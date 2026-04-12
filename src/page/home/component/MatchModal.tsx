import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";

// ─── Language options ─────────────────────────────────────────
const LANGUAGES = [
  { code: "en", label: "English",    flag: "🇺🇸" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "ja", label: "日本語",      flag: "🇯🇵" },
  { code: "ko", label: "한국어",      flag: "🇰🇷" },
  { code: "zh", label: "中文",        flag: "🇨🇳" },
  { code: "fr", label: "Français",   flag: "🇫🇷" },
  { code: "de", label: "Deutsch",    flag: "🇩🇪" },
  { code: "es", label: "Español",    flag: "🇪🇸" },
];

interface MatchModalProps {
  open: boolean;
  onClose: () => void;
  onStart: (language: string) => void;
}

export default function MatchModal({ open, onClose, onStart }: MatchModalProps) {
  const { theme } = useTheme();
  const { locale } = useI18n();
  const [selected, setSelected] = useState<string | null>(null);

  if (!open) return null;

  const handleStart = () => {
    if (!selected) return;
    onStart(selected);
  };

  const label = locale === "vi"
    ? { title: "Chọn ngôn ngữ luyện tập", subtitle: "Bạn muốn luyện ngôn ngữ nào hôm nay?", start: "Bắt đầu tìm kiếm", cancel: "Huỷ" }
    : { title: "Choose a language", subtitle: "Which language do you want to practice today?", start: "Start matching", cancel: "Cancel" };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-5"
        style={{
          background: theme.background.card,
          border: `1px solid ${theme.border.default}`,
          boxShadow: theme.shadow.card,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
              {label.title}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: theme.text.secondary }}>
              {label.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity shrink-0"
            style={{ background: theme.background.input, color: theme.text.secondary }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Language grid */}
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map((lang) => {
            const isSelected = selected === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setSelected(lang.code)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: isSelected ? theme.button.bg : theme.background.input,
                  color: isSelected ? theme.button.text : theme.text.primary,
                  border: `1px solid ${isSelected ? theme.button.bg : theme.border.default}`,
                  transform: isSelected ? "scale(1.02)" : "scale(1)",
                }}
              >
                <span className="text-xl">{lang.flag}</span>
                {lang.label}
                {isSelected && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                    className="w-4 h-4 ml-auto shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: theme.background.input, color: theme.text.secondary }}
          >
            {label.cancel}
          </button>
          <button
            onClick={handleStart}
            disabled={!selected}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: theme.button.bg, color: theme.button.text }}
          >
            {label.start}
          </button>
        </div>
      </div>
    </div>
  );
}
