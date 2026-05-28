import { io, Socket } from "socket.io-client";

// ─── Types ───────────────────────────────────────────────────

export interface MatchFoundPayload {
  sessionId: string;
  partnerId: string;
}

export interface WaitingStatusPayload {
  message: string;
}

export interface QueueTimeoutPayload {
  message: string;
}

export interface PartnerDisconnectedPayload {
  message: string;
}

export interface FriendRequestRespondedPayload {
  friendshipId: string;
  recipientId: string;
  status: "accepted" | "rejected";
}

export interface StreakUpdatePayload {
  streak: number;
}

export interface BannedPayload {
  message?: string;
}

// ─── Singleton socket instance ───────────────────────────────

let socket: Socket | null = null;

export const socketService = {
  connect(): Socket {
    if (socket) return socket;

    socket = io(import.meta.env.VITE_BACKEND_URL as string, {
      auth: {
        token: localStorage.getItem("access_token"),
      },
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });

    return socket;
  },

  disconnect(): void {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket(): Socket | null {
    return socket;
  },

  onBanned(cb: (payload?: BannedPayload) => void): () => void {
    socket?.on("banned", cb);
    return () => {
      socket?.off("banned", cb);
    };
  },

  // Chạy callback ngay nếu socket đã connected, hoặc chờ connect event
  // Nếu socket chưa được tạo, retry mỗi 200ms tối đa 15 lần (3 giây)
  onReady(cb: (s: Socket) => void): void {
    if (socket?.connected) {
      cb(socket);
      return;
    }
    if (socket) {
      socket.once("connect", () => { if (socket) cb(socket); });
      return;
    }
    // Socket chưa được tạo — poll cho đến khi có
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (socket?.connected) {
        clearInterval(interval);
        cb(socket);
      } else if (socket) {
        clearInterval(interval);
        socket.once("connect", () => { if (socket) cb(socket); });
      } else if (attempts >= 15) {
        clearInterval(interval);
      }
    }, 200);
  },

  // ── Matching events ──────────────────────────────────────

  joinQueue(language: string): void {
    console.log("[Socket] emit join_queue:", { language }, "| connected:", socket?.connected, "| id:", socket?.id);
    socket?.emit("join_queue", { language });
  },

  leaveQueue(): void {
    console.log("[Socket] emit leave_queue | connected:", socket?.connected, "| id:", socket?.id);
    socket?.emit("leave_queue");
  },

  onWaitingStatus(cb: (payload: WaitingStatusPayload) => void): void {
    socket?.on("waiting_status", (data) => {
      console.log("[Socket] waiting_status:", data);
      cb(data);
    });
  },

  onMatchFound(cb: (payload: MatchFoundPayload) => void): void {
    socket?.on("match_found", (data) => {
      console.log("[Socket] match_found:", data);
      cb(data);
    });
  },

  onQueueTimeout(cb: (payload: QueueTimeoutPayload) => void): void {
    socket?.on("queue_timeout", (data) => {
      console.log("[Socket] queue_timeout:", data);
      cb(data);
    });
  },

  onPartnerDisconnected(cb: (payload: PartnerDisconnectedPayload) => void): void {
    // Dùng off+on để tránh duplicate — đây là event 1-1 per session
    socket?.off("partner_disconnected");
    socket?.on("partner_disconnected", (data) => {
      console.log("[Socket] partner_disconnected:", data);
      cb(data);
    });
  },

  onError(cb: (message: string) => void): void {
    socket?.on("error", (data) => {
      console.log("[Socket] error:", data);
      cb(data);
    });
  },

  // ── Chat events ──────────────────────────────────────────

  sendMessage(payload: { partnerId: string; content: string; matchSessionId: string | null }): void {
    console.log("[Socket] emit send_message:", payload);
    socket?.emit("send_message", payload);
  },

  // KHÔNG dùng blanket off — caller tự quản lý handler reference
  onReceiveMessage(cb: (msg: {
    _id: string;
    senderId: string;
    content: string;
    type: string;
    createdAt: string;
    conversationId: string;
  }) => void): void {
    socket?.on("receive_message", cb);
  },

  offReceiveMessage(cb: (msg: {
    _id: string;
    senderId: string;
    content: string;
    type: string;
    createdAt: string;
    conversationId: string;
  }) => void): void {
    socket?.off("receive_message", cb);
  },

  onMessageSentSuccess(cb: (msg: { _id: string; content: string; createdAt: string; conversationId?: string }) => void): void {
    socket?.on("message_sent_success", cb);
  },

  offMessageSentSuccess(cb: (msg: { _id: string; content: string; createdAt: string; conversationId?: string }) => void): void {
    socket?.off("message_sent_success", cb);
  },

  offChatEvents(): void {
    socket?.off("receive_message");
    socket?.off("message_sent_success");
  },

  // ── WebRTC signaling ─────────────────────────────────────

  emitOffer(sessionId: string, offer: RTCSessionDescriptionInit): void {
    socket?.emit("webrtc_offer", { sessionId, offer });
  },

  emitAnswer(sessionId: string, answer: RTCSessionDescriptionInit): void {
    socket?.emit("webrtc_answer", { sessionId, answer });
  },

  emitIceCandidate(sessionId: string, candidate: RTCIceCandidateInit): void {
    socket?.emit("webrtc_ice_candidate", { sessionId, candidate });
  },

  // KHÔNG dùng blanket off — caller tự quản lý handler reference
  onOffer(cb: (payload: { sessionId?: string; offer: RTCSessionDescriptionInit }) => void): void {
    socket?.on("webrtc_offer", cb);
  },

  offOffer(cb: (payload: { sessionId?: string; offer: RTCSessionDescriptionInit }) => void): void {
    socket?.off("webrtc_offer", cb);
  },

  onAnswer(cb: (payload: { sessionId?: string; answer: RTCSessionDescriptionInit }) => void): void {
    socket?.on("webrtc_answer", cb);
  },

  offAnswer(cb: (payload: { sessionId?: string; answer: RTCSessionDescriptionInit }) => void): void {
    socket?.off("webrtc_answer", cb);
  },

  onIceCandidate(cb: (payload: { sessionId?: string; candidate: RTCIceCandidateInit }) => void): void {
    socket?.on("webrtc_ice_candidate", cb);
  },

  offIceCandidate(cb: (payload: { sessionId?: string; candidate: RTCIceCandidateInit }) => void): void {
    socket?.off("webrtc_ice_candidate", cb);
  },

  offWebRTCEvents(): void {
    socket?.off("webrtc_offer");
    socket?.off("webrtc_answer");
    socket?.off("webrtc_ice_candidate");
  },

  // ── Direct call events ───────────────────────────────────

  emitDirectCallRequest(targetUserId: string): void {
    console.log("[Socket] emit direct_match_request:", { targetUserId });
    socket?.emit("direct_match_request", { targetUserId });
  },

  emitDirectCallResponse(callerId: string, accept: boolean): void {
    console.log("[Socket] emit direct_match_response:", { callerId, accept });
    socket?.emit("direct_match_response", { callerId, accept });
  },

  onDirectCallOffer(cb: (payload: { callerId: string; message: string }) => void): void {
    // Direct call offer là 1-1 per session — off+on ổn
    socket?.off("direct_match_offer");
    socket?.on("direct_match_offer", (data) => {
      console.log("[Socket] direct_match_offer:", data);
      cb(data);
    });
  },

  onDirectCallRejected(cb: (payload: { message: string }) => void): void {
    socket?.off("direct_match_rejected");
    socket?.on("direct_match_rejected", (data) => {
      console.log("[Socket] direct_match_rejected:", data);
      cb(data);
    });
  },

  onDirectCallError(cb: (payload: { message: string }) => void): void {
    socket?.off("direct_match_error");
    socket?.on("direct_match_error", (data) => {
      console.log("[Socket] direct_match_error:", data);
      cb(data);
    });
  },

  offDirectCallEvents(): void {
    socket?.off("direct_match_offer");
    socket?.off("direct_match_rejected");
    socket?.off("direct_match_error");
  },

  // ── Notification realtime ────────────────────────────────

  // KHÔNG dùng blanket off — caller tự quản lý handler reference
  onNewNotification(cb: (payload: {
    _id: string;
    type: string;
    content: string;
    isRead: boolean;
    senderId?: { _id: string; profile: { fullName: string; avatar: string } };
    metadata?: Record<string, unknown>;
  }) => void): void {
    socket?.on("new_notification", (data) => {
      console.log("[Socket] new_notification:", data);
      cb(data);
    });
  },

  offNewNotification(): void {
    socket?.off("new_notification");
  },

  // ── Heartbeat (30s) ──────────────────────────────────────

  emitHeartbeat(): void {
    socket?.emit("heartbeat");
  },

  // ── Friend presence ──────────────────────────────────────

  // KHÔNG dùng blanket off — caller tự quản lý handler reference
  onFriendStatusChange(cb: (payload: { userId: string; status: "online" | "offline" }) => void): void {
    socket?.on("friend_status_change", (data) => {
      console.log("[Socket] friend_status_change:", data);
      cb(data);
    });
  },

  offFriendStatusChange(): void {
    socket?.off("friend_status_change");
  },

  // Friendship events

  onFriendRequestResponded(cb: (payload: FriendRequestRespondedPayload) => void): void {
    socket?.on("friend_request_responded", cb);
  },

  offFriendRequestResponded(cb: (payload: FriendRequestRespondedPayload) => void): void {
    socket?.off("friend_request_responded", cb);
  },

  onStreakUpdate(cb: (payload: StreakUpdatePayload) => void): void {
    socket?.on("streak_update", cb);
  },

  offStreakUpdate(cb: (payload: StreakUpdatePayload) => void): void {
    socket?.off("streak_update", cb);
  },

  // Remove all matching listeners (cleanup)
  offMatchingEvents(): void {
    socket?.off("waiting_status");
    socket?.off("match_found");
    socket?.off("queue_timeout");
    socket?.off("partner_disconnected");
    socket?.off("error");
  },
};
