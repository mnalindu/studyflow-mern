// Serverless entrypoint. Does not start a listening HTTP server.
const mongoose = require("mongoose");
const serverless = require("serverless-http");

const connectDB = require("./config/db");
const app = require("./app");

const expressHandler = serverless(app);
let connectionPromise = null;

async function ensureDatabaseConnected() {
  if (mongoose.connection.readyState === 1) return;

  if (!connectionPromise) {
    connectionPromise = connectDB().catch((error) => {
      // Allow a later invocation to retry if Atlas was temporarily unavailable.
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;
}

async function handler(event, context) {
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32
  ) {
    throw new Error("JWT_SECRET must contain at least 32 characters.");
  }

  await ensureDatabaseConnected();
  return expressHandler(event, context);
}

module.exports = { handler };
