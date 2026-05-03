import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";
import { useFriends, type Friend } from "../../context/FriendContext";
import PageShell from "../../layout/PageShell";
import FriendSidebar from "./component/FriendSidebar";
import ChatArea from "./component/ChatArea";

export default function MessagesPage() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { friends } = useFriends();

  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  // Đọc friendId từ query param ?friend=xxx
  useEffect(() => {
    const friendId = searchParams.get("friend");
    if (!friendId || friends.length === 0) return;
    const found = friends.find((f) => f.id === friendId);
    if (found) setSelectedFriend(found);
  }, [searchParams, friends]);

  // Sync selectedFriend khi friends list update (status, conversationId...)
  useEffect(() => {
    if (!selectedFriend) return;
    const updated = friends.find((f) => f.id === selectedFriend.id);
    if (updated) setSelectedFriend(updated);
  }, [friends]);

  return (
    <PageShell controlsPosition="none">
      <div
        className="flex flex-col h-screen"
        style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Top bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 shrink-0"
          style={{
            background: theme.background.card,
            borderBottom: `1px solid ${theme.border.default}`,
            boxShadow: theme.shadow.card,
          }}
        >
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity"
            style={{ color: theme.text.secondary }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {t.messages.backToHome}
          </button>

          {/* <h1 className="text-base font-bold" style={{ color: theme.text.primary }}>
            {t.messages.title}
          </h1> */}
        </div>

        {/* Main layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-72 shrink-0 overflow-hidden">
            <FriendSidebar
              selectedFriendId={selectedFriend?.id ?? null}
              onSelectFriend={(f) => {
                setSelectedFriend(f);
                navigate(`/messages?friend=${f.id}`, { replace: true });
              }}
            />
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-hidden">
            {selectedFriend ? (
              <ChatArea friend={selectedFriend} />
            ) : (
              <div
                className="flex flex-col items-center justify-center h-full gap-3"
                style={{ color: theme.text.placeholder }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-14 h-14 opacity-30">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p className="text-base font-semibold" style={{ color: theme.text.secondary }}>
                  {t.messages.noFriendSelected}
                </p>
                <p className="text-sm" style={{ color: theme.text.placeholder }}>
                  {t.messages.selectFriendHint}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
