
const mongoose = require("mongoose");

// =====================================
// Note Schema
// =====================================

const noteSchema = new mongoose.Schema(
  {
    // Student who owns this note
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Note title
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: 150,
    },

    // Note content
    content: {
      type: String,
      default: "",
      maxlength: 10000,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize queries for each student's notes
noteSchema.index({
  user: 1,
  updatedAt: -1,
});

// Create and export Note model
const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
