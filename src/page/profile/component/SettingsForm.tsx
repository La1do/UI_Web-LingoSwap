import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { useAuth } from "../../../context/AuthContext";
import { useApi } from "../../../hook/useApi";
import { userService } from "../../../services/user.service";
import { localeLabels, type Locale } from "../../../context/I18nContext";
import { lightTheme, darkTheme } from "../../../theme/theme";

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

export default function SettingsForm() {
  const { theme, mode, setMode } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const { user, updateUser } = useAuth();
  const { execute, isLoading } = useApi();

  // Init từ settings của user (server) hoặc fallback về current state
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">(
    (user?.settings?.theme as "light" | "dark") ?? mode
  );
  const [selectedLang, setSelectedLang] = useState<Locale>(
    (user?.settings?.uiLanguage as Locale) ?? locale
  );
  const [success, setSuccess] = useState(false);

  const label = t.profile.settings;

  const handleSave = async () => {
    setSuccess(false);
    // Apply ngay lập tức
    if (selectedTheme !== mode) setMode(selectedTheme);
    if (selectedLang !== locale) setLocale(selectedLang);

    const result = await execute(userService.updateSettings({
      theme: selectedTheme,
      uiLanguage: selectedLang,
    }));

    if (result !== null) {
      updateUser({ settings: { theme: selectedTheme, uiLanguage: selectedLang } });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const themeOptions: { value: "light" | "dark"; label: string; icon: React.ReactNode; previewBg: string; previewLine1: string; previewLine2: string }[] = [
    {
      value: "light",
      label: t.profile.settings.light,
      icon: <SunIcon />,
      previewBg: lightTheme.background.card,
      previewLine1: lightTheme.border.default,
      previewLine2: lightTheme.button.bg,
    },
    {
      value: "dark",
      label: t.profile.settings.dark,
      icon: <MoonIcon />,
      previewBg: darkTheme.background.card,
      previewLine1: darkTheme.border.default,
      previewLine2: darkTheme.button.bg,
    },
  ];

  const langOptions = Object.entries(localeLabels) as [Locale, string][];

  return (
    <div className="flex flex-col gap-6">
      {/* Theme */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.secondary }}>
          {label.appearance}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {themeOptions.map((opt) => {
            const isSelected = selectedTheme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedTheme(opt.value)}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: theme.background.input,
                  border: `2px solid ${isSelected ? theme.button.bg : theme.border.default}`,
                  boxShadow: isSelected ? theme.shadow.glow : "none",
                }}
              >
                {/* Mini preview */}
                <div className="w-full h-14 rounded-xl flex flex-col gap-1.5 p-2"
                  style={{ background: opt.previewBg }}>
                  <div className="h-1.5 w-3/4 rounded-full" style={{ background: opt.previewLine1 }} />
                  <div className="h-1.5 w-1/2 rounded-full" style={{ background: opt.previewLine2 }} />
                  <div className="h-1.5 w-2/3 rounded-full" style={{ background: opt.previewLine1 }} />
                </div>

                <div className="flex items-center gap-2" style={{ color: theme.text.primary }}>
                  {opt.icon}
                  <span className="text-sm font-medium">{opt.label}</span>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: theme.button.bg }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} className="w-3 h-3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Language */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.secondary }}>
          {label.defaultLanguage}
        </p>
        <div className="flex gap-2">
          {langOptions.map(([code, name]) => {
            const isSelected = selectedLang === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => setSelectedLang(code)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: isSelected ? theme.button.bg : theme.background.input,
                  color: isSelected ? theme.button.text : theme.text.secondary,
                  border: `1px solid ${isSelected ? theme.button.bg : theme.border.default}`,
                }}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
          style={{ background: theme.button.bg, color: theme.button.text }}
        >
          {isLoading ? label.saving : label.save}
        </button>
        {success && (
          <span className="text-sm" style={{ color: theme.text.success }}>
            ✓ {label.saved}
          </span>
        )}
      </div>
    </div>
  );
}
