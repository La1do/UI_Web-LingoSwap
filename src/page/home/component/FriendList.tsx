import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { useApi } from "../../../hook/useApi";
import { userService } from "../../../services/user.service";
import { useFriends, type Friend, type FriendStatus } from "../../../context/FriendContext";
// ─── Types ───────────────────────────────────────────────────

export type { FriendStatus, Friend };

interface FriendListProps {
  onViewProfile?: (friend: Friend) => void;
  onOpenChat?: (friend: Friend) => void;
}

function Avatar({ name, avatarUrl, status }: { name: string; avatarUrl?: string; status: FriendStatus }) {
  const { theme } = useTheme();
  const validAvatar = avatarUrl && avatarUrl !== "default_avatar.png" ? avatarUrl : undefined;
  return (
    <div className="relative shrink-0">
      {validAvatar ? (
        <img src={validAvatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
          style={{ background: theme.button.bg, color: theme.button.text }}>
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
        style={{ background: theme.status[status], borderColor: theme.background.card }} />
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────

// ─── Main component ──────────────────────────────────────────

export default function FriendList({ onViewProfile, onOpenChat }: FriendListProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { friends, isLoading, removeFriend } = useFriends();
  const { execute: unfriendExec } = useApi();
  const [filter, setFilter] = useState<"all" | "online">("all");
  const [confirmUnfriend, setConfirmUnfriend] = useState<string | null>(null);

  const STATUS_ORDER: Record<FriendStatus, number> = { online: 0, busy: 1, away: 2, offline: 3 };

  const displayed = (filter === "online"
    ? friends.filter((f) => f.status !== "offline")
    : friends
  ).slice().sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  const onlineCount = friends.filter((f) => f.status === "online").length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: theme.text.primary }}>{t.home.friends}</h2>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: `${theme.status.online}20`, color: theme.status.online }}>
            {t.home.onlineCount.replace("{n}", String(onlineCount))}
          </span>
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: theme.background.input }}>
          {(["all", "online"] as const).map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)}
              className="flex-1 py-1 rounded-lg text-xs font-medium transition-all capitalize"
              style={{
                background: filter === tab ? theme.background.card : "transparent",
                color: filter === tab ? theme.text.primary : theme.text.placeholder,
                boxShadow: filter === tab ? theme.shadow.card : "none",
              }}>
              {tab === "all" ? t.home.allFilter : t.home.onlineFilter}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-1">
        {isLoading ? (
          <p className="text-xs text-center py-6" style={{ color: theme.text.placeholder }}>{t.home.loading}</p>
        ) : displayed.length === 0 ? (
          <p className="text-xs text-center py-6" style={{ color: theme.text.placeholder }}>
            {filter === "online" ? t.home.noFriendsOnline : t.home.noFriendsYet}
          </p>
        ) : (
          displayed.map((friend) => (
            <div key={friend.id}
              className="relative flex items-center gap-3 px-2 py-2.5 rounded-xl cursor-pointer group"
              onMouseEnter={(e) => (e.currentTarget.style.background = theme.background.input)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => { onViewProfile?.(friend); onOpenChat?.(friend); }}
            >
              <Avatar name={friend.fullName} avatarUrl={friend.avatarUrl} status={friend.status} />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium " style={{ color: theme.text.primary }}>
                  {friend.fullName}
                </p>
                <p className="text-[9px]" style={{ color: theme.text.placeholder }}>
                  {friend.status === "offline" && friend.lastSeen
                    ? `Last seen ${friend.lastSeen}`
                    : t.friendStatus[friend.status]}
                  {friend.language && ` · ${friend.language}`}
                </p>
              </div>

              {friend.status !== "offline" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const params = new URLSearchParams({
                      target: friend.id,
                      name: friend.fullName,
                      ...(friend.avatarUrl ? { avatar: friend.avatarUrl } : {}),
                    });
                    navigate(`/direct-call?${params.toString()}`);
                  }}
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-opacity shrink-0"
                  style={{ background: theme.button.bg, color: theme.button.text }}
                  aria-label={`Call ${friend.fullName}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                    <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </button>
              )}

              {/* Unfriend button + popup confirm */}
              <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmUnfriend(confirmUnfriend === friend.id ? null : friend.id); }}
                  className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded-lg text-[11px] font-medium transition-opacity hover:opacity-80"
                  style={{ color: theme.text.error, border: `1px solid ${theme.text.error}50`, background: `${theme.text.error}10` }}
                >
                  {t.home.unfriend}
                </button>

                {confirmUnfriend === friend.id && (
                  <div
                    className="absolute right-0 top-full mt-1 z-50 rounded-xl p-3 flex flex-col gap-2"
                    style={{
                      background: theme.background.card,
                      border: `1px solid ${theme.border.default}`,
                      boxShadow: theme.shadow.card,
                      minWidth: "140px",
                    }}
                  >
                    <p className="text-xs font-medium" style={{ color: theme.text.primary }}>
                      {t.home.unfriendConfirm}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          unfriendExec(userService.unfriend(friend.id)).then(() => {
                            removeFriend(friend.id);
                            setConfirmUnfriend(null);
                          });
                        }}
                        className="flex-1 py-1 rounded-lg text-xs font-semibold hover:opacity-80"
                        style={{ background: theme.text.error, color: theme.button.text }}
                      >
                        {t.home.unfriendYes}
                      </button>
                      <button
                        onClick={() => setConfirmUnfriend(null)}
                        className="flex-1 py-1 rounded-lg text-xs hover:opacity-80"
                        style={{ background: theme.background.input, color: theme.text.secondary, border: `1px solid ${theme.border.default}` }}
                      >
                        {t.home.unfriendNo}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
