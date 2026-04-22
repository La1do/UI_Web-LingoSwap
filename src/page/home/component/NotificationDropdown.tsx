import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { useApi } from "../../../hook/useApi";
import { userService } from "../../../services/user.service";

// ─── Types ───────────────────────────────────────────────────

interface FriendRequest {
  _id: string;
  partner: {
    _id: string;
    username?: string;
    email: string;
    avatar?: string;
  };
  sentAt: { full: string; friendly: string };
}

// ─── Bell Icon ───────────────────────────────────────────────

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

// ─── Friend Request Card ──────────────────────────────────────

function FriendRequestCard({
  request,
  onRespond,
}: {
  request: FriendRequest;
  onRespond: (id: string, status: "accept" | "reject") => void;
}) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { execute, isLoading } = useApi();
  const [done, setDone] = useState<"accept" | "reject" | null>(null);

  const avatarUrl = request.partner.avatar && request.partner.avatar !== "default_avatar.png"
    ? request.partner.avatar : undefined;
  const displayName = request.partner.username || request.partner.email;

  const handle = async (status: "accept" | "reject") => {
    await execute(userService.respondFriendRequest(request._id, status));
    setDone(status);
    onRespond(request._id, status);
  };

  return (
    <div className="flex flex-col gap-3 p-3 rounded-xl"
      style={{ background: theme.background.input, border: `1px solid ${theme.border.default}` }}>
      {/* User info */}
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
            style={{ background: theme.button.bg, color: theme.button.text }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: theme.text.primary }}>
            {displayName}
          </p>
          <p className="text-[11px]" style={{ color: theme.text.placeholder }}>
            {request.sentAt.friendly}
          </p>
        </div>
      </div>

      {/* Actions */}
      {done ? (
        <p className="text-xs text-center py-1 font-medium"
          style={{ color: done === "accept" ? theme.text.success : theme.text.placeholder }}>
          {done === "accept" ? `✓ ${t.home.accepted}` : t.home.rejected}
        </p>
      ) : (
        <div className="flex gap-2">
          <button onClick={() => handle("reject")} disabled={isLoading}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
            style={{ background: theme.background.card, color: theme.text.secondary, border: `1px solid ${theme.border.default}` }}>
            {t.home.reject}
          </button>
          <button onClick={() => handle("accept")} disabled={isLoading}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
            style={{ background: theme.button.bg, color: theme.button.text }}>
            {isLoading ? "..." : t.home.accept}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Notification Dropdown ────────────────────────────────────

interface NotificationDropdownProps {
  notificationCount?: number;
}

export default function NotificationDropdown({ notificationCount = 0 }: NotificationDropdownProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { execute, isLoading } = useApi<FriendRequest[]>();
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [count, setCount] = useState(notificationCount);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRequests = useCallback(async () => {
    const data = await execute(userService.getFriendRequests());
    if (data) {
      setRequests(data);
      setCount(data.length);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };

  const handleRespond = (id: string) => {
    setCount((c) => Math.max(0, c - 1));
  };

  return (
    <div ref={ref} className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Bell trigger */}
      <button
        className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
        style={{ background: theme.background.input, color: theme.text.secondary }}
        aria-label="Notifications"
      >
        <BellIcon />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ background: theme.text.error, color: theme.button.text }}>
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <div
        className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50"
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
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${theme.border.default}` }}>
          <h3 className="text-sm font-semibold" style={{ color: theme.text.primary }}>
            {t.home.notifications}
          </h3>
          {count > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${theme.text.error}18`, color: theme.text.error }}>
              {t.home.newBadge.replace("{n}", String(count))}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col gap-2 max-h-80 overflow-y-auto">
          {isLoading ? (
            <p className="text-xs text-center py-4" style={{ color: theme.text.placeholder }}>{t.home.loadingNotifications}</p>
          ) : requests.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: theme.text.placeholder }}>
              {t.home.noNotifications}
            </p>
          ) : (
            requests.map((req) => (
              <FriendRequestCard key={req._id} request={req} onRespond={handleRespond} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
