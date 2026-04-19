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
    country: string;
  };
  role: string;
  token: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  profile: {
    fullName: string;
    language: string;
    proficiencyLevel: string;
    avatar: string;
    bio: string;
    country: string;
  };
  role: string;
  token: string;
}

// ─── Service ─────────────────────────────────────────────────

export const authService = {
  login: (data: LoginRequest): AxiosRequestConfig => ({
    method: "POST",
    url: "/api/auth/login",
    data,
  }),

  register: (data: RegisterRequest): AxiosRequestConfig => ({
    method: "POST",
    url: "/api/auth/register",
    data,
  }),

  // Gửi idToken lấy từ Google Identity Services lên backend
  googleLogin: (idToken: string): AxiosRequestConfig => ({
    method: "POST",
    url: "/api/auth/google",
    data: { idToken },
  }),

  sendForgotPasswordOtp: (email: string): AxiosRequestConfig => ({
    method: "POST",
    url: "/api/auth/password/forgot",
    data: { email },
  }),

  resetPassword: (data: { email: string; otp: string; newPassword: string }): AxiosRequestConfig => ({
    method: "POST",
    url: "/api/auth/password/forgot",
    data,
  }),
};
