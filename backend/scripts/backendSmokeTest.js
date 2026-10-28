/*
StudyFlow backend API security smoke test.
Run with: node scripts/backendSmokeTest.js
No credentials or database mutations required.
Node.js 18+.
*/

const BASE_URL = (process.env.BASE_URL || "http://localhost:5000").replace(/\/+$/, "");
const TRUSTED_ORIGIN = process.env.CLIENT_URL || "http://localhost:5173";

const tests = [
  { name: "Tasks API Authentication", method: "GET", path: "/api/tasks", expected: 401 },
  { name: "Notes API Authentication", method: "GET", path: "/api/notes", expected: 401 },
  { name: "Study Sessions API Authentication", method: "GET", path: "/api/study-sessions", expected: 401 },
  { name: "Study Session Statistics", method: "GET", path: "/api/study-sessions/stats", expected: 401 },
  { name: "Analytics API Authentication", method: "GET", path: "/api/study-insights?timeZone=Asia%2FColombo", expected: 401 },
  { name: "Study Rooms API Authentication", method: "GET", path: "/api/study-rooms", expected: 401 },
  { name: "Notifications API Authentication", method: "GET", path: "/api/notifications", expected: 401 },
  { name: "Unread Notification Count", method: "GET", path: "/api/notifications/unread-count", expected: 401 },
  { name: "Protected Task Creation", method: "POST", path: "/api/tasks", expected: 401, body: { title: "Smoke Test Task" } },
  { name: "Protected Room Creation", method: "POST", path: "/api/study-rooms", expected: 401, body: { name: "Smoke Test Room" } },
  { name: "Protected Notification Creation", method: "POST", path: "/api/notifications", expected: 401, body: { title: "Smoke Test Reminder", remindAt: "2026-12-01T09:00:00.000Z" } },
  { name: "Unknown API Route", method: "GET", path: "/api/studyflow-route-that-does-not-exist", expected: 404 },
  { name: "Block Foreign Origin", method: "POST", path: "/api/tasks", expected: 403, origin: "https://untrusted.example", body: { title: "Must Be Rejected" } },
  { name: "Block Missing Origin", method: "POST", path: "/api/tasks", expected: 403, origin: null, body: { title: "Must Be Rejected" } },
];

async function runTest(test) {
  const hasBody = test.body !== undefined;
  const headers = { Accept: "application/json" };

  if (hasBody) headers["Content-Type"] = "application/json";
  if (test.origin !== null && !["GET", "HEAD"].includes(test.method)) {
    headers.Origin = test.origin || TRUSTED_ORIGIN;
  }

  try {
    const response = await fetch(`${BASE_URL}${test.path}`, {
      method: test.method,
      headers,
      body: hasBody ? JSON.stringify(test.body) : undefined,
      signal: AbortSignal.timeout(8000),
    });

    const passed = response.status === test.expected;
    console.log(`[${passed ? "PASS" : "FAIL"}] ${test.name} | Expected ${test.expected}, got ${response.status}`);
    return passed;
  } catch (error) {
    console.log(`[FAIL] ${test.name} | ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`\nStudyFlow Backend Security Tests: ${BASE_URL}\n`);
  let passedCount = 0;

  for (const test of tests) {
    if (await runTest(test)) passedCount++;
  }

  const failedCount = tests.length - passedCount;
  console.log(`\nTotal: ${tests.length} | Passed: ${passedCount} | Failed: ${failedCount}\n`);
  if (failedCount) process.exitCode = 1;
}

main().catch((error) => {
  console.error("Test runner failed:", error);
  process.exitCode = 1;
});
