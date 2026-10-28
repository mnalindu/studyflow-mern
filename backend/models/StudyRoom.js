
const mongoose = require("mongoose");

// =====================================
// Study Room Schema
// =====================================

const studyRoomSchema = new mongoose.Schema(
  {
    // Room name
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      minlength: 3,
      maxlength: 80,
    },

    // Short description displayed on room cards
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 180,
    },

    // Room visual emoji
    emoji: {
      type: String,
      default: "🌿",
      maxlength: 20,
    },

    // Room introduction displayed in the modal
    introduction: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    // Default focus duration in minutes
    focusMinutes: {
      type: Number,
      default: 25,
      min: 5,
      max: 180,
      validate: {
        validator: Number.isInteger,
        message: "Focus minutes must be a whole number.",
      },
    },

    // Student who created the room
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Students who have joined the room
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Whether the room is publicly discoverable
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================
// Database Indexes
// =====================================

// Quickly retrieve publicly available rooms
studyRoomSchema.index({
  isPublic: 1,
  createdAt: -1,
});

// Quickly find rooms joined by a student
studyRoomSchema.index({
  members: 1,
});

// =====================================
// Export Study Room Model
// =====================================

const StudyRoom = mongoose.model(
  "StudyRoom",
  studyRoomSchema
);

module.exports = StudyRoom;
