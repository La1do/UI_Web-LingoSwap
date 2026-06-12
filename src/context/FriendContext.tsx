import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import axios from "../library/axios.customize";
import { socketService, type FriendRequestRespondedPayload } from "../services/socket.service";
import { useAuth } from "./AuthContext";

// ─── Types ───────────────────────────────────────────────────

export type FriendStatus = "online" | "offline" | "busy" | "away";

export interface FriendMessagePreview {
  _id: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: string;
  conversationId: string;
}

export interface Friend {
  id: string;
  fullName: string;
  avatarUrl?: string;
  status: FriendStatus;
  language?: string;
  lastSeen?: string;
  conversationId?: string | null;
  lastMessage?: FriendMessagePreview | null;
  lastMessageAt?: number;
  hasUnreadMessage?: boolean;
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

export type IncomingMessagePayload = FriendMessagePreview;

interface RealtimeNotificationPayload {
  type: string;
}

const FRIEND_LIST_NOTIFICATION_TYPES = new Set([
  "friend_accepted",
  "friendship_ended",
]);

interface FriendContextValue {
  friends: Friend[];
  isLoading: boolean;
  refetchFriends: () => void;
  updateFriendStatus: (userId: string, status: FriendStatus) => void;
  removeFriend: (friendId: string) => void;
  updateConversationId: (friendId: string, conversationId: string) => void;
  recordFriendMessage: (friendId: string, message: FriendMessagePreview, options?: { unread?: boolean }) => void;
  markFriendMessagesSeen: (friendId: string) => void;
  incomingMessageFriendId: string | null;
  incomingMessage: IncomingMessagePayload | null;
  clearIncomingMessage: () => void;
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

function getMessageTimestamp(createdAt?: string): number {
  const timestamp = createdAt ? Date.parse(createdAt) : NaN;
  return Number.isFinite(timestamp) ? timestamp : Date.now();
}

function mergeRealtimeFriendState(nextFriends: Friend[], previousFriends: Friend[]): Friend[] {
  const previousById = new Map(previousFriends.map((friend) => [friend.id, friend]));

  return nextFriends.map((friend) => {
    const previous = previousById.get(friend.id);
    if (!previous) return friend;

    return {
      ...friend,
      lastMessage: previous.lastMessage,
      lastMessageAt: previous.lastMessageAt,
      hasUnreadMessage: previous.hasUnreadMessage,
    };
  });
}

// ─── Context ─────────────────────────────────────────────────

const FriendContext = createContext<FriendContextValue>({
  friends: [],
  isLoading: false,
  refetchFriends: () => {},
  updateFriendStatus: () => {},
  removeFriend: () => {},
  updateConversationId: () => {},
  recordFriendMessage: () => {},
  markFriendMessagesSeen: () => {},
  incomingMessageFriendId: null,
  incomingMessage: null,
  clearIncomingMessage: () => {},
});

// ─── Provider ────────────────────────────────────────────────

export function FriendProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [incomingMessageFriendId, setIncomingMessageFriendId] = useState<string | null>(null);
  const [incomingMessage, setIncomingMessage] = useState<IncomingMessagePayload | null>(null);
  const fetchRef = useRef(0);

  const fetchFriends = useCallback(async () => {
    setIsLoading(true);
    const id = ++fetchRef.current;
    try {
      const res = await axios.get<ApiFriend[]>("/api/user/friends");
      if (id !== fetchRef.current) return;

      const mapped = res.data.map(mapApiFriend);
      setFriends((prev) => mergeRealtimeFriendState(mapped, prev));

      // Merge online status từ API riêng
      try {
        const onlineRes = await axios.get<{ onlineFriendIds: string[] }>("/api/user/friends/online");
        const onlineSet = new Set(onlineRes.data.onlineFriendIds ?? []);
        const withOnlineStatus = mapped.map((f) =>
          onlineSet.has(f.id) ? { ...f, status: "online" as FriendStatus } : f
        );
        setFriends((prev) => mergeRealtimeFriendState(withOnlineStatus, prev));
      } catch {
        // online-friends API thất bại — giữ nguyên status từ friends API
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

  const recordFriendMessage = useCallback((friendId: string, message: FriendMessagePreview, options?: { unread?: boolean }) => {
    setFriends((prev) =>
      prev.map((f) =>
        f.id === friendId
          ? {
              ...f,
              conversationId: message.conversationId || f.conversationId,
              lastMessage: message,
              lastMessageAt: getMessageTimestamp(message.createdAt),
              hasUnreadMessage: options?.unread ?? f.hasUnreadMessage,
            }
          : f
      )
    );
  }, []);

  const markFriendMessagesSeen = useCallback((friendId: string) => {
    setFriends((prev) =>
      prev.map((f) =>
        f.id === friendId && f.hasUnreadMessage
          ? { ...f, hasUnreadMessage: false }
          : f
      )
    );
  }, []);

  const clearIncomingMessage = useCallback(() => {
    setIncomingMessageFriendId(null);
    setIncomingMessage(null);
  }, []);

  // Fetch + setup socket khi user đã authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setFriends([]);
      return;
    }
    // Reconnect socket nếu chưa connected (ví dụ sau F5)
    socketService.connect();
    fetchFriends();
  }, [isAuthenticated, fetchFriends]);

  // Heartbeat mỗi 30s — chỉ khi authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    socketService.onReady((s) => {
      socketService.emitHeartbeat();
      // Refetch online status sau mỗi lần reconnect
      s.on("connect", () => {
        socketService.emitHeartbeat();
        fetchFriends();
      });
    });
    const interval = setInterval(() => socketService.emitHeartbeat(), 30_000);
    return () => {
      clearInterval(interval);
      socketService.getSocket()?.off("connect");
    };
  }, [isAuthenticated, fetchFriends]);

  // Realtime friend status — chỉ khi authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const handler = ({ userId, status }: { userId: string; status: string }) => {
      updateFriendStatus(userId, normalizeStatus(status));
    };

    const registerListener = () => {
      const s = socketService.getSocket();
      if (!s) return;
      s.off("friend_status_change", handler).on("friend_status_change", handler);
    };

    // Đăng ký ngay nếu socket đã sẵn sàng, hoặc chờ
    socketService.onReady(registerListener);

    // Re-register sau mỗi lần reconnect
    socketService.onReady((s) => {
      s.on("connect", registerListener);
    });

    return () => {
      socketService.offFriendStatusChange();
      socketService.getSocket()?.off("connect", registerListener);
    };
  }, [isAuthenticated, updateFriendStatus]);

  // Realtime friendship response - refetch để UI hết trạng thái pending/chuyển sang bạn bè
  useEffect(() => {
    if (!isAuthenticated) return;

    const handler = (payload: FriendRequestRespondedPayload) => {
      console.log("[Socket] friend_request_responded:", payload);
      fetchFriends();
    };

    const registerListener = () => {
      socketService.offFriendRequestResponded(handler);
      socketService.onFriendRequestResponded(handler);
    };

    socketService.onReady(registerListener);

    socketService.onReady((s) => {
      s.on("connect", registerListener);
    });

    return () => {
      socketService.offFriendRequestResponded(handler);
      socketService.getSocket()?.off("connect", registerListener);
    };
  }, [isAuthenticated, fetchFriends]);

  // Realtime friendship list changes - backend sends these as new_notification events
  useEffect(() => {
    if (!isAuthenticated) return;

    const handler = (payload: RealtimeNotificationPayload) => {
      if (FRIEND_LIST_NOTIFICATION_TYPES.has(payload.type)) {
        fetchFriends();
      }
    };

    const registerListener = () => {
      const s = socketService.getSocket();
      if (!s) return;
      s.off("new_notification", handler).on("new_notification", handler);
    };

    socketService.onReady(registerListener);

    socketService.onReady((s) => {
      s.on("connect", registerListener);
    });

    return () => {
      const s = socketService.getSocket();
      s?.off("new_notification", handler);
      s?.off("connect", registerListener);
    };
  }, [isAuthenticated, fetchFriends]);

  // Realtime incoming message — tự động mở ChatWindow khi nhận tin nhắn mới
  useEffect(() => {
    if (!isAuthenticated) return;

    const handler = (msg: { senderId: string; conversationId: string; _id: string; content: string; type: string; createdAt: string }) => {
      // Chỉ trigger khi là tin nhắn từ người khác gửi đến mình
      if (msg.senderId && msg.senderId !== user?.id) {
        recordFriendMessage(msg.senderId, msg, { unread: true });
        setIncomingMessageFriendId(msg.senderId);
        setIncomingMessage(msg);
      }
    };

    const registerListener = () => {
      const s = socketService.getSocket();
      if (!s) return;
      // off trước để tránh duplicate khi reconnect
      s.off("receive_message", handler);
      s.on("receive_message", handler);
    };

    socketService.onReady(registerListener);

    socketService.onReady((s) => {
      s.on("connect", registerListener);
    });

    return () => {
      const s = socketService.getSocket();
      s?.off("receive_message", handler);
      s?.off("connect", registerListener);
    };
  }, [isAuthenticated, recordFriendMessage, user?.id]);

  return (
    <FriendContext.Provider value={{ friends, isLoading, refetchFriends, updateFriendStatus, removeFriend, updateConversationId, recordFriendMessage, markFriendMessagesSeen, incomingMessageFriendId, incomingMessage, clearIncomingMessage }}>
      {children}
    </FriendContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────

export const useFriends = () => useContext(FriendContext);
