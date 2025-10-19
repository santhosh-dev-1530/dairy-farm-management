const express = require("express");
const { body } = require("express-validator");
const {
  getUserNotifications,
  markNotificationAsRead,
} = require("../services/notificationService");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const deviceValidation = [
  body("fcmToken").notEmpty().withMessage("FCM token is required"),
];

// Get user notifications
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await getUserNotifications(
      req.user.id,
      parseInt(page),
      parseInt(limit)
    );
    res.json(result);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await markNotificationAsRead(id, req.user.id);

    if (result.count === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Register device token (moved from auth routes for better organization)
const registerDevice = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    await prisma.user.update({
      where: { id: req.user.id },
      data: { fcmToken },
    });

    res.json({ message: "Device token registered successfully" });
  } catch (error) {
    console.error("Register device error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Routes
router.get("/", auth, getNotifications);
router.put("/:id/read", auth, markAsRead);
router.post("/register-device", auth, deviceValidation, registerDevice);

module.exports = router;
