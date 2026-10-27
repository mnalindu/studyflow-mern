
const mongoose = require("mongoose");

// =====================================
// Study Session Schema
// =====================================

const studySessionSchema = new mongoose.Schema(
  {
    // Student who completed the session
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Actual focused study time in seconds
    durationSeconds: {
      type: Number,
      required: true,
      min: 1,
      max: 86400,
    },

    // When the study session started
    startedAt: {
      type: Date,
      required: true,
    },

    // When the study session finished
    completedAt: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.startedAt;
        },
        message:
          "Completion time must be after start time.",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Faster queries for each student's sessions
studySessionSchema.index({
  user: 1,
  completedAt: -1,
});

// Create and export model
const StudySession = mongoose.model(
  "StudySession",
  studySessionSchema
);

module.exports = StudySession;
