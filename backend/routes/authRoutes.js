
const express = require("express");
const { rateLimit } = require("express-rate-limit");

const {
  register,
  login,
  logout,
  getMe,
} = require("../controllers/authController");

const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

// Limit repeated authentication attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many attempts. Please try again later.",
  },
});

// Public routes
router.post("/register", authLimiter, register);

router.post("/login", authLimiter, login);

// Logout
router.post("/logout", logout);

// Protected route
router.get("/me", requireAuth, getMe);

module.exports = router;
