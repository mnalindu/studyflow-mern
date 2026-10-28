
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

// =====================================
// Common Google Authentication Request
// =====================================

async function googleAuthRequest(endpoint, credential) {
  if (
    typeof credential !== "string" ||
    !credential.trim()
  ) {
    throw new Error(
      "Google did not return a valid credential."
    );
  }

  let response;

  try {
    response = await fetch(
      `${API_URL}${endpoint}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        // Send existing JWT HttpOnly session cookie
        credentials: "include",

        body: JSON.stringify({
          credential,
        }),
      }
    );
  } catch {
    throw new Error(
      "Cannot connect to StudyFlow backend."
    );
  }

  const result = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message ||
        `Google authentication failed (${response.status}).`
    );
  }

  return result;
}

// =====================================
// GOOGLE LOGIN / SIGNUP
// POST /api/auth/google
// =====================================

export function signInWithGoogle(credential) {
  return googleAuthRequest(
    "/api/auth/google",
    credential
  );
}

// =====================================
// LINK GOOGLE TO EXISTING ACCOUNT
// POST /api/auth/google/link
// =====================================

export function linkGoogleAccount(credential) {
  return googleAuthRequest(
    "/api/auth/google/link",
    credential
  );
}
