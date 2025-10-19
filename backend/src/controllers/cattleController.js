const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const prisma = new PrismaClient();

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/cattle-photos";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "cattle-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Get all cattle (filtered by role)
const getCattle = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let whereClause = {};

    // Filter by organization
    whereClause.organizationId = req.user.organizationId;

    // Filter by role - Users only see assigned cattle
    if (req.user.role === "USER") {
      whereClause.assignedUserId = req.user.id;
    }

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Search functionality
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { tagNumber: { contains: search, mode: "insensitive" } },
        { breed: { contains: search, mode: "insensitive" } },
      ];
    }

    const [cattle, total] = await Promise.all([
      prisma.cattle.findMany({
        where: whereClause,
        include: {
          assignedUser: {
            select: { id: true, username: true },
          },
          parent: {
            select: { id: true, name: true, tagNumber: true },
          },
          _count: {
            select: {
              children: true,
              seminationRecords: true,
              pregnancyRecords: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: parseInt(skip),
        take: parseInt(limit),
      }),
      prisma.cattle.count({ where: whereClause }),
    ]);

    res.json({
      cattle,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get cattle error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single cattle with full history
const getCattleById = async (req, res) => {
  try {
    const { id } = req.params;

    const cattle = await prisma.cattle.findUnique({
      where: { id },
      include: {
        assignedUser: {
          select: { id: true, username: true, email: true },
        },
        parent: {
          select: { id: true, name: true, tagNumber: true, breed: true },
        },
        children: {
          select: {
            id: true,
            name: true,
            tagNumber: true,
            gender: true,
            dateOfBirth: true,
          },
        },
        seminationRecords: {
          include: {
            createdBy: { select: { username: true } },
            pregnancyRecord: true,
          },
          orderBy: { seminationDate: "desc" },
        },
        pregnancyRecords: {
          include: {
            createdBy: { select: { username: true } },
            calf: { select: { id: true, name: true, tagNumber: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        feedingRecords: {
          include: {
            recordedBy: { select: { username: true } },
          },
          orderBy: { timestamp: "desc" },
          take: 10,
        },
        healthRecords: {
          include: {
            recordedBy: { select: { username: true } },
          },
          orderBy: { timestamp: "desc" },
          take: 10,
        },
      },
    });

    if (!cattle) {
      return res.status(404).json({ message: "Cattle not found" });
    }

    // Check if user has access to this cattle
    if (req.user.role === "USER" && cattle.assignedUserId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ cattle });
  } catch (error) {
    console.error("Get cattle by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add new cattle (Admin only)
const addCattle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      tagNumber,
      name,
      breed,
      gender,
      dateOfBirth,
      parentId,
      assignedUserId,
    } = req.body;

    // Check if tag number already exists within the same organization
    const existingCattle = await prisma.cattle.findFirst({
      where: {
        tagNumber,
        organizationId: req.user.organizationId,
      },
    });

    if (existingCattle) {
      return res.status(400).json({ message: "Tag number already exists" });
    }

    // Validate parent if provided
    if (parentId) {
      const parent = await prisma.cattle.findFirst({
        where: {
          id: parentId,
          organizationId: req.user.organizationId,
        },
      });
      if (!parent) {
        return res.status(400).json({ message: "Parent cattle not found" });
      }
    }

    // Validate assigned user if provided
    if (assignedUserId) {
      const user = await prisma.user.findFirst({
        where: {
          id: assignedUserId,
          organizationId: req.user.organizationId,
        },
      });
      if (!user) {
        return res.status(400).json({ message: "Assigned user not found" });
      }
    }

    const cattle = await prisma.cattle.create({
      data: {
        tagNumber,
        name,
        breed,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        parentId: parentId || null,
        assignedUserId: assignedUserId || null,
        organizationId: req.user.organizationId,
      },
      include: {
        assignedUser: {
          select: { id: true, username: true },
        },
        parent: {
          select: { id: true, name: true, tagNumber: true },
        },
      },
    });

    res.status(201).json({
      message: "Cattle added successfully",
      cattle,
    });
  } catch (error) {
    console.error("Add cattle error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update cattle details
const updateCattle = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, breed, status, assignedUserId } = req.body;

    // Check if cattle exists
    const existingCattle = await prisma.cattle.findUnique({
      where: { id },
    });

    if (!existingCattle) {
      return res.status(404).json({ message: "Cattle not found" });
    }

    // Check access permissions
    if (
      req.user.role === "USER" &&
      existingCattle.assignedUserId !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Validate assigned user if provided
    if (assignedUserId) {
      const user = await prisma.user.findUnique({
        where: { id: assignedUserId },
      });
      if (!user) {
        return res.status(400).json({ message: "Assigned user not found" });
      }
    }

    const cattle = await prisma.cattle.update({
      where: { id },
      data: {
        name,
        breed,
        status,
        assignedUserId: assignedUserId || existingCattle.assignedUserId,
      },
      include: {
        assignedUser: {
          select: { id: true, username: true },
        },
        parent: {
          select: { id: true, name: true, tagNumber: true },
        },
      },
    });

    res.json({
      message: "Cattle updated successfully",
      cattle,
    });
  } catch (error) {
    console.error("Update cattle error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Soft delete cattle
const deleteCattle = async (req, res) => {
  try {
    const { id } = req.params;

    const cattle = await prisma.cattle.findUnique({
      where: { id },
    });

    if (!cattle) {
      return res.status(404).json({ message: "Cattle not found" });
    }

    // Only admin can delete cattle
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }

    await prisma.cattle.update({
      where: { id },
      data: { status: "DECEASED" },
    });

    res.json({ message: "Cattle marked as deceased" });
  } catch (error) {
    console.error("Delete cattle error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Assign cattle to user
const assignCattle = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Check if cattle exists
    const cattle = await prisma.cattle.findUnique({
      where: { id },
    });

    if (!cattle) {
      return res.status(404).json({ message: "Cattle not found" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Update cattle assignment
    const updatedCattle = await prisma.cattle.update({
      where: { id },
      data: { assignedUserId: userId },
    });

    // Create assignment record
    await prisma.assignment.create({
      data: {
        cattleId: id,
        userId: userId,
        assignedBy: req.user.id,
      },
    });

    res.json({
      message: "Cattle assigned successfully",
      cattle: updatedCattle,
    });
  } catch (error) {
    console.error("Assign cattle error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload cattle photo
const uploadPhoto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No photo uploaded" });
    }

    const cattle = await prisma.cattle.findUnique({
      where: { id },
    });

    if (!cattle) {
      return res.status(404).json({ message: "Cattle not found" });
    }

    // Delete old photo if exists
    if (cattle.photo) {
      const oldPhotoPath = path.join(
        "uploads/cattle-photos",
        path.basename(cattle.photo)
      );
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Update cattle with new photo path
    const updatedCattle = await prisma.cattle.update({
      where: { id },
      data: { photo: `/uploads/cattle-photos/${req.file.filename}` },
    });

    res.json({
      message: "Photo uploaded successfully",
      cattle: updatedCattle,
    });
  } catch (error) {
    console.error("Upload photo error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getCattle,
  getCattleById,
  addCattle,
  updateCattle,
  deleteCattle,
  assignCattle,
  uploadPhoto,
  upload,
};
