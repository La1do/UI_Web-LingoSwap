import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";

export type ReportStatus = "pending" | "resolved" | "dismissed";

export interface Report {
  _id: string;
  reporter: { _id: string; fullName: string; email: string };
  reported: { _id: string; fullName: string; email: string };
  reason: string;
  description?: string;
  status: ReportStatus;
  createdAt: string;
}

interface ReportListProps {
  reports: Report[];
  onResolve: (report: Report) => void;
  onDismiss: (report: Report) => void;
}

export default function ReportList({ reports, onResolve, onDismiss }: ReportListProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [filter, setFilter] = useState<"all" | ReportStatus>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);
  const pendingCount = reports.filter((r) => r.status === "pending").length;

  const statusColor = (status: ReportStatus) => {
    if (status === "pending") return theme.star;
    if (status === "resolved") return theme.text.success;
    return theme.text.placeholder;
  };

  const statusLabel = (status: ReportStatus) => {
    if (status === "pending") return t.admin.reports.pending.replace(" ({n})", "");
    if (status === "resolved") return t.admin.reports.resolved;
    return t.admin.reports.dismissed;
  };

  const tabs: { key: "all" | ReportStatus; label: string }[] = [
    { key: "all", label: t.admin.reports.all.replace("{n}", String(reports.length)) },
    { key: "pending", label: t.admin.reports.pending.replace("{n}", String(pendingCount)) },
    { key: "resolved", label: t.admin.reports.resolved },
    { key: "dismissed", label: t.admin.reports.dismissed },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl self-start" style={{ background: theme.background.input }}>
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filter === tab.key ? theme.background.card : "transparent",
              color: filter === tab.key ? theme.text.primary : theme.text.placeholder,
              boxShadow: filter === tab.key ? theme.shadow.card : "none",
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs text-center py-8" style={{ color: theme.text.placeholder }}>
          {t.admin.reports.noReports}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((report) => (
            <div key={report._id} className="rounded-xl overflow-hidden"
              style={{ border: `1px solid ${theme.border.default}` }}>
              <div
                className="flex items-center gap-4 px-4 py-3 cursor-pointer"
                style={{ background: theme.background.card }}
                onClick={() => setExpanded(expanded === report._id ? null : report._id)}
              >
                <div className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: statusColor(report.status) }} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: theme.text.primary }}>
                    <span style={{ color: theme.text.accent }}>{report.reporter.fullName}</span>
                    <span style={{ color: theme.text.placeholder }}> → </span>
                    <span style={{ color: theme.text.error }}>{report.reported.fullName}</span>
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: theme.text.secondary }}>
                    {report.reason}
                  </p>
                </div>

                <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                  style={{
                    background: `${statusColor(report.status)}18`,
                    color: statusColor(report.status),
                  }}>
                  {statusLabel(report.status)}
                </span>

                <span className="text-xs shrink-0" style={{ color: theme.text.placeholder }}>
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>

                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                  className="w-4 h-4 shrink-0 transition-transform"
                  style={{
                    color: theme.text.placeholder,
                    transform: expanded === report._id ? "rotate(180deg)" : "rotate(0deg)",
                  }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {expanded === report._id && (
                <div className="px-4 py-3 flex flex-col gap-3"
                  style={{ background: theme.background.input, borderTop: `1px solid ${theme.border.default}` }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[10px] uppercase tracking-wider font-semibold"
                        style={{ color: theme.text.placeholder }}>{t.admin.reports.reporter}</p>
                      <p className="text-sm font-medium" style={{ color: theme.text.primary }}>
                        {report.reporter.fullName}
                      </p>
                      <p className="text-xs" style={{ color: theme.text.secondary }}>{report.reporter.email}</p>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[10px] uppercase tracking-wider font-semibold"
                        style={{ color: theme.text.placeholder }}>{t.admin.reports.reportedUser}</p>
                      <p className="text-sm font-medium" style={{ color: theme.text.error }}>
                        {report.reported.fullName}
                      </p>
                      <p className="text-xs" style={{ color: theme.text.secondary }}>{report.reported.email}</p>
                    </div>
                  </div>

                  {report.description && (
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] uppercase tracking-wider font-semibold"
                        style={{ color: theme.text.placeholder }}>{t.admin.reports.description}</p>
                      <p className="text-sm" style={{ color: theme.text.secondary }}>{report.description}</p>
                    </div>
                  )}

                  {report.status === "pending" && (
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => onDismiss(report)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                        style={{ background: theme.background.card, color: theme.text.secondary, border: `1px solid ${theme.border.default}` }}>
                        {t.admin.reports.dismiss}
                      </button>
                      <button onClick={() => onResolve(report)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
                        style={{ background: theme.text.success, color: theme.button.text }}>
                        {t.admin.reports.markResolved}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
