const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");

const prisma = new PrismaClient();

// Record feeding
const recordFeeding = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { cattleId, feedType, quantity, waterGiven, timestamp } = req.body;

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

    // Create feeding record
    const feedingRecord = await prisma.feedingRecord.create({
      data: {
        cattleId,
        feedType,
        quantity: parseFloat(quantity),
        waterGiven: waterGiven === true || waterGiven === "true",
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
      message: "Feeding recorded successfully",
      feedingRecord,
    });
  } catch (error) {
    console.error("Record feeding error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get feeding history for a cattle
const getFeedingHistory = async (req, res) => {
  try {
    const { cattleId } = req.params;
    const { page = 1, limit = 20 } = req.query;
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

    const [feedingRecords, total] = await Promise.all([
      prisma.feedingRecord.findMany({
        where: { cattleId },
        include: {
          recordedBy: {
            select: { username: true },
          },
        },
        orderBy: { timestamp: "desc" },
        skip: parseInt(skip),
        take: parseInt(limit),
      }),
      prisma.feedingRecord.count({ where: { cattleId } }),
    ]);

    res.json({
      feedingRecords,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get feeding history error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get feeding statistics
const getFeedingStats = async (req, res) => {
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

    const [totalFeedings, totalQuantity, waterGivenCount, recentFeedings] =
      await Promise.all([
        prisma.feedingRecord.count({ where: whereClause }),
        prisma.feedingRecord.aggregate({
          where: whereClause,
          _sum: { quantity: true },
        }),
        prisma.feedingRecord.count({
          where: { ...whereClause, waterGiven: true },
        }),
        prisma.feedingRecord.findMany({
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
        totalFeedings,
        totalQuantity: totalQuantity._sum.quantity || 0,
        waterGivenCount,
        averageQuantity:
          totalFeedings > 0
            ? (totalQuantity._sum.quantity || 0) / totalFeedings
            : 0,
      },
      recentFeedings,
    });
  } catch (error) {
    console.error("Get feeding stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Batch record feeding for multiple cattle
const batchRecordFeeding = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { cattleIds, feedType, quantity, waterGiven, timestamp } = req.body;

    if (!Array.isArray(cattleIds) || cattleIds.length === 0) {
      return res.status(400).json({ message: "Cattle IDs array is required" });
    }

    // Check if all cattle exist and user has access
    const cattle = await prisma.cattle.findMany({
      where: {
        id: { in: cattleIds },
        ...(req.user.role === "USER" ? { assignedUserId: req.user.id } : {}),
      },
    });

    if (cattle.length !== cattleIds.length) {
      return res
        .status(400)
        .json({ message: "Some cattle not found or access denied" });
    }

    // Create feeding records for all cattle
    const feedingRecords = await Promise.all(
      cattleIds.map((cattleId) =>
        prisma.feedingRecord.create({
          data: {
            cattleId,
            feedType,
            quantity: parseFloat(quantity),
            waterGiven: waterGiven === true || waterGiven === "true",
            timestamp: timestamp ? new Date(timestamp) : new Date(),
            recordedById: req.user.id,
          },
          include: {
            cattle: {
              select: { id: true, name: true, tagNumber: true },
            },
          },
        })
      )
    );

    res.status(201).json({
      message: "Batch feeding recorded successfully",
      feedingRecords,
    });
  } catch (error) {
    console.error("Batch record feeding error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  recordFeeding,
  getFeedingHistory,
  getFeedingStats,
  batchRecordFeeding,
};
