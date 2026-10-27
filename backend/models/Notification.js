
const mongoose = require("mongoose");

// =====================================
// Notification Schema
// =====================================

const notificationSchema = new mongoose.Schema(
  {
    // Student who owns this notification
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Optional related task
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    // Notification category
    type: {
      type: String,
      enum: [
        "task_due",
        "study_reminder",
        "general",
      ],
      default: "study_reminder",
    },

    // NEW: How was this notification created?
    source: {
      type: String,
      enum: [
        "manual",
        "task_auto",
      ],
      default: "manual",
    },

    // Notification title
    title: {
      type: String,
      required: [
        true,
        "Notification title is required",
      ],
      trim: true,
      maxlength: 150,
    },

    // Notification message
    message: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    // Date and time when reminder becomes due
    remindAt: {
      type: Date,
      required: [
        true,
        "Reminder date is required",
      ],
    },

    // Read / Unread status
    isRead: {
      type: Boolean,
      default: false,
    },

    // Time when student reads notification
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================
// Existing Database Indexes
// =====================================

notificationSchema.index({
  user: 1,
  remindAt: -1,
});

notificationSchema.index({
  user: 1,
  isRead: 1,
  remindAt: -1,
});

// =====================================
// NEW: Prevent Duplicate Auto Reminders
// =====================================

// Only one automatic reminder per task per student.
//
// Manual reminders are not affected.
//
// Partial index applies only when:
// source = "task_auto"
// and task is a MongoDB ObjectId.

notificationSchema.index(
  {
    user: 1,
    task: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      source: "task_auto",
      task: {
        $type: "objectId",
      },
    },
    name: "unique_auto_task_notification",
  }
);

// =====================================
// Export Notification Model
// =====================================

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

module.exports = Notification;
