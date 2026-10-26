
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// Common API request function
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,

      credentials: "include",

      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong"
    );
  }

  return data;
}

// Register a new student
export async function registerUser(userData) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

// Login an existing student
export async function loginUser(credentials) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

// Get currently logged-in student
export async function getCurrentUser() {
  return apiRequest("/api/auth/me", {
    method: "GET",
  });
}

// Logout the student
export async function logoutUser() {
  return apiRequest("/api/auth/logout", {
    method: "POST",
  });
}
