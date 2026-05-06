import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";
import { useApi } from "../../hook/useApi";
import { userService } from "../../services/user.service";
import PageShell from "../../layout/PageShell";

const MIN_REASON_LENGTH = 20;

export default function AppealPage() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { execute, isLoading } = useApi();

  const appealToken = searchParams.get("token") ?? "";

  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isValidToken = appealToken.trim().length > 0;
  const isReasonValid = reason.trim().length >= MIN_REASON_LENGTH;

  const handleSubmit = async () => {
    if (!isReasonValid || !isValidToken) return;
    setError("");
    const result = await execute(
      userService.submitAppeal({ appealToken, reason: reason.trim() })
    );
    if (result !== null) {
      setSubmitted(true);
    } else {
      setError(t.appeal.errorGeneric);
    }
  };

  return (
    <PageShell controlsPosition="top-right">
      <div
        className="min-h-screen flex items-center justify-center px-4 py-10"
        style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif" }}
      >
        <div
          className="w-full max-w-md rounded-2xl p-8 flex flex-col gap-6"
          style={{
            background: theme.background.card,
            border: `1px solid ${theme.border.default}`,
            boxShadow: theme.shadow.card,
          }}
        >
          {/* Invalid token state */}
          {!isValidToken ? (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: `${theme.text.error}15`, border: `2px solid ${theme.text.error}` }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-7 h-7"
                  style={{ color: theme.text.error }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h1 className="text-xl font-bold" style={{ color: theme.text.primary }}>
                {t.appeal.invalidToken}
              </h1>
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                {t.appeal.invalidTokenDesc}
              </p>
              <button
                onClick={() => navigate("/login")}
                className="mt-2 text-sm hover:opacity-70 transition-opacity"
                style={{ color: theme.text.accent }}
              >
                {t.appeal.backToLogin}
              </button>
            </div>
          ) : submitted ? (
            /* Success state */
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                style={{ background: `${theme.text.success}15`, border: `2px solid ${theme.text.success}` }}
              >
                ✓
              </div>
              <h1 className="text-xl font-bold" style={{ color: theme.text.primary }}>
                {t.appeal.successTitle}
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: theme.text.secondary }}>
                {t.appeal.successDesc}
              </p>
              <button
                onClick={() => navigate("/login")}
                className="mt-2 text-sm hover:opacity-70 transition-opacity"
                style={{ color: theme.text.accent }}
              >
                {t.appeal.backToLogin}
              </button>
            </div>
          ) : (
            /* Form state */
            <>
              {/* Header */}
              <div className="flex flex-col gap-2">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${theme.text.error}15` }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6"
                    style={{ color: theme.text.error }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold" style={{ color: theme.text.primary }}>
                  {t.appeal.title}
                </h1>
                <p className="text-sm leading-relaxed" style={{ color: theme.text.secondary }}>
                  {t.appeal.subtitle}
                </p>
              </div>

              <div className="h-px" style={{ background: theme.border.default }} />

              {/* Reason textarea */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                  {t.appeal.reasonLabel}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t.appeal.reasonPlaceholder}
                  rows={5}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  style={{
                    background: theme.background.input,
                    color: theme.text.primary,
                    border: `1px solid ${theme.border.default}`,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = theme.border.focused)}
                  onBlur={(e) => (e.target.style.borderColor = theme.border.default)}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: theme.text.placeholder }}>
                    {t.appeal.reasonHint}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: isReasonValid ? theme.text.success : theme.text.placeholder }}
                  >
                    {reason.trim().length} / {MIN_REASON_LENGTH}
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs text-center px-2 py-2 rounded-lg"
                  style={{ color: theme.text.error, background: `${theme.text.error}10` }}>
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!isReasonValid || isLoading}
                className="w-full py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: theme.button.bg, color: theme.button.text }}
              >
                {isLoading ? t.appeal.submitting : t.appeal.submit}
              </button>

              <button
                onClick={() => navigate("/login")}
                className="text-xs text-center hover:opacity-70 transition-opacity"
                style={{ color: theme.text.placeholder }}
              >
                {t.appeal.backToLogin}
              </button>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
