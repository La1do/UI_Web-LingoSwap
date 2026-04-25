import type { AxiosRequestConfig } from "axios";

// ─── Types ───────────────────────────────────────────────────

export interface UserProfile {
  fullName: string;
  language: string;
  proficiencyLevel: string;
  avatar: string;
  bio: string;
  country: string;
}

export interface UserResponse {
  id: string;
  email: string;
  profile: UserProfile;
  role: string;
  token: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  bio: string;
  country: string;
}

// ─── Service ─────────────────────────────────────────────────

export const userService = {
  getMe: (): AxiosRequestConfig => ({
    method: "GET",
    url: "/api/users/me",
  }),

  getPublicProfile: (userId: string): AxiosRequestConfig => ({
    method: "GET",
    url: `/api/users/${userId}`,
  }),

  sendFriendRequest: (recipientId: string): AxiosRequestConfig => ({
    method: "POST",
    url: `/api/user/friends/friends/${recipientId}/request`,
  }),

  getFriends: (): AxiosRequestConfig => ({
    method: "GET",
    url: "/api/user/friends/friends",
  }),

  getFriendRequests: (): AxiosRequestConfig => ({
    method: "GET",
    url: "/api/user/friends/friends/requests",
  }),

  respondFriendRequest: (requestId: string, status: "accept" | "reject"): AxiosRequestConfig => ({
    method: "PATCH",
    url: `/api/user/friends/friends/${requestId}/response`,
    data: { status },
  }),

  uploadAvatar: (formData: FormData): AxiosRequestConfig => ({
    method: "POST",
    url: "/api/users/avatar",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  }),

  updateSettings: (data: { theme: string; uiLanguage: string }): AxiosRequestConfig => ({
    method: "PUT",
    url: "/api/users/me",
    data: { settings: data },
  }),

  updateProfile: (data: UpdateProfileRequest): AxiosRequestConfig => ({
    method: "PUT",
    url: "/api/users/me",
    data: { profile: data },
  }),

 
  getMatchHistory: (limit = 7, page = 1): AxiosRequestConfig => ({
    method: "GET",
    url: "/api/user/matches",
    params: { limit, page },
  }),

  reviewMatch: (sessionId: string, data: { rating: number; comment?: string }): AxiosRequestConfig => ({
    method: "POST",
    url: `/api/user/matches/${sessionId}/review`,
    data,
  }),
};
