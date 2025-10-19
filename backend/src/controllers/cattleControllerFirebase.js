const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const multer = require("multer");
const {
  uploadCattlePhoto,
  deleteCattlePhoto,
} = require("../services/firebaseStorage");

const prisma = new PrismaClient();

// Configure multer for memory storage (for Firebase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Upload cattle photo to Firebase Storage
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
      await deleteCattlePhoto(cattle.photo);
    }

    // Upload new photo to Firebase Storage
    const uploadResult = await uploadCattlePhoto(
      req.file,
      cattle.id,
      cattle.organizationId
    );

    // Update cattle with new photo URL
    const updatedCattle = await prisma.cattle.update({
      where: { id },
      data: { photo: uploadResult.publicUrl },
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
      message: "Photo uploaded successfully",
      cattle: updatedCattle,
      uploadInfo: {
        fileName: uploadResult.fileName,
        size: uploadResult.size,
        contentType: uploadResult.contentType,
      },
    });
  } catch (error) {
    console.error("Upload photo error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete cattle photo
const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;

    const cattle = await prisma.cattle.findUnique({
      where: { id },
    });

    if (!cattle) {
      return res.status(404).json({ message: "Cattle not found" });
    }

    if (!cattle.photo) {
      return res.status(400).json({ message: "No photo to delete" });
    }

    // Delete from Firebase Storage
    await deleteCattlePhoto(cattle.photo);

    // Update cattle record
    const updatedCattle = await prisma.cattle.update({
      where: { id },
      data: { photo: null },
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
      message: "Photo deleted successfully",
      cattle: updatedCattle,
    });
  } catch (error) {
    console.error("Delete photo error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  uploadPhoto,
  deletePhoto,
  upload,
};
