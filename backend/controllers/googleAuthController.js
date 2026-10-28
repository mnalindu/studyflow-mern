const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const {
  publicUser,
  setSessionCookie,
} = require("./authController");

const googleClient = new OAuth2Client();

// Verify that Google signed the ID token and issued it for OUR client.
// This endpoint receives `credential` from the Google Identity Services
// JavaScript callback, NOT an unverified email or user ID from the browser.
async function getVerifiedGoogleIdentity(credential) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    const error = new Error("Google Sign-In is not configured.");
    error.statusCode = 503;
    throw error;
  }

  if (
    typeof credential !== "string" ||
    credential.length < 100 ||
    credential.length > 10000
  ) {
    const error = new Error("A valid Google credential is required.");
    error.statusCode = 400;
    throw error;
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    payload = ticket.getPayload();
  } catch {
    const error = new Error("Google sign-in verification failed.");
    error.statusCode = 401;
    throw error;
  }

  // ID token must contain a unique account identifier and verified email.
  if (
    !payload ||
    typeof payload.sub !== "string" ||
    !payload.sub ||
    typeof payload.email !== "string" ||
    payload.email_verified !== true
  ) {
    const error = new Error("Google account email must be verified.");
    error.statusCode = 401;
    throw error;
  }

  const email = payload.email.trim().toLowerCase();
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    payload.sub.length > 255
  ) {
    const error = new Error("Invalid Google account information.");
    error.statusCode = 401;
    throw error;
  }

  const suggestedName =
    (typeof payload.name === "string" && payload.name.trim()) ||
    (typeof payload.given_name === "string" && payload.given_name.trim()) ||
    email.split("@")[0] ||
    "Student";

  return {
    googleId: payload.sub,
    email,
    name: suggestedName.slice(0, 80),
  };
}

function fail(res, error, operation) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Do not log credentials or internal error details in responses.
  console.error(`Google ${operation} error:`, error.message);
  return res.status(500).json({
    success: false,
    message: "Google authentication failed. Please try again.",
  });
}

// =====================================
// POST /api/auth/google
// Public Google sign-in / sign-up
// =====================================
exports.googleLogin = async (req, res) => {
  res.set("Cache-Control", "no-store");

  try {
    const { googleId, email, name } =
      await getVerifiedGoogleIdentity(req.body?.credential);

    // Stable Google ID is the only identifier for returning Google users.
    const googleUser = await User.findOne({ googleId });
    if (googleUser) {
      setSessionCookie(res, googleUser._id);
      return res.status(200).json({
        success: true,
        message: "Google login successful.",
        user: publicUser(googleUser),
      });
    }

    // Do not automatically link an existing password account by email.
    // The student must sign in with password and explicitly link Google.
    const emailAlreadyUsed = await User.exists({ email });
    if (emailAlreadyUsed) {
      return res.status(409).json({
        success: false,
        message:
          "This email already has a StudyFlow account. Sign in with your password first, then connect Google from your account.",
      });
    }

    const user = await User.create({
      name,
      email,
      googleId,
      // No passwordHash: this is a Google-only user.
    });

    setSessionCookie(res, user._id);
    return res.status(201).json({
      success: true,
      message: "Google account created successfully.",
      user: publicUser(user),
    });
  } catch (error) {
    // Another concurrent request may have created the same Google user.
    if (error.code === 11000) {
      try {
        // Only log in if the SAME verified Google sub owns this record.
        const credential = req.body?.credential;
        const identity = await getVerifiedGoogleIdentity(credential);
        const sameGoogleUser = await User.findOne({
          googleId: identity.googleId,
        });
        if (sameGoogleUser) {
          setSessionCookie(res, sameGoogleUser._id);
          return res.status(200).json({
            success: true,
            message: "Google login successful.",
            user: publicUser(sameGoogleUser),
          });
        }
      } catch {
        // Fall through to conflict; do not disclose internals.
      }
      return res.status(409).json({
        success: false,
        message: "Account already exists. Please sign in and link Google.",
      });
    }

    return fail(res, error, "login");
  }
};

// =====================================
// POST /api/auth/google/link
// Requires existing StudyFlow session (email/password login).
// Proves control of BOTH the StudyFlow account and the Google account.
// =====================================
exports.linkGoogleAccount = async (req, res) => {
  res.set("Cache-Control", "no-store");

  try {
    const { googleId, email } =
      await getVerifiedGoogleIdentity(req.body?.credential);

    const user = await User.findById(req.user._id).select("+googleId");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Please sign in again.",
      });
    }

    // Protect against accidental linking of an unrelated Google identity.
    if (user.email !== email) {
      return res.status(409).json({
        success: false,
        message: "Google email must match your StudyFlow account email.",
      });
    }

    if (user.googleId) {
      if (user.googleId !== googleId) {
        return res.status(409).json({
          success: false,
          message: "A different Google account is already connected.",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Google account is already connected.",
        user: publicUser(user),
      });
    }

    // Atomic conditional update prevents replacing an existing Google link.
    const updated = await User.findOneAndUpdate(
      {
        _id: user._id,
        email,
        googleId: null,
      },
      { $set: { googleId } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(409).json({
        success: false,
        message: "Account connection changed. Please retry.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Google account linked successfully.",
      user: publicUser(updated),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This Google account is already linked to another user.",
      });
    }
    return fail(res, error, "link");
  }
};

// =====================================
// GET /api/auth/google/status
// Authenticated student only.
// googleId is select:false, so request it explicitly.
// Never return the Google subject identifier to the browser.
// =====================================
exports.getGoogleLinkStatus = async (req, res) => {
  res.set("Cache-Control", "no-store");

  try {
    const user = await User.findById(req.user._id).select("+googleId");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Please sign in again.",
      });
    }

    return res.status(200).json({
      success: true,
      linked: Boolean(user.googleId),
    });
  } catch (error) {
    return fail(res, error, "status");
  }
};
