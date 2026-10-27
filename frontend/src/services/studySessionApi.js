
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// Send the existing HttpOnly authentication cookie with every request.
async function sessionRequest(endpoint, options = {}) {
  const hasBody = options.body !== undefined;
  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method: options.method || "GET",
      credentials: "include",
      headers: hasBody
        ? { "Content-Type": "application/json" }
        : undefined,
      body: hasBody ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error("Cannot connect to StudyFlow backend.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || `Study session request failed (${response.status}).`
    );
  }

  return data;
}

// =====================================
// CREATE STUDY SESSION
// POST /api/study-sessions
// =====================================

export function createStudySession(sessionData) {
  return sessionRequest("/api/study-sessions", {
    method: "POST",
    body: sessionData,
  });
}

// =====================================
// GET STUDY SESSION HISTORY
// GET /api/study-sessions
// =====================================

export function getStudySessions() {
  return sessionRequest("/api/study-sessions");
}

// =====================================
// GET STUDY SESSION STATISTICS
// GET /api/study-sessions/stats
// =====================================

// Optional: { from, to }
// Both dates must be provided together for filtering.

export function getStudySessionStats({ from, to } = {}) {
  const params = new URLSearchParams();

  if (from && to) {
    params.set("from", from);
    params.set("to", to);
  }

  const query = params.toString();

  return sessionRequest(
    `/api/study-sessions/stats${query ? `?${query}` : ""}`
  );
}
