const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");

const prisma = new PrismaClient();

// Get pregnancy records for a cattle
const getPregnancyRecords = async (req, res) => {
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

    const pregnancyRecords = await prisma.pregnancyRecord.findMany({
      where: { cattleId },
      include: {
        cattle: {
          select: { id: true, name: true, tagNumber: true },
        },
        seminationRecord: {
          select: { id: true, seminationDate: true, notes: true },
        },
        calf: {
          select: {
            id: true,
            name: true,
            tagNumber: true,
            gender: true,
            dateOfBirth: true,
          },
        },
        createdBy: {
          select: { username: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ pregnancyRecords });
  } catch (error) {
    console.error("Get pregnancy records error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Record delivery and create calf entry
const recordDelivery = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      actualDeliveryDate,
      calfName,
      calfTagNumber,
      calfGender,
      calfBreed,
      notes,
    } = req.body;

    // Find pregnancy record
    const pregnancyRecord = await prisma.pregnancyRecord.findUnique({
      where: { id },
      include: {
        cattle: {
          include: { assignedUser: true },
        },
      },
    });

    if (!pregnancyRecord) {
      return res.status(404).json({ message: "Pregnancy record not found" });
    }

    // Check access permissions
    if (
      req.user.role === "USER" &&
      pregnancyRecord.cattle.assignedUserId !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (pregnancyRecord.status !== "IN_PROGRESS") {
      return res.status(400).json({ message: "Pregnancy is not in progress" });
    }

    // Create calf entry
    const calf = await prisma.cattle.create({
      data: {
        tagNumber: calfTagNumber,
        name: calfName,
        breed: calfBreed,
        gender: calfGender,
        dateOfBirth: new Date(actualDeliveryDate),
        parentId: pregnancyRecord.cattleId,
        assignedUserId: pregnancyRecord.cattle.assignedUserId,
      },
    });

    // Update pregnancy record
    const updatedPregnancyRecord = await prisma.pregnancyRecord.update({
      where: { id },
      data: {
        actualDeliveryDate: new Date(actualDeliveryDate),
        calfId: calf.id,
        status: "DELIVERED",
        notes: notes || pregnancyRecord.notes,
      },
      include: {
        cattle: {
          select: { id: true, name: true, tagNumber: true },
        },
        calf: {
          select: {
            id: true,
            name: true,
            tagNumber: true,
            gender: true,
            dateOfBirth: true,
          },
        },
        createdBy: {
          select: { username: true },
        },
      },
    });

    // Update mother's status back to ACTIVE
    await prisma.cattle.update({
      where: { id: pregnancyRecord.cattleId },
      data: { status: "ACTIVE" },
    });

    res.json({
      message: "Delivery recorded successfully",
      pregnancyRecord: updatedPregnancyRecord,
      calf,
    });
  } catch (error) {
    console.error("Record delivery error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark calf separation (15 days after birth)
const markSeparation = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Find pregnancy record
    const pregnancyRecord = await prisma.pregnancyRecord.findUnique({
      where: { id },
      include: {
        cattle: {
          include: { assignedUser: true },
        },
        calf: true,
      },
    });

    if (!pregnancyRecord) {
      return res.status(404).json({ message: "Pregnancy record not found" });
    }

    // Check access permissions
    if (
      req.user.role === "USER" &&
      pregnancyRecord.cattle.assignedUserId !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (pregnancyRecord.status !== "DELIVERED") {
      return res
        .status(400)
        .json({ message: "Calf has not been delivered yet" });
    }

    // Check if 15 days have passed since delivery
    const deliveryDate = new Date(pregnancyRecord.actualDeliveryDate);
    const separationDate = new Date(deliveryDate);
    separationDate.setDate(separationDate.getDate() + 15);

    if (new Date() < separationDate) {
      return res.status(400).json({
        message: "Separation can only be marked 15 days after delivery",
        separationDate: separationDate.toISOString(),
      });
    }

    // Update pregnancy record
    const updatedPregnancyRecord = await prisma.pregnancyRecord.update({
      where: { id },
      data: {
        status: "SEPARATED",
        notes: notes || pregnancyRecord.notes,
      },
      include: {
        cattle: {
          select: { id: true, name: true, tagNumber: true },
        },
        calf: {
          select: {
            id: true,
            name: true,
            tagNumber: true,
            gender: true,
            dateOfBirth: true,
          },
        },
        createdBy: {
          select: { username: true },
        },
      },
    });

    // Update calf status to ACTIVE (if it was assigned to someone)
    if (pregnancyRecord.calf.assignedUserId) {
      await prisma.cattle.update({
        where: { id: pregnancyRecord.calfId },
        data: { status: "ACTIVE" },
      });
    }

    res.json({
      message: "Separation marked successfully",
      pregnancyRecord: updatedPregnancyRecord,
    });
  } catch (error) {
    console.error("Mark separation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get pregnancy statistics
const getPregnancyStats = async (req, res) => {
  try {
    let whereClause = {};

    // Filter by user's assigned cattle if not admin
    if (req.user.role === "USER") {
      whereClause.cattle = {
        assignedUserId: req.user.id,
      };
    }

    const [
      totalPregnancies,
      inProgressPregnancies,
      deliveredPregnancies,
      separatedPregnancies,
      pendingDeliveries,
    ] = await Promise.all([
      prisma.pregnancyRecord.count({ where: whereClause }),
      prisma.pregnancyRecord.count({
        where: { ...whereClause, status: "IN_PROGRESS" },
      }),
      prisma.pregnancyRecord.count({
        where: { ...whereClause, status: "DELIVERED" },
      }),
      prisma.pregnancyRecord.count({
        where: { ...whereClause, status: "SEPARATED" },
      }),
      prisma.pregnancyRecord.count({
        where: {
          ...whereClause,
          status: "IN_PROGRESS",
          expectedDeliveryDate: { lte: new Date() },
        },
      }),
    ]);

    res.json({
      stats: {
        totalPregnancies,
        inProgressPregnancies,
        deliveredPregnancies,
        separatedPregnancies,
        pendingDeliveries,
      },
    });
  } catch (error) {
    console.error("Get pregnancy stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getPregnancyRecords,
  recordDelivery,
  markSeparation,
  getPregnancyStats,
};
