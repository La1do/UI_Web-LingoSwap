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

  // Redirect browser sang Google OAuth — không dùng axios
  // Backend sẽ redirect sang Google, sau đó callback về frontend
  googleLogin: (): void => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
  },

  // Sau khi Google callback, frontend gọi endpoint này để lấy token
  // (dùng khi backend redirect về kèm ?code=... hoặc ?token=...)
  googleCallback: (code: string): AxiosRequestConfig => ({
    method: "GET",
    url: "/api/auth/google/callback",
    params: { code },
  }),
};
