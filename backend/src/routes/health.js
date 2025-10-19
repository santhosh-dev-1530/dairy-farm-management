const express = require("express");
const { body } = require("express-validator");
const {
  recordHealthEvent,
  getHealthHistory,
  getHealthStats,
  getHealthAlerts,
} = require("../controllers/healthController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const healthValidation = [
  body("cattleId").notEmpty().withMessage("Cattle ID is required"),
  body("recordType")
    .isIn(["DISEASE", "INJECTION", "CHECKUP"])
    .withMessage("Invalid record type"),
  body("description").trim().notEmpty().withMessage("Description is required"),
];

// Routes
router.post("/", auth, healthValidation, recordHealthEvent);
router.get("/cattle/:cattleId", auth, getHealthHistory);
router.get("/cattle/:cattleId/stats", auth, getHealthStats);
router.get("/alerts", auth, getHealthAlerts);

module.exports = router;
