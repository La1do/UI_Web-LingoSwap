import { useTheme } from "../../context/ThemeContext";
import Header from "./component/Header";
import FriendList from "./component/FriendList";
import RecentMatches from "./component/RecentMatches";

export default function HomePage() {
  const { theme } = useTheme();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Header ── */}
      <Header
        username="Minh Anh"
        notificationCount={3}
        onSearch={(q) => console.log("search:", q)}
        onSettingsClick={() => console.log("settings")}
        onNotificationsClick={() => console.log("notifications")}
        onProfileClick={() => console.log("profile")}
      />

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar — Friends */}
        <aside
          className="w-64 shrink-0 flex flex-col overflow-hidden"
          style={{ borderRight: `1px solid ${theme.border.default}` }}
        >
          <FriendList
            onStartCall={(f) => console.log("call", f.name)}
            onViewProfile={(f) => console.log("profile", f.name)}
          />
        </aside>

        {/* Center — main content slot */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Slot for future content (e.g. feed, find match, etc.) */}
          <div
            className="h-full rounded-2xl flex items-center justify-center"
            style={{ border: `2px dashed ${theme.border.default}` }}
          >
            <p className="text-sm" style={{ color: theme.text.placeholder }}>
              Main content area
            </p>
          </div>
        </main>

        {/* Right sidebar — Recent matches */}
        <aside
          className="w-72 shrink-0 flex flex-col overflow-hidden"
          style={{ borderLeft: `1px solid ${theme.border.default}` }}
        >
          <RecentMatches
            onRematch={(m) => console.log("rematch", m.name)}
            onViewProfile={(m) => console.log("profile", m.name)}
          />
        </aside>
      </div>
    </div>
  );
}
