
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

    // Notification title
    title: {
      type: String,
      required: [true, "Notification title is required"],
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
      required: [true, "Reminder date is required"],
    },

    // Read / Unread status
    isRead: {
      type: Boolean,
      default: false,
    },

    // Time when student reads the notification
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
// Database Indexes
// =====================================

// Efficient notification queries per student
notificationSchema.index({
  user: 1,
  remindAt: -1,
});

// Efficient unread notification queries
notificationSchema.index({
  user: 1,
  isRead: 1,
  remindAt: -1,
});

// =====================================
// Export Notification Model
// =====================================

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

module.exports = Notification;
