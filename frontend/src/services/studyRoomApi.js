const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// All requests include the existing StudyFlow HttpOnly login cookie.
async function roomRequest(endpoint, options = {}) {
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
      data.message || `Study room request failed (${response.status}).`
    );
  }

  return data;
}

// GET /api/study-rooms — publicly listed rooms plus your joined/owned rooms.
export function getStudyRooms() {
  return roomRequest("/api/study-rooms");
}

// GET /api/study-rooms/:id
export function getStudyRoom(roomId) {
  return roomRequest(`/api/study-rooms/${encodeURIComponent(roomId)}`);
}

// POST /api/study-rooms — creator joins automatically.
export function createStudyRoom(roomData) {
  return roomRequest("/api/study-rooms", {
    method: "POST",
    body: roomData,
  });
}

// POST /api/study-rooms/:id/join — available for public rooms.
export function joinStudyRoom(roomId) {
  return roomRequest(`/api/study-rooms/${encodeURIComponent(roomId)}/join`, {
    method: "POST",
  });
}

// POST /api/study-rooms/:id/leave — creator cannot leave their own room.
export function leaveStudyRoom(roomId) {
  return roomRequest(`/api/study-rooms/${encodeURIComponent(roomId)}/leave`, {
    method: "POST",
  });
}

// DELETE /api/study-rooms/:id — only the creator can delete.
export function deleteStudyRoom(roomId) {
  return roomRequest(`/api/study-rooms/${encodeURIComponent(roomId)}`, {
    method: "DELETE",
  });
}
