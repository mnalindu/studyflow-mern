
const mongoose = require("mongoose");

// =====================================
// CUSTOM APPLICATION ERROR
// =====================================

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace?.(
      this,
      this.constructor
    );
  }
}

// =====================================
// HANDLE UNKNOWN API ROUTES
// =====================================

function apiNotFound(req, res, next) {
  const error = new AppError(
    "API endpoint not found.",
    404
  );

  next(error);
}

// =====================================
// CENTRALIZED ERROR HANDLER
// =====================================

function errorHandler(err, req, res, next) {
  // Let Express handle an already-started response.
  if (res.headersSent) {
    return next(err);
  }

  let statusCode =
    err.statusCode || err.status || 500;

  let message =
    err.message || "Something went wrong.";

  // =====================================
  // INVALID JSON REQUEST BODY
  // =====================================

  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON request body.";
  }

  // =====================================
  // REQUEST BODY TOO LARGE
  // =====================================

  else if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body is too large.";
  }

  // =====================================
  // MONGOOSE VALIDATION ERROR
  // =====================================

  else if (
    err instanceof mongoose.Error.ValidationError
  ) {
    statusCode = 400;

    message = Object.values(err.errors)
      .map((item) => item.message)
      .join("; ");
  }

  // =====================================
  // INVALID MONGODB OBJECT ID
  // =====================================

  else if (
    err instanceof mongoose.Error.CastError
  ) {
    statusCode = 400;
    message = "Invalid database field value.";
  }

  // =====================================
  // DUPLICATE DATABASE VALUE
  // =====================================

  else if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate value already exists.";
  }

  // =====================================
  // INVALID OR EXPIRED JWT
  // =====================================

  else if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    statusCode = 401;
    message =
      "Your session is invalid or expired. Please sign in again.";
  }

  // =====================================
  // NORMALIZE HTTP STATUS
  // =====================================

  statusCode = Number(statusCode);

  if (
    !Number.isInteger(statusCode) ||
    statusCode < 400 ||
    statusCode > 599
  ) {
    statusCode = 500;
  }

  // =====================================
  // PROTECT INTERNAL SERVER DETAILS
  // =====================================

  if (statusCode >= 500) {
    console.error(
      "[StudyFlow Server Error]",
      err
    );

    message =
      "An unexpected server error occurred. Please try again.";
  }

  // =====================================
  // SEND CONSISTENT JSON RESPONSE
  // =====================================

  return res.status(statusCode).json({
    success: false,
    message,
  });
}

// =====================================
// EXPORT MIDDLEWARE
// =====================================

module.exports = {
  AppError,
  apiNotFound,
  errorHandler,
};
