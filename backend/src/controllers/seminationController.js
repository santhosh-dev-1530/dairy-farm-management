const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");

const prisma = new PrismaClient();

// Record semination injection
const recordSemination = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { cattleId, seminationDate, notes } = req.body;

    // Check if cattle exists and user has access
    const cattle = await prisma.cattle.findUnique({
      where: { id: cattleId },
      include: { assignedUser: true },
    });

    if (!cattle) {
      return res.status(404).json({ message: "Cattle not found" });
    }

    // Check access permissions
    if (req.user.role === "USER" && cattle.assignedUserId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Calculate check date (15 days after semination)
    const checkDate = new Date(seminationDate);
    checkDate.setDate(checkDate.getDate() + 15);

    // Create semination record
    const seminationRecord = await prisma.seminationRecord.create({
      data: {
        cattleId,
        seminationDate: new Date(seminationDate),
        checkDate,
        notes,
        createdById: req.user.id,
      },
      include: {
        cattle: {
          select: { id: true, name: true, tagNumber: true },
        },
        createdBy: {
          select: { username: true },
        },
      },
    });

    // Update cattle status to ACTIVE if it was PREGNANT
    if (cattle.status === "PREGNANT") {
      await prisma.cattle.update({
        where: { id: cattleId },
        data: { status: "ACTIVE" },
      });
    }

    res.status(201).json({
      message: "Semination recorded successfully",
      seminationRecord,
    });
  } catch (error) {
    console.error("Record semination error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark pregnancy check result (15th day)
const checkPregnancy = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPregnant, notes } = req.body;

    // Find semination record
    const seminationRecord = await prisma.seminationRecord.findUnique({
      where: { id },
      include: {
        cattle: {
          include: { assignedUser: true },
        },
      },
    });

    if (!seminationRecord) {
      return res.status(404).json({ message: "Semination record not found" });
    }

    // Check access permissions
    if (
      req.user.role === "USER" &&
      seminationRecord.cattle.assignedUserId !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update semination record
    const updatedRecord = await prisma.seminationRecord.update({
      where: { id },
      data: {
        isPregnant,
        checkedAt: new Date(),
        notes: notes || seminationRecord.notes,
      },
      include: {
        cattle: {
          select: { id: true, name: true, tagNumber: true },
        },
        createdBy: {
          select: { username: true },
        },
      },
    });

    // If pregnant, create pregnancy record and update cattle status
    if (isPregnant) {
      // Calculate expected delivery date (approximately 9 months)
      const expectedDeliveryDate = new Date(seminationRecord.seminationDate);
      expectedDeliveryDate.setMonth(expectedDeliveryDate.getMonth() + 9);

      await prisma.pregnancyRecord.create({
        data: {
          cattleId: seminationRecord.cattleId,
          seminationRecordId: id,
          expectedDeliveryDate,
          createdById: req.user.id,
        },
      });

      // Update cattle status to PREGNANT
      await prisma.cattle.update({
        where: { id: seminationRecord.cattleId },
        data: { status: "PREGNANT" },
      });
    }

    res.json({
      message: "Pregnancy check recorded successfully",
      seminationRecord: updatedRecord,
    });
  } catch (error) {
    console.error("Check pregnancy error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get semination history for a cattle
const getSeminationHistory = async (req, res) => {
  try {
    const { cattleId } = req.params;

    // Check if cattle exists and user has access
    const cattle = await prisma.cattle.findUnique({
      where: { id: cattleId },
      include: { assignedUser: true },
    });

    if (!cattle) {
      return res.status(404).json({ message: "Cattle not found" });
    }

    // Check access permissions
    if (req.user.role === "USER" && cattle.assignedUserId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const seminationRecords = await prisma.seminationRecord.findMany({
      where: { cattleId },
      include: {
        createdBy: {
          select: { username: true },
        },
        pregnancyRecord: {
          include: {
            calf: {
              select: { id: true, name: true, tagNumber: true },
            },
          },
        },
      },
      orderBy: { seminationDate: "desc" },
    });

    res.json({ seminationRecords });
  } catch (error) {
    console.error("Get semination history error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get pending pregnancy checks (for notifications)
const getPendingChecks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    let whereClause = {
      checkDate: { lte: today },
      isPregnant: null,
    };

    // Filter by user's assigned cattle if not admin
    if (req.user.role === "USER") {
      whereClause.cattle = {
        assignedUserId: req.user.id,
      };
    }

    const pendingChecks = await prisma.seminationRecord.findMany({
      where: whereClause,
      include: {
        cattle: {
          select: { id: true, name: true, tagNumber: true, assignedUser: true },
        },
        createdBy: {
          select: { username: true },
        },
      },
      orderBy: { checkDate: "asc" },
    });

    res.json({ pendingChecks });
  } catch (error) {
    console.error("Get pending checks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  recordSemination,
  checkPregnancy,
  getSeminationHistory,
  getPendingChecks,
};
