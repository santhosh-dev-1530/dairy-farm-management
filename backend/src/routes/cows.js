const express = require("express");
const router = express.Router();

// @route   GET /api/cows
// @desc    Get all cows
// @access  Private
router.get("/", (req, res) => {
  res.json({ message: "Cows route - Coming soon!" });
});

module.exports = router;
