const express = require("express");
const { body } = require("express-validator");
const {
  getCattle,
  getCattleById,
  addCattle,
  updateCattle,
  deleteCattle,
  assignCattle,
  uploadPhoto,
  upload,
} = require("../controllers/cattleController");
const { auth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const cattleValidation = [
  body("tagNumber").trim().notEmpty().withMessage("Tag number is required"),
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("breed").trim().notEmpty().withMessage("Breed is required"),
  body("gender").isIn(["MALE", "FEMALE"]).withMessage("Invalid gender"),
  body("dateOfBirth").isISO8601().withMessage("Invalid date format"),
];

const assignmentValidation = [
  body("userId").notEmpty().withMessage("User ID is required"),
];

// Routes
router.get("/", auth, getCattle);
router.get("/:id", auth, getCattleById);
router.post("/", auth, requireAdmin, cattleValidation, addCattle);
router.put("/:id", auth, cattleValidation, updateCattle);
router.delete("/:id", auth, requireAdmin, deleteCattle);
router.post(
  "/:id/assign",
  auth,
  requireAdmin,
  assignmentValidation,
  assignCattle
);
router.post("/:id/photo", auth, upload.single("photo"), uploadPhoto);

module.exports = router;
