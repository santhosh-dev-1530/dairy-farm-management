const express = require("express");
const { body } = require("express-validator");
const {
  recordFeeding,
  getFeedingHistory,
  getFeedingStats,
  batchRecordFeeding,
} = require("../controllers/feedingController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const feedingValidation = [
  body("cattleId").notEmpty().withMessage("Cattle ID is required"),
  body("feedType").trim().notEmpty().withMessage("Feed type is required"),
  body("quantity").isNumeric().withMessage("Quantity must be a number"),
  body("waterGiven").isBoolean().withMessage("Water given must be boolean"),
];

const batchFeedingValidation = [
  body("cattleIds")
    .isArray({ min: 1 })
    .withMessage("Cattle IDs array is required"),
  body("feedType").trim().notEmpty().withMessage("Feed type is required"),
  body("quantity").isNumeric().withMessage("Quantity must be a number"),
  body("waterGiven").isBoolean().withMessage("Water given must be boolean"),
];

// Routes
router.post("/", auth, feedingValidation, recordFeeding);
router.get("/cattle/:cattleId", auth, getFeedingHistory);
router.get("/cattle/:cattleId/stats", auth, getFeedingStats);
router.post("/batch", auth, batchFeedingValidation, batchRecordFeeding);

module.exports = router;
