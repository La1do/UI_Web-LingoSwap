// ============================================================
//  validation.ts  —  Shared form validation rules
//  Dùng chung cho LoginPage, RegisterPage và bất kỳ form nào
// ============================================================

// ---------- Types ----------

export type ValidationRule<T = string> = (value: T) => string | null;

export type FieldRules<T extends Record<string, string>> = {
  [K in keyof T]?: ValidationRule[];
};

export type FormErrors<T extends Record<string, string>> = Partial<Record<keyof T, string>>;

// ---------- Primitive rules (reusable building blocks) ----------

/** Bắt buộc nhập */
export const required =
  (label = "Trường này"): ValidationRule =>
  (value) =>
    value.trim() === "" ? `${label} không được để trống.` : null;

/** Độ dài tối thiểu */
export const minLength =
  (min: number, label = "Giá trị"): ValidationRule =>
  (value) =>
    value.length > 0 && value.length < min
      ? `${label} phải có ít nhất ${min} ký tự.`
      : null;

/** Độ dài tối đa */
export const maxLength =
  (max: number, label = "Giá trị"): ValidationRule =>
  (value) =>
    value.length > max ? `${label} không được vượt quá ${max} ký tự.` : null;

/** Định dạng email hợp lệ */
export const isEmail = (): ValidationRule => (value) => {
  if (value.trim() === "") return null; // required handles empty
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value) ? null : "Email không đúng định dạng.";
};

/** Mật khẩu phải có ít nhất 1 chữ hoa, 1 số */
export const isStrongPassword = (): ValidationRule => (value) => {
  if (value.length === 0) return null;
  if (!/[A-Z]/.test(value)) return "Mật khẩu phải có ít nhất 1 chữ hoa.";
  if (!/[0-9]/.test(value)) return "Mật khẩu phải có ít nhất 1 chữ số.";
  return null;
};

/** Phải trùng với giá trị của field khác (dùng cho confirm password) */
export const mustMatch =
  (getOther: () => string, label = "Giá trị"): ValidationRule =>
  (value) =>
    value !== getOther() ? `${label} không khớp.` : null;

/** Regex tùy chỉnh */
export const matchesPattern =
  (pattern: RegExp, message: string): ValidationRule =>
  (value) =>
    value.length > 0 && !pattern.test(value) ? message : null;

// ---------- Core validator ----------

/**
 * Chạy tất cả các rule cho một field và trả về lỗi đầu tiên (nếu có).
 */
export function validateField(value: string, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
}

/**
 * Validate toàn bộ form.
 * Trả về object errors và boolean isValid.
 */
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

// ---------- Pre-built rule sets ----------

/** Rules cho field Email */
export const emailRules = (label = "Email"): ValidationRule[] => [
  required(label),
  isEmail(),
];

/** Rules cho field Password (đăng nhập – chỉ required + minLength) */
export const passwordRules = (label = "Mật khẩu"): ValidationRule[] => [
  required(label),
  minLength(8, label),
];

/** Rules cho field Password khi đăng ký (strict) */
export const strongPasswordRules = (label = "Mật khẩu"): ValidationRule[] => [
  required(label),
  minLength(8, label),
  isStrongPassword(),
];

/** Rules cho confirm password */
export const confirmPasswordRules = (
  getPassword: () => string,
  label = "Xác nhận mật khẩu"
): ValidationRule[] => [required(label), mustMatch(getPassword, label)];