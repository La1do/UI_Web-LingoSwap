import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { useAuth } from "../../../context/AuthContext";
import StreakCalendarModal from "./StreakCalendarModal";

function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function StreakCard() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();
  const [showCalendar, setShowCalendar] = useState(false);

  const streak = user?.stats?.streak ?? 0;
  const totalHours = user?.stats?.totalHours ?? 0;
  const totalSessions = user?.stats?.totalSessions ?? 0;
  const calendar = user?.stats?.learningCalendar ?? {};

  const statCards = [
    { label: t.home.totalHours, value: formatHours(totalHours), color: theme.text.accent },
    { label: t.home.totalSessions, value: String(totalSessions), color: theme.text.success },
  ];

  return (
    <>
      <div
        className="w-full rounded-2xl p-5 flex flex-col gap-4"
        style={{
          background: theme.background.card,
          border: `1px solid ${theme.border.default}`,
          boxShadow: theme.shadow.card,
        }}
      >
        {/* Streak count — icon clickable */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCalendar(true)}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 active:scale-95"
            style={{
              background: `${theme.star}20`,
              cursor: "pointer",
              transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.15)";
              e.currentTarget.style.boxShadow = `0 4px 16px ${theme.star}50`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.92)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1.15)"; }}
            title={t.home.streak}
          >
            🔥
          </button>
          <div>
            <p className="text-2xl font-bold leading-none" style={{ color: theme.text.primary }}>
              {streak}{" "}
              <span className="text-sm font-normal" style={{ color: theme.text.secondary }}>
                {t.home.streakDays}
              </span>
            </p>
            <p className="text-xs mt-0.5" style={{ color: theme.text.placeholder }}>
              {t.home.streak}
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-3 flex flex-col gap-0.5"
              style={{ background: theme.background.input, border: `1px solid ${theme.border.default}` }}
            >
              <p className="text-xs" style={{ color: theme.text.placeholder }}>{s.label}</p>
              <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {showCalendar && (
        <StreakCalendarModal calendar={calendar} onClose={() => setShowCalendar(false)} />
      )}
    </>
  );
}
