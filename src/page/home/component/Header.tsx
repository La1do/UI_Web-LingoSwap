import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useEffect } from "react";
import { useI18n } from "../../../context/I18nContext";
import { useAuth } from "../../../context/AuthContext";
import { ThemeToggle } from "../../component/ThemeToggle";
import { LanguageToggle } from "../../component/LanguageToggle";
import NotificationDropdown from "./NotificationDropdown";

interface HeaderProps {
  notificationCount?: number;
  onSearch?: (query: string) => void;
}

// ─── Icons ───────────────────────────────────────────────────

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);


const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── Avatar ───────────────────────────────────────────────────

function Avatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const { theme } = useTheme();
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full object-cover" />;
  }
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
      style={{ background: theme.button.bg, color: theme.button.text }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── User Dropdown ────────────────────────────────────────────

function UserDropdown({ username, avatarUrl }: { username: string; avatarUrl?: string }) {
  const { theme } = useTheme();
  const { locale } = useI18n();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);


  const label = locale === "vi"
    ? { profile: "Chỉnh sửa hồ sơ", logout: "Đăng xuất" }
    : { profile: "Edit profile", logout: "Log out" };

  const menuItems = [
    {
      icon: <UserIcon />,
      label: label.profile,
      onClick: () => { setOpen(false); navigate("/profile"); },
    },
    {
      icon: <LogoutIcon />,
      label: label.logout,
      onClick: () => { setOpen(false); logout(); navigate("/"); },
      danger: true,
    },
  ];

  return (
    <div ref={ref} className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl transition-all hover:opacity-80"
        style={{ background: theme.background.input }}
        aria-label="User menu"
        aria-expanded={open}
      >
        <Avatar name={username} avatarUrl={avatarUrl} />
        <span className="text-xs font-medium hidden sm:block max-w-[100px] truncate"
          style={{ color: theme.text.primary }}>
          {username}
        </span>
        <span style={{ color: theme.text.placeholder, transition: "transform 0.2s",
          transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <ChevronIcon />
        </span>
      </button>

      {/* Dropdown */}
      <div
        className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-50"
        style={{
          background: theme.background.card,
          border: `1px solid ${theme.border.default}`,
          boxShadow: theme.shadow.card,
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-8px)",
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
          {/* User info header */}
          <div className="px-4 py-3 flex items-center gap-3"
            style={{ borderBottom: `1px solid ${theme.border.default}` }}>
            <Avatar name={username} avatarUrl={avatarUrl} />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: theme.text.primary }}>
                {username}
              </p>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all hover:opacity-80 text-left"
                style={{
                  color: item.danger ? theme.text.error : theme.text.primary,
                  background: "transparent",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = theme.background.input)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────

export default function Header({
  notificationCount = 0,
  onSearch,
}: HeaderProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();

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

      {/* Search */}
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
        <LanguageToggle />
        <ThemeToggle />

        {/* Notifications */}
        <NotificationDropdown notificationCount={notificationCount} />

        {/* User dropdown */}
        <UserDropdown
          username={user?.fullName ?? "User"}
          avatarUrl={user?.avatar !== "default_avatar.png" ? user?.avatar : undefined}
        />
      </div>
    </header>
  );
}
