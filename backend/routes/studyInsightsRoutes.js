const express = require("express");
const requireAuth = require("../middleware/authMiddleware");
const { getStudyInsights } = require("../controllers/studyInsightsController");

const router = express.Router();
router.use(requireAuth);
router.get("/", getStudyInsights);

module.exports = router;
