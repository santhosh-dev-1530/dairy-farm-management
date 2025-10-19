const express = require("express");
const { body } = require("express-validator");
const {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getOrganizationStats,
} = require("../controllers/organizationController");
const { auth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const organizationValidation = [
  body("name").trim().notEmpty().withMessage("Organization name is required"),
];

// Routes
router.post(
  "/",
  auth,
  requireAdmin,
  organizationValidation,
  createOrganization
);
router.get("/", auth, requireAdmin, getOrganizations);
router.get("/:id", auth, requireAdmin, getOrganizationById);
router.put(
  "/:id",
  auth,
  requireAdmin,
  organizationValidation,
  updateOrganization
);
router.delete("/:id", auth, requireAdmin, deleteOrganization);
router.get("/:id/stats", auth, requireAdmin, getOrganizationStats);

module.exports = router;
