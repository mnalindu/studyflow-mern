// Authenticated requests send only our StudyFlow HttpOnly cookie.
// The Google ID token is never stored in localStorage.
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

async function requestGoogleAuth(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method: options.method || "GET",
      credentials: "include",
      headers: options.body ? { "Content-Type": "application/json" } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error("Cannot connect to the StudyFlow backend. Is it running?");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Google account request failed (${response.status}).`);
  }
  return data;
}

function credentialBody(credential) {
  if (typeof credential !== "string" || !credential.trim()) {
    throw new Error("Google did not return a valid credential.");
  }
  return { credential };
}

// Existing login flow (keep this export so Login.jsx still works).
export function signInWithGoogle(credential) {
  return requestGoogleAuth("/api/auth/google", {
    method: "POST",
    body: credentialBody(credential),
  });
}

// Link a verified Google account to the current logged-in student.
export function linkGoogleAccount(credential) {
  return requestGoogleAuth("/api/auth/google/link", {
    method: "POST",
    body: credentialBody(credential),
  });
}

// Check linked state even after a page refresh.
export function getGoogleLinkStatus() {
  return requestGoogleAuth("/api/auth/google/status");
}
