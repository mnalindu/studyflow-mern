
/*
========================================
StudyFlow Backend Smoke Test
========================================

Checks:
1. Backend API routes exist
2. Protected endpoints reject unauthenticated requests
3. Unknown API routes return 404

No login credentials are required.
No database records should be created or changed.
Requires Node.js 18 or later.
*/

const BASE_URL = (
  process.env.BASE_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

// =====================================
// API TEST CASES
// =====================================

const tests = [
  {
    name: "Tasks API Authentication",
    method: "GET",
    path: "/api/tasks",
    expected: 401,
  },
  {
    name: "Notes API Authentication",
    method: "GET",
    path: "/api/notes",
    expected: 401,
  },
  {
    name: "Study Sessions API Authentication",
    method: "GET",
    path: "/api/study-sessions",
    expected: 401,
  },
  {
    name: "Study Session Statistics",
    method: "GET",
    path: "/api/study-sessions/stats",
    expected: 401,
  },
  {
    name: "Analytics API Authentication",
    method: "GET",
    path: "/api/study-insights?timeZone=Asia%2FColombo",
    expected: 401,
  },
  {
    name: "Study Rooms API Authentication",
    method: "GET",
    path: "/api/study-rooms",
    expected: 401,
  },
  {
    name: "Notifications API Authentication",
    method: "GET",
    path: "/api/notifications",
    expected: 401,
  },
  {
    name: "Unread Notification Count",
    method: "GET",
    path: "/api/notifications/unread-count",
    expected: 401,
  },
  {
    name: "Protected Task Creation",
    method: "POST",
    path: "/api/tasks",
    expected: 401,
    body: {
      title: "Smoke Test Task",
    },
  },
  {
    name: "Protected Room Creation",
    method: "POST",
    path: "/api/study-rooms",
    expected: 401,
    body: {
      name: "Smoke Test Room",
    },
  },
  {
    name: "Protected Notification Creation",
    method: "POST",
    path: "/api/notifications",
    expected: 401,
    body: {
      title: "Smoke Test Reminder",
      remindAt: "2026-12-01T09:00:00.000Z",
    },
  },
  {
    name: "Unknown API Route",
    method: "GET",
    path: "/api/studyflow-route-that-does-not-exist",
    expected: 404,
  },
];

// =====================================
// RUN SINGLE TEST
// =====================================

async function runTest(test) {
  const hasBody = test.body !== undefined;

  try {
    const response = await fetch(
      `${BASE_URL}${test.path}`,
      {
        method: test.method,

        // Deliberately send NO JWT cookie.
        // These tests verify access is denied.
        headers: {
          Accept: "application/json",
          ...(hasBody
            ? {
                "Content-Type": "application/json",
              }
            : {}),
        },

        body: hasBody
          ? JSON.stringify(test.body)
          : undefined,

        signal: AbortSignal.timeout(8000),
      }
    );

    const passed =
      response.status === test.expected;

    const icon = passed ? "PASS" : "FAIL";

    console.log(
      `[${icon}] ${test.name}`
    );

    console.log(
      `       Expected: ${test.expected} | Actual: ${response.status}`
    );

    return passed;
  } catch (error) {
    console.log(`[FAIL] ${test.name}`);
    console.log(`       Error: ${error.message}`);

    return false;
  }
}

// =====================================
// RUN ALL TESTS
// =====================================

async function main() {
  console.log("\n=================================");
  console.log("StudyFlow Backend Smoke Test");
  console.log("=================================");
  console.log(`Backend: ${BASE_URL}`);
  console.log(`Total tests: ${tests.length}`);
  console.log("=================================\n");

  let passedCount = 0;

  for (const test of tests) {
    const passed = await runTest(test);

    if (passed) {
      passedCount++;
    }
  }

  const failedCount =
    tests.length - passedCount;

  console.log("\n=================================");
  console.log("FINAL TEST RESULTS");
  console.log("=================================");
  console.log(`Total:  ${tests.length}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log("=================================\n");

  if (failedCount === 0) {
    console.log(
      "SUCCESS: All API smoke tests passed!"
    );
  } else {
    console.log(
      "WARNING: Some tests failed. Review the results above."
    );

    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Test runner failed:", error);
  process.exitCode = 1;
});
