import type { AxiosRequestConfig } from "axios";

// ─── Types ───────────────────────────────────────────────────

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    banned: number;
    online: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
  };
  matchSessions: {
    total: number;
    today: number;
    thisWeek: number;
    avgDurationSeconds: number;
    totalDurationSeconds: number;
  };
  messages: { total: number; today: number; thisWeek: number };
  reports: { total: number; pending: number; resolved: number; today: number };
  friendships: { total: number };
}

export interface Appeal {
  _id: string;
  userId: { _id: string; email: string; profile: { fullName: string; avatar?: string } };
  banReason?: string;
  reason: string;
  content?: string;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  createdAt: string;
}

export interface BlacklistKeywordCreator {
  _id: string;
  profile?: { fullName?: string };
  email?: string;
}

export interface BlacklistKeyword {
  _id: string;
  keyword: string;
  createdBy: string | BlacklistKeywordCreator;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface BlacklistKeywordListResponse {
  total: number;
  page: number;
  limit: number;
  keywords: BlacklistKeyword[];
}

export interface CreateBlacklistKeywordResponse {
  message: string;
  keyword: BlacklistKeyword;
}

// ─── Service ─────────────────────────────────────────────────

export const adminService = {
  getUsers: (): AxiosRequestConfig => ({
    method: "GET",
    url: "/api/admin/users",
  }),

  banUser: (id: string): AxiosRequestConfig => ({
    method: "PATCH",
    url: `/api/admin/users/${id}/status`,
    data: { status: "banned" },
  }),

  deleteUser: (id: string): AxiosRequestConfig => ({
    method: "DELETE",
    url: `/api/admin/users/${id}`,
  }),

  getDashboard: (): AxiosRequestConfig => ({
    method: "GET",
    url: "/api/admin/dashboard",
  }),

  getAppeals: (status?: "pending" | "approved" | "rejected"): AxiosRequestConfig => ({
    method: "GET",
    url: "/api/admin/appeals",
    params: status ? { status } : undefined,
  }),

  resolveAppeal: (id: string, data: { status: "approved" | "rejected"; adminNotes?: string }): AxiosRequestConfig => ({
    method: "PATCH",
    url: `/api/admin/appeals/${id}/status`,
    data,
  }),

  getReports: (status?: "pending" | "resolved" | "dismissed"): AxiosRequestConfig => ({
    method: "GET",
    url: "/api/admin/reports",
    params: status ? { status } : undefined,
  }),

  resolveReport: (id: string, data: {
    status: "resolved" | "dismissed";
    adminNotes?: string;
    banDuration?: "3_days" | "7_days" | "30_days" | "permanent";
  }): AxiosRequestConfig => ({
    method: "PATCH",
    url: `/api/admin/reports/${id}/status`,
    data,
  }),

  getBlacklistKeywords: (params?: { search?: string; page?: number; limit?: number }): AxiosRequestConfig => ({
    method: "GET",
    url: "/api/admin/blacklist-keywords",
    params,
  }),

  createBlacklistKeyword: (keyword: string): AxiosRequestConfig => ({
    method: "POST",
    url: "/api/admin/blacklist-keywords",
    data: { keyword },
  }),

  deleteBlacklistKeyword: (id: string): AxiosRequestConfig => ({
    method: "DELETE",
    url: `/api/admin/blacklist-keywords/${id}`,
  }),
};
