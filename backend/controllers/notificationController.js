
const mongoose = require("mongoose");

const Notification = require("../models/Notification");
const Task = require("../models/Task");

// =====================================
// Format Notification for Frontend
// =====================================

function formatNotification(notification) {
  return {
    id: notification._id.toString(),
    task: notification.task
      ? notification.task.toString()
      : null,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    remindAt: notification.remindAt,
    isRead: notification.isRead,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}

// =====================================
// Validate ISO Date
// =====================================

function parseReminderDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  ) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

// =====================================
// Handle Database Errors
// =====================================

function handleNotificationError(res, error) {
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Invalid notification data.",
    });
  }

  console.error(
    "Notification API Error:",
    error.message
  );

  return res.status(500).json({
    success: false,
    message: "Notification operation failed.",
  });
}

// =====================================
// CREATE NOTIFICATION
// POST /api/notifications
// =====================================

exports.createNotification = async (req, res) => {
  try {
    const body = req.body;

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification data.",
      });
    }

    const allowedFields = [
      "task",
      "type",
      "title",
      "message",
      "remindAt",
    ];

    const invalidField = Object.keys(body).find(
      (field) => !allowedFields.includes(field)
    );

    if (invalidField) {
      return res.status(400).json({
        success: false,
        message: `Field '${invalidField}' is not allowed.`,
      });
    }

    // Validate title
    if (
      typeof body.title !== "string" ||
      body.title.trim().length < 1 ||
      body.title.trim().length > 150
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Notification title must contain 1 to 150 characters.",
      });
    }

    // Validate notification type
    const type = body.type || "study_reminder";

    const allowedTypes = [
      "task_due",
      "study_reminder",
      "general",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification type.",
      });
    }

    // Validate message
    const message = body.message ?? "";

    if (
      typeof message !== "string" ||
      message.length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Notification message must not exceed 1000 characters.",
      });
    }

    // Validate reminder time
    const remindAt = parseReminderDate(body.remindAt);

    if (!remindAt) {
      return res.status(400).json({
        success: false,
        message:
          "A valid ISO reminder date and time is required.",
      });
    }

    let taskId = null;

    // Validate optional task ownership
    if (body.task !== undefined && body.task !== null) {
      if (
        typeof body.task !== "string" ||
        !mongoose.isValidObjectId(body.task)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID.",
        });
      }

      const taskExists = await Task.exists({
        _id: body.task,
        user: req.user._id,
      });

      if (!taskExists) {
        return res.status(404).json({
          success: false,
          message: "Related task not found.",
        });
      }

      taskId = body.task;
    }

    // Task deadline reminders require a related task
    if (type === "task_due" && !taskId) {
      return res.status(400).json({
        success: false,
        message:
          "A related task is required for task deadline reminders.",
      });
    }

    const notification = await Notification.create({
      user: req.user._id,
      task: taskId,
      type,
      title: body.title.trim(),
      message,
      remindAt,
    });

    return res.status(201).json({
      success: true,
      message: "Notification created successfully.",
      notification: formatNotification(notification),
    });
  } catch (error) {
    return handleNotificationError(res, error);
  }
};

// =====================================
// GET MY NOTIFICATIONS
// GET /api/notifications
//
// Optional:
// ?scope=due
// ?scope=upcoming
// ?scope=all
// =====================================

exports.getNotifications = async (req, res) => {
  try {
    const scope = req.query.scope || "due";

    if (
      !["due", "upcoming", "all"].includes(scope)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification scope.",
      });
    }

    const filter = {
      user: req.user._id,
    };

    const now = new Date();

    if (scope === "due") {
      filter.remindAt = { $lte: now };
    }

    if (scope === "upcoming") {
      filter.remindAt = { $gt: now };
    }

    const sort =
      scope === "upcoming"
        ? { remindAt: 1 }
        : { remindAt: -1 };

    const notifications = await Notification.find(
      filter
    )
      .sort(sort)
      .limit(100);

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications: notifications.map(
        formatNotification
      ),
    });
  } catch (error) {
    return handleNotificationError(res, error);
  }
};

// =====================================
// GET UNREAD NOTIFICATION COUNT
// GET /api/notifications/unread-count
// =====================================

exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount =
      await Notification.countDocuments({
        user: req.user._id,
        isRead: false,
        remindAt: { $lte: new Date() },
      });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    return handleNotificationError(res, error);
  }
};

// =====================================
// MARK SINGLE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// =====================================

exports.markNotificationRead = async (req, res) => {
  try {
    const notificationId = req.params.id;

    if (!mongoose.isValidObjectId(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const notification = await Notification.findOne({
      _id: notificationId,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    if (notification.remindAt > new Date()) {
      return res.status(400).json({
        success: false,
        message: "This reminder is not due yet.",
      });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();

      await notification.save();
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification: formatNotification(notification),
    });
  } catch (error) {
    return handleNotificationError(res, error);
  }
};

// =====================================
// MARK ALL DUE NOTIFICATIONS AS READ
// PATCH /api/notifications/read-all
// =====================================

exports.markAllNotificationsRead = async (
  req,
  res
) => {
  try {
    const now = new Date();

    const result = await Notification.updateMany(
      {
        user: req.user._id,
        isRead: false,
        remindAt: { $lte: now },
      },
      {
        $set: {
          isRead: true,
          readAt: now,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Due notifications marked as read.",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    return handleNotificationError(res, error);
  }
};

// =====================================
// DELETE NOTIFICATION
// DELETE /api/notifications/:id
// =====================================

exports.deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;

    if (!mongoose.isValidObjectId(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const notification =
      await Notification.findOneAndDelete({
        _id: notificationId,
        user: req.user._id,
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    return handleNotificationError(res, error);
  }
};
