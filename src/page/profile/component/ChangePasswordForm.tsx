import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { useApi } from "../../../hook/useApi";
import { validateForm, required, minLength, mustMatch } from "../../../library/validation";

interface ChangePasswordFields extends Record<string, string> {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function ChangePasswordForm() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { execute, isLoading } = useApi();

  const [values, setValues] = useState<ChangePasswordFields>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ChangePasswordFields, string>>>({});
  const [success, setSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const getRules = (current: ChangePasswordFields) => ({
    currentPassword: [required(t.profile.currentPassword, t.validation)],
    newPassword: [required(t.profile.newPassword, t.validation), minLength(8, t.profile.newPassword, t.validation)],
    confirmNewPassword: [required(t.profile.confirmNewPassword, t.validation), mustMatch(() => current.newPassword, t.profile.confirmNewPassword, t.validation)],
  });

  const handleChange = (field: keyof ChangePasswordFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    if (submitted) {
      const { errors: newErrors } = validateForm(next, getRules(next));
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setSuccess(false);

    const { errors: newErrors, isValid } = validateForm(values, getRules(values));
    setErrors(newErrors);
    if (!isValid) return;

    const result = await execute({
      method: "PUT",
      url: "/api/user/change-password",
      data: { currentPassword: values.currentPassword, newPassword: values.newPassword },
    });

    if (result !== null) {
      setSuccess(true);
      setValues({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setSubmitted(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const inputStyle = {
    background: theme.background.input,
    color: theme.text.primary,
    border: `1px solid ${theme.border.default}`,
  };

  const fields: { key: keyof ChangePasswordFields; label: string; show: boolean; toggle: () => void }[] = [
    { key: "currentPassword", label: t.profile.currentPassword, show: showCurrent, toggle: () => setShowCurrent((v) => !v) },
    { key: "newPassword", label: t.profile.newPassword, show: showNew, toggle: () => setShowNew((v) => !v) },
    { key: "confirmNewPassword", label: t.profile.confirmNewPassword, show: showConfirm, toggle: () => setShowConfirm((v) => !v) },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {fields.map(({ key, label, show, toggle }) => (
        <div key={key} className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.secondary }}>
            {label}
          </label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={values[key]}
              onChange={handleChange(key)}
              placeholder="••••••••"
              className="w-full rounded-xl px-4 pr-11 py-2.5 text-sm outline-none"
              style={{ ...inputStyle, borderColor: errors[key] ? theme.border.error : theme.border.default }}
              onFocus={(e) => (e.target.style.borderColor = errors[key] ? theme.border.error : theme.border.focused)}
              onBlur={(e) => (e.target.style.borderColor = errors[key] ? theme.border.error : theme.border.default)}
            />
            <button type="button" onClick={toggle} tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
              style={{ color: theme.text.placeholder }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                {show
                  ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                  : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                }
              </svg>
            </button>
          </div>
          {errors[key] && (
            <p className="text-xs" style={{ color: theme.text.error }}>{errors[key]}</p>
          )}
        </div>
      ))}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
          style={{ background: theme.button.bg, color: theme.button.text }}
        >
          {isLoading ? t.profile.updatingPassword : t.profile.updatePassword}
        </button>
        {success && (
          <span className="text-sm" style={{ color: theme.text.success }}>
            ✓ {t.profile.passwordUpdateSuccess}
          </span>
        )}
      </div>
    </form>
  );
}
