
const express = require("express");

const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

// All task endpoints require authentication
router.use(requireAuth);

// Create a new task
// POST /api/tasks
router.post("/", createTask);

// Get all tasks belonging to logged-in user
// GET /api/tasks
router.get("/", getTasks);

// Get a single task
// GET /api/tasks/:id
router.get("/:id", getTask);

// Update task details or completion status
// PATCH /api/tasks/:id
router.patch("/:id", updateTask);

// Delete a task
// DELETE /api/tasks/:id
router.delete("/:id", deleteTask);

module.exports = router;
