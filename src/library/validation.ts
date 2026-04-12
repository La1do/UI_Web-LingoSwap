// ============================================================
//  validation.ts — Shared form validation rules
//  Messages được inject từ i18n — không hardcode ngôn ngữ
// ============================================================

import type { Translation } from "../i18n/types";

// ─── Types ───────────────────────────────────────────────────

export type ValidationRule<T = string> = (value: T) => string | null;

export type FieldRules<T extends Record<string, string>> = {
  [K in keyof T]?: ValidationRule[];
};

export type FormErrors<T extends Record<string, string>> = Partial<Record<keyof T, string>>;

export type ValidationMessages = Translation["validation"];

// ─── Default messages (fallback tiếng Việt) ──────────────────

const DEFAULT_MESSAGES: ValidationMessages = {
  required:            "{label} không được để trống.",
  minLength:           "{label} phải có ít nhất {min} ký tự.",
  maxLength:           "{label} không được vượt quá {max} ký tự.",
  invalidEmail:        "Email không đúng định dạng.",
  mustMatch:           "{label} không khớp.",
  passwordNoUppercase: "Mật khẩu phải có ít nhất 1 chữ hoa.",
  passwordNoNumber:    "Mật khẩu phải có ít nhất 1 chữ số.",
};

// ─── Primitive rules ─────────────────────────────────────────

export const required =
  (label = "Trường này", msg = DEFAULT_MESSAGES): ValidationRule =>
  (value) =>
    value.trim() === ""
      ? msg.required.replace("{label}", label)
      : null;

export const minLength =
  (min: number, label = "Giá trị", msg = DEFAULT_MESSAGES): ValidationRule =>
  (value) =>
    value.length > 0 && value.length < min
      ? msg.minLength.replace("{label}", label).replace("{min}", String(min))
      : null;

export const maxLength =
  (max: number, label = "Giá trị", msg = DEFAULT_MESSAGES): ValidationRule =>
  (value) =>
    value.length > max
      ? msg.maxLength.replace("{label}", label).replace("{max}", String(max))
      : null;

export const isEmail =
  (msg = DEFAULT_MESSAGES): ValidationRule =>
  (value) => {
    if (value.trim() === "") return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : msg.invalidEmail;
  };

export const isStrongPassword =
  (msg = DEFAULT_MESSAGES): ValidationRule =>
  (value) => {
    if (value.length === 0) return null;
    if (!/[A-Z]/.test(value)) return msg.passwordNoUppercase;
    if (!/[0-9]/.test(value)) return msg.passwordNoNumber;
    return null;
  };

export const mustMatch =
  (getOther: () => string, label = "Giá trị", msg = DEFAULT_MESSAGES): ValidationRule =>
  (value) =>
    value !== getOther()
      ? msg.mustMatch.replace("{label}", label)
      : null;

export const matchesPattern =
  (pattern: RegExp, message: string): ValidationRule =>
  (value) =>
    value.length > 0 && !pattern.test(value) ? message : null;

// ─── Core validator ──────────────────────────────────────────

export function validateField(value: string, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
}

export function validateForm<T extends Record<string, string>>(
  values: T,
  fieldRules: FieldRules<T>
): { errors: FormErrors<T>; isValid: boolean } {
  const errors: FormErrors<T> = {};
  for (const key in fieldRules) {
    const rules = fieldRules[key];
    if (!rules) continue;
    const error = validateField(values[key] ?? "", rules);
    if (error) errors[key] = error;
  }
  return { errors, isValid: Object.keys(errors).length === 0 };
}

// ─── Pre-built rule sets (nhận msg từ i18n) ──────────────────

export const emailRules = (
  label = "Email",
  msg = DEFAULT_MESSAGES
): ValidationRule[] => [
  required(label, msg),
  isEmail(msg),
];

export const passwordRules = (
  label = "Mật khẩu",
  msg = DEFAULT_MESSAGES
): ValidationRule[] => [
  required(label, msg),
  minLength(8, label, msg),
];

export const strongPasswordRules = (
  label = "Mật khẩu",
  msg = DEFAULT_MESSAGES
): ValidationRule[] => [
  required(label, msg),
  minLength(8, label, msg),
  isStrongPassword(msg),
];

export const confirmPasswordRules = (
  getPassword: () => string,
  label = "Xác nhận mật khẩu",
  msg = DEFAULT_MESSAGES
): ValidationRule[] => [
  required(label, msg),
  mustMatch(getPassword, label, msg),
];
