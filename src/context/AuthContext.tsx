import React, { createContext, useContext, useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatar: string;
  language: string;
  proficiencyLevel: string;
  bio: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUserFromResponse: (data: {
    id: string;
    email: string;
    profile: {
      fullName: string;
      language: string;
      proficiencyLevel: string;
      avatar: string;
      bio: string;
    };
    role: string;
    token: string;
  }) => void;
  logout: () => void;
}

// ─── Context ─────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  setUserFromResponse: () => {},
  logout: () => {},
});

// ─── Helper — parse user từ localStorage ─────────────────────

function loadUserFromStorage(): AuthUser | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

// ─── Provider ────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUserFromStorage);

  const setUserFromResponse = useCallback((data: {
    id: string;
    email: string;
    profile: { fullName: string; language: string; proficiencyLevel: string; avatar: string; bio: string };
    role: string;
    token: string;
  }) => {
    const authUser: AuthUser = {
      id: data.id,
      email: data.email,
      fullName: data.profile.fullName,
      avatar: data.profile.avatar,
      language: data.profile.language,
      proficiencyLevel: data.profile.proficiencyLevel,
      bio: data.profile.bio,
      role: data.role,
    };
    localStorage.setItem("access_token", data.token);
    localStorage.setItem("user", JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, setUserFromResponse, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────

export const useAuth = () => useContext(AuthContext);
