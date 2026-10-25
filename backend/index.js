
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import database connection
const connectDB = require("./config/db");

// Create Express application
const app = express();

// Middleware
app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
  })
);

app.use(express.json());

// Home API Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to StudyFlow Backend API",
  });
});

// Health Check Route
app.get("/api/health", (req, res) => {
  const dbConnected =
    mongoose.connection.readyState === 1;

  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    message: dbConnected
      ? "StudyFlow Backend is running successfully"
      : "Database is disconnected",
    database: dbConnected
      ? "Connected"
      : "Disconnected",
  });
});

// Backend Port
const PORT = process.env.PORT || 5000;

// Start server after connecting to MongoDB
const startServer = async () => {
  try {
    // Step 1: Connect database
    await connectDB();

    // Step 2: Start Express
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
};

startServer();
