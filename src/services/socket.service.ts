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
    socket?.emit("join_queue", { language });
  },

  leaveQueue(): void {
    socket?.emit("leave_queue");
  },

  onWaitingStatus(cb: (payload: WaitingStatusPayload) => void): void {
    socket?.on("waiting_status", cb);
  },

  onMatchFound(cb: (payload: MatchFoundPayload) => void): void {
    socket?.on("match_found", cb);
  },

  onQueueTimeout(cb: (payload: QueueTimeoutPayload) => void): void {
    socket?.on("queue_timeout", cb);
  },

  onPartnerDisconnected(cb: (payload: PartnerDisconnectedPayload) => void): void {
    socket?.on("partner_disconnected", cb);
  },

  onError(cb: (message: string) => void): void {
    socket?.on("error", cb);
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
