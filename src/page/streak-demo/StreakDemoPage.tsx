import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import StreakCelebration from "../review/component/StreakCelebration";

// Mock calendar: streak ngày liên tiếp tính từ mockToday trở về
function generateMockCalendar(streak: number, mockToday: string): Record<string, number> {
  const cal: Record<string, number> = {};
  const base = new Date(mockToday + "T12:00:00");
  for (let i = 0; i < streak; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    cal[d.toISOString().slice(0, 10)] = 1;
  }
  return cal;
}

// Tính ngày T2 của tuần chứa date
function getMondayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const dow = d.getDay(); // 0=CN
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

// Các ngày trong tuần (T2→CN) chứa date
function getWeekDays(dateStr: string): string[] {
  const monday = getMondayOfWeek(dateStr);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday + "T12:00:00");
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function StreakDemoPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [streak, setStreak] = useState(3);
  const [mockToday, setMockToday] = useState(new Date().toISOString().slice(0, 10));
  const [show, setShow] = useState(false);

  const calendar = generateMockCalendar(streak, mockToday);
  const weekDays = getWeekDays(mockToday);

  if (show) {
    return (
      <StreakCelebration
        streak={streak}
        calendar={calendar}
        mockToday={mockToday}
        onContinue={() => setShow(false)}
      />
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center gap-5 flex-col"
      style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif" }}
    >
      <p className="text-sm font-semibold" style={{ color: theme.text.secondary }}>
        Streak Animation Demo
      </p>

      {/* Streak count */}
      <div className="flex items-center gap-4">
        <button onClick={() => setStreak((s) => Math.max(1, s - 1))}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold hover:opacity-70"
          style={{ background: theme.background.input, color: theme.text.primary }}>−</button>
        <span className="text-4xl font-black min-w-[80px] text-center" style={{ color: theme.star }}>
          {streak} 🔥
        </span>
        <button onClick={() => setStreak((s) => Math.min(30, s + 1))}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold hover:opacity-70"
          style={{ background: theme.background.input, color: theme.text.primary }}>+</button>
      </div>

      {/* Date picker */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs" style={{ color: theme.text.placeholder }}>Ngày hôm nay (mock)</p>
        <input
          type="date"
          value={mockToday}
          onChange={(e) => setMockToday(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{
            background: theme.background.input,
            color: theme.text.primary,
            border: `1px solid ${theme.border.default}`,
          }}
        />
        {/* Quick day buttons */}
        <div className="flex gap-1 flex-wrap justify-center">
          {["T2","T3","T4","T5","T6","T7","CN"].map((label, i) => {
            const targetDow = i === 6 ? 0 : i + 1; // T2=1..CN=0
            const today = new Date();
            const currentDow = today.getDay();
            const diff = targetDow === 0
              ? (7 - currentDow) % 7 || 7
              : targetDow - currentDow <= 0
                ? targetDow - currentDow + 7
                : targetDow - currentDow;
            const target = new Date(today);
            target.setDate(today.getDate() + diff - (diff === 7 ? 7 : 0));
            // Tìm ngày gần nhất là targetDow
            const nearest = new Date(today);
            const nd = today.getDay();
            let d2 = targetDow - nd;
            if (d2 > 0) d2 -= 7; // lấy ngày trong tuần hiện tại hoặc tuần trước
            nearest.setDate(today.getDate() + d2);
            const nearestStr = nearest.toISOString().slice(0, 10);
            const isActive = mockToday === nearestStr;
            return (
              <button
                key={label}
                onClick={() => setMockToday(nearestStr)}
                className="px-2 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: isActive ? theme.button.bg : theme.background.input,
                  color: isActive ? theme.button.text : theme.text.secondary,
                  border: `1px solid ${isActive ? theme.button.bg : theme.border.default}`,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview tuần */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs" style={{ color: theme.text.placeholder }}>
          Tuần hiện tại — ngày có 🔥 = có streak
        </p>
        <div className="flex gap-2">
          {weekDays.map((d, i) => {
            const isActive = (calendar[d] ?? 0) > 0;
            const isToday = d === mockToday;
            return (
              <div key={d} className="flex flex-col items-center gap-1">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm"
                  style={{
                    background: isActive ? theme.star : theme.background.input,
                    color: isActive ? theme.button.text : theme.text.placeholder,
                    border: isToday ? `2px solid ${theme.border.focused}` : `1px solid ${theme.border.default}`,
                    fontWeight: isToday ? 700 : 400,
                  }}
                >
                  {isActive ? "🔥" : ""}
                </div>
                <span className="text-[10px]" style={{ color: isToday ? theme.text.accent : theme.text.placeholder }}>
                  {DAY_LABELS[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => setShow(true)}
        className="px-10 py-3 rounded-2xl text-base font-semibold hover:opacity-90 active:scale-95 transition-all"
        style={{ background: theme.star, color: theme.button.text, boxShadow: `0 8px 24px ${theme.star}50` }}
      >
        Xem animation 🔥
      </button>

      <button onClick={() => navigate("/home")}
        className="text-xs hover:opacity-70 transition-opacity"
        style={{ color: theme.text.placeholder }}>
        ← Về home
      </button>
    </div>
  );
}
