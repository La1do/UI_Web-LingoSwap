import type { AxiosRequestConfig } from "axios";

// ─── Types ───────────────────────────────────────────────────

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image";
  createdAt: { full: string; friendly: string } | string;
}

// ─── Service ─────────────────────────────────────────────────

export const chatService = {
  getMessages: (conversationId: string, limit = 50, page = 1): AxiosRequestConfig => ({
    method: "GET",
    url: `/api/user/conversations/${conversationId}`,
    params: { limit, page },
  }),
};
