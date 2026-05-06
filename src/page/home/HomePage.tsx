import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";
import Header from "./component/Header";
import FriendList from "./component/FriendList";
import RecentMatches from "./component/RecentMatches";
import MatchModal from "./component/MatchModal";
import IncomingCallModal from "./component/IncomingCallModal";
import StreakCard from "./component/StreakCard";
import ChatWindow from "./component/ChatWindow";
import type { Friend } from "../../context/FriendContext";

export default function HomePage() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [openChats, setOpenChats] = useState<Friend[]>([]);

  const handleOpenChat = (friend: Friend) => {
    setOpenChats((prev) => {
      if (prev.find((f) => f.id === friend.id)) return prev;
      if (prev.length >= 2) return [prev[1], friend];
      return [...prev, friend];
    });
  };

  const handleCloseChat = (friendId: string) => {
    setOpenChats((prev) => prev.filter((f) => f.id !== friendId));
  };

  const handleStartMatch = (language: string) => {
    setModalOpen(false);
    navigate(`/waiting?lang=${language}`);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Header ── */}
      <Header
        onSearch={(q) => console.log("search:", q)}
      />

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar — Friends */}
        <aside
          className="w-64 shrink-0 flex flex-col overflow-hidden"
          style={{ borderRight: `1px solid ${theme.border.default}` }}
        >
          <FriendList
            onViewProfile={(f) => console.log("profile", f.fullName)}
            onOpenChat={handleOpenChat}
          />
        </aside>

        {/* Center — main content */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center gap-6 pt-8">
          {/* Streak */}
          <StreakCard />

          {/* Find match button */}
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold shadow-lg hover:opacity-90 active:scale-95 transition-all"
            style={{ background: theme.button.bg, color: theme.button.text, boxShadow: theme.shadow.glow }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {t.home.findPartner}
          </button>

          <p className="text-xs" style={{ color: theme.text.placeholder }}>
            {t.home.chooseLanguageHint}
          </p>
        </main>

        {/* Right sidebar — Recent matches */}
        <aside
          className="w-72 shrink-0 flex flex-col overflow-hidden"
          style={{ borderLeft: `1px solid ${theme.border.default}` }}
        >
          <RecentMatches
            onViewProfile={(partnerId) => console.log("profile", partnerId)}
          />
        </aside>
      </div>

      {/* ── Match Modal ── */}
      <MatchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onStart={handleStartMatch}
      />

      {/* ── Incoming Call Modal ── */}
      <IncomingCallModal />

      {/* ── Chat Windows (max 2, bottom-right) ── */}
      {openChats.map((friend, i) => (
        <ChatWindow
          key={friend.id}
          friend={friend}
          onClose={() => handleCloseChat(friend.id)}
          offsetIndex={openChats.length - 1 - i}
        />
      ))}
    </div>
  );
}
