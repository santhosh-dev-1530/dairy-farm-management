const admin = require("firebase-admin");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (!admin.apps.length) {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
};

// Send push notification
const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  try {
    initializeFirebase();

    const message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "dairy_farm_notifications",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
    return response;
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
};

// Send notification to multiple users
const sendBulkNotification = async (userIds, title, body, data = {}) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        fcmToken: { not: null },
      },
      select: { id: true, fcmToken: true },
    });

    const promises = users.map((user) =>
      sendPushNotification(user.fcmToken, title, body, data)
    );

    const results = await Promise.allSettled(promises);
    const successful = results.filter(
      (result) => result.status === "fulfilled"
    ).length;
    const failed = results.filter(
      (result) => result.status === "rejected"
    ).length;

    console.log(
      `Bulk notification sent: ${successful} successful, ${failed} failed`
    );
    return { successful, failed };
  } catch (error) {
    console.error("Error sending bulk notification:", error);
    throw error;
  }
};

// Create notification record
const createNotification = async (
  userId,
  cattleId,
  type,
  title,
  message,
  scheduledFor = null
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        cattleId,
        type,
        title,
        message,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      },
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Send pregnancy check reminder
const sendPregnancyCheckReminder = async (seminationRecord) => {
  try {
    const { cattle, createdBy } = seminationRecord;

    const title = "Pregnancy Check Due";
    const message = `Pregnancy check is due for ${cattle.name} (${cattle.tagNumber})`;

    // Create notification record
    await createNotification(
      cattle.assignedUserId || createdBy.id,
      cattle.id,
      "PREGNANCY_CHECK_DUE",
      title,
      message
    );

    // Send push notification if user has FCM token
    if (cattle.assignedUser?.fcmToken) {
      await sendPushNotification(cattle.assignedUser.fcmToken, title, message, {
        type: "PREGNANCY_CHECK_DUE",
        cattleId: cattle.id,
        cattleName: cattle.name,
        cattleTag: cattle.tagNumber,
      });
    }

    console.log(`Pregnancy check reminder sent for cattle ${cattle.tagNumber}`);
  } catch (error) {
    console.error("Error sending pregnancy check reminder:", error);
  }
};

// Send separation reminder
const sendSeparationReminder = async (pregnancyRecord) => {
  try {
    const { cattle, calf } = pregnancyRecord;

    const title = "Separation Reminder";
    const message = `Time to separate calf ${calf.name} from ${cattle.name}`;

    // Create notification record
    await createNotification(
      cattle.assignedUserId,
      cattle.id,
      "SEPARATION_REMINDER",
      title,
      message
    );

    // Send push notification if user has FCM token
    if (cattle.assignedUser?.fcmToken) {
      await sendPushNotification(cattle.assignedUser.fcmToken, title, message, {
        type: "SEPARATION_REMINDER",
        cattleId: cattle.id,
        calfId: calf.id,
        cattleName: cattle.name,
        calfName: calf.name,
      });
    }

    console.log(`Separation reminder sent for calf ${calf.tagNumber}`);
  } catch (error) {
    console.error("Error sending separation reminder:", error);
  }
};

// Send health alert
const sendHealthAlert = async (healthRecord) => {
  try {
    const { cattle, recordedBy } = healthRecord;

    const title = "Health Alert";
    const message = `Health issue reported for ${cattle.name}: ${healthRecord.description}`;

    // Get all users who should be notified (admin and assigned user)
    const users = await prisma.user.findMany({
      where: {
        OR: [{ role: "ADMIN" }, { id: cattle.assignedUserId }],
        fcmToken: { not: null },
      },
      select: { id: true, fcmToken: true },
    });

    // Create notification records
    await Promise.all(
      users.map((user) =>
        createNotification(user.id, cattle.id, "HEALTH_ALERT", title, message)
      )
    );

    // Send push notifications
    await sendBulkNotification(
      users.map((u) => u.id),
      title,
      message,
      {
        type: "HEALTH_ALERT",
        cattleId: cattle.id,
        cattleName: cattle.name,
        cattleTag: cattle.tagNumber,
        recordType: healthRecord.recordType,
      }
    );

    console.log(`Health alert sent for cattle ${cattle.tagNumber}`);
  } catch (error) {
    console.error("Error sending health alert:", error);
  }
};

// Get user notifications
const getUserNotifications = async (userId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        include: {
          cattle: {
            select: { id: true, name: true, tagNumber: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error getting user notifications:", error);
    throw error;
  }
};

// Mark notification as read
const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { isRead: true },
    });

    return notification;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

module.exports = {
  initializeFirebase,
  sendPushNotification,
  sendBulkNotification,
  createNotification,
  sendPregnancyCheckReminder,
  sendSeparationReminder,
  sendHealthAlert,
  getUserNotifications,
  markNotificationAsRead,
};
