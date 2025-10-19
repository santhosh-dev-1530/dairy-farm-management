const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");

const prisma = new PrismaClient();

// Create organization
const createOrganization = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;

    const organization = await prisma.organization.create({
      data: {
        name,
      },
    });

    res.status(201).json({
      message: "Organization created successfully",
      organization,
    });
  } catch (error) {
    console.error("Create organization error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all organizations
const getOrganizations = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        include: {
          _count: {
            select: {
              users: true,
              cattle: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: parseInt(skip),
        take: parseInt(limit),
      }),
      prisma.organization.count(),
    ]);

    res.json({
      organizations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get organizations error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get organization by ID
const getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        cattle: {
          select: {
            id: true,
            tagNumber: true,
            name: true,
            breed: true,
            gender: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            users: true,
            cattle: true,
            seminationRecords: true,
            pregnancyRecords: true,
            feedingRecords: true,
            healthRecords: true,
          },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json({ organization });
  } catch (error) {
    console.error("Get organization by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update organization
const updateOrganization = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name } = req.body;

    const organization = await prisma.organization.update({
      where: { id },
      data: { name },
    });

    res.json({
      message: "Organization updated successfully",
      organization,
    });
  } catch (error) {
    console.error("Update organization error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete organization
const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Delete organization (cascade will handle related records)
    await prisma.organization.delete({
      where: { id },
    });

    res.json({ message: "Organization deleted successfully" });
  } catch (error) {
    console.error("Delete organization error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get organization stats
const getOrganizationStats = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const [
      totalUsers,
      totalCattle,
      activeCattle,
      pregnantCattle,
      totalSeminationRecords,
      totalPregnancyRecords,
      totalFeedingRecords,
      totalHealthRecords,
    ] = await Promise.all([
      prisma.user.count({ where: { organizationId: id } }),
      prisma.cattle.count({ where: { organizationId: id } }),
      prisma.cattle.count({
        where: { organizationId: id, status: "ACTIVE" },
      }),
      prisma.cattle.count({
        where: { organizationId: id, status: "PREGNANT" },
      }),
      prisma.seminationRecord.count({ where: { organizationId: id } }),
      prisma.pregnancyRecord.count({ where: { organizationId: id } }),
      prisma.feedingRecord.count({ where: { organizationId: id } }),
      prisma.healthRecord.count({ where: { organizationId: id } }),
    ]);

    res.json({
      organization: {
        id: organization.id,
        name: organization.name,
        createdAt: organization.createdAt,
      },
      stats: {
        totalUsers,
        totalCattle,
        activeCattle,
        pregnantCattle,
        totalSeminationRecords,
        totalPregnancyRecords,
        totalFeedingRecords,
        totalHealthRecords,
      },
    });
  } catch (error) {
    console.error("Get organization stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getOrganizationStats,
};
