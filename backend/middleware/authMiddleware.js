const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  try {
    // AuthContext sends this HttpOnly session cookie.
    const token = req.cookies?.studyflow_session;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please log in to continue.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Session is invalid.",
      });
    }

    // Preserve the authenticated user contract for all APIs.
    req.user = user;
    return next();
  } catch (error) {
    // Important: JWT errors are converted to 401 by errorHandler.
    // Unexpected MongoDB errors must NOT be reported as 401.
    return next(error);
  }
};

module.exports = requireAuth;
