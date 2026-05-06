import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { useApi } from "../../../hook/useApi";
import { userService } from "../../../services/user.service";

interface ReportModalProps {
  reportedUserId: string;
  reportedUserName: string;
  matchSessionId?: string | null;
  conversationId?: string | null;
  onClose: () => void;
}

export default function ReportModal({
  reportedUserId,
  reportedUserName,
  matchSessionId,
  conversationId,
  onClose,
}: ReportModalProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { execute: submitReport, isLoading } = useApi();

  const [selectedReason, setSelectedReason] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const reasons = [
    { key: "Spam", label: t.report.reasons.spam },
    { key: "Quấy rối", label: t.report.reasons.harassment },
    { key: "Nội dung không phù hợp", label: t.report.reasons.inappropriate },
    { key: "Ngôn ngữ thù địch", label: t.report.reasons.hate },
    { key: "Khác", label: t.report.reasons.other },
  ];

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setError("");
    const result = await submitReport(
      userService.reportUser({
        reportedUserId,
        reason: selectedReason,
        matchSessionId: matchSessionId ?? null,
        conversationId: conversationId ?? null,
      })
    );
    if (result !== null) {
      setDone(true);
    } else {
      setError(t.report.error);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: theme.overlay.default }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
        style={{
          background: theme.background.card,
          border: `1px solid ${theme.border.default}`,
          boxShadow: theme.shadow.card,
        }}
      >
        {done ? (
          // Success state
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
              style={{ background: `${theme.text.success}18`, border: `2px solid ${theme.text.success}` }}
            >
              ✓
            </div>
            <p className="text-base font-semibold" style={{ color: theme.text.primary }}>
              {t.report.success}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
              style={{ background: theme.button.bg, color: theme.button.text }}
            >
              {t.report.cancel}
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-bold" style={{ color: theme.text.primary }}>
                  {t.report.title}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: theme.text.placeholder }}>
                  {reportedUserName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity shrink-0"
                style={{ background: theme.background.input, color: theme.text.secondary }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Reason list */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium" style={{ color: theme.text.secondary }}>
                {t.report.subtitle}
              </p>
              {reasons.map(({ key, label }) => {
                const isSelected = selectedReason === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedReason(key)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all"
                    style={{
                      background: isSelected ? `${theme.button.bg}15` : theme.background.input,
                      border: `1.5px solid ${isSelected ? theme.button.bg : theme.border.default}`,
                      color: isSelected ? theme.button.bg : theme.text.primary,
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    <span
                      className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                      style={{
                        borderColor: isSelected ? theme.button.bg : theme.border.default,
                        background: isSelected ? theme.button.bg : "transparent",
                      }}
                    >
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.button.text }} />
                      )}
                    </span>
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-center" style={{ color: theme.text.error }}>{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
                style={{
                  background: theme.background.input,
                  color: theme.text.secondary,
                  border: `1px solid ${theme.border.default}`,
                }}
              >
                {t.report.cancel}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedReason || isLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: theme.text.error, color: theme.button.text }}
              >
                {isLoading ? t.report.submitting : t.report.submit}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
