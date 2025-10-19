const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  getMe,
  updateUserRole,
  registerDevice,
} = require("../controllers/authController");
const { auth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role").optional().isIn(["ADMIN", "USER"]).withMessage("Invalid role"),
];

const loginValidation = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const deviceValidation = [
  body("fcmToken").notEmpty().withMessage("FCM token is required"),
];

// Routes
router.post("/register", auth, requireAdmin, registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", auth, getMe);
router.put("/users/:id", auth, requireAdmin, updateUserRole);
router.post("/register-device", auth, deviceValidation, registerDevice);

module.exports = router;
