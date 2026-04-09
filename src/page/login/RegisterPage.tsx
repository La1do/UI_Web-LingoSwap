// ============================================================
//  RegisterPage.tsx
// ============================================================

import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { AuthInput } from "./AuthInput";
import {
  validateForm,
  emailRules,
  strongPasswordRules,
  confirmPasswordRules,
  type FormErrors,
} from "../../library/validation";

interface RegisterFields extends Record<string, string> {
  email: string;
  password: string;
  confirmPassword: string;
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

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

function PasswordStrength({ password }: { password: string }) {
  const { theme } = useTheme();
  const checks = [
    { label: "8+ ký tự",        pass: password.length >= 8 },
    { label: "Chữ hoa",         pass: /[A-Z]/.test(password) },
    { label: "Số",              pass: /[0-9]/.test(password) },
    { label: "Ký tự đặc biệt", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = [theme.border.default, theme.text.error, "#F5A623", theme.text.success, theme.text.success];
  const labels = ["", "Yếu", "Trung bình", "Tốt", "Mạnh"];

  if (!password) return null;

  return (
    <div className="mt-1">
      <div className="flex gap-1 mb-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? colors[score] : theme.border.default }}
          />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          {checks.map((c) => (
            <span key={c.label} className="text-[10px]" style={{ color: c.pass ? theme.text.success : theme.text.placeholder }}>
              {c.pass ? "✓" : "○"} {c.label}
            </span>
          ))}
        </div>
        <span className="text-[10px] font-medium" style={{ color: colors[score] }}>
          {labels[score]}
        </span>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const { theme } = useTheme();
  const [values, setValues] = useState<RegisterFields>({ email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FormErrors<RegisterFields>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const getFieldRules = (current: RegisterFields) => ({
    email: emailRules(),
    password: strongPasswordRules(),
    confirmPassword: confirmPasswordRules(() => current.password),
  });

  const handleChange = (field: keyof RegisterFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    if (submitted) {
      const { errors: newErrors } = validateForm(next, getFieldRules(next));
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const { errors: newErrors, isValid } = validateForm(values, getFieldRules(values));
    setErrors(newErrors);
    if (!isValid) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif", transition: "background 0.3s" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes successPop {
          0%   { opacity: 0; transform: scale(0.85); }
          70%  { transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }
        .fade-up { animation: fadeUp 0.5s cubic-bezier(.22,.68,0,1.2) both; }
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.12s; }
        .fade-up-3 { animation-delay: 0.20s; }
        .fade-up-4 { animation-delay: 0.28s; }
        .fade-up-5 { animation-delay: 0.36s; }
        .fade-up-6 { animation-delay: 0.44s; }
        .success-pop { animation: successPop 0.5s cubic-bezier(.22,.68,0,1.2) both; }
        .primary-btn {
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        .primary-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(26,111,212,0.35);
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
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-2/3 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${theme.button.bg}, transparent)` }}
        />

        {success ? (
          <div className="flex flex-col items-center text-center gap-4 py-4 success-pop">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{ background: `${theme.text.success}18`, border: `1px solid ${theme.text.success}` }}
            >
              ✓
            </div>
            <h2 className="text-2xl font-semibold" style={{ color: theme.text.primary }}>
              Đăng ký thành công!
            </h2>
            <p className="text-sm" style={{ color: theme.text.secondary }}>
              Tài khoản của bạn đã được tạo. Hãy kiểm tra email để xác minh.
            </p>
            <a href="/login" className="mt-2 text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: theme.text.accent }}>
              Đến trang đăng nhập →
            </a>
          </div>
        ) : (
          <>
            <div className="mb-8 fade-up fade-up-1">
              <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: theme.text.accent }}>
                Tạo tài khoản
              </p>
              <h1 className="text-3xl font-semibold" style={{ color: theme.text.primary }}>
                Đăng ký
              </h1>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div className="fade-up fade-up-2">
                <AuthInput
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  leftIcon={<MailIcon />}
                  value={values.email}
                  onChange={handleChange("email")}
                  error={errors.email}
                />
              </div>

              <div className="fade-up fade-up-3">
                <AuthInput
                  label="Mật khẩu"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  leftIcon={<LockIcon />}
                  value={values.password}
                  onChange={handleChange("password")}
                  error={errors.password}
                  hint={!errors.password && !values.password ? "Ít nhất 8 ký tự, 1 chữ hoa, 1 số" : undefined}
                />
                <PasswordStrength password={values.password} />
              </div>

              <div className="fade-up fade-up-4">
                <AuthInput
                  label="Xác nhận mật khẩu"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  leftIcon={<ShieldIcon />}
                  value={values.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  error={errors.confirmPassword}
                />
              </div>

              <p className="text-xs fade-up fade-up-5" style={{ color: theme.text.placeholder }}>
                Bằng cách đăng ký, bạn đồng ý với{" "}
                <a href="/terms" className="hover:opacity-80" style={{ color: theme.text.accent }}>Điều khoản dịch vụ</a>{" "}
                và{" "}
                <a href="/privacy" className="hover:opacity-80" style={{ color: theme.text.accent }}>Chính sách bảo mật</a>.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="primary-btn w-full py-3 rounded-lg text-sm font-semibold tracking-wider fade-up fade-up-5"
                style={{
                  background: loading ? theme.button.bgDisabled : theme.button.bg,
                  color: theme.button.text,
                  borderRadius: "0.5rem",
                }}
              >
                {loading ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6 fade-up fade-up-6">
              <div className="flex-1 h-px" style={{ background: theme.border.default }} />
              <span className="text-xs" style={{ color: theme.text.placeholder }}>hoặc</span>
              <div className="flex-1 h-px" style={{ background: theme.border.default }} />
            </div>

            <p className="text-center text-sm fade-up fade-up-6" style={{ color: theme.text.secondary }}>
              Đã có tài khoản?{" "}
              <a href="/login" className="font-medium hover:opacity-80 transition-opacity" style={{ color: theme.text.accent }}>
                Đăng nhập
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
