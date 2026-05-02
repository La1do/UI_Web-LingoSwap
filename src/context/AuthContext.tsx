import React, { createContext, useContext, useState, useCallback } from "react";
import axiosInstance from "../library/axios.customize";
import { socketService } from "../services/socket.service";

// ─── Types ───────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatar: string;
  language: string;
  proficiencyLevel: string;
  bio: string;
  country: string;
  role: string;
  settings: {
    theme: string;
    uiLanguage: string;
  };
  stats?: {
    streak: number;
    totalHours: number;
    totalSessions: number;
    learningCalendar: Record<string, number>;
  };
}

// Response shape từ GET /api/users/me
export interface MeResponse {
  _id: string;
  email: string;
  profile: {
    fullName: string;
    bio: string;
    avatar: string;
    language?: string;
    proficiencyLevel?: string;
    country?: string;
  };
  settings: {
    theme: string;
    uiLanguage: string;
  };
  stats?: {
    streak: number;
    totalHours: number;
    totalSessions: number;
    learningCalendar: Record<string, number>;
  };
  role: string;
  statusAccount: string;
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
      country: string;
    };
    role: string;
    token: string;
  }) => void;
  setUserFromMe: (data: MeResponse) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  logout: () => void;
}

// ─── Context ─────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  setUserFromResponse: () => {},
  setUserFromMe: () => {},
  updateUser: () => {},
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
    profile: { fullName: string; language: string; proficiencyLevel: string; avatar: string; bio: string; country: string };
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
      country: data.profile.country ?? "",
      role: data.role,
      settings: { theme: "light", uiLanguage: "vi" },
    };
    localStorage.setItem("access_token", data.token);
    localStorage.setItem("user", JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const setUserFromMe = useCallback((data: MeResponse) => {
    const authUser: AuthUser = {
      id: data._id,
      email: data.email,
      fullName: data.profile.fullName,
      avatar: data.profile.avatar,
      language: data.profile.language ?? "",
      proficiencyLevel: data.profile.proficiencyLevel ?? "",
      bio: data.profile.bio,
      country: data.profile.country ?? "",
      role: data.role,
      settings: data.settings,
      stats: data.stats,
    };
    // Đồng bộ theme từ server vào localStorage để ThemeContext đọc đúng
    if (data.settings?.theme) {
      localStorage.setItem("theme", data.settings.theme);
    }
    localStorage.setItem("user", JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const updateUser = useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    // Gọi API logout (fire-and-forget — không block UI)
    axiosInstance.post("/api/auth/logout").catch(() => {});
    // Disconnect socket
    socketService.disconnect();
    // Clear local state
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, setUserFromResponse, setUserFromMe, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────

export const useAuth = () => useContext(AuthContext);
