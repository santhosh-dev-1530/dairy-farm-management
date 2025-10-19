const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const {
  sendPregnancyCheckReminder,
  sendSeparationReminder,
} = require("../services/notificationService");

const prisma = new PrismaClient();

// Daily job to check for pregnancy check reminders (runs at 10 AM)
const pregnancyCheckReminderJob = cron.schedule(
  "0 10 * * *",
  async () => {
    try {
      console.log("Running pregnancy check reminder job...");

      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      // Find semination records where check date is today and not yet checked
      const pendingChecks = await prisma.seminationRecord.findMany({
        where: {
          checkDate: { lte: today },
          isPregnant: null,
        },
        include: {
          cattle: {
            include: {
              assignedUser: {
                select: { id: true, fcmToken: true },
              },
            },
          },
          createdBy: {
            select: { id: true, fcmToken: true },
          },
        },
      });

      console.log(`Found ${pendingChecks.length} pending pregnancy checks`);

      // Send reminders for each pending check
      for (const record of pendingChecks) {
        try {
          await sendPregnancyCheckReminder(record);
        } catch (error) {
          console.error(
            `Error sending reminder for cattle ${record.cattle.tagNumber}:`,
            error
          );
        }
      }

      console.log("Pregnancy check reminder job completed");
    } catch (error) {
      console.error("Pregnancy check reminder job error:", error);
    }
  },
  {
    scheduled: false,
    timezone: "UTC",
  }
);

// Daily job to check for separation reminders (runs at 9 AM)
const separationReminderJob = cron.schedule(
  "0 9 * * *",
  async () => {
    try {
      console.log("Running separation reminder job...");

      const today = new Date();
      const fifteenDaysAgo = new Date(today);
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      // Find pregnancy records where calf was delivered 15 days ago and not yet separated
      const pendingSeparations = await prisma.pregnancyRecord.findMany({
        where: {
          status: "DELIVERED",
          actualDeliveryDate: {
            gte: new Date(
              fifteenDaysAgo.getFullYear(),
              fifteenDaysAgo.getMonth(),
              fifteenDaysAgo.getDate()
            ),
            lt: new Date(
              fifteenDaysAgo.getFullYear(),
              fifteenDaysAgo.getMonth(),
              fifteenDaysAgo.getDate() + 1
            ),
          },
        },
        include: {
          cattle: {
            include: {
              assignedUser: {
                select: { id: true, fcmToken: true },
              },
            },
          },
          calf: {
            select: { id: true, name: true, tagNumber: true },
          },
        },
      });

      console.log(`Found ${pendingSeparations.length} pending separations`);

      // Send reminders for each pending separation
      for (const record of pendingSeparations) {
        try {
          await sendSeparationReminder(record);
        } catch (error) {
          console.error(
            `Error sending separation reminder for calf ${record.calf.tagNumber}:`,
            error
          );
        }
      }

      console.log("Separation reminder job completed");
    } catch (error) {
      console.error("Separation reminder job error:", error);
    }
  },
  {
    scheduled: false,
    timezone: "UTC",
  }
);

// Weekly job to check for pregnancy milestones (runs every Monday at 8 AM)
const pregnancyMilestoneJob = cron.schedule(
  "0 8 * * 1",
  async () => {
    try {
      console.log("Running pregnancy milestone job...");

      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      // Find pregnancy records where delivery is expected in the next week
      const upcomingDeliveries = await prisma.pregnancyRecord.findMany({
        where: {
          status: "IN_PROGRESS",
          expectedDeliveryDate: {
            gte: today,
            lte: nextWeek,
          },
        },
        include: {
          cattle: {
            include: {
              assignedUser: {
                select: { id: true, fcmToken: true },
              },
            },
          },
        },
      });

      console.log(`Found ${upcomingDeliveries.length} upcoming deliveries`);

      // Send milestone reminders
      for (const record of upcomingDeliveries) {
        try {
          const daysUntilDelivery = Math.ceil(
            (record.expectedDeliveryDate - today) / (1000 * 60 * 60 * 24)
          );

          const title = "Pregnancy Milestone";
          const message = `${record.cattle.name} is expected to deliver in ${daysUntilDelivery} day(s)`;

          // Create notification
          await prisma.notification.create({
            data: {
              userId: record.cattle.assignedUserId,
              cattleId: record.cattle.id,
              type: "MILESTONE_REMINDER",
              title,
              message,
            },
          });

          // Send push notification if user has FCM token
          if (record.cattle.assignedUser?.fcmToken) {
            const {
              sendPushNotification,
            } = require("../services/notificationService");
            await sendPushNotification(
              record.cattle.assignedUser.fcmToken,
              title,
              message,
              {
                type: "MILESTONE_REMINDER",
                cattleId: record.cattle.id,
                cattleName: record.cattle.name,
                cattleTag: record.cattle.tagNumber,
                expectedDeliveryDate: record.expectedDeliveryDate.toISOString(),
              }
            );
          }
        } catch (error) {
          console.error(
            `Error sending milestone reminder for cattle ${record.cattle.tagNumber}:`,
            error
          );
        }
      }

      console.log("Pregnancy milestone job completed");
    } catch (error) {
      console.error("Pregnancy milestone job error:", error);
    }
  },
  {
    scheduled: false,
    timezone: "UTC",
  }
);

// Start all cron jobs
const startJobs = () => {
  pregnancyCheckReminderJob.start();
  separationReminderJob.start();
  pregnancyMilestoneJob.start();
  console.log("All reminder jobs started");
};

// Stop all cron jobs
const stopJobs = () => {
  pregnancyCheckReminderJob.stop();
  separationReminderJob.stop();
  pregnancyMilestoneJob.stop();
  console.log("All reminder jobs stopped");
};

module.exports = {
  startJobs,
  stopJobs,
  pregnancyCheckReminderJob,
  separationReminderJob,
  pregnancyMilestoneJob,
};
