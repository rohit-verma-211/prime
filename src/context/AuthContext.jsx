import { createContext, useContext, useEffect, useState } from "react";
import { GOOGLE_CLIENT_ID } from "../config";

const AuthContext = createContext(null);

const SESSION_KEY = "pb_session";
const USERS_KEY = "pb_users";

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch {
    return {};
  }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const [authError, setAuthError] = useState("");

  // Restore session on load
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (saved) setUser(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (u) => {
    setUser(u);
    if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else localStorage.removeItem(SESSION_KEY);
  };

  // ---- Google Identity Services ----
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGsiLoaded(true);
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!gsiLoaded || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        try {
          const base64 = response.credential.split(".")[1];
          const payload = JSON.parse(atob(base64));
          persist({
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
            provider: "google",
          });
        } catch {
          setAuthError("Google sign-in failed. Please try again.");
        }
      },
    });
  }, [gsiLoaded]);

  const signInWithGoogle = () => {
    setAuthError("");
    if (gsiLoaded && window.google) window.google.accounts.id.prompt();
    else setAuthError("Google sign-in is still loading, please try again in a moment.");
  };

  // ---- Dummy email/password auth (stored locally, demo only) ----
  const signUpWithEmail = (name, email, password) => {
    setAuthError("");
    if (!name || !email || !password) {
      setAuthError("Please fill in all fields.");
      return false;
    }
    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return false;
    }
    const users = loadUsers();
    const key = email.trim().toLowerCase();
    if (users[key]) {
      setAuthError("An account with this email already exists. Try logging in.");
      return false;
    }
    users[key] = { name, email: key, password };
    saveUsers(users);
    persist({ name, email: key, picture: null, provider: "email" });
    return true;
  };

  const loginWithEmail = (email, password) => {
    setAuthError("");
    const users = loadUsers();
    const key = email.trim().toLowerCase();
    const record = users[key];
    if (!record || record.password !== password) {
      setAuthError("Invalid email or password.");
      return false;
    }
    persist({ name: record.name, email: record.email, picture: null, provider: "email" });
    return true;
  };

  const signOut = () => {
    if (gsiLoaded && window.google) window.google.accounts.id.disableAutoSelect();
    persist(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, signInWithGoogle, signUpWithEmail, loginWithEmail, signOut, authError, setAuthError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
