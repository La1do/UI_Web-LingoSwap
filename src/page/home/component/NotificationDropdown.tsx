import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { useApi } from "../../../hook/useApi";
import { userService } from "../../../services/user.service";
import { notificationService, type Notification } from "../../../services/notification.service";
import { socketService } from "../../../services/socket.service";
import { useFriends } from "../../../context/FriendContext";

// ─── Bell Icon ───────────────────────────────────────────────

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

// ─── Notification Card ────────────────────────────────────────

function NotificationCard({
  notification,
  onRespond,
  onMarkRead,
}: {
  notification: Notification;
  onRespond: (notifId: string, status: "accept" | "reject") => void;
  onMarkRead: (notifId: string) => void;
}) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { execute: respondExec, isLoading } = useApi();
  const { execute: markExec } = useApi();
  const { refetchFriends } = useFriends();
  const [done, setDone] = useState<"accept" | "reject" | null>(null);

  const sender = notification.senderId;
  const avatarUrl = sender?.profile?.avatar && sender.profile.avatar !== "default_avatar.png"
    ? sender.profile.avatar : undefined;
  const displayName = sender?.profile?.fullName ?? "Unknown";
  const isFriendRequest = notification.type === "friend_request";
  const friendshipId = notification.metadata?.friendshipId as string | undefined;

  const handleRespond = async (status: "accept" | "reject") => {
    if (friendshipId) {
      await respondExec(userService.respondFriendRequest(friendshipId, status));
    }
    await markExec(notificationService.markRead(notification._id));
    setDone(status);
    onRespond(notification._id, status);
    onMarkRead(notification._id);
    if (status === "accept") refetchFriends();
  };

  return (
    <div
      className="flex flex-col gap-3 p-3 rounded-xl"
      style={{
        background: notification.isRead ? theme.background.page : theme.background.input,
        border: `1px solid ${notification.isRead ? theme.border.default : `${theme.button.bg}40`}`,
        opacity: notification.isRead ? 0.65 : 1,
        transition: "opacity 0.2s, background 0.2s",
      }}
    >
      {/* User info + content */}
      <div className="flex items-start gap-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5" />
        ) : (
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 mt-0.5"
            style={{ background: theme.button.bg, color: theme.button.text }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm" style={{ color: theme.text.primary }}>
            {notification.content}
          </p>
          {!notification.isRead && (
            <span className="inline-block w-2 h-2 rounded-full mt-1" style={{ background: theme.button.bg }} />
          )}
        </div>
      </div>

      {/* Friend request actions — chỉ ẩn khi đã trả lời, không phụ thuộc isRead */}
      {isFriendRequest && !done && (
        <div className="flex gap-2">
          <button onClick={() => handleRespond("reject")} disabled={isLoading}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
            style={{ background: theme.background.page, color: theme.text.secondary, border: `1px solid ${theme.border.default}` }}>
            {t.home.reject}
          </button>
          <button onClick={() => handleRespond("accept")} disabled={isLoading}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
            style={{ background: theme.button.bg, color: theme.button.text }}>
            {isLoading ? "..." : t.home.accept}
          </button>
        </div>
      )}

      {done && (
        <p className="text-xs text-center py-0.5 font-medium"
          style={{ color: done === "accept" ? theme.text.success : theme.text.placeholder }}>
          {done === "accept" ? `✓ ${t.home.accepted}` : t.home.rejected}
        </p>
      )}
    </div>
  );
}

// ─── Notification Dropdown ────────────────────────────────────

export default function NotificationDropdown() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { execute: fetchNotifs, isLoading } = useApi<Notification[]>();
  const { execute: fetchCount } = useApi<{ unreadCount: number }>();
  const { execute: markAll } = useApi();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFetched = useRef(false);

  // Fetch unread count on mount + lắng nghe realtime notification
  useEffect(() => {
    fetchCount(notificationService.getUnreadCount()).then((res) => {
      if (res) setUnreadCount(res.unreadCount);
    });

    const handler = (payload: {
      _id: string;
      type: string;
      content: string;
      isRead: boolean;
      senderId?: { _id: string; profile: { fullName: string; avatar: string } };
      metadata?: Record<string, unknown>;
    }) => {
      console.log("[NotificationDropdown] new_notification received:", payload);
      const newNotif: Notification = {
        _id: payload._id,
        type: payload.type,
        content: payload.content,
        isRead: false,
        senderId: payload.senderId ?? { _id: "", profile: { fullName: "Unknown", avatar: "" } },
        metadata: payload.metadata,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((c) => c + 1);
      hasFetched.current = false;
    };

    // Dùng onReady để đảm bảo socket đã connected trước khi đăng ký listener
    socketService.onReady((s) => {
      s.off("new_notification").on("new_notification", handler);
    });

    return () => {
      socketService.getSocket()?.off("new_notification", handler);
    };
  }, []);

  // Fetch notifications when dropdown opens (once)
  const fetchNotifications = useCallback(async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const data = await fetchNotifs(notificationService.getNotifications());
    if (data) {
      setNotifications(data);
      // Recalculate unreadCount từ data thực tế
      setUnreadCount(data.filter((n) => !n.isRead).length);
    }
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };

  const handleRespond = (notifId: string) => {
    setUnreadCount((c) => Math.max(0, c - 1));
    setNotifications((prev) =>
      prev.map((n) => n._id === notifId ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => n._id === notifId ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllRead = async () => {
    await markAll(notificationService.markAllRead());
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    hasFetched.current = false;
  };

  return (
    <div ref={ref} className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Bell trigger */}
      <button
        className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
        style={{ background: theme.background.input, color: theme.text.secondary }}
        aria-label={t.home.notifications}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ background: theme.text.error, color: theme.button.text }}>
            {unreadCount > 9 ? "9+" : unreadCount}
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
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${theme.text.error}18`, color: theme.text.error }}>
                  {t.home.newBadge.replace("{n}", String(unreadCount))}
                </span>
                <button onClick={handleMarkAllRead}
                  className="text-[10px] hover:opacity-70 transition-opacity"
                  style={{ color: theme.text.accent }}>
                  {t.home.markAllRead}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col gap-2 max-h-80 overflow-y-auto">
          {isLoading ? (
            <p className="text-xs text-center py-4" style={{ color: theme.text.placeholder }}>
              {t.home.loadingNotifications}
            </p>
          ) : notifications.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: theme.text.placeholder }}>
              {t.home.noNotifications}
            </p>
          ) : (
            notifications.map((notif) => (
              <NotificationCard
                key={notif._id}
                notification={notif}
                onRespond={handleRespond}
                onMarkRead={handleMarkRead}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
