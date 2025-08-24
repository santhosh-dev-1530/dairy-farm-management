const express = require("express");
const router = express.Router();

// @route   GET /api/health
// @desc    Get health records
// @access  Private
router.get("/", (req, res) => {
  res.json({ message: "Health route - Coming soon!" });
});

module.exports = router;
