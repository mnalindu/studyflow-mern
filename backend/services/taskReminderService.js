
const mongoose = require("mongoose");

const Notification = require("../models/Notification");

// =====================================
// TASK REMINDER SETTINGS
// =====================================

// Initial project convention:
// 9:00 AM Sri Lanka time (UTC +05:30).
//
// 09:00 - 05:30 = 03:30 UTC.
//
// Student-specific timezones can be
// supported later through Preferences.

const REMINDER_UTC_HOUR = 3;
const REMINDER_UTC_MINUTE = 30;

// =====================================
// GET VALID TASK DUE DATE
// =====================================

function getDueDateOnly(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  let dateText;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error("Invalid task due date.");
    }

    dateText = value.toISOString().slice(0, 10);
  } else if (typeof value === "string") {
    // Accept YYYY-MM-DD and ISO datetime strings
    dateText = value.slice(0, 10);
  } else {
    throw new Error("Invalid task due date.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    throw new Error("Task due date must be YYYY-MM-DD.");
  }

  // Validate actual calendar date.
  const parsedDate = new Date(
    `${dateText}T00:00:00.000Z`
  );

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== dateText
  ) {
    throw new Error("Invalid task calendar date.");
  }

  return dateText;
}

// =====================================
// CONVERT DUE DATE TO REMINDER TIME
// =====================================

function getReminderDate(dueDateText) {
  const [year, month, day] = dueDateText
    .split("-")
    .map(Number);

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      REMINDER_UTC_HOUR,
      REMINDER_UTC_MINUTE
    )
  );
}

// =====================================
// VALIDATE TASK AND USER IDs
// =====================================

function validateIds(taskId, userId) {
  if (
    !mongoose.isValidObjectId(taskId) ||
    !mongoose.isValidObjectId(userId)
  ) {
    throw new Error(
      "Valid task and user IDs are required."
    );
  }
}

// =====================================
// DELETE AUTOMATIC TASK REMINDER
// =====================================

async function deleteTaskDeadlineReminder({
  taskId,
  userId,
}) {
  validateIds(taskId, userId);

  // Delete ONLY automatically generated reminders.
  // Student-created manual reminders remain untouched.

  const result = await Notification.deleteMany({
    task: taskId,
    user: userId,
    source: "task_auto",
  });

  return {
    action: "removed",
    deletedCount: result.deletedCount,
  };
}

// =====================================
// CREATE OR UPDATE TASK REMINDER
// =====================================

async function syncTaskDeadlineReminder({
  task,
  userId,
}) {
  if (!task || typeof task !== "object") {
    throw new Error("A task object is required.");
  }

  const taskId = task._id || task.id;

  validateIds(taskId, userId);

  // =====================================
  // Remove Reminder if Task Completed
  // =====================================

  if (task.completed === true) {
    return deleteTaskDeadlineReminder({
      taskId,
      userId,
    });
  }

  // =====================================
  // Remove Reminder if Due Date Missing
  // =====================================

  const dueDateText = getDueDateOnly(task.due);

  if (!dueDateText) {
    return deleteTaskDeadlineReminder({
      taskId,
      userId,
    });
  }

  // =====================================
  // Prepare Notification Data
  // =====================================

  const taskTitle =
    typeof task.title === "string"
      ? task.title.trim()
      : "";

  const safeTitle = taskTitle || "Untitled task";

  const title = `Task due: ${safeTitle}`.slice(
    0,
    150
  );

  const message =
    `Your task "${safeTitle}" is due on ` +
    `${dueDateText}. Open My tasks to review it.`;

  const remindAt = getReminderDate(dueDateText);

  // =====================================
  // Find Existing Automatic Reminder
  // =====================================

  const filter = {
    user: userId,
    task: taskId,
    source: "task_auto",
  };

  const existingNotification =
    await Notification.findOne(filter);

  // =====================================
  // Preserve Read Status if Nothing Changed
  // =====================================

  const isUnchanged =
    existingNotification &&
    existingNotification.title === title &&
    existingNotification.message === message &&
    existingNotification.remindAt.getTime() ===
      remindAt.getTime();

  if (isUnchanged) {
    return {
      action: "unchanged",
      notification: existingNotification,
    };
  }

  // =====================================
  // Create or Update Reminder
  // =====================================

  const update = {
    $set: {
      type: "task_due",
      title,
      message: message.slice(0, 1000),
      remindAt,

      // A changed deadline/title needs a new alert.
      isRead: false,
      readAt: null,
    },

    $setOnInsert: {
      user: userId,
      task: taskId,
      source: "task_auto",
    },
  };

  try {
    const notification =
      await Notification.findOneAndUpdate(
        filter,
        update,
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

    return {
      action: existingNotification
        ? "updated"
        : "created",
      notification,
    };
  } catch (error) {
    // Handle concurrent upsert attempts.
    // The unique partial index prevents duplicates.
    if (error.code !== 11000) {
      throw error;
    }

    const notification =
      await Notification.findOneAndUpdate(
        filter,
        {
          $set: update.$set,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!notification) {
      throw error;
    }

    return {
      action: "updated",
      notification,
    };
  }
}

// =====================================
// EXPORT SERVICE FUNCTIONS
// =====================================

module.exports = {
  syncTaskDeadlineReminder,
  deleteTaskDeadlineReminder,
};
