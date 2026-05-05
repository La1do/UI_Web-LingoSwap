import { useEffect, useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { useAuth } from "../../../context/AuthContext";

interface StreakCelebrationProps {
  streak: number;
  calendar?: Record<string, number>;
  mockToday?: string;
  onContinue: () => void;
}

const DAY_LABELS_VI = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const DAY_LABELS_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMondayOfWeek(date: Date): Date {
  const dow = date.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return monday;
}

// Normal mode: T2→CN tuần hiện tại + T2 tuần sau (8 ngày)
function getWeekDays8(baseDate: Date): string[] {
  const monday = getMondayOfWeek(baseDate);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(toLocalDateStr(d));
  }
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  days.push(toLocalDateStr(nextMonday));
  return days;
}

// Slide mode: T2→CN tuần TRƯỚC + T2 tuần này (8 ngày)
// Hiển thị 7 ô: T2→CN tuần trước, ô thứ 8 = T2 tuần này (xuất hiện sau slide)
function getPrevWeekDays8(baseDate: Date): string[] {
  const monday = getMondayOfWeek(baseDate);
  // T2 tuần trước
  const prevMonday = new Date(monday);
  prevMonday.setDate(monday.getDate() - 7);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(prevMonday);
    d.setDate(prevMonday.getDate() + i);
    days.push(toLocalDateStr(d));
  }
  // T2 tuần này (ô thứ 8)
  days.push(toLocalDateStr(monday));
  return days;
}

const CELL_W = 56;
const CELL_TOTAL = CELL_W + 8;

export default function StreakCelebration({ streak, calendar: calendarProp, mockToday, onContinue }: StreakCelebrationProps) {
  const { theme } = useTheme();
  const { locale } = useI18n();
  const { user } = useAuth();

  const rawCalendar = calendarProp ?? user?.stats?.learningCalendar ?? {};
  // Nếu calendar rỗng nhưng streak > 0, tự thêm ngày hôm nay vào
  const calendar: Record<string, number> =
    Object.keys(rawCalendar).length === 0 && streak > 0
      ? { [mockToday ?? toLocalDateStr(new Date())]: 1 }
      : rawCalendar;
  const baseDate = mockToday ? new Date(mockToday + "T12:00:00") : new Date();
  const todayKey = mockToday ?? toLocalDateStr(new Date());
  const dayLabels = locale === "vi" ? DAY_LABELS_VI : DAY_LABELS_EN;

  // Điều kiện slide: hôm nay T2 + streak >= 2 + CN hôm qua có streak
  const yesterday = new Date(baseDate);
  yesterday.setDate(baseDate.getDate() - 1);
  const yesterdayKey = toLocalDateStr(yesterday);
  const todayDow = baseDate.getDay();
  const yesterdayDow = yesterday.getDay();
  const shouldSlide =
    todayDow === 1 &&
    streak >= 2 &&
    yesterdayDow === 0 &&
    (calendar[yesterdayKey] ?? 0) > 0;

  // Chọn days array
  // Slide mode: tuần trước + T2 tuần này
  // Normal mode: tuần hiện tại + T2 tuần sau
  const days8 = shouldSlide ? getPrevWeekDays8(baseDate) : getWeekDays8(baseDate);

  // Index hôm nay trong days8 (chỉ dùng cho normal mode)
  const todayIndexInWeek = days8.indexOf(todayKey);

  // Các ô cần bừng lửa
  const activeDayIndices: number[] = [];
  if (shouldSlide) {
    // Bừng các ngày trong tuần trước (index 0-6) có streak
    // Không bừng T2 tuần này (index 7) — sẽ bừng sau slide
    days8.slice(0, 7).forEach((d, i) => {
      if ((calendar[d] ?? 0) > 0) {
        activeDayIndices.push(i);
      }
    });
    activeDayIndices.sort((a, b) => a - b);
  } else {
    days8.slice(0, 7).forEach((d, i) => {
      if (i <= todayIndexInWeek && (calendar[d] ?? 0) > 0) {
        activeDayIndices.push(i);
      }
    });
  }

  const [litCount, setLitCount] = useState(0);
  const [slideTriggered, setSlideTriggered] = useState(false);
  const [mondayLit, setMondayLit] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPageVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!pageVisible) return;

    if (litCount < activeDayIndices.length) {
      const timer = setTimeout(() => setLitCount((c) => c + 1), 380);
      return () => clearTimeout(timer);
    }

    if (shouldSlide && !slideTriggered) {
      const timer = setTimeout(() => {
        setSlideTriggered(true);
        setTranslateX(-CELL_TOTAL);
        setTimeout(() => {
          setMondayLit(true);
          setTimeout(() => setShowResult(true), 500);
        }, 550);
      }, 400);
      return () => clearTimeout(timer);
    } else if (!shouldSlide) {
      const timer = setTimeout(() => setShowResult(true), 400);
      return () => clearTimeout(timer);
    }
  }, [litCount, pageVisible, activeDayIndices.length, shouldSlide, slideTriggered]);

  const label = locale === "vi"
    ? { title: "Chuỗi ngày học!", subtitle: "Bạn đã duy trì", days: "ngày liên tiếp", continue: "Tiếp tục →", great: "Tuyệt vời! 🎉" }
    : { title: "Day Streak!", subtitle: "You've maintained a", days: "day streak", continue: "Continue →", great: "Amazing! 🎉" };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 px-6"
      style={{
        background: `radial-gradient(ellipse at 50% 55%, ${theme.star}18 0%, ${theme.background.page} 65%)`,
        opacity: pageVisible ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      <style>{`
        @keyframes cellBurst {
          0%   { transform: scale(0.6); opacity: 0.3; }
          45%  { transform: scale(1.25); opacity: 1; }
          65%  { transform: scale(0.92); }
          80%  { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes flamePulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.12); }
        }
        @keyframes glowRing {
          0%, 100% { box-shadow: 0 0 8px 2px ${theme.star}55; }
          50%       { box-shadow: 0 0 22px 6px ${theme.star}99; }
        }
        @keyframes resultPop {
          0%   { transform: scale(0.6) translateY(16px); opacity: 0; }
          55%  { transform: scale(1.1) translateY(-4px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <p className="text-sm font-semibold tracking-widest uppercase" style={{ color: theme.text.placeholder }}>
        {label.great}
      </p>

      {/* Row container */}
      <div style={{ width: `${7 * CELL_TOTAL - 8}px`, overflow: "hidden" }}>
        <div
          className="flex gap-2"
          style={{
            transform: `translateX(${translateX}px)`,
            transition: slideTriggered ? "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
            width: `${8 * CELL_TOTAL - 8}px`,
          }}
        >
          {days8.map((dateKey, i) => {
            if (i === 7 && !shouldSlide) return null;

            const activeIdx = activeDayIndices.indexOf(i);
            const isLit =
              (activeIdx >= 0 && activeIdx < litCount) ||
              (shouldSlide && i === 7 && mondayLit);

            const isToday = dateKey === todayKey;
            // Label luôn T2→CN (index 0→6), ô thứ 8 = T2
            const labelText = i === 7 ? dayLabels[0] : dayLabels[i];

            return (
              <div key={`${dateKey}-${i}`} className="flex flex-col items-center gap-2 shrink-0" style={{ width: `${CELL_W}px` }}>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl select-none"
                  style={{
                    background: isLit ? theme.star : theme.background.input,
                    border: isToday
                      ? `2px solid ${theme.border.focused}`
                      : `1.5px solid ${isLit ? theme.star : theme.border.default}`,
                    animation: isLit
                      ? `cellBurst 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards, glowRing 1.6s 0.5s ease-in-out infinite`
                      : "none",
                    transition: "background 0.2s",
                  }}
                >
                  {isLit ? (
                    <span style={{ animation: "flamePulse 1.2s ease-in-out infinite", display: "inline-block" }}>
                      🔥
                    </span>
                  ) : (
                    <span style={{ fontSize: "14px", color: theme.text.placeholder }}>
                      {isToday && !isLit ? "·" : ""}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold" style={{ color: isLit ? theme.star : theme.text.placeholder }}>
                  {labelText}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {showResult && (
        <div
          className="flex flex-col items-center gap-3 text-center"
          style={{ animation: "resultPop 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
        >
          <p className="text-7xl font-black leading-none" style={{ color: theme.star }}>{streak}</p>
          <p className="text-xl font-bold" style={{ color: theme.text.primary }}>{label.title}</p>
          <p className="text-sm" style={{ color: theme.text.secondary }}>
            {label.subtitle} <strong style={{ color: theme.star }}>{streak}</strong> {label.days}
          </p>
        </div>
      )}

      {showResult && (
        <button
          onClick={onContinue}
          className="px-10 py-3 rounded-2xl text-base font-semibold hover:opacity-90 active:scale-95 transition-all"
          style={{
            background: theme.star,
            color: theme.button.text,
            boxShadow: `0 8px 28px ${theme.star}55`,
            animation: "slideUp 0.4s 0.15s ease both",
          }}
        >
          {label.continue}
        </button>
      )}
    </div>
  );
}
