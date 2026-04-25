import type { AxiosRequestConfig } from "axios";

// ─── Types ───────────────────────────────────────────────────

export interface Notification {
  _id: string;
  type: string;
  content: string;
  isRead: boolean;
  senderId: {
    _id: string;
    profile: { fullName: string; avatar: string };
  };
  metadata?: {
    friendshipId?: string;
    [key: string]: unknown;
  };
}

// ─── Service ─────────────────────────────────────────────────

export const notificationService = {
  getNotifications: (limit = 20, page = 1): AxiosRequestConfig => ({
    method: "GET",
    url: "/api/user/notifications",
    params: { limit, page },
  }),

  getUnreadCount: (): AxiosRequestConfig => ({
    method: "GET",
    url: "/api/user/notifications/unread-count",
  }),

  markRead: (notificationId: string): AxiosRequestConfig => ({
    method: "PATCH",
    url: `/api/user/notifications/${notificationId}/read`,
  }),

  markAllRead: (): AxiosRequestConfig => ({
    method: "PATCH",
    url: "/api/user/notifications/mark-all-read",
  }),
};
