require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const fs = require("node:fs");
const path = require("node:path");

const connectDB = require("./config/db");
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
  process.exit(1);
}

const app = express();
app.disable("x-powered-by");

// Render routes traffic through a trusted reverse proxy.
// This also allows express-rate-limit to identify the client IP correctly.
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

// Local development keeps the existing backend welcome endpoint.
// Production serves the compiled React app at the same root URL instead.
if (process.env.NODE_ENV !== "production") {
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "Welcome to StudyFlow Backend API",
    });
  });
}

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
// Serve React on Render (production only)
// =====================================

if (process.env.NODE_ENV === "production") {
  const frontendDist = path.resolve(__dirname, "../frontend/dist");
  const frontendIndex = path.join(frontendDist, "index.html");

  if (!fs.existsSync(frontendIndex)) {
    throw new Error(
      "Frontend build not found. Run npm run build --prefix frontend first."
    );
  }

  // Vite-generated JavaScript, CSS, images, etc.
  app.use(express.static(frontendDist, { index: false }));

  // React SPA fallback. Never substitute index.html for /api errors.
  // StudyFlow uses hash routes (#login, #dashboard), which also work here.
  app.use((req, res, next) => {
    const isApi = req.path === "/api" || req.path.startsWith("/api/");
    const isPageRequest = req.method === "GET" || req.method === "HEAD";

    if (isApi || !isPageRequest) {
      return next();
    }

    return res.sendFile(frontendIndex, (error) => {
      if (error) next(error);
    });
  });
}

// =====================================
// 404 and Central Error Handler
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
      throw new Error("JWT_SECRET must contain at least 32 characters.");
    }

    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`StudyFlow Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
