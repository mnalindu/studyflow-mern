
const mongoose = require("mongoose");
const Note = require("../models/Note");

// =====================================
// Format Note for Frontend
// =====================================

function formatNote(note) {
  return {
    id: note._id.toString(),
    title: note.title,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

// =====================================
// Validate Note Data
// =====================================

function validateNoteData(body, creating = false) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return { error: "Invalid note data." };
  }

  const keys = Object.keys(body);
  const allowedFields = ["title", "content"];

  if (keys.length === 0) {
    return { error: "No note data provided." };
  }

  for (const key of keys) {
    if (!allowedFields.includes(key)) {
      return {
        error: `Field '${key}' is not allowed.`,
      };
    }
  }

  if (creating && !keys.includes("title")) {
    return {
      error: "Note title is required.",
    };
  }

  const data = {};

  // Validate title
  if (keys.includes("title")) {
    if (
      typeof body.title !== "string" ||
      !body.title.trim() ||
      body.title.trim().length > 150
    ) {
      return {
        error:
          "Note title must contain 1 to 150 characters.",
      };
    }

    data.title = body.title.trim();
  }

  // Validate content
  if (keys.includes("content")) {
    if (
      typeof body.content !== "string" ||
      body.content.length > 10000
    ) {
      return {
        error:
          "Note content must be a string of up to 10000 characters.",
      };
    }

    data.content = body.content;
  }

  return { data };
}

// =====================================
// Handle Errors
// =====================================

function handleNoteError(res, error) {
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Invalid note data.",
    });
  }

  console.error("Note API Error:", error.message);

  return res.status(500).json({
    success: false,
    message: "Note operation failed.",
  });
}

// =====================================
// CREATE NOTE
// POST /api/notes
// =====================================

exports.createNote = async (req, res) => {
  try {
    const { data, error } = validateNoteData(
      req.body,
      true
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const note = await Note.create({
      ...data,
      user: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Note created successfully.",
      note: formatNote(note),
    });
  } catch (error) {
    return handleNoteError(res, error);
  }
};

// =====================================
// GET ALL MY NOTES
// GET /api/notes
// =====================================

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.user._id,
    }).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: notes.length,
      notes: notes.map(formatNote),
    });
  } catch (error) {
    return handleNoteError(res, error);
  }
};

// =====================================
// GET SINGLE NOTE
// GET /api/notes/:id
// =====================================

exports.getNote = async (req, res) => {
  try {
    const noteId = req.params.id;

    if (!mongoose.isValidObjectId(noteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    const note = await Note.findOne({
      _id: noteId,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    return res.status(200).json({
      success: true,
      note: formatNote(note),
    });
  } catch (error) {
    return handleNoteError(res, error);
  }
};

// =====================================
// UPDATE NOTE
// PATCH /api/notes/:id
// =====================================

exports.updateNote = async (req, res) => {
  try {
    const noteId = req.params.id;

    if (!mongoose.isValidObjectId(noteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    const { data, error } = validateNoteData(
      req.body
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    // Only fetch notes owned by the logged-in user
    const note = await Note.findOne({
      _id: noteId,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    // Apply allowed changes
    Object.assign(note, data);

    await note.save();

    return res.status(200).json({
      success: true,
      message: "Note updated successfully.",
      note: formatNote(note),
    });
  } catch (error) {
    return handleNoteError(res, error);
  }
};

// =====================================
// DELETE NOTE
// DELETE /api/notes/:id
// =====================================

exports.deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;

    if (!mongoose.isValidObjectId(noteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    const note = await Note.findOneAndDelete({
      _id: noteId,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully.",
    });
  } catch (error) {
    return handleNoteError(res, error);
  }
};
