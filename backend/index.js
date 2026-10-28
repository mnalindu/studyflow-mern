require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

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

    app.listen(PORT, () => {
      console.log(`StudyFlow Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
}

// Only the local/standalone Node entrypoint starts a listening server.
startServer();
