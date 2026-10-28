// Google ID token is sent only to the StudyFlow backend for verification.
// JWT session remains in the HttpOnly cookie, never localStorage.
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export async function signInWithGoogle(credential) {
  if (typeof credential !== "string" || !credential) {
    throw new Error("Google did not return a valid sign-in credential.");
  }

  let response;
  try {
    response = await fetch(`${API_URL}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ credential }),
    });
  } catch {
    throw new Error("Cannot connect to the StudyFlow backend. Is it running?");
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || `Google sign-in failed (${response.status}).`);
  }

  return result;
}
