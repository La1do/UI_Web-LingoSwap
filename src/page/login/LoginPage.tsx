// ============================================================
//  LoginPage.tsx
// ============================================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";
import { AuthInput } from "./AuthInput";
import PageShell from "../../layout/PageShell";
import GoogleSignInButton from "../component/GoogleSignInButton";
import { useApi } from "../../hook/useApi";
import { useAuth } from "../../context/AuthContext";
import { authService, type LoginResponse } from "../../services/auth.service";
import { userService } from "../../services/user.service";
import type { MeResponse } from "../../context/AuthContext";
import { socketService } from "../../services/socket.service";
import {
  validateForm,
  emailRules,
  passwordRules,
  type FormErrors,
} from "../../library/validation";

interface LoginFields extends Record<string, string> {
  email: string;
  password: string;
}

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

export default function LoginPage() {
  const { theme, setMode } = useTheme();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { execute, isLoading, isError, error: apiError } = useApi<LoginResponse>();
  const { execute: executeMe } = useApi<MeResponse>();
  const { setUserFromResponse, setUserFromMe, logout } = useAuth();

  const [values, setValues] = useState<LoginFields>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors<LoginFields>>({});
  const [submitted, setSubmitted] = useState(false);

  const fieldRules = {
    email: emailRules("Email", t.validation),
    password: passwordRules(t.auth.login, t.validation),
  };

  // Re-run validation khi đổi ngôn ngữ để cập nhật error messages
  useEffect(() => {
    if (submitted) {
      const { errors: newErrors } = validateForm(values, {
        email: emailRules("Email", t.validation),
        password: passwordRules(t.auth.login, t.validation),
      });
      setErrors(newErrors);
    }
  }, [locale]);

  const handleChange = (field: keyof LoginFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    if (submitted) {
      const { errors: newErrors } = validateForm(next, fieldRules);
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const { errors: newErrors, isValid } = validateForm(values, fieldRules);
    setErrors(newErrors);
    if (!isValid) return;

    const result = await execute(authService.login({ email: values.email, password: values.password }));
    if (result) {
      setUserFromResponse(result);
      // Fetch full profile từ /api/users/me
      const me = await executeMe(userService.getMe());
      if (me) {
        // Chặn admin đăng nhập vào trang user
        if (me.role === "admin") {
          logout();
          setErrors({ email: "Tài khoản admin không thể đăng nhập tại đây. Vui lòng dùng trang Admin Portal." });
          return;
        }
        setUserFromMe(me);
        if (me.settings?.theme === "light" || me.settings?.theme === "dark") {
          setMode(me.settings.theme);
        }
      }
      socketService.connect();
      navigate("/home");
    }
  };

  return (
    <PageShell controlsPosition="top-right">
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif", transition: "background 0.3s" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s cubic-bezier(.22,.68,0,1.2) both; }
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.12s; }
        .fade-up-3 { animation-delay: 0.20s; }
        .fade-up-4 { animation-delay: 0.28s; }
        .fade-up-5 { animation-delay: 0.36s; }
        .primary-btn {
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        .primary-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px ${theme.button.bg}55;
          background: ${theme.button.bgHover} !important;
        }
        .primary-btn:active:not(:disabled) { transform: translateY(0); }
        .primary-btn:disabled { cursor: not-allowed; opacity: 0.5; }
      `}</style>

      <div
        className="w-full max-w-md relative"
        style={{
          background: theme.background.card,
          borderRadius: "1.25rem",
          border: `1px solid ${theme.border.default}`,
          boxShadow: `${theme.shadow.card}, ${theme.shadow.glow}`,
          padding: "2.75rem 2.5rem",
          transition: "background 0.3s, border 0.3s, box-shadow 0.3s",
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-2/3 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${theme.button.bg}, transparent)` }}
        />

        {/* Header */}
        <div className="mb-8 fade-up fade-up-1">
          <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: theme.text.accent }}>
            {t.auth.welcomeBack}
          </p>
          <h1 className="text-3xl font-semibold" style={{ color: theme.text.primary }}>
            {t.auth.login}
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div className="fade-up fade-up-2">
            <AuthInput
              label="Email"
              type="email"
              placeholder={t.auth.emailPlaceholder}
              autoComplete="email"
              leftIcon={<MailIcon />}
              value={values.email}
              onChange={handleChange("email")}
              error={errors.email}
            />
          </div>

          <div className="fade-up fade-up-3">
            <AuthInput
              label={t.auth.passwordLabel}
              type="password"
              placeholder={t.auth.passwordPlaceholder}
              autoComplete="current-password"
              leftIcon={<LockIcon />}
              value={values.password}
              onChange={handleChange("password")}
              error={errors.password}
            />
          </div>

          <div className="flex justify-end fade-up fade-up-3" style={{ marginTop: "-0.75rem" }}>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-xs hover:opacity-80 transition-opacity"
              style={{ color: theme.text.accent }}
            >
              {t.auth.forgotPassword}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="primary-btn w-full py-3 rounded-lg text-sm font-semibold tracking-wider fade-up fade-up-4"
            style={{
              background: isLoading ? theme.button.bgDisabled : theme.button.bg,
              color: theme.button.text,
              borderRadius: "0.5rem",
            }}
          >
          {isLoading ? t.auth.loggingIn : t.auth.login}
          </button>

          {/* API error */}
          {isError && apiError && (
            <p className="text-xs text-center -mt-2" style={{ color: theme.text.error }}>
              {apiError}
            </p>
          )}
        </form>

        <div className="flex items-center gap-3 my-6 fade-up fade-up-4">
          <div className="flex-1 h-px" style={{ background: theme.border.default }} />
          <span className="text-xs" style={{ color: theme.text.placeholder }}>{t.common.or}</span>
          <div className="flex-1 h-px" style={{ background: theme.border.default }} />
        </div>

        <div className="fade-up fade-up-5 mb-5">
          <GoogleSignInButton label={t.auth.googleSignIn} />
        </div>

        <p className="text-center text-sm fade-up fade-up-5" style={{ color: theme.text.secondary }}>
          {t.auth.noAccount}{" "}
          <a href="/register" className="font-medium hover:opacity-80 transition-opacity" style={{ color: theme.text.accent }}>
            {t.auth.registerNow}
          </a>
        </p>
      </div>
    </div>
    </PageShell>
  );
}
