require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const noteRoutes = require("./routes/noteRoutes");
const studySessionRoutes = require("./routes/studySessionRoutes");
const studyInsightsRoutes = require("./routes/studyInsightsRoutes");
const studyRoomRoutes = require("./routes/studyRoomRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Centralized error handling (created in Step 07.12.2)
const {
  apiNotFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const app = express();

// =====================================
// Middleware
// =====================================

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
    credentials: true,
  })
);

// JSON parser errors are handled by errorHandler below.
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

// =====================================
// API Routes
// =====================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to StudyFlow Backend API",
  });
});

app.get("/api/health", (req, res) => {
  const connected =
    mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    success: connected,
    message: connected
      ? "StudyFlow Backend is running successfully"
      : "Database is disconnected",
    database: connected
      ? "Connected"
      : "Disconnected",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Task Management Routes
app.use("/api/tasks", taskRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/study-sessions", studySessionRoutes);
app.use("/api/study-insights", studyInsightsRoutes);
app.use("/api/study-rooms", studyRoomRoutes);
app.use("/api/notifications", notificationRoutes);

// =====================================
// 404 Handler and Central Error Handler
// IMPORTANT: Both must come AFTER all API routes.
// =====================================

app.use(apiNotFound);
app.use(errorHandler);

// =====================================
// Start Server
// =====================================

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET.length < 32
    ) {
      throw new Error(
        "JWT_SECRET must contain at least 32 characters."
      );
    }

    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `StudyFlow Backend running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Backend startup failed:",
      error.message
    );

    process.exit(1);
  }
}

startServer();
