import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";

// ─── Types ───────────────────────────────────────────────────

export type FriendStatus = "online" | "offline" | "busy" | "away";

export interface Friend {
  id: string;
  name: string;
  avatarUrl?: string;
  status: FriendStatus;
  language?: string;   // ngôn ngữ đang học
  lastSeen?: string;   // chỉ hiện khi offline
}

interface FriendListProps {
  friends?: Friend[];
  onStartCall?: (friend: Friend) => void;
  onViewProfile?: (friend: Friend) => void;
}

// ─── Mock data ───────────────────────────────────────────────

const MOCK_FRIENDS: Friend[] = [
  { id: "1", name: "Minh Anh",   status: "online",  language: "English" },
  { id: "2", name: "Hana Sato",  status: "online",  language: "Vietnamese" },
  { id: "3", name: "Carlos R.",  status: "busy",    language: "English" },
  { id: "4", name: "Emma Liu",   status: "away",    language: "French" },
  { id: "5", name: "Trung Kiên", status: "offline", language: "Japanese", lastSeen: "2h ago" },
  { id: "6", name: "Yuki T.",    status: "offline", language: "Korean",   lastSeen: "5h ago" },
];

// ─── Status config ───────────────────────────────────────────

const STATUS_COLOR: Record<FriendStatus, string> = {
  online:  "#22c55e",
  busy:    "#ef4444",
  away:    "#f59e0b",
  offline: "#6b7280",
};

const STATUS_LABEL: Record<FriendStatus, string> = {
  online:  "Online",
  busy:    "Busy",
  away:    "Away",
  offline: "Offline",
};

// ─── Sub-components ──────────────────────────────────────────

function Avatar({ name, avatarUrl, status, size = 10 }: {
  name: string; avatarUrl?: string; status: FriendStatus; size?: number;
}) {
  const { theme } = useTheme();
  return (
    <div className="relative shrink-0">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name}
          className={`w-${size} h-${size} rounded-full object-cover`} />
      ) : (
        <div
          className={`w-${size} h-${size} rounded-full flex items-center justify-center text-sm font-semibold`}
          style={{ background: theme.button.bg, color: theme.button.text }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <span
        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
        style={{ background: STATUS_COLOR[status], borderColor: theme.background.card }}
      />
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────

export default function FriendList({
  friends = MOCK_FRIENDS,
  onStartCall,
  onViewProfile,
}: FriendListProps) {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<"all" | "online">("all");

  const displayed = filter === "online"
    ? friends.filter((f) => f.status !== "offline")
    : friends;

  const onlineCount = friends.filter((f) => f.status === "online").length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: theme.text.primary }}>
            Friends
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: `${STATUS_COLOR.online}20`, color: STATUS_COLOR.online }}>
            {onlineCount} online
          </span>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: theme.background.input }}>
          {(["all", "online"] as const).map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)}
              className="flex-1 py-1 rounded-lg text-xs font-medium transition-all capitalize"
              style={{
                background: filter === tab ? theme.background.card : "transparent",
                color: filter === tab ? theme.text.primary : theme.text.placeholder,
                boxShadow: filter === tab ? theme.shadow.card : "none",
              }}>
              {tab === "all" ? "All" : "Online"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-1">
        {displayed.length === 0 ? (
          <p className="text-xs text-center py-6" style={{ color: theme.text.placeholder }}>
            No friends online
          </p>
        ) : (
          displayed.map((friend) => (
            <div key={friend.id}
              className="flex items-center gap-3 px-2 py-2.5 rounded-xl cursor-pointer group"
              style={{ transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = theme.background.input)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => onViewProfile?.(friend)}
            >
              <Avatar name={friend.name} avatarUrl={friend.avatarUrl} status={friend.status} />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: theme.text.primary }}>
                  {friend.name}
                </p>
                <p className="text-[11px] truncate" style={{ color: theme.text.placeholder }}>
                  {friend.status === "offline" && friend.lastSeen
                    ? `Last seen ${friend.lastSeen}`
                    : STATUS_LABEL[friend.status]}
                  {friend.language && ` · ${friend.language}`}
                </p>
              </div>

              {/* Call button — show on hover when online */}
              {friend.status !== "offline" && (
                <button
                  onClick={(e) => { e.stopPropagation(); onStartCall?.(friend); }}
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-opacity shrink-0"
                  style={{ background: theme.button.bg, color: theme.button.text }}
                  aria-label={`Call ${friend.name}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                    <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
