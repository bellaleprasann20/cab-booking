
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export const AuthContext = createContext(null);

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/+$/, "");

async function request(path, options = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || "The request failed."
    );
  }

  return data;
}

function getStoredUser() {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    return getStoredUser();
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const saveSession = useCallback((data) => {
    const token = data.access_token ?? data.accessToken;
    const nextUser = data.user ?? data;

    if (!token) {
      throw new Error("The server did not return an access token.");
    }

    if (!nextUser || !nextUser.role) {
      throw new Error("The server response is missing the user's role.");
    }

    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);

    return nextUser;
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    return saveSession(data);
  }, [saveSession]);

  const register = useCallback(async (details) => {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(details),
    });

    // Some APIs return a token immediately; others require a separate login.
    if (data.access_token || data.accessToken) {
      saveSession(data);
    }

    return data;
  }, [saveSession]);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(
        user && localStorage.getItem("access_token")
      ),
      login,
      register,
      logout,
      setUser,
    }),
    [user, loading, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
