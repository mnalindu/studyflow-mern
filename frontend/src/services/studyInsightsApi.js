const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export async function getStudyInsights() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  let response;
  try {
    response = await fetch(
      `${API_URL}/api/study-insights?timeZone=${encodeURIComponent(timeZone)}`,
      { credentials: "include" }
    );
  } catch {
    throw new Error("Cannot connect to StudyFlow backend.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Could not load insights (${response.status}).`);
  }

  return data;
}
