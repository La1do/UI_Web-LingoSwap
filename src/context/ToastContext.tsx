import React, { createContext, useContext, useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toasts: Toast[];
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  dismiss: (id: string) => void;
}

// ─── Context ─────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  success: () => {},
  error: () => {},
  info: () => {},
  dismiss: () => {},
});

// ─── Provider ────────────────────────────────────────────────

const MAX_TOASTS = 3;
const DURATION: Record<ToastType, number> = {
  success: 3000,
  info: 3000,
  error: 5000,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((type: ToastType, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => {
      const next = [...prev, { id, type, message }];
      // Giữ tối đa MAX_TOASTS — bỏ toast cũ nhất nếu vượt quá
      return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
    });
    setTimeout(() => dismiss(id), DURATION[type]);
  }, [dismiss]);

  const success = useCallback((message: string) => add("success", message), [add]);
  const error = useCallback((message: string) => add("error", message), [add]);
  const info = useCallback((message: string) => add("info", message), [add]);

  return (
    <ToastContext.Provider value={{ toasts, success, error, info, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────

export const useToast = () => useContext(ToastContext);
