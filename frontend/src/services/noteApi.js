
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// Include the HttpOnly login cookie in every Notes API request.
async function noteRequest(endpoint, options = {}) {
  const { method = "GET", body } = options;

  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method,
      credentials: "include",

      headers:
        body === undefined
          ? undefined
          : { "Content-Type": "application/json" },

      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Cannot connect to StudyFlow backend."
    );
  }

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        `Notes request failed (${response.status}).`
    );
  }

  return data;
}

// =====================================
// GET ALL NOTES
// GET /api/notes
// =====================================

export function getNotes() {
  return noteRequest("/api/notes");
}

// =====================================
// GET SINGLE NOTE
// GET /api/notes/:id
// =====================================

export function getNote(noteId) {
  return noteRequest(
    `/api/notes/${encodeURIComponent(noteId)}`
  );
}

// =====================================
// CREATE NOTE
// POST /api/notes
// =====================================

export function createNote(noteData) {
  return noteRequest("/api/notes", {
    method: "POST",
    body: noteData,
  });
}

// =====================================
// UPDATE NOTE
// PATCH /api/notes/:id
// =====================================

export function updateNote(noteId, changes) {
  return noteRequest(
    `/api/notes/${encodeURIComponent(noteId)}`,
    {
      method: "PATCH",
      body: changes,
    }
  );
}

// =====================================
// DELETE NOTE
// DELETE /api/notes/:id
// =====================================

export function deleteNote(noteId) {
  return noteRequest(
    `/api/notes/${encodeURIComponent(noteId)}`,
    {
      method: "DELETE",
    }
  );
}
