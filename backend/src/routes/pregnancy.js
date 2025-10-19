const express = require("express");
const { body } = require("express-validator");
const {
  getPregnancyRecords,
  recordDelivery,
  markSeparation,
  getPregnancyStats,
} = require("../controllers/pregnancyController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const deliveryValidation = [
  body("actualDeliveryDate").isISO8601().withMessage("Invalid date format"),
  body("calfName").trim().notEmpty().withMessage("Calf name is required"),
  body("calfTagNumber")
    .trim()
    .notEmpty()
    .withMessage("Calf tag number is required"),
  body("calfGender").isIn(["MALE", "FEMALE"]).withMessage("Invalid gender"),
  body("calfBreed").trim().notEmpty().withMessage("Calf breed is required"),
];

// Routes
router.get("/cattle/:cattleId", auth, getPregnancyRecords);
router.put("/:id/delivery", auth, deliveryValidation, recordDelivery);
router.put("/:id/separation", auth, markSeparation);
router.get("/stats", auth, getPregnancyStats);

module.exports = router;
