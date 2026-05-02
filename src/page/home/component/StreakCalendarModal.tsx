import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";

interface StreakCalendarModalProps {
  calendar: Record<string, number>;
  onClose: () => void;
}

const MONTH_NAMES_VI = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
const MONTH_NAMES_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS_VI = ["T2","T3","T4","T5","T6","T7","CN"];
const DAY_LABELS_EN = ["Mo","Tu","We","Th","Fr","Sa","Su"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Thứ trong tuần của ngày đầu tháng (0=CN → đổi sang 0=T2)
function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay(); // 0=CN
  return day === 0 ? 6 : day - 1; // 0=T2, 6=CN
}

export default function StreakCalendarModal({ calendar, onClose }: StreakCalendarModalProps) {
  const { theme } = useTheme();
  const { locale } = useI18n();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const monthNames = locale === "vi" ? MONTH_NAMES_VI : MONTH_NAMES_EN;
  const dayLabels = locale === "vi" ? DAY_LABELS_VI : DAY_LABELS_EN;

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOffset = getFirstDayOfWeek(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const todayKey = today.toISOString().slice(0, 10);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: theme.overlay.default }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5 flex flex-col gap-4"
        style={{
          background: theme.background.card,
          border: `1px solid ${theme.border.default}`,
          boxShadow: theme.shadow.card,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
            style={{ background: theme.background.input, color: theme.text.secondary }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <h3 className="text-sm font-semibold" style={{ color: theme.text.primary }}>
            {monthNames[viewMonth]} {viewYear}
          </h3>

          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
            style={{ background: theme.background.input, color: theme.text.secondary }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1">
          {dayLabels.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold py-1"
              style={{ color: theme.text.placeholder }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const mm = String(viewMonth + 1).padStart(2, "0");
            const dd = String(day).padStart(2, "0");
            const dateKey = `${viewYear}-${mm}-${dd}`;
            const sessions = calendar[dateKey] ?? 0;
            const isActive = sessions > 0;
            const isToday = dateKey === todayKey;

            return (
              <div
                key={dateKey}
                className="aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative"
                style={{
                  background: isActive ? theme.star : theme.background.input,
                  border: isToday ? `2px solid ${theme.border.focused}` : `1px solid ${theme.border.default}`,
                  color: isActive ? theme.button.text : theme.text.placeholder,
                  fontWeight: isActive ? 600 : 400,
                }}
                title={isActive ? `${sessions} session${sessions > 1 ? "s" : ""}` : undefined}
              >
                <span>{day}</span>
                {isActive && sessions > 1 && (
                  <span className="text-[8px] leading-none opacity-80">{sessions}x</span>
                )}
                {isActive && (
                  <span className="absolute top-0.5 right-0.5 text-[8px]">🔥</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ background: theme.background.input, color: theme.text.secondary }}
        >
          {locale === "vi" ? "Đóng" : "Close"}
        </button>
      </div>
    </div>
  );
}
