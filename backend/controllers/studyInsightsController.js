const mongoose = require("mongoose");
const StudySession = require("../models/StudySession");

// GET /api/study-insights?timeZone=Asia/Colombo
// Aggregate *all* of this student's sessions by local calendar day.
// This is deliberately separate from GET /api/study-sessions, which
// returns only the most recent 100 individual records.
exports.getStudyInsights = async (req, res) => {
  const timeZone = req.query.timeZone || "UTC";

  if (typeof timeZone !== "string" || timeZone.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Invalid time zone.",
    });
  }

  try {
    // Reject unsupported time zones before passing them to MongoDB.
    new Intl.DateTimeFormat("en-US", { timeZone });
  } catch {
    return res.status(400).json({
      success: false,
      message: "Unsupported time zone.",
    });
  }

  try {
    // Mongoose aggregation does not cast the match ID automatically.
    const userId = new mongoose.Types.ObjectId(String(req.user._id));
    const results = await StudySession.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$completedAt",
              timezone: timeZone,
            },
          },
          sessions: { $sum: 1 },
          focusSeconds: { $sum: "$durationSeconds" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    let totalSessions = 0;
    let totalFocusSeconds = 0;

    const days = results.map((day) => {
      totalSessions += day.sessions;
      totalFocusSeconds += day.focusSeconds;
      return {
        date: day._id,
        sessions: day.sessions,
        focusSeconds: day.focusSeconds,
      };
    });

    return res.status(200).json({
      success: true,
      timeZone,
      totalSessions,
      totalFocusSeconds,
      days,
    });
  } catch (error) {
    console.error("Study Insights Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load study insights.",
    });
  }
};
