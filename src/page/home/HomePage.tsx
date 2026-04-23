import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";
import { useAuth } from "../../context/AuthContext";
import Header from "./component/Header";
import FriendList from "./component/FriendList";
import RecentMatches from "./component/RecentMatches";
import MatchModal from "./component/MatchModal";
import IncomingCallModal from "./component/IncomingCallModal";

export default function HomePage() {
  const { theme } = useTheme();
  const { locale } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const handleStartMatch = (language: string) => {
    setModalOpen(false);
    navigate(`/waiting?lang=${language}`);
  };

  const findLabel = locale === "vi" ? "Tìm người luyện tập" : "Find a partner";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Header ── */}
      <Header
        notificationCount={3}
        onSearch={(q) => console.log("search:", q)}
        onNotificationsClick={() => console.log("notifications")}
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
          />
        </aside>

        {/* Center — main content */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center gap-6">
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
            {findLabel}
          </button>

          <p className="text-xs" style={{ color: theme.text.placeholder }}>
            {locale === "vi" ? "Chọn ngôn ngữ và bắt đầu luyện tập ngay" : "Choose a language and start practicing"}
          </p>
        </main>

        {/* Right sidebar — Recent matches */}
        <aside
          className="w-72 shrink-0 flex flex-col overflow-hidden"
          style={{ borderLeft: `1px solid ${theme.border.default}` }}
        >
          <RecentMatches
            onRematch={(partnerId) => console.log("rematch", partnerId)}
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
    </div>
  );
}
