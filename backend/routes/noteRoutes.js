
const express = require("express");

const {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");

const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// Protect all Notes endpoints
// =====================================

router.use(requireAuth);

// =====================================
// CREATE NOTE
// POST /api/notes
// =====================================

router.post("/", createNote);

// =====================================
// GET ALL MY NOTES
// GET /api/notes
// =====================================

router.get("/", getNotes);

// =====================================
// GET SINGLE NOTE
// GET /api/notes/:id
// =====================================

router.get("/:id", getNote);

// =====================================
// UPDATE NOTE
// PATCH /api/notes/:id
// =====================================

router.patch("/:id", updateNote);

// =====================================
// DELETE NOTE
// DELETE /api/notes/:id
// =====================================

router.delete("/:id", deleteNote);

module.exports = router;
