import { useEffect, useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { useApi } from "../../../hook/useApi";
import { userService } from "../../../services/user.service";

interface ApiMatch {
  _id: string;
  durationSeconds: number;
  createdAt?: string;
  updatedAt?: string;
}

// Lấy date string dạng YYYY-MM-DD từ ISO string
function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

// Tính streak từ danh sách ngày có match (sorted desc)
function calcStreak(activeDays: Set<string>): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (activeDays.has(key)) {
      streak++;
    } else if (i > 0) {
      break; // chuỗi bị gián đoạn
    }
  }
  return streak;
}

// 7 ngày gần nhất (hôm nay là index 6)
function getLast7Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

const DAY_LABELS_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const DAY_LABELS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function StreakCard() {
  const { theme } = useTheme();
  const { locale, t } = useI18n();
  const { execute } = useApi<ApiMatch[]>();
  const [streak, setStreak] = useState(0);
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    execute(userService.getMatchHistory()).then((data) => {
      if (!data) return;
      const days = new Set<string>();
      data.forEach((m) => {
        // dùng updatedAt hoặc _id (ObjectId chứa timestamp)
        const ts = m.updatedAt ?? m.createdAt;
        if (ts) days.add(toDateKey(ts));
        else {
          // fallback: extract timestamp từ ObjectId
          const hex = m._id.slice(0, 8);
          const ts2 = new Date(parseInt(hex, 16) * 1000).toISOString();
          days.add(toDateKey(ts2));
        }
      });
      setActiveDays(days);
      setStreak(calcStreak(days));
    });
  }, []);

  const last7 = getLast7Days();
  const dayLabels = locale === "vi" ? DAY_LABELS_VI : DAY_LABELS_EN;
  const label = {
    streak: t.home.streak,
    days: t.home.streakDays,
  };

  return (
    <div
      className="w-full rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: theme.background.card,
        border: `1px solid ${theme.border.default}`,
        boxShadow: theme.shadow.card,
      }}
    >
      {/* Streak count */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: `${theme.star}20` }}
        >
          🔥
        </div>
        <div>
          <p className="text-2xl font-bold leading-none" style={{ color: theme.text.primary }}>
            {streak} <span className="text-sm font-normal" style={{ color: theme.text.secondary }}>{label.days}</span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: theme.text.placeholder }}>{label.streak}</p>
        </div>
      </div>

      {/* 7-day grid */}
      <div className="flex gap-1.5 justify-between">
        {last7.map((dateKey, i) => {
          const isActive = activeDays.has(dateKey);
          const isToday = i === 6;
          const dayOfWeek = new Date(dateKey + "T00:00:00").getDay();
          return (
            <div key={dateKey} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[10px]" style={{ color: theme.text.placeholder }}>
                {dayLabels[dayOfWeek]}
              </span>
              <div
                className="w-full aspect-square rounded-lg flex items-center justify-center text-xs"
                style={{
                  background: isActive
                    ? theme.star
                    : isToday
                    ? theme.background.input
                    : theme.background.input,
                  border: isToday ? `1.5px solid ${theme.border.focused}` : `1px solid ${theme.border.default}`,
                  color: isActive ? theme.button.text : theme.text.placeholder,
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {isActive ? "🔥" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
