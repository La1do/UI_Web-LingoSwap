import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import type { DashboardStats } from "../../../services/admin.service";

interface AdminDashboardChartsProps {
  dashboard: DashboardStats;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function AdminDashboardCharts({ dashboard }: AdminDashboardChartsProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const label = t.admin.dashboardCharts;

  const userStatusData = [
    { name: label.activeUsers, value: dashboard.users.active, color: theme.text.success },
    { name: label.bannedUsers, value: dashboard.users.banned, color: theme.text.error },
  ];

  const userGrowthData = [
    { name: label.today, value: dashboard.users.newToday },
    { name: label.thisWeek, value: dashboard.users.newThisWeek },
    { name: label.thisMonth, value: dashboard.users.newThisMonth },
  ];

  const activityData = [
    {
      name: label.today,
      sessions: dashboard.matchSessions.today,
      messages: dashboard.messages.today,
    },
    {
      name: label.thisWeek,
      sessions: dashboard.matchSessions.thisWeek,
      messages: dashboard.messages.thisWeek,
    },
  ];

  const moderationData = [
    { name: label.pending, value: dashboard.reports.pending, color: theme.star },
    { name: label.resolved, value: dashboard.reports.resolved, color: theme.text.success },
    { name: label.today, value: dashboard.reports.today, color: theme.text.accent },
  ];

  const tooltipStyle = {
    background: theme.background.card,
    border: `1px solid ${theme.border.default}`,
    borderRadius: 8,
    color: theme.text.primary,
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <ChartCard title={label.userHealth}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={userStatusData}
                dataKey="value"
                nameKey="name"
                innerRadius={64}
                outerRadius={96}
                paddingAngle={4}
              >
                {userStatusData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title={label.userGrowth}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userGrowthData} margin={{ top: 16, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={theme.border.default} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke={theme.text.placeholder} tickLine={false} axisLine={false} />
              <YAxis stroke={theme.text.placeholder} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: theme.background.input }} />
              <Bar dataKey="value" name={label.newUsers} fill={theme.text.accent} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title={label.activityOverview}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} margin={{ top: 16, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={theme.border.default} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke={theme.text.placeholder} tickLine={false} axisLine={false} />
              <YAxis stroke={theme.text.placeholder} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: theme.background.input }} />
              <Legend />
              <Bar dataKey="sessions" name={label.sessions} fill={theme.button.bg} radius={[8, 8, 0, 0]} />
              <Bar dataKey="messages" name={label.messages} fill={theme.text.success} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title={label.moderation}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moderationData} layout="vertical" margin={{ top: 16, right: 20, left: 24, bottom: 0 }}>
              <CartesianGrid stroke={theme.border.default} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke={theme.text.placeholder} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke={theme.text.placeholder} tickLine={false} axisLine={false} width={76} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: theme.background.input }} />
              <Bar dataKey="value" name={label.reports} radius={[0, 8, 8, 0]}>
                {moderationData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
        <InsightCard label={label.avgDuration} value={formatDuration(dashboard.matchSessions.avgDurationSeconds)} />
        <InsightCard label={label.totalDuration} value={formatDuration(dashboard.matchSessions.totalDurationSeconds)} />
        <InsightCard label={label.friendships} value={dashboard.friendships.total.toLocaleString()} />
      </div>
    </div>
  );

  function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <section
        className="rounded-2xl p-5 flex flex-col gap-4"
        style={{
          background: theme.background.card,
          border: `1px solid ${theme.border.default}`,
          boxShadow: theme.shadow.card,
        }}
      >
        <h2 className="text-sm font-semibold" style={{ color: theme.text.primary }}>
          {title}
        </h2>
        {children}
      </section>
    );
  }

  function InsightCard({ label: insightLabel, value }: { label: string; value: string }) {
    return (
      <section
        className="rounded-2xl p-4 flex flex-col gap-1"
        style={{
          background: theme.background.card,
          border: `1px solid ${theme.border.default}`,
          boxShadow: theme.shadow.card,
        }}
      >
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.placeholder }}>
          {insightLabel}
        </p>
        <p className="text-2xl font-bold" style={{ color: theme.text.primary }}>
          {value}
        </p>
      </section>
    );
  }
}
