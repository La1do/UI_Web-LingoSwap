import { useI18n, localeLabels, type Locale } from "../../context/I18nContext";
import { useTheme } from "../../context/ThemeContext";

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();
  const { theme } = useTheme();

  const locales = Object.keys(localeLabels) as Locale[];

  return (
    <div
      className="flex items-center rounded-full overflow-hidden"
      style={{ border: `1px solid ${theme.border.default}`, background: theme.background.card }}
    >
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => setLocale(loc)}
          className="px-3 py-1 text-xs font-medium transition-all"
          style={{
            background: locale === loc ? theme.button.bg : "transparent",
            color: locale === loc ? theme.button.text : theme.text.secondary,
          }}
        >
          {localeLabels[loc]}
        </button>
      ))}
    </div>
  );
}
