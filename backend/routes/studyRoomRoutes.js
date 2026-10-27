
const express = require("express");

const {
  createStudyRoom,
  getStudyRooms,
  getStudyRoom,
  joinStudyRoom,
  leaveStudyRoom,
  deleteStudyRoom,
} = require("../controllers/studyRoomController");

const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// Protect all Study Room API endpoints
// =====================================

router.use(requireAuth);

// =====================================
// CREATE STUDY ROOM
// POST /api/study-rooms
// =====================================

router.post("/", createStudyRoom);

// =====================================
// GET AVAILABLE STUDY ROOMS
// GET /api/study-rooms
// =====================================

router.get("/", getStudyRooms);

// =====================================
// GET SINGLE STUDY ROOM
// GET /api/study-rooms/:id
// =====================================

router.get("/:id", getStudyRoom);

// =====================================
// JOIN STUDY ROOM
// POST /api/study-rooms/:id/join
// =====================================

router.post("/:id/join", joinStudyRoom);

// =====================================
// LEAVE STUDY ROOM
// POST /api/study-rooms/:id/leave
// =====================================

router.post("/:id/leave", leaveStudyRoom);

// =====================================
// DELETE STUDY ROOM
// DELETE /api/study-rooms/:id
// =====================================

router.delete("/:id", deleteStudyRoom);

// =====================================
// Export Routes
// =====================================

module.exports = router;
