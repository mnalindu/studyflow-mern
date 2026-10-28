
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const COOKIE_NAME = "studyflow_session";

const COOKIE_AGE = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}

function setSessionCookie(res, userId) {
  // Do not cache responses that contain login session details.
  res.set("Cache-Control", "no-store");

  const token = jwt.sign(
    { sub: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie(COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: COOKIE_AGE,
  });
}

// =====================================
// Register User
// =====================================

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (
      !cleanName ||
      cleanName.length > 80 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      cleanEmail.length > 254
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid name and email.",
      });
    }

    const passwordBytes =
      Buffer.byteLength(password, "utf8");

    if (passwordBytes < 8 || passwordBytes > 72) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be between 8 and 72 bytes.",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
    });

    setSessionCookie(res, user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

// =====================================
// Login User
// =====================================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail,
    }).select("+passwordHash");

    // Google-only accounts may not have a local password.
    // Return the same generic 401 instead of causing a bcrypt error.
    if (!user || typeof user.passwordHash !== "string") {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    setSessionCookie(res, user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

// =====================================
// Logout User
// =====================================

exports.logout = async (req, res) => {
  res.set("Cache-Control", "no-store");
  res.clearCookie(COOKIE_NAME, cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

// =====================================
// Get Current User
// =====================================

exports.getMe = async (req, res) => {
  res.set("Cache-Control", "no-store");
  return res.status(200).json({
    success: true,
    user: publicUser(req.user),
  });
};
