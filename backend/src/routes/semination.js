const express = require("express");
const { body } = require("express-validator");
const {
  recordSemination,
  checkPregnancy,
  getSeminationHistory,
  getPendingChecks,
} = require("../controllers/seminationController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const seminationValidation = [
  body("cattleId").notEmpty().withMessage("Cattle ID is required"),
  body("seminationDate").isISO8601().withMessage("Invalid date format"),
];

const pregnancyCheckValidation = [
  body("isPregnant")
    .isBoolean()
    .withMessage("Pregnancy result must be boolean"),
];

// Routes
router.post("/", auth, seminationValidation, recordSemination);
router.put("/:id/check", auth, pregnancyCheckValidation, checkPregnancy);
router.get("/cattle/:cattleId", auth, getSeminationHistory);
router.get("/pending-checks", auth, getPendingChecks);

module.exports = router;
