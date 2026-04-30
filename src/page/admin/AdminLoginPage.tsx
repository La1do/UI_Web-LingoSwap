import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useApi } from "../../hook/useApi";
import { useAuth } from "../../context/AuthContext";
import { authService, type LoginResponse } from "../../services/auth.service";
import { userService } from "../../services/user.service";
import type { MeResponse } from "../../context/AuthContext";
import { AuthInput } from "../login/AuthInput";

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

export default function AdminLoginPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { execute, isLoading, isError, error: apiError } = useApi<LoginResponse>();
  const { execute: executeMe } = useApi<MeResponse>();
  const { setUserFromResponse, setUserFromMe } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    const result = await execute(authService.login({ email, password }));
    if (!result) return;

    if (result.role !== "admin") {
      setError("Tài khoản này không có quyền truy cập admin.");
      return;
    }

    setUserFromResponse(result);
    const me = await executeMe(userService.getMe());
    if (me) setUserFromMe(me);

    navigate("/admin", { replace: true });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif" }}
    >
      <div
        className="w-full max-w-sm relative"
        style={{
          background: theme.background.card,
          borderRadius: "1.25rem",
          border: `1px solid ${theme.border.default}`,
          boxShadow: `${theme.shadow.card}, ${theme.shadow.glow}`,
          padding: "2.5rem 2rem",
        }}
      >
        {/* Top accent */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-2/3 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${theme.button.bg}, transparent)` }}
        />

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg mx-auto mb-4"
            style={{ background: theme.button.bg, color: theme.button.text }}>
            A
          </div>
          <p className="text-xs tracking-[0.2em] uppercase mb-1" style={{ color: theme.text.accent }}>
            LingoSwap
          </p>
          <h1 className="text-2xl font-semibold" style={{ color: theme.text.primary }}>
            Admin Portal
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <AuthInput
            label="Email"
            type="email"
            placeholder="admin@lingoswap.com"
            autoComplete="email"
            leftIcon={<MailIcon />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <AuthInput
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            leftIcon={<LockIcon />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {(error || (isError && apiError)) && (
            <p className="text-xs text-center" style={{ color: theme.text.error }}>
              {error || apiError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl text-sm font-semibold mt-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: theme.button.bg, color: theme.button.text }}
          >
            {isLoading ? "Đang xử lý…" : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
