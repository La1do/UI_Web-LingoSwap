import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";
import { useMatching } from "../../hook/useMatching";

const LANGUAGE_LABELS: Record<string, { label: string; flag: string }> = {
  en: { label: "English",    flag: "🇺🇸" },
  vi: { label: "Tiếng Việt", flag: "🇻🇳" },
  ja: { label: "日本語",      flag: "🇯🇵" },
  ko: { label: "한국어",      flag: "🇰🇷" },
  zh: { label: "中文",        flag: "🇨🇳" },
  fr: { label: "Français",   flag: "🇫🇷" },
  de: { label: "Deutsch",    flag: "🇩🇪" },
  es: { label: "Español",    flag: "🇪🇸" },
};

export default function WaitingPage() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [elapsed, setElapsed] = useState(0);

  const lang = searchParams.get("lang") ?? "en";
  const langInfo = LANGUAGE_LABELS[lang] ?? { label: lang, flag: "🌍" };

  const { status, matchData, errorMessage, startMatching, cancelMatching } = useMatching();
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Start matching on mount
  useEffect(() => {
    startMatching(lang);
    return () => {
      // cancelMatching chỉ emit leave_queue khi chưa matched (xử lý trong hook)
      if( statusRef.current !== "matched"){

        cancelMatching();
      }
    };
  }, [lang]);

  // Navigate to meeting when matched
  useEffect(() => {
    if (statusRef.current === "matched" && matchData) {
      navigate(`/meeting?session=${matchData.sessionId}&partner=${matchData.partnerId}`, {
        replace: true,
      });
    }
  }, [statusRef, matchData]);

  // Timer — only tick while waiting
  useEffect(() => {
    if (status !== "waiting") return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const handleCancel = () => {
    cancelMatching();
    navigate("/home");
  };

  const handleRetry = () => {
    setElapsed(0);
    startMatching(lang);
  };

  const isError = status === "timeout" || status === "error";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8 px-4"
      style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Animated rings */}
      <div className="relative flex items-center justify-center">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border-2"
            style={{
              width: `${i * 60}px`,
              height: `${i * 60}px`,
              borderColor: isError ? theme.text.error : theme.button.bg,
              opacity: isError ? 0.3 : 1 / (i + 1),
              animation: isError ? "none" : `ping 1.8s ease-out ${(i - 1) * 0.4}s infinite`,
            }}
          />
        ))}
        <div
          className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-3xl"
          style={{
            background: theme.background.card,
            border: `2px solid ${isError ? theme.text.error : theme.button.bg}`,
          }}
        >
          {langInfo.flag}
        </div>
      </div>

      {/* Text */}
      <div className="text-center flex flex-col gap-2">
        <h1 className="text-2xl font-semibold" style={{ color: isError ? theme.text.error : theme.text.primary }}>
          {isError ? (errorMessage ?? t.waiting.timeout) : status === "matched" ? t.waiting.matched : t.waiting.title}
        </h1>
        {!isError && (
          <p className="text-sm" style={{ color: theme.text.secondary }}>
            {t.waiting.subtitle.replace("{lang}", langInfo.label)}
          </p>
        )}
        {status === "waiting" && (
          <p className="text-xs mt-1" style={{ color: theme.text.placeholder }}>
            {t.waiting.elapsed.replace("{s}", String(elapsed))}
          </p>
        )}
      </div>

      {/* Tip */}
      {!isError && (
        <div
          className="max-w-sm w-full px-4 py-3 rounded-xl text-sm text-center"
          style={{
            background: theme.background.card,
            border: `1px solid ${theme.border.default}`,
            color: theme.text.secondary,
          }}
        >
          💡 {t.waiting.tip}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {isError && (
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ background: theme.button.bg, color: theme.button.text }}
          >
            {t.waiting.retry}
          </button>
        )}
        <button
          onClick={handleCancel}
          className="px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
          style={{
            background: theme.background.input,
            color: theme.text.secondary,
            border: `1px solid ${theme.border.default}`,
          }}
        >
          {t.waiting.cancel}
        </button>
      </div>

      <style>{`
        @keyframes ping {
          0% { transform: scale(1); opacity: inherit; }
          75%, 100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
