require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const noteRoutes = require("./routes/noteRoutes");
const studySessionRoutes = require("./routes/studySessionRoutes");
const studyInsightsRoutes = require("./routes/studyInsightsRoutes");
const studyRoomRoutes = require("./routes/studyRoomRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const createTrustedOriginGuard = require("./middleware/trustedOrigin");
const { apiNotFound, errorHandler } = require("./middleware/errorMiddleware");

// CORS must trust a specific frontend origin, never '*'.
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
let CLIENT_ORIGIN;

try {
  const parsed = new URL(clientUrl);
  const normalizedInput = clientUrl.replace(/\/+$/, "");

  if (
    !["http:", "https:"].includes(parsed.protocol) ||
    parsed.origin !== normalizedInput ||
    parsed.username ||
    parsed.password
  ) {
    throw new Error("CLIENT_URL must contain an origin only.");
  }

  if (
    process.env.NODE_ENV === "production" &&
    parsed.protocol !== "https:"
  ) {
    throw new Error("Production CLIENT_URL must use HTTPS.");
  }

  CLIENT_ORIGIN = parsed.origin;
} catch (error) {
  console.error("Invalid CLIENT_URL:", error.message);
  throw error;
}

const app = express();
app.disable("x-powered-by");

// Netlify runs behind a trusted proxy. Keep local development unchanged.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// =====================================
// Middleware
// =====================================

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

// JSON errors are handled by errorHandler below.
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

// Prevent CSRF via untrusted browser origins on POST/PATCH/PUT/DELETE.
// Place before the routes; CORS preflight OPTIONS is allowed through.
app.use(createTrustedOriginGuard(CLIENT_ORIGIN));

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
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    success: connected,
    message: connected
      ? "StudyFlow Backend is running successfully"
      : "Database is disconnected",
    database: connected ? "Connected" : "Disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/study-sessions", studySessionRoutes);
app.use("/api/study-insights", studyInsightsRoutes);
app.use("/api/study-rooms", studyRoomRoutes);
app.use("/api/notifications", notificationRoutes);

// =====================================
// 404 and Central Error Handler
// =====================================

app.use(apiNotFound);
app.use(errorHandler);

// The same Express app is used by local Node and Netlify Functions.
module.exports = app;
