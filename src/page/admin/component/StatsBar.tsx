import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";

interface StatsBarProps {
  total: number;
  active: number;
  banned: number;
  reports: number;
}

export default function StatsBar({ total, active, banned, reports }: StatsBarProps) {
  const { theme } = useTheme();
  const { t } = useI18n();

  const stats = [
    { label: t.admin.stats.totalUsers, value: total, color: theme.text.accent },
    { label: t.admin.stats.active, value: active, color: theme.text.success },
    { label: t.admin.stats.banned, value: banned, color: theme.text.error },
    { label: t.admin.stats.pendingReports, value: reports, color: theme.star },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl p-4 flex flex-col gap-1"
          style={{ background: theme.background.card, border: `1px solid ${theme.border.default}` }}>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.placeholder }}>
            {s.label}
          </p>
          <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
