import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { useApi } from "../../../hook/useApi";
import { authService } from "../../../services/auth.service";

interface EmailStepProps {
  onSuccess: (email: string) => void;
}

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
  </svg>
);

export default function EmailStep({ onSuccess }: EmailStepProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { execute, isLoading, isError, error } = useApi();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const result = await execute(authService.sendForgotPasswordOtp(email.trim()));
    if (result !== null) onSuccess(email.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.secondary }}>
          {t.forgotPassword.emailLabel}
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 pointer-events-none" style={{ color: theme.text.placeholder }}>
            <MailIcon />
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
            style={{
              background: theme.background.input,
              color: theme.text.primary,
              border: `1px solid ${theme.border.default}`,
            }}
            onFocus={(e) => (e.target.style.borderColor = theme.border.focused)}
            onBlur={(e) => (e.target.style.borderColor = theme.border.default)}
            required
          />
        </div>
      </div>

      {isError && error && (
        <p className="text-xs" style={{ color: theme.text.error }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading || !email.trim()}
        className="w-full py-3 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
        style={{ background: theme.button.bg, color: theme.button.text }}
      >
        {isLoading ? t.forgotPassword.sendingOtp : t.forgotPassword.sendOtp}
      </button>
    </form>
  );
}
