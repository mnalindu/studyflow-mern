
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getCurrentUser,
  logoutUser,
} from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const authVersion = useRef(0);

  // Check existing login session on page load
  useEffect(() => {
    let active = true;
    const version = authVersion.current;

    async function checkSession() {
      try {
        const response = await getCurrentUser();

        if (active && authVersion.current === version) {
          setUser(response.user || null);
        }
      } catch {
        if (active && authVersion.current === version) {
          setUser(null);
        }
      } finally {
        if (active && authVersion.current === version) {
          setAuthLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  // Update React authentication after Login/Signup
  function setAuthenticatedUser(userData) {
    authVersion.current += 1;

    setUser(userData);
    setAuthLoading(false);
  }

  // Logout from backend
  async function logout() {
    await logoutUser();

    authVersion.current += 1;
    setUser(null);
    setAuthLoading(false);

    window.location.hash = "#login";
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        isAuthenticated: Boolean(user),
        setAuthenticatedUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication anywhere
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
