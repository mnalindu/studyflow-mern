
const StudySession = require("../models/StudySession");

// =====================================
// Format Session for Frontend
// =====================================

function formatSession(session) {
  return {
    id: session._id.toString(),
    durationSeconds: session.durationSeconds,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

// =====================================
// Parse ISO Date
// =====================================

function parseDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  ) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

// =====================================
// Handle Database Errors
// =====================================

function handleSessionError(res, error) {
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Invalid study session data.",
    });
  }

  console.error(
    "Study Session Error:",
    error.message
  );

  return res.status(500).json({
    success: false,
    message: "Study session operation failed.",
  });
}

// =====================================
// CREATE STUDY SESSION
// POST /api/study-sessions
// =====================================

exports.createStudySession = async (req, res) => {
  try {
    const body = req.body;

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid study session data.",
      });
    }

    const allowedFields = [
      "durationSeconds",
      "startedAt",
      "completedAt",
    ];

    // Reject extra fields, including user ID
    const invalidField = Object.keys(body).find(
      (field) => !allowedFields.includes(field)
    );

    if (invalidField) {
      return res.status(400).json({
        success: false,
        message: `Field '${invalidField}' is not allowed.`,
      });
    }

    const {
      durationSeconds,
      startedAt,
      completedAt,
    } = body;

    // Validate duration
    if (
      !Number.isInteger(durationSeconds) ||
      durationSeconds < 1 ||
      durationSeconds > 86400
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Duration must be between 1 and 86400 seconds.",
      });
    }

    // Validate timestamps
    const startDate = parseDate(startedAt);
    const completionDate = parseDate(completedAt);

    if (!startDate || !completionDate) {
      return res.status(400).json({
        success: false,
        message:
          "Valid ISO start and completion dates are required.",
      });
    }

    if (completionDate <= startDate) {
      return res.status(400).json({
        success: false,
        message:
          "Completion time must be after start time.",
      });
    }

    // Prevent durations greater than elapsed time.
    // Small tolerance handles timer rounding.
    const elapsedMilliseconds =
      completionDate.getTime() -
      startDate.getTime();

    if (
      elapsedMilliseconds + 2000 <
      durationSeconds * 1000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Focus duration cannot exceed elapsed session time.",
      });
    }

    // Allow 5 minutes for client clock differences
    if (
      completionDate.getTime() >
      Date.now() + 5 * 60 * 1000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Completion time cannot be in the future.",
      });
    }

    // Get student ID from authenticated session
    const session = await StudySession.create({
      user: req.user._id,
      durationSeconds,
      startedAt: startDate,
      completedAt: completionDate,
    });

    return res.status(201).json({
      success: true,
      message: "Study session saved successfully.",
      session: formatSession(session),
    });
  } catch (error) {
    return handleSessionError(res, error);
  }
};

// =====================================
// GET MY STUDY SESSIONS
// GET /api/study-sessions
// =====================================

exports.getStudySessions = async (req, res) => {
  try {
    // Latest 100 completed sessions
    const sessions = await StudySession.find({
      user: req.user._id,
    })
      .sort({ completedAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions: sessions.map(formatSession),
    });
  } catch (error) {
    return handleSessionError(res, error);
  }
};

// =====================================
// GET STUDY SESSION STATISTICS
// GET /api/study-sessions/stats
//
// Optional:
// ?from=ISO_DATE&to=ISO_DATE
//
// "to" is exclusive.
// =====================================

exports.getStudySessionStats = async (req, res) => {
  try {
    const { from, to } = req.query;

    const hasFrom = from !== undefined;
    const hasTo = to !== undefined;

    // Dates must be supplied together
    if (hasFrom !== hasTo) {
      return res.status(400).json({
        success: false,
        message:
          "Provide both 'from' and 'to' dates.",
      });
    }

    let fromDate = null;
    let toDate = null;

    if (hasFrom && hasTo) {
      fromDate = parseDate(from);
      toDate = parseDate(to);

      if (
        !fromDate ||
        !toDate ||
        fromDate >= toDate
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid statistics date range.",
        });
      }
    }

    const userId = req.user._id;

    // All-time statistics
    const totalResults = await StudySession.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      {
        $group: {
          _id: null,
          sessions: { $sum: 1 },
          seconds: { $sum: "$durationSeconds" },
        },
      },
    ]);

    const overall = totalResults[0] || {
      sessions: 0,
      seconds: 0,
    };

    let periodSessions = null;
    let periodFocusSeconds = null;

    // Statistics for a requested time period
    if (fromDate && toDate) {
      const periodResults =
        await StudySession.aggregate([
          {
            $match: {
              user: userId,
              completedAt: {
                $gte: fromDate,
                $lt: toDate,
              },
            },
          },
          {
            $group: {
              _id: null,
              sessions: { $sum: 1 },
              seconds: {
                $sum: "$durationSeconds",
              },
            },
          },
        ]);

      const period = periodResults[0] || {
        sessions: 0,
        seconds: 0,
      };

      periodSessions = period.sessions;
      periodFocusSeconds = period.seconds;
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalSessions: overall.sessions,
        totalFocusSeconds: overall.seconds,
        periodSessions,
        periodFocusSeconds,
        periodStart: fromDate,
        periodEnd: toDate,
      },
    });
  } catch (error) {
    return handleSessionError(res, error);
  }
};
