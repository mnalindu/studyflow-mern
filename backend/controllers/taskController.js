
const mongoose = require("mongoose");
const Task = require("../models/Task");
const {
  syncTaskDeadlineReminder,
  deleteTaskDeadlineReminder,
} = require("../services/taskReminderService");

// Fields students are allowed to change
const allowedFields = [
  "title",
  "description",
  "subject",
  "priority",
  "due",
  "completed",
];

// Convert MongoDB task into frontend-friendly data
function formatTask(task) {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    subject: task.subject,
    priority: task.priority,
    due: task.due,
    completed: task.completed,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

// Check that a due date is a real calendar date
function validDueDate(value) {
  if (value === "") return true;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

// Validate incoming task data
function validateTaskData(body, creating = false) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return { error: "Invalid task data." };
  }

  const keys = Object.keys(body);

  if (keys.length === 0) {
    return { error: "No task data provided." };
  }

  for (const key of keys) {
    if (!allowedFields.includes(key)) {
      return {
        error: `Field '${key}' is not allowed.`,
      };
    }
  }

  const data = {};

  if (creating && !keys.includes("title")) {
    return { error: "Task title is required." };
  }

  if (keys.includes("title")) {
    if (
      typeof body.title !== "string" ||
      !body.title.trim() ||
      body.title.trim().length > 150
    ) {
      return {
        error: "Title must contain 1–150 characters.",
      };
    }

    data.title = body.title.trim();
  }

  if (keys.includes("description")) {
    if (
      typeof body.description !== "string" ||
      body.description.length > 2000
    ) {
      return {
        error: "Invalid description.",
      };
    }

    data.description = body.description.trim();
  }

  if (keys.includes("subject")) {
    if (
      typeof body.subject !== "string" ||
      !body.subject.trim() ||
      body.subject.length > 100
    ) {
      return { error: "Invalid subject." };
    }

    data.subject = body.subject.trim();
  }

  if (keys.includes("priority")) {
    if (typeof body.priority !== "string") {
      return { error: "Invalid priority." };
    }

    const priority = body.priority.toLowerCase();

    if (!["low", "medium", "high"].includes(priority)) {
      return {
        error: "Priority must be low, medium or high.",
      };
    }

    data.priority = priority;
  }

  if (keys.includes("due")) {
    if (
      typeof body.due !== "string" ||
      !validDueDate(body.due)
    ) {
      return {
        error: "Due date must be a valid YYYY-MM-DD date.",
      };
    }

    data.due = body.due;
  }

  if (keys.includes("completed")) {
    if (typeof body.completed !== "boolean") {
      return {
        error: "Completed must be true or false.",
      };
    }

    data.completed = body.completed;
  }

  return { data };
}

// Common error handler
function handleTaskError(res, error) {
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Task API error:", error.message);

  return res.status(500).json({
    success: false,
    message: "Task operation failed.",
  });
}

// =====================================
// Automatic Reminder Helpers
// =====================================

// A task operation should not look like it failed AFTER the task
// has already been saved. If reminder sync fails, report a warning
// while keeping the existing task API response successful.
async function syncReminderSafely(task, userId) {
  try {
    await syncTaskDeadlineReminder({ task, userId });
    return {};
  } catch (error) {
    console.error("Automatic reminder sync failed:", error);
    return {
      reminderWarning:
        "Task saved, but its automatic reminder could not be updated.",
    };
  }
}

async function deleteReminderSafely(taskId, userId) {
  try {
    await deleteTaskDeadlineReminder({ taskId, userId });
    return {};
  } catch (error) {
    console.error("Automatic reminder removal failed:", error);
    return {
      reminderWarning:
        "Task deleted, but its automatic reminder could not be removed.",
    };
  }
}

// =====================================
// CREATE TASK
// POST /api/tasks
// =====================================

exports.createTask = async (req, res) => {
  try {
    const { data, error } = validateTaskData(
      req.body,
      true
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const task = await Task.create({
      ...data,
      user: req.user._id,
    });

    // Schedule reminder if task is incomplete and has a due date.
    const reminderResult = await syncReminderSafely(
      task,
      req.user._id
    );

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      task: formatTask(task),
      ...reminderResult,
    });
  } catch (error) {
    return handleTaskError(res, error);
  }
};

// =====================================
// GET ALL USER TASKS
// GET /api/tasks
// =====================================

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks: tasks.map(formatTask),
    });
  } catch (error) {
    return handleTaskError(res, error);
  }
};

// =====================================
// GET ONE TASK
// GET /api/tasks/:id
// =====================================

exports.getTask = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      success: true,
      task: formatTask(task),
    });
  } catch (error) {
    return handleTaskError(res, error);
  }
};

// =====================================
// UPDATE TASK / COMPLETE TASK
// PATCH /api/tasks/:id
// =====================================

exports.updateTask = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }

    const { data, error } = validateTaskData(
      req.body
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      { $set: data },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // Keep the automatic reminder in sync with the saved task.
    // Handles due-date edits, title changes, completion, and reopening.
    const reminderResult = await syncReminderSafely(
      task,
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      task: formatTask(task),
      ...reminderResult,
    });
  } catch (error) {
    return handleTaskError(res, error);
  }
};

// =====================================
// DELETE TASK
// DELETE /api/tasks/:id
// =====================================

exports.deleteTask = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // Remove only the system-generated reminder for this task.
    // Manually scheduled reminders are never deleted here.
    const reminderResult = await deleteReminderSafely(
      task._id,
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
      ...reminderResult,
    });
  } catch (error) {
    return handleTaskError(res, error);
  }
};
