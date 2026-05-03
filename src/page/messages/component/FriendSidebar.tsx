import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { useFriends, type Friend } from "../../../context/FriendContext";

interface FriendSidebarProps {
  selectedFriendId: string | null;
  onSelectFriend: (friend: Friend) => void;
}

export default function FriendSidebar({ selectedFriendId, onSelectFriend }: FriendSidebarProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { friends, isLoading } = useFriends();
  const [search, setSearch] = useState("");

  const filtered = friends.filter((f) =>
    f.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="flex flex-col h-full"
      style={{
        borderRight: `1px solid ${theme.border.default}`,
        background: theme.background.card,
      }}
    >
      {/* Search */}
      <div className="p-3" style={{ borderBottom: `1px solid ${theme.border.default}` }}>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: theme.background.input, border: `1px solid ${theme.border.default}` }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0" style={{ color: theme.text.placeholder }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.messages.searchFriends}
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: theme.text.primary }}
          />
        </div>
      </div>

      {/* Friend list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <p className="text-xs text-center py-8" style={{ color: theme.text.placeholder }}>
            {t.home.loading}
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: theme.text.placeholder }}>
            {friends.length === 0 ? t.messages.noFriends : t.home.noFriendsYet}
          </p>
        ) : (
          filtered.map((friend) => {
            const isSelected = friend.id === selectedFriendId;
            const isOnline = friend.status === "online";
            const validAvatar = friend.avatarUrl && friend.avatarUrl !== "default_avatar.png"
              ? friend.avatarUrl
              : undefined;

            return (
              <button
                key={friend.id}
                onClick={() => onSelectFriend(friend)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{
                  background: isSelected ? `${theme.button.bg}18` : "transparent",
                  borderLeft: isSelected ? `3px solid ${theme.button.bg}` : "3px solid transparent",
                }}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {validAvatar ? (
                    <img
                      src={validAvatar}
                      alt={friend.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                      style={{ background: theme.button.bg, color: theme.button.text }}
                    >
                      {friend.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isOnline && (
                    <span
                      className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                      style={{ background: theme.status.online, borderColor: theme.background.card }}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: isSelected ? theme.button.bg : theme.text.primary }}
                  >
                    {friend.fullName}
                  </p>
                  <p className="text-xs truncate" style={{ color: theme.text.placeholder }}>
                    {isOnline ? t.messages.online : (friend.lastSeen ?? t.messages.offline)}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
