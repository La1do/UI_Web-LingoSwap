import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { useApi } from "../../../hook/useApi";
import { authService } from "../../../services/auth.service";
import { validateForm, minLength, mustMatch, required } from "../../../library/validation";

const OTP_SECONDS = 5 * 60; // 5 phút

interface OtpPasswordStepProps {
  email: string;
  onSuccess: () => void;
}

interface Fields extends Record<string, string> {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

export default function OtpPasswordStep({ email, onSuccess }: OtpPasswordStepProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { execute, isLoading, isError, error: apiError } = useApi();
  const { execute: resendExecute, isLoading: resending } = useApi();

  const [values, setValues] = useState<Fields>({ otp: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Countdown
  const [secondsLeft, setSecondsLeft] = useState(OTP_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    setSecondsLeft(OTP_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(timerRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => { startTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const getRules = (v: Fields) => ({
    otp: [required("OTP", t.validation), minLength(6, "OTP", t.validation)],
    newPassword: [required(t.forgotPassword.newPasswordLabel, t.validation), minLength(8, t.forgotPassword.newPasswordLabel, t.validation)],
    confirmPassword: [required(t.forgotPassword.confirmPasswordLabel, t.validation), mustMatch(() => v.newPassword, t.forgotPassword.confirmPasswordLabel, t.validation)],
  });

  const handleChange = (field: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    if (submitted) {
      const { errors: newErrors } = validateForm(next, getRules(next));
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (secondsLeft === 0) return;
    const { errors: newErrors, isValid } = validateForm(values, getRules(values));
    setErrors(newErrors);
    if (!isValid) return;
    const result = await execute(authService.resetPassword({
      email,
      otp: values.otp,
      newPassword: values.newPassword,
    }));
    if (result !== null) onSuccess();
  };

  const handleResend = async () => {
    const result = await resendExecute(authService.sendForgotPasswordOtp(email));
    if (result !== null) startTimer();
  };

  const inputStyle = {
    background: theme.background.input,
    color: theme.text.primary,
    border: `1px solid ${theme.border.default}`,
  };

  const EyeToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button type="button" tabIndex={-1} onClick={onToggle}
      className="absolute right-3.5 hover:opacity-70 transition-opacity"
      style={{ color: theme.text.placeholder }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        {show
          ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
          : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
        }
      </svg>
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* OTP sent notice */}
      <div className="px-4 py-3 rounded-xl text-sm text-center"
        style={{ background: `${theme.text.success}15`, color: theme.text.success }}>
        ✉️ {t.forgotPassword.otpSent}
      </div>

      {/* Countdown */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: theme.text.placeholder }}>
          {secondsLeft > 0
            ? `${t.forgotPassword.resendIn} ${formatTime(secondsLeft)}`
            : t.forgotPassword.expired}
        </span>
        <button type="button" onClick={handleResend} disabled={secondsLeft > 0 || resending}
          className="text-xs font-medium hover:opacity-70 transition-opacity disabled:opacity-40"
          style={{ color: theme.text.accent }}>
          {resending ? "…" : t.forgotPassword.resendOtp}
        </button>
      </div>

      {/* OTP input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.secondary }}>
          {t.forgotPassword.otpLabel}
        </label>
        <input
          value={values.otp}
          onChange={handleChange("otp")}
          placeholder={t.forgotPassword.otpPlaceholder}
          maxLength={6}
          className="rounded-xl px-4 py-3 text-sm outline-none text-center tracking-[0.5em] font-mono"
          style={{ ...inputStyle, borderColor: errors.otp ? theme.border.error : theme.border.default, fontSize: "1.2rem" }}
          onFocus={(e) => (e.target.style.borderColor = errors.otp ? theme.border.error : theme.border.focused)}
          onBlur={(e) => (e.target.style.borderColor = errors.otp ? theme.border.error : theme.border.default)}
        />
        {errors.otp && <p className="text-xs" style={{ color: theme.text.error }}>{errors.otp}</p>}
      </div>

      {/* New password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.secondary }}>
          {t.forgotPassword.newPasswordLabel}
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 pointer-events-none" style={{ color: theme.text.placeholder }}><LockIcon /></span>
          <input type={showNew ? "text" : "password"} value={values.newPassword}
            onChange={handleChange("newPassword")} placeholder="••••••••"
            className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none"
            style={{ ...inputStyle, borderColor: errors.newPassword ? theme.border.error : theme.border.default }}
            onFocus={(e) => (e.target.style.borderColor = errors.newPassword ? theme.border.error : theme.border.focused)}
            onBlur={(e) => (e.target.style.borderColor = errors.newPassword ? theme.border.error : theme.border.default)}
          />
          <EyeToggle show={showNew} onToggle={() => setShowNew(v => !v)} />
        </div>
        {errors.newPassword && <p className="text-xs" style={{ color: theme.text.error }}>{errors.newPassword}</p>}
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.secondary }}>
          {t.forgotPassword.confirmPasswordLabel}
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 pointer-events-none" style={{ color: theme.text.placeholder }}><LockIcon /></span>
          <input type={showConfirm ? "text" : "password"} value={values.confirmPassword}
            onChange={handleChange("confirmPassword")} placeholder="••••••••"
            className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none"
            style={{ ...inputStyle, borderColor: errors.confirmPassword ? theme.border.error : theme.border.default }}
            onFocus={(e) => (e.target.style.borderColor = errors.confirmPassword ? theme.border.error : theme.border.focused)}
            onBlur={(e) => (e.target.style.borderColor = errors.confirmPassword ? theme.border.error : theme.border.default)}
          />
          <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
        </div>
        {errors.confirmPassword && <p className="text-xs" style={{ color: theme.text.error }}>{errors.confirmPassword}</p>}
      </div>

      {isError && apiError && (
        <p className="text-xs text-center" style={{ color: theme.text.error }}>{apiError}</p>
      )}

      <button type="submit" disabled={isLoading || secondsLeft === 0}
        className="w-full py-3 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
        style={{ background: theme.button.bg, color: theme.button.text }}>
        {isLoading ? t.forgotPassword.submitting : t.forgotPassword.submit}
      </button>
    </form>
  );
}
