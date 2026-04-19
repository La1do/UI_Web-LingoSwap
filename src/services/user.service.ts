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
  uploadAvatar: (formData: FormData): AxiosRequestConfig => ({
    method: "POST",
    url: "/api/users/avatar",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  }),

  updateProfile: (data: UpdateProfileRequest): AxiosRequestConfig => ({
    method: "PUT",
    url: "/api/users/me",
    data: { profile: data },
  }),
};
