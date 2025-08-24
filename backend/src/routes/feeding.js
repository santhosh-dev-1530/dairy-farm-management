const express = require("express");
const router = express.Router();

// @route   GET /api/feeding
// @desc    Get feeding schedules
// @access  Private
router.get("/", (req, res) => {
  res.json({ message: "Feeding route - Coming soon!" });
});

module.exports = router;
