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

export interface UploadImageResponse {
  _id: string;
  content: string; // Cloudinary URL
  type: "image";
  conversationId: string;
}

// ─── Service ─────────────────────────────────────────────────

export const chatService = {
  getMessages: (conversationId: string, limit = 50, page = 1): AxiosRequestConfig => ({
    method: "GET",
    url: `/api/user/conversations/${conversationId}`,
    params: { limit, page },
  }),

  uploadImage: (file: File, partnerId: string, matchSessionId?: string | null): AxiosRequestConfig => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("partnerId", partnerId);
    if (matchSessionId) formData.append("matchSessionId", matchSessionId);
    return {
      method: "POST",
      url: "/api/user/conversations/upload-image",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    };
  },
};
