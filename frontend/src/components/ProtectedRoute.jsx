
import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

// Pages that require authentication
const protectedPages = new Set([
  "#dashboard",
  "#tasks",
  "#focus",
  "#calendar",
  "#analytics",
  "#notes",
  "#study-rooms",
]);

function getCurrentPage() {
  return (window.location.hash || "#home")
    .split("?")[0]
    .toLowerCase();
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useAuth();

  const [currentPage, setCurrentPage] = useState(
    getCurrentPage
  );

  // Listen for URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getCurrentPage());
    };

    window.addEventListener(
      "hashchange",
      handleHashChange
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        handleHashChange
      );
    };
  }, []);

  const needsAuthentication =
    protectedPages.has(currentPage);

  // Redirect unauthenticated users to Login
  useEffect(() => {
    if (
      needsAuthentication &&
      !authLoading &&
      !isAuthenticated
    ) {
      window.location.hash = "#login";
    }
  }, [
    needsAuthentication,
    authLoading,
    isAuthenticated,
  ]);

  // Wait until session verification completes
  if (needsAuthentication && authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9f5",
          color: "#315c45",
          fontFamily: "inherit",
        }}
      >
        <p>Checking your StudyFlow session...</p>
      </div>
    );
  }

  // Do not render protected pages without login
  if (needsAuthentication && !isAuthenticated) {
    return null;
  }

  return children;
}

export default ProtectedRoute;
