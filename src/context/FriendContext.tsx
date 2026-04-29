import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import axios from "../library/axios.customize";
import { socketService } from "../services/socket.service";
import { useAuth } from "./AuthContext";

// ─── Types ───────────────────────────────────────────────────

export type FriendStatus = "online" | "offline" | "busy" | "away";

export interface Friend {
  id: string;
  fullName: string;
  avatarUrl?: string;
  status: FriendStatus;
  language?: string;
  lastSeen?: string;
  conversationId?: string | null;
}

interface ApiFriend {
  _id: string;
  email: string;
  fullName: string;
  avatar: string;
  status?: string;
  lastOnlineAt?: { full: string; friendly: string };
  conversationId?: string | null;
}

interface FriendContextValue {
  friends: Friend[];
  isLoading: boolean;
  refetchFriends: () => void;
  updateFriendStatus: (userId: string, status: FriendStatus) => void;
  removeFriend: (friendId: string) => void;
  updateConversationId: (friendId: string, conversationId: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────

function normalizeStatus(s?: string): FriendStatus {
  if (s === "online" || s === "busy" || s === "away") return s;
  return "offline";
}

function mapApiFriend(f: ApiFriend): Friend {
  return {
    id: f._id,
    fullName: f.fullName,
    avatarUrl: f.avatar !== "default_avatar.png" ? f.avatar : undefined,
    status: normalizeStatus(f.status),
    lastSeen: f.lastOnlineAt?.friendly,
    conversationId: f.conversationId ?? null,
  };
}

// ─── Context ─────────────────────────────────────────────────

const FriendContext = createContext<FriendContextValue>({
  friends: [],
  isLoading: false,
  refetchFriends: () => {},
  updateFriendStatus: () => {},
  removeFriend: () => {},
  updateConversationId: () => {},
});

// ─── Provider ────────────────────────────────────────────────

export function FriendProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchRef = useRef(0);

  const fetchFriends = useCallback(async () => {
    setIsLoading(true);
    const id = ++fetchRef.current;
    try {
      const res = await axios.get<ApiFriend[]>("/api/user/friends/friends");
      if (id === fetchRef.current) {
        setFriends(res.data.map(mapApiFriend));
      }
    } catch {
      // silent
    } finally {
      if (id === fetchRef.current) setIsLoading(false);
    }
  }, []);

  const refetchFriends = useCallback(() => {
    fetchFriends();
  }, [fetchFriends]);

  const updateFriendStatus = useCallback((userId: string, status: FriendStatus) => {
    setFriends((prev) =>
      prev.map((f) => f.id === userId ? { ...f, status } : f)
    );
  }, []);

  const removeFriend = useCallback((friendId: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== friendId));
  }, []);

  const updateConversationId = useCallback((friendId: string, conversationId: string) => {
    setFriends((prev) =>
      prev.map((f) => f.id === friendId ? { ...f, conversationId } : f)
    );
  }, []);

  // Fetch + setup socket khi user đã authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setFriends([]);
      return;
    }
    fetchFriends();
  }, [isAuthenticated]);

  // Heartbeat mỗi 30s — chỉ khi authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    socketService.onReady(() => socketService.emitHeartbeat());
    const interval = setInterval(() => socketService.emitHeartbeat(), 30_000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Realtime friend status — chỉ khi authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    socketService.onReady((s) => {
      s.off("friend_status_change").on("friend_status_change", ({ userId, status }) => {
        updateFriendStatus(userId, normalizeStatus(status));
      });
    });
    return () => socketService.offFriendStatusChange();
  }, [isAuthenticated, updateFriendStatus]);

  return (
    <FriendContext.Provider value={{ friends, isLoading, refetchFriends, updateFriendStatus, removeFriend, updateConversationId }}>
      {children}
    </FriendContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────

export const useFriends = () => useContext(FriendContext);
