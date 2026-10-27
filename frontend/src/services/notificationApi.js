
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

// =====================================
// Common Notification API Request
// =====================================

async function notificationRequest(
  endpoint,
  options = {}
) {
  const hasBody = options.body !== undefined;

  let response;

  try {
    response = await fetch(
      `${API_URL}${endpoint}`,
      {
        method: options.method || "GET",

        // Send the authenticated user's cookie
        credentials: "include",

        headers: hasBody
          ? {
              "Content-Type": "application/json",
            }
          : undefined,

        body: hasBody
          ? JSON.stringify(options.body)
          : undefined,
      }
    );
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
        `Notification request failed (${response.status}).`
    );
  }

  return data;
}

// =====================================
// GET NOTIFICATIONS
// GET /api/notifications
//
// scope:
// "due" | "upcoming" | "all"
// =====================================

export function getNotifications(
  scope = "due"
) {
  const query = new URLSearchParams({
    scope,
  });

  return notificationRequest(
    `/api/notifications?${query.toString()}`
  );
}

// =====================================
// GET UNREAD NOTIFICATION COUNT
// GET /api/notifications/unread-count
// =====================================

export function getUnreadNotificationCount() {
  return notificationRequest(
    "/api/notifications/unread-count"
  );
}

// =====================================
// CREATE NOTIFICATION
// POST /api/notifications
// =====================================

export function createNotification(
  notificationData
) {
  return notificationRequest(
    "/api/notifications",
    {
      method: "POST",
      body: notificationData,
    }
  );
}

// =====================================
// MARK ONE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// =====================================

export function markNotificationRead(
  notificationId
) {
  return notificationRequest(
    `/api/notifications/${encodeURIComponent(
      notificationId
    )}/read`,
    {
      method: "PATCH",
    }
  );
}

// =====================================
// MARK ALL DUE NOTIFICATIONS AS READ
// PATCH /api/notifications/read-all
// =====================================

export function markAllNotificationsRead() {
  return notificationRequest(
    "/api/notifications/read-all",
    {
      method: "PATCH",
    }
  );
}

// =====================================
// DELETE NOTIFICATION
// DELETE /api/notifications/:id
// =====================================

export function deleteNotification(
  notificationId
) {
  return notificationRequest(
    `/api/notifications/${encodeURIComponent(
      notificationId
    )}`,
    {
      method: "DELETE",
    }
  );
}
