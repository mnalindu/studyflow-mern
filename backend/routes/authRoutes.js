const express = require("express");
const { isIP } = require("node:net");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const {
  register,
  login,
  logout,
  getMe,
} = require("../controllers/authController");

const {
  googleLogin,
  linkGoogleAccount,
  getGoogleLinkStatus,
} = require("../controllers/googleAuthController");

const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

// Limit repeated authentication attempts (including Google token attempts).

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,

  keyGenerator: (req) => {
    // Netlify provides the connecting client IP through this header.
    const netlifyIp =
      process.env.NODE_ENV === "production"
        ? req.headers["x-nf-client-connection-ip"]
        : undefined;

    const clientIp =
      typeof netlifyIp === "string" && isIP(netlifyIp)
        ? netlifyIp
        : req.ip;

    // Keep rate limiting enabled even if no valid IP is available.
    if (typeof clientIp !== "string" || !isIP(clientIp)) {
      return "unknown-client";
    }

    // Apply proper IPv6 subnet handling.
    return ipKeyGenerator(clientIp);
  },

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});


// Existing email/password auth (unchanged).
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

// New Google Identity Services flow: { "credential": "<ID_TOKEN>" }
router.post("/google", authLimiter, googleLogin);

// Explicitly link an existing password account only after logging in.
router.post("/google/link", requireAuth, authLimiter, linkGoogleAccount);
router.get("/google/status", requireAuth, getGoogleLinkStatus);

// Existing session routes (unchanged).
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);

module.exports = router;
