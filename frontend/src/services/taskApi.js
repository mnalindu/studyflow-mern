
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

// Common request function for Task APIs
async function taskRequest(endpoint, options = {}) {
  const hasBody = options.body !== undefined;

  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method: options.method || "GET",

      // Send JWT session cookie automatically
      credentials: "include",

      headers: hasBody
        ? { "Content-Type": "application/json" }
        : undefined,

      body: hasBody
        ? JSON.stringify(options.body)
        : undefined,
    });
  } catch {
    throw new Error(
      "Cannot connect to StudyFlow backend."
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Task request failed."
    );
  }

  return data;
}

// =====================================
// GET ALL TASKS
// =====================================
export async function getTasks() {
  return taskRequest("/api/tasks");
}

// =====================================
// GET SINGLE TASK
// =====================================
export async function getTask(taskId) {
  return taskRequest(
    `/api/tasks/${encodeURIComponent(taskId)}`
  );
}

// =====================================
// CREATE TASK
// =====================================
export async function createTask(taskData) {
  return taskRequest("/api/tasks", {
    method: "POST",
    body: taskData,
  });
}

// =====================================
// UPDATE TASK
// =====================================
export async function updateTask(taskId, updates) {
  return taskRequest(
    `/api/tasks/${encodeURIComponent(taskId)}`,
    {
      method: "PATCH",
      body: updates,
    }
  );
}

// =====================================
// COMPLETE / UNCOMPLETE TASK
// =====================================
export async function toggleTaskCompletion(
  taskId,
  completed
) {
  return updateTask(taskId, {
    completed,
  });
}

// =====================================
// DELETE TASK
// =====================================
export async function deleteTask(taskId) {
  return taskRequest(
    `/api/tasks/${encodeURIComponent(taskId)}`,
    {
      method: "DELETE",
    }
  );
}
