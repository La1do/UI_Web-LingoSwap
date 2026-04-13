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

// ─── Singleton socket instance ───────────────────────────────

let socket: Socket | null = null;

export const socketService = {
  connect(): Socket {
    if (socket?.connected) return socket;

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

  // ── Matching events ──────────────────────────────────────

  joinQueue(language: string): void {
    console.log("[Socket] emit join_queue:", { language }, "| connected:", socket?.connected, "| id:", socket?.id);
    socket?.emit("join_queue", { language });
  },

  leaveQueue(): void {
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

  // Remove all matching listeners (cleanup)
  offMatchingEvents(): void {
    socket?.off("waiting_status");
    socket?.off("match_found");
    socket?.off("queue_timeout");
    socket?.off("partner_disconnected");
    socket?.off("error");
  },
};
