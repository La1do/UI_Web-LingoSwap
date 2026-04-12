import type { AxiosRequestConfig } from "axios";

// ─── Types ───────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  profile: {
    fullName: string;
    language: string;
    proficiencyLevel: string;
    avatar: string;
    bio: string;
  };
  role: string;
  token: string;
}

// ─── Configs ─────────────────────────────────────────────────

export const authService = {
  login: (data: LoginRequest): AxiosRequestConfig => ({
    method: "POST",
    url: "/api/auth/login",
    data,
  }),
};
