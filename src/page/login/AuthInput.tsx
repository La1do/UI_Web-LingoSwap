// ============================================================
//  AuthInput.tsx
// ============================================================

import React, { useState, forwardRef } from "react";
import { useTheme } from "../../context/ThemeContext";

const EyeOpen = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, hint, leftIcon, type = "text", className = "", ...rest }, ref) => {
    const { theme } = useTheme();
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;
    const borderColor = error ? theme.border.error : theme.border.default;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label
          className="text-xs font-medium tracking-widest uppercase"
          style={{ color: theme.text.secondary }}
        >
          {label}
        </label>

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 pointer-events-none" style={{ color: theme.text.placeholder }}>
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            type={inputType}
            className={[
              "w-full rounded-lg py-3 text-sm outline-none transition-all duration-200",
              leftIcon ? "pl-10 pr-4" : "px-4",
              isPassword ? "pr-11" : "",
              className,
            ].join(" ")}
            style={{
              background: theme.background.input,
              color: theme.text.primary,
              border: `1px solid ${borderColor}`,
              transition: "background 0.3s, border 0.3s, color 0.3s",
            }}
            {...rest}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 transition-opacity hover:opacity-70"
              style={{ color: theme.text.placeholder }}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOpen /> : <EyeClose />}
            </button>
          )}
        </div>

        {error ? (
          <p className="text-xs" style={{ color: theme.text.error }}>{error}</p>
        ) : hint ? (
          <p className="text-xs" style={{ color: theme.text.secondary }}>{hint}</p>
        ) : null}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
