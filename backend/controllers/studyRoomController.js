
const mongoose = require("mongoose");
const StudyRoom = require("../models/StudyRoom");

// =====================================
// Format Room for Frontend
// =====================================

function formatRoom(room, userId) {
  const members = room.members || [];

  return {
    id: room._id.toString(),
    name: room.name,
    description: room.description,
    emoji: room.emoji,
    introduction: room.introduction,
    focusMinutes: room.focusMinutes,
    isPublic: room.isPublic,
    memberCount: members.length,
    isMember: members.some(
      (id) => id.toString() === userId.toString()
    ),
    isOwner:
      room.createdBy.toString() === userId.toString(),
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  };
}

// =====================================
// Validate Room Data
// =====================================

function validateRoomData(body) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return { error: "Invalid room data." };
  }

  const allowedFields = [
    "name",
    "description",
    "emoji",
    "introduction",
    "focusMinutes",
    "isPublic",
  ];

  const invalidField = Object.keys(body).find(
    (field) => !allowedFields.includes(field)
  );

  if (invalidField) {
    return {
      error: `Field '${invalidField}' is not allowed.`,
    };
  }

  if (
    typeof body.name !== "string" ||
    body.name.trim().length < 3 ||
    body.name.trim().length > 80
  ) {
    return {
      error: "Room name must contain 3 to 80 characters.",
    };
  }

  const data = {
    name: body.name.trim(),
  };

  if (body.description !== undefined) {
    if (
      typeof body.description !== "string" ||
      body.description.trim().length > 180
    ) {
      return {
        error: "Description must not exceed 180 characters.",
      };
    }

    data.description = body.description.trim();
  }

  if (body.emoji !== undefined) {
    if (
      typeof body.emoji !== "string" ||
      body.emoji.length > 20
    ) {
      return {
        error: "Invalid room emoji.",
      };
    }

    data.emoji = body.emoji;
  }

  if (body.introduction !== undefined) {
    if (
      typeof body.introduction !== "string" ||
      body.introduction.trim().length > 500
    ) {
      return {
        error: "Introduction must not exceed 500 characters.",
      };
    }

    data.introduction = body.introduction.trim();
  }

  if (body.focusMinutes !== undefined) {
    if (
      !Number.isInteger(body.focusMinutes) ||
      body.focusMinutes < 5 ||
      body.focusMinutes > 180
    ) {
      return {
        error:
          "Focus duration must be between 5 and 180 minutes.",
      };
    }

    data.focusMinutes = body.focusMinutes;
  }

  if (body.isPublic !== undefined) {
    if (typeof body.isPublic !== "boolean") {
      return {
        error: "isPublic must be true or false.",
      };
    }

    data.isPublic = body.isPublic;
  }

  return { data };
}

// =====================================
// Handle Database Errors
// =====================================

function handleRoomError(res, error) {
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Invalid study room data.",
    });
  }

  console.error("Study Room Error:", error.message);

  return res.status(500).json({
    success: false,
    message: "Study room operation failed.",
  });
}

// =====================================
// CREATE STUDY ROOM
// POST /api/study-rooms
// =====================================

exports.createStudyRoom = async (req, res) => {
  try {
    const { data, error } = validateRoomData(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const userId = req.user._id;

    const room = await StudyRoom.create({
      ...data,
      createdBy: userId,
      members: [userId],
    });

    return res.status(201).json({
      success: true,
      message: "Study room created successfully.",
      room: formatRoom(room, userId),
    });
  } catch (error) {
    return handleRoomError(res, error);
  }
};

// =====================================
// GET AVAILABLE STUDY ROOMS
// GET /api/study-rooms
// =====================================

exports.getStudyRooms = async (req, res) => {
  try {
    const userId = req.user._id;

    // Public rooms + rooms belonging to this student
    const rooms = await StudyRoom.find({
      $or: [
        { isPublic: true },
        { createdBy: userId },
        { members: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms: rooms.map((room) =>
        formatRoom(room, userId)
      ),
    });
  } catch (error) {
    return handleRoomError(res, error);
  }
};

// =====================================
// GET SINGLE STUDY ROOM
// GET /api/study-rooms/:id
// =====================================

exports.getStudyRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID.",
      });
    }

    // Private rooms are visible only to members
    const room = await StudyRoom.findOne({
      _id: roomId,
      $or: [
        { isPublic: true },
        { createdBy: userId },
        { members: userId },
      ],
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Study room not found.",
      });
    }

    return res.status(200).json({
      success: true,
      room: formatRoom(room, userId),
    });
  } catch (error) {
    return handleRoomError(res, error);
  }
};

// =====================================
// JOIN STUDY ROOM
// POST /api/study-rooms/:id/join
// =====================================

exports.joinStudyRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID.",
      });
    }

    // Atomic update prevents duplicate members.
    // Only publicly joinable rooms are allowed.
    const room = await StudyRoom.findOneAndUpdate(
      {
        _id: roomId,
        isPublic: true,
      },
      {
        $addToSet: {
          members: userId,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Study room not found or unavailable.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Study room joined successfully.",
      room: formatRoom(room, userId),
    });
  } catch (error) {
    return handleRoomError(res, error);
  }
};

// =====================================
// LEAVE STUDY ROOM
// POST /api/study-rooms/:id/leave
// =====================================

exports.leaveStudyRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID.",
      });
    }

    const room = await StudyRoom.findOne({
      _id: roomId,
      $or: [
        { isPublic: true },
        { createdBy: userId },
        { members: userId },
      ],
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Study room not found.",
      });
    }

    // Room creator cannot leave their own room
    if (room.createdBy.toString() === userId.toString()) {
      return res.status(403).json({
        success: false,
        message:
          "Room creator cannot leave. Delete the room instead.",
      });
    }

    const isMember = room.members.some(
      (memberId) =>
        memberId.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "You have not joined this room.",
      });
    }

    // Remove only the authenticated student
    const updatedRoom = await StudyRoom.findOneAndUpdate(
      {
        _id: roomId,
        members: userId,
      },
      {
        $pull: {
          members: userId,
        },
      },
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(409).json({
        success: false,
        message: "Room membership has changed. Please retry.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "You left the study room.",
      room: formatRoom(updatedRoom, userId),
    });
  } catch (error) {
    return handleRoomError(res, error);
  }
};

// =====================================
// DELETE STUDY ROOM
// DELETE /api/study-rooms/:id
// =====================================

exports.deleteStudyRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID.",
      });
    }

    // Only the room creator can delete the room
    const room = await StudyRoom.findOneAndDelete({
      _id: roomId,
      createdBy: userId,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Study room not found or not owned by you.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Study room deleted successfully.",
    });
  } catch (error) {
    return handleRoomError(res, error);
  }
};
