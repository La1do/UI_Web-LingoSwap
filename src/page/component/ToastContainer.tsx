import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useToast, type Toast, type ToastType } from "../../context/ToastContext";

// ─── Icons ───────────────────────────────────────────────────

function SuccessIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 shrink-0">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 shrink-0">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ─── Single Toast Item ────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);

  // Trigger enter animation sau 1 frame
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const colorMap: Record<ToastType, { bg: string; text: string; icon: string; border: string }> = {
    success: {
      bg: `${theme.text.success}12`,
      text: theme.text.success,
      icon: theme.text.success,
      border: `${theme.text.success}30`,
    },
    error: {
      bg: `${theme.text.error}12`,
      text: theme.text.error,
      icon: theme.text.error,
      border: `${theme.text.error}30`,
    },
    info: {
      bg: `${theme.text.accent}12`,
      text: theme.text.accent,
      icon: theme.text.accent,
      border: `${theme.text.accent}30`,
    },
  };

  const colors = colorMap[toast.type];

  const iconMap: Record<ToastType, React.ReactNode> = {
    success: <SuccessIcon />,
    error: <ErrorIcon />,
    info: <InfoIcon />,
  };

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-2xl min-w-[280px] max-w-[360px]"
      style={{
        background: theme.background.card,
        border: `1px solid ${colors.border}`,
        boxShadow: theme.shadow.card,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(24px)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}
    >
      {/* Icon */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: colors.bg, color: colors.icon }}
      >
        {iconMap[toast.type]}
      </div>

      {/* Message */}
      <p className="flex-1 text-sm leading-snug pt-0.5" style={{ color: theme.text.primary }}>
        {toast.message}
      </p>

      {/* Close */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="w-5 h-5 flex items-center justify-center rounded-lg hover:opacity-60 transition-opacity shrink-0 mt-0.5"
        style={{ color: theme.text.placeholder }}
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ─── Container ───────────────────────────────────────────────

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}
