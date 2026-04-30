import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";

interface StatsBarProps {
  total: number;
  active: number;
  banned: number;
  reports: number;
  online?: number;
  newToday?: number;
  totalSessions?: number;
  totalMessages?: number;
}

export default function StatsBar({ total, active, banned, reports, online, newToday, totalSessions, totalMessages }: StatsBarProps) {
  const { theme } = useTheme();
  const { t } = useI18n();

  const stats = [
    { label: t.admin.stats.totalUsers, value: total, color: theme.text.accent },
    { label: t.admin.stats.active, value: active, color: theme.text.success },
    { label: t.admin.stats.banned, value: banned, color: theme.text.error },
    { label: t.admin.stats.pendingReports, value: reports, color: theme.star },
    ...(online !== undefined ? [{ label: t.admin.stats.online, value: online, color: theme.status.online }] : []),
    ...(newToday !== undefined ? [{ label: t.admin.stats.newToday, value: newToday, color: theme.text.accent }] : []),
    ...(totalSessions !== undefined ? [{ label: t.admin.stats.totalSessions, value: totalSessions, color: theme.text.secondary }] : []),
    ...(totalMessages !== undefined ? [{ label: t.admin.stats.totalMessages, value: totalMessages, color: theme.text.secondary }] : []),
  ];

  const cols = stats.length <= 4 ? "grid-cols-4" : stats.length <= 6 ? "grid-cols-3" : "grid-cols-4";

  return (
    <div className={`grid ${cols} gap-4`}>
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl p-4 flex flex-col gap-1"
          style={{ background: theme.background.card, border: `1px solid ${theme.border.default}` }}>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.placeholder }}>
            {s.label}
          </p>
          <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
