// ============================================================
//  RegisterPage.tsx
// ============================================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";
import { AuthInput } from "./AuthInput";
import PageShell from "../../layout/PageShell";
import GoogleSignInButton from "../component/GoogleSignInButton";
import { useApi } from "../../hook/useApi";
import { authService, type RegisterResponse } from "../../services/auth.service";
import {
  validateForm,
  required,
  emailRules,
  strongPasswordRules,
  confirmPasswordRules,
  type FormErrors,
} from "../../library/validation";

interface RegisterFields extends Record<string, string> {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
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

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

function PasswordStrength({ password }: { password: string }) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const s = t.auth.passwordStrength;
  const checks = [
    { label: s.checks.length,    pass: password.length >= 8 },
    { label: s.checks.uppercase, pass: /[A-Z]/.test(password) },
    { label: s.checks.number,    pass: /[0-9]/.test(password) },
    { label: s.checks.special,   pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = [theme.border.default, theme.text.error, theme.warning, theme.text.success, theme.text.success];
  const labels = ["", s.weak, s.medium, s.good, s.strong];

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
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { execute, isLoading, isError, error: apiError } = useApi<RegisterResponse>();

  const [values, setValues] = useState<RegisterFields>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
  });
  const [errors, setErrors] = useState<FormErrors<RegisterFields>>({});
  const [submitted, setSubmitted] = useState(false);

  const getFieldRules = (current: RegisterFields) => ({
    fullName: [required(t.auth.fullNameLabel, t.validation)],
    email: emailRules("Email", t.validation),
    password: strongPasswordRules(t.auth.register, t.validation),
    confirmPassword: confirmPasswordRules(() => current.password, t.auth.confirmPasswordLabel, t.validation),
  });

  // Re-run validation khi đổi ngôn ngữ để cập nhật error messages
  useEffect(() => {
    if (submitted) {
      const { errors: newErrors } = validateForm(values, getFieldRules(values));
      setErrors(newErrors);
    }
  }, [locale]);

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

    const result = await execute(authService.register({
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
      country: values.country,
    }));

    if (result) {
      navigate("/");
    }
  };

  return (
    <PageShell controlsPosition="top-right">
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
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-2/3 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${theme.button.bg}, transparent)` }}
        />

        <div className="mb-8 fade-up fade-up-1">
              <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: theme.text.accent }}>
                {t.auth.createAccount}
              </p>
              <h1 className="text-3xl font-semibold" style={{ color: theme.text.primary }}>
                {t.auth.register}
              </h1>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div className="fade-up fade-up-2">
                <AuthInput
                  label={t.auth.fullNameLabel}
                  type="text"
                  placeholder={t.auth.fullNamePlaceholder}
                  autoComplete="name"
                  leftIcon={<UserIcon />}
                  value={values.fullName}
                  onChange={handleChange("fullName")}
                  error={errors.fullName}
                />
              </div>

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
                  autoComplete="new-password"
                  leftIcon={<LockIcon />}
                  value={values.password}
                  onChange={handleChange("password")}
                  error={errors.password}
                  hint={!errors.password && !values.password ? t.auth.passwordHint : undefined}
                />
                <PasswordStrength password={values.password} />
              </div>

              <div className="fade-up fade-up-4">
                <AuthInput
                  label={t.auth.confirmPasswordLabel}
                  type="password"
                  placeholder={t.auth.passwordPlaceholder}
                  autoComplete="new-password"
                  leftIcon={<ShieldIcon />}
                  value={values.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  error={errors.confirmPassword}
                />
              </div>

              {/* Country select */}
              <div className="fade-up fade-up-5 flex flex-col gap-1.5">
                <label className="text-xs font-medium tracking-widest uppercase"
                  style={{ color: theme.text.secondary }}>
                  {t.auth.countryLabel}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: theme.text.placeholder }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                  </span>
                  <select
                    value={values.country}
                    onChange={(e) => {
                      const next = { ...values, country: e.target.value };
                      setValues(next);
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none appearance-none"
                    style={{
                      background: theme.background.input,
                      color: values.country ? theme.text.primary : theme.text.placeholder,
                      border: `1px solid ${theme.border.default}`,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = theme.border.focused)}
                    onBlur={(e) => (e.target.style.borderColor = theme.border.default)}
                  >
                    <option value="" disabled>{t.auth.countryPlaceholder}</option>
                    <option value="VN">🇻🇳 Vietnam</option>
                    <option value="US">🇺🇸 United States</option>
                    <option value="GB">🇬🇧 United Kingdom</option>
                    <option value="JP">🇯🇵 Japan</option>
                    <option value="KR">🇰🇷 South Korea</option>
                    <option value="CN">🇨🇳 China</option>
                    <option value="FR">🇫🇷 France</option>
                    <option value="DE">🇩🇪 Germany</option>
                    <option value="AU">🇦🇺 Australia</option>
                    <option value="CA">🇨🇦 Canada</option>
                    <option value="SG">🇸🇬 Singapore</option>
                    <option value="TH">🇹🇭 Thailand</option>
                    <option value="OTHER">🌍 Other</option>
                  </select>
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: theme.text.placeholder }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>
              </div>

              <p className="text-xs fade-up fade-up-5" style={{ color: theme.text.placeholder }}>
                {t.auth.termsText}{" "}
                <a href="/terms" className="hover:opacity-80" style={{ color: theme.text.accent }}>{t.auth.termsLink}</a>{" "}
                {t.auth.termsAnd}{" "}
                <a href="/privacy" className="hover:opacity-80" style={{ color: theme.text.accent }}>{t.auth.privacyLink}</a>.
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="primary-btn w-full py-3 rounded-lg text-sm font-semibold tracking-wider fade-up fade-up-5"
                style={{
                  background: isLoading ? theme.button.bgDisabled : theme.button.bg,
                  color: theme.button.text,
                  borderRadius: "0.5rem",
                }}
              >
                {isLoading ? t.auth.registering : t.auth.register}
              </button>

              {isError && apiError && (
                <p className="text-xs text-center -mt-2" style={{ color: theme.text.error }}>
                  {apiError}
                </p>
              )}
            </form>

            <div className="flex items-center gap-3 my-6 fade-up fade-up-6">
              <div className="flex-1 h-px" style={{ background: theme.border.default }} />
              <span className="text-xs" style={{ color: theme.text.placeholder }}>{t.common.or}</span>
              <div className="flex-1 h-px" style={{ background: theme.border.default }} />
            </div>

            <div className="fade-up fade-up-6 mb-5">
              <GoogleSignInButton label={t.auth.googleSignUp} />
            </div>

            <p className="text-center text-sm fade-up fade-up-6" style={{ color: theme.text.secondary }}>
              {t.auth.alreadyHaveAccount}{" "}
              <a href="/login" className="font-medium hover:opacity-80 transition-opacity" style={{ color: theme.text.accent }}>
                {t.auth.loginLink}
              </a>
            </p>
      </div>
    </div>
    </PageShell>
  );
}
