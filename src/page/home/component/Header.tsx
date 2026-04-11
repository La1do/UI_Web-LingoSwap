import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { ThemeToggle } from "../../component/ThemeToggle";
import { LanguageToggle } from "../../component/LanguageToggle";

interface HeaderProps {
  username?: string;
  avatarUrl?: string;
  notificationCount?: number;
  onSearch?: (query: string) => void;
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
  onProfileClick?: () => void;
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

export default function Header({
  username = "User",
  avatarUrl,
  notificationCount = 0,
  onSearch,
  onSettingsClick,
  onNotificationsClick,
  onProfileClick,
}: HeaderProps) {
  const { theme } = useTheme();
  const { t } = useI18n();

  return (
    <header
      className="flex items-center justify-between px-6 py-3 gap-4"
      style={{
        background: theme.background.card,
        borderBottom: `1px solid ${theme.border.default}`,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm"
          style={{ background: theme.button.bg, color: theme.button.text }}
        >
          L
        </div>
        <span className="font-semibold text-sm hidden sm:block" style={{ color: theme.text.primary }}>
          LingoSwap
        </span>
      </div>

      {/* Search bar */}
      <div className="flex-1 max-w-sm relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.text.placeholder }}>
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder={t.common.or === "or" ? "Search friends..." : "Tìm bạn bè..."}
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
          style={{
            background: theme.background.input,
            color: theme.text.primary,
            border: `1px solid ${theme.border.default}`,
          }}
          onFocus={(e) => (e.target.style.borderColor = theme.border.focused)}
          onBlur={(e) => (e.target.style.borderColor = theme.border.default)}
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Language + Theme toggles */}
        <LanguageToggle />
        <ThemeToggle />

        {/* Notifications */}
        <button
          onClick={onNotificationsClick}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ background: theme.background.input, color: theme.text.secondary }}
          aria-label="Notifications"
        >
          <BellIcon />
          {notificationCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={{ background: theme.text.error, color: "#fff" }}
            >
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={onSettingsClick}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ background: theme.background.input, color: theme.text.secondary }}
          aria-label="Settings"
        >
          <SettingsIcon />
        </button>

        {/* Avatar */}
        <button
          onClick={onProfileClick}
          className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:opacity-80 transition-opacity"
          style={{ background: theme.background.input }}
          aria-label="Profile"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: theme.button.bg, color: theme.button.text }}
            >
              {username.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-xs font-medium hidden sm:block" style={{ color: theme.text.primary }}>
            {username}
          </span>
        </button>
      </div>
    </header>
  );
}
