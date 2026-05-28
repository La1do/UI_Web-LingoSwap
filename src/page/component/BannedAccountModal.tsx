import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";

interface BannedAccountModalProps {
  message: string;
  onConfirm: () => void;
}

export default function BannedAccountModal({ message, onConfirm }: BannedAccountModalProps) {
  const { theme } = useTheme();
  const { t } = useI18n();

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4"
      style={{ background: theme.overlay.strong }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="banned-account-title"
    >
      <div
        className="w-full max-w-md rounded-xl p-6 shadow-2xl"
        style={{
          background: theme.background.card,
          border: `1px solid ${theme.border.default}`,
          boxShadow: theme.shadow.card,
        }}
      >
        <h2
          id="banned-account-title"
          className="text-xl font-semibold"
          style={{ color: theme.text.primary }}
        >
          {t.auth.accountBannedTitle}
        </h2>

        <p className="mt-3 text-sm leading-6" style={{ color: theme.text.secondary }}>
          {message}
        </p>

        <button
          type="button"
          onClick={onConfirm}
          className="mt-6 w-full rounded-lg px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            background: theme.button.bg,
            color: theme.button.text,
          }}
        >
          {t.auth.accountBannedOk}
        </button>
      </div>
    </div>
  );
}
