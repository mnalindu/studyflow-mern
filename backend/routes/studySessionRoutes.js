
const express = require("express");

const {
  createStudySession,
  getStudySessions,
  getStudySessionStats,
} = require("../controllers/studySessionController");

const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// Protect all Study Session endpoints
// =====================================

router.use(requireAuth);

// =====================================
// CREATE STUDY SESSION
// POST /api/study-sessions
// =====================================

router.post("/", createStudySession);

// =====================================
// GET STUDY SESSION STATISTICS
// GET /api/study-sessions/stats
// =====================================

router.get("/stats", getStudySessionStats);

// =====================================
// GET MY STUDY SESSION HISTORY
// GET /api/study-sessions
// =====================================

router.get("/", getStudySessions);

module.exports = router;
