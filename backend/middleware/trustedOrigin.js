// StudyFlow CSRF origin protection for state-changing requests.
// Only the configured React frontend origin may initiate browser mutations.

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function createTrustedOriginGuard(trustedOrigin) {
  if (!trustedOrigin || typeof trustedOrigin !== "string") {
    throw new Error("A trusted frontend origin is required.");
  }

  return function trustedOriginGuard(req, res, next) {
    // Reading data and CORS preflight checks are not state-changing.
    if (SAFE_METHODS.has(req.method)) {
      return next();
    }

    const origin = req.get("Origin");

    // If Origin is present, it must match EXACTLY.
    // The string "null" is never trusted.
    if (origin !== undefined) {
      if (origin === trustedOrigin) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: "Request origin is not allowed.",
      });
    }

    // Some legitimate requests have Referer but no Origin.
    const referer = req.get("Referer");

    if (referer) {
      try {
        if (new URL(referer).origin === trustedOrigin) {
          return next();
        }
      } catch {
        // Malformed Referer: reject below.
      }
    }

    // Fail closed when neither header establishes a trusted origin.
    return res.status(403).json({
      success: false,
      message: "Trusted Origin or Referer is required.",
    });
  };
}

module.exports = createTrustedOriginGuard;
