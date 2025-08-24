const express = require("express");
const router = express.Router();

// @route   GET /api/milk
// @desc    Get milk production data
// @access  Private
router.get("/", (req, res) => {
  res.json({ message: "Milk route - Coming soon!" });
});

module.exports = router;
