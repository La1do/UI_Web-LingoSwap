import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { useAuth } from "../../../context/AuthContext";
import { useApi } from "../../../hook/useApi";
import { userService } from "../../../services/user.service";

const COUNTRIES = [
  { code: "VN", label: "🇻🇳 Vietnam" }, { code: "US", label: "🇺🇸 United States" },
  { code: "GB", label: "🇬🇧 United Kingdom" }, { code: "JP", label: "🇯🇵 Japan" },
  { code: "KR", label: "🇰🇷 South Korea" }, { code: "CN", label: "🇨🇳 China" },
  { code: "FR", label: "🇫🇷 France" }, { code: "DE", label: "🇩🇪 Germany" },
  { code: "AU", label: "🇦🇺 Australia" }, { code: "CA", label: "🇨🇦 Canada" },
  { code: "SG", label: "🇸🇬 Singapore" }, { code: "TH", label: "🇹🇭 Thailand" },
  { code: "OTHER", label: "🌍 Other" },
];

export default function ProfileForm() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { user, updateUser } = useAuth();
  const { execute, isLoading } = useApi<{ message: string; user: { profile: { fullName: string; bio: string; country: string } } }>();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [country, setCountry] = useState(user?.country ?? "");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    const result = await execute(userService.updateProfile({ fullName, bio, country }));
    if (result !== null) {
      updateUser({
        fullName: result.user.profile.fullName,
        bio: result.user.profile.bio,
        country: result.user.profile.country,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const inputStyle = {
    background: theme.background.input,
    color: theme.text.primary,
    border: `1px solid ${theme.border.default}`,
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Full name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.secondary }}>
          {t.profile.fullName}
        </label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="rounded-xl px-4 py-2.5 text-sm outline-none"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = theme.border.focused)}
          onBlur={(e) => (e.target.style.borderColor = theme.border.default)}
        />
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.secondary }}>
          {t.profile.bio}
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={t.profile.bioPlaceholder}
          rows={3}
          className="rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = theme.border.focused)}
          onBlur={(e) => (e.target.style.borderColor = theme.border.default)}
        />
      </div>

      {/* Country */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.secondary }}>
          {t.profile.country}
        </label>
        <div className="relative">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none appearance-none"
            style={{ ...inputStyle, color: country ? theme.text.primary : theme.text.placeholder }}
            onFocus={(e) => (e.target.style.borderColor = theme.border.focused)}
            onBlur={(e) => (e.target.style.borderColor = theme.border.default)}
          >
            <option value="" disabled>—</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: theme.text.placeholder }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </div>

      {/* Email (readonly) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.secondary }}>
          {t.profile.email}
        </label>
        <input
          value={user?.email ?? ""}
          readOnly
          className="rounded-xl px-4 py-2.5 text-sm outline-none cursor-not-allowed"
          style={{ ...inputStyle, opacity: 0.6 }}
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
          style={{ background: theme.button.bg, color: theme.button.text }}
        >
          {isLoading ? t.profile.saving : t.profile.saveChanges}
        </button>
        {success && (
          <span className="text-sm" style={{ color: theme.text.success }}>
            ✓ {t.profile.saveSuccess}
          </span>
        )}
      </div>
    </form>
  );
}
