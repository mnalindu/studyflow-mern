
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    // Student who owns this task
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Task title
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: 150,
    },

    // Optional description
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    // Task subject or category
    subject: {
      type: String,
      default: "General",
      trim: true,
    },

    // Priority
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      lowercase: true,
    },

    // Due date in YYYY-MM-DD format
    due: {
      type: String,
      default: "",
      match: [
        /^$|^\d{4}-\d{2}-\d{2}$/,
        "Due date must use YYYY-MM-DD format",
      ],
    },

    // Task completion status
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize queries for a student's tasks
taskSchema.index({
  user: 1,
  createdAt: -1,
});

// Export the Task model
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
