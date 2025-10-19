const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");

const prisma = new PrismaClient();

// Record health event
const recordHealthEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { cattleId, recordType, description, medication, dosage, timestamp } =
      req.body;

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

    // Create health record
    const healthRecord = await prisma.healthRecord.create({
      data: {
        cattleId,
        recordType,
        description,
        medication: medication || null,
        dosage: dosage || null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        recordedById: req.user.id,
      },
      include: {
        cattle: {
          select: { id: true, name: true, tagNumber: true },
        },
        recordedBy: {
          select: { username: true },
        },
      },
    });

    res.status(201).json({
      message: "Health record created successfully",
      healthRecord,
    });
  } catch (error) {
    console.error("Record health event error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get health history for a cattle
const getHealthHistory = async (req, res) => {
  try {
    const { cattleId } = req.params;
    const { page = 1, limit = 20, recordType } = req.query;
    const skip = (page - 1) * limit;

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

    let whereClause = { cattleId };
    if (recordType) {
      whereClause.recordType = recordType;
    }

    const [healthRecords, total] = await Promise.all([
      prisma.healthRecord.findMany({
        where: whereClause,
        include: {
          recordedBy: {
            select: { username: true },
          },
        },
        orderBy: { timestamp: "desc" },
        skip: parseInt(skip),
        take: parseInt(limit),
      }),
      prisma.healthRecord.count({ where: whereClause }),
    ]);

    res.json({
      healthRecords,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get health history error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get health statistics
const getHealthStats = async (req, res) => {
  try {
    const { cattleId } = req.params;
    const { startDate, endDate } = req.query;

    let whereClause = { cattleId };

    // Add date filter if provided
    if (startDate && endDate) {
      whereClause.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

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

    const [
      totalRecords,
      diseaseCount,
      injectionCount,
      checkupCount,
      recentRecords,
    ] = await Promise.all([
      prisma.healthRecord.count({ where: whereClause }),
      prisma.healthRecord.count({
        where: { ...whereClause, recordType: "DISEASE" },
      }),
      prisma.healthRecord.count({
        where: { ...whereClause, recordType: "INJECTION" },
      }),
      prisma.healthRecord.count({
        where: { ...whereClause, recordType: "CHECKUP" },
      }),
      prisma.healthRecord.findMany({
        where: whereClause,
        orderBy: { timestamp: "desc" },
        take: 5,
        include: {
          recordedBy: {
            select: { username: true },
          },
        },
      }),
    ]);

    res.json({
      stats: {
        totalRecords,
        diseaseCount,
        injectionCount,
        checkupCount,
      },
      recentRecords,
    });
  } catch (error) {
    console.error("Get health stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get health alerts (diseases in last 30 days)
const getHealthAlerts = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let whereClause = {
      recordType: "DISEASE",
      timestamp: { gte: thirtyDaysAgo },
    };

    // Filter by user's assigned cattle if not admin
    if (req.user.role === "USER") {
      whereClause.cattle = {
        assignedUserId: req.user.id,
      };
    }

    const healthAlerts = await prisma.healthRecord.findMany({
      where: whereClause,
      include: {
        cattle: {
          select: { id: true, name: true, tagNumber: true, assignedUser: true },
        },
        recordedBy: {
          select: { username: true },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    res.json({ healthAlerts });
  } catch (error) {
    console.error("Get health alerts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  recordHealthEvent,
  getHealthHistory,
  getHealthStats,
  getHealthAlerts,
};
