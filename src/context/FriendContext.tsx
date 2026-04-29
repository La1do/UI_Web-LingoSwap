import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import axios from "../library/axios.customize";
import { socketService } from "../services/socket.service";

// ─── Types ───────────────────────────────────────────────────

export type FriendStatus = "online" | "offline" | "busy" | "away";

export interface Friend {
  id: string;
  fullName: string;
  avatarUrl?: string;
  status: FriendStatus;
  language?: string;
  lastSeen?: string;
}

interface ApiFriend {
  _id: string;
  email: string;
  fullName: string;
  avatar: string;
  status?: string;
  lastOnlineAt?: { full: string; friendly: string };
}

interface FriendContextValue {
  friends: Friend[];
  isLoading: boolean;
  refetchFriends: () => void;
  updateFriendStatus: (userId: string, status: FriendStatus) => void;
  removeFriend: (friendId: string) => void;
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
  };
}

// ─── Context ─────────────────────────────────────────────────

const FriendContext = createContext<FriendContextValue>({
  friends: [],
  isLoading: false,
  refetchFriends: () => {},
  updateFriendStatus: () => {},
  removeFriend: () => {},
});

// ─── Provider ────────────────────────────────────────────────

export function FriendProvider({ children }: { children: React.ReactNode }) {
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

  // Initial fetch
  useEffect(() => {
    fetchFriends();
  }, []);

  // Heartbeat mỗi 30s
  useEffect(() => {
    socketService.onReady(() => socketService.emitHeartbeat());
    const interval = setInterval(() => socketService.emitHeartbeat(), 30_000);
    return () => clearInterval(interval);
  }, []);

  // Realtime friend status
  useEffect(() => {
    socketService.onReady((s) => {
      s.off("friend_status_change").on("friend_status_change", ({ userId, status }) => {
        updateFriendStatus(userId, normalizeStatus(status));
      });
    });
    return () => socketService.offFriendStatusChange();
  }, [updateFriendStatus]);

  return (
    <FriendContext.Provider value={{ friends, isLoading, refetchFriends, updateFriendStatus, removeFriend }}>
      {children}
    </FriendContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────

export const useFriends = () => useContext(FriendContext);
