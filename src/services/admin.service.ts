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
  content: string;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  createdAt: string;
}

// ─── Service ─────────────────────────────────────────────────

export const adminService = {
  getUsers: (): AxiosRequestConfig => ({
    method: "GET",
    url: "/api/admin/users",
  }),

  banUser: (id: string): AxiosRequestConfig => ({
    method: "PUT",
    url: `/api/admin/users/${id}/ban`,
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
    method: "PUT",
    url: `/api/admin/appeals/${id}/resolve`,
    data,
  }),
};
