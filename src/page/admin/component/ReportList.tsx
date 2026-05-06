import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";

export type ReportStatus = "pending" | "resolved" | "dismissed";
export type BanDuration = "3_days" | "7_days" | "30_days" | "permanent";

// Shape BE trả về
export interface ApiReport {
  _id: string;
  reporterId: { _id: string; email: string; profile: { fullName: string } } | null;
  reportedUserId: { _id: string; email: string; profile: { fullName: string }; statusAccount?: string } | null;
  reason: string;
  description?: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: string;
}

// Shape FE dùng
export interface Report {
  _id: string;
  reporter: { _id: string; fullName: string; email: string } | null;
  reported: { _id: string; fullName: string; email: string } | null;
  reason: string;
  description?: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: string;
}

export function mapApiReport(r: ApiReport): Report {
  return {
    _id: r._id,
    reporter: r.reporterId
      ? { _id: r.reporterId._id, fullName: r.reporterId.profile?.fullName ?? "?", email: r.reporterId.email }
      : null,
    reported: r.reportedUserId
      ? { _id: r.reportedUserId._id, fullName: r.reportedUserId.profile?.fullName ?? "?", email: r.reportedUserId.email }
      : null,
    reason: r.reason,
    description: r.description,
    status: r.status,
    adminNotes: r.adminNotes,
    createdAt: r.createdAt,
  };
}

export interface ResolvePayload {
  status: "resolved" | "dismissed";
  adminNotes?: string;
  banDuration?: BanDuration;
}

interface ReportListProps {
  reports: Report[];
  onResolve: (report: Report, payload: ResolvePayload) => void;
}

// ─── Resolve Modal ────────────────────────────────────────────

function ResolveModal({
  report,
  onConfirm,
  onClose,
}: {
  report: Report;
  onConfirm: (payload: ResolvePayload) => void;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [action, setAction] = useState<"resolved" | "dismissed">("resolved");
  const [adminNotes, setAdminNotes] = useState("");
  const [banDuration, setBanDuration] = useState<BanDuration | "none">("none");

  const banOptions: { value: BanDuration | "none"; label: string }[] = [
    { value: "none", label: t.admin.reports.noBan },
    { value: "3_days", label: t.admin.reports.ban3days },
    { value: "7_days", label: t.admin.reports.ban7days },
    { value: "30_days", label: t.admin.reports.ban30days },
    { value: "permanent", label: t.admin.reports.banPermanent },
  ];

  const handleConfirm = () => {
    onConfirm({
      status: action,
      adminNotes: adminNotes.trim() || undefined,
      banDuration: action === "resolved" && banDuration !== "none" ? banDuration : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: theme.overlay.default }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4"
        style={{
          background: theme.background.card,
          border: `1px solid ${theme.border.default}`,
          boxShadow: theme.shadow.card,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold" style={{ color: theme.text.primary }}>
            {t.admin.reports.resolveTitle}
          </h3>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70"
            style={{ background: theme.background.input, color: theme.text.secondary }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Report summary */}
        <div className="px-3 py-2 rounded-xl text-sm"
          style={{ background: theme.background.input, border: `1px solid ${theme.border.default}` }}>
          <span style={{ color: theme.text.accent }}>{report.reporter?.fullName ?? "?"}</span>
          <span style={{ color: theme.text.placeholder }}> → </span>
          <span style={{ color: theme.text.error }}>{report.reported?.fullName ?? "?"}</span>
          <p className="text-xs mt-0.5" style={{ color: theme.text.secondary }}>{report.reason}</p>
        </div>

        {/* Action toggle */}
        <div className="flex gap-2">
          {(["resolved", "dismissed"] as const).map((a) => (
            <button key={a} onClick={() => setAction(a)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: action === a
                  ? (a === "resolved" ? theme.text.success : theme.background.input)
                  : theme.background.input,
                color: action === a
                  ? (a === "resolved" ? theme.button.text : theme.text.secondary)
                  : theme.text.placeholder,
                border: `1.5px solid ${action === a
                  ? (a === "resolved" ? theme.text.success : theme.border.default)
                  : theme.border.default}`,
              }}>
              {a === "resolved" ? t.admin.reports.markResolved : t.admin.reports.dismiss}
            </button>
          ))}
        </div>

        {/* Ban duration — chỉ hiện khi resolved */}
        {action === "resolved" && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium" style={{ color: theme.text.secondary }}>
              {t.admin.reports.banDuration}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {banOptions.map((opt) => (
                <button key={opt.value} onClick={() => setBanDuration(opt.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: banDuration === opt.value
                      ? (opt.value === "none" ? theme.background.input : `${theme.text.error}15`)
                      : theme.background.input,
                    color: banDuration === opt.value && opt.value !== "none"
                      ? theme.text.error
                      : theme.text.secondary,
                    border: `1.5px solid ${banDuration === opt.value
                      ? (opt.value === "none" ? theme.border.default : theme.text.error)
                      : theme.border.default}`,
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Admin notes */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium" style={{ color: theme.text.secondary }}>
            {t.admin.reports.adminNotes}
          </p>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder={t.admin.reports.adminNotesPlaceholder}
            rows={3}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
            style={{
              background: theme.background.input,
              color: theme.text.primary,
              border: `1px solid ${theme.border.default}`,
            }}
            onFocus={(e) => (e.target.style.borderColor = theme.border.focused)}
            onBlur={(e) => (e.target.style.borderColor = theme.border.default)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ background: theme.background.input, color: theme.text.secondary, border: `1px solid ${theme.border.default}` }}>
            {t.admin.reports.cancel}
          </button>
          <button onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{
              background: action === "resolved" ? theme.text.success : theme.button.bg,
              color: theme.button.text,
            }}>
            {t.admin.reports.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────

export default function ReportList({ reports, onResolve }: ReportListProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [filter, setFilter] = useState<"all" | ReportStatus>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [resolving, setResolving] = useState<Report | null>(null);

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
    <>
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
                      <span style={{ color: theme.text.accent }}>{report.reporter?.fullName ?? "?"}</span>
                      <span style={{ color: theme.text.placeholder }}> → </span>
                      <span style={{ color: theme.text.error }}>{report.reported?.fullName ?? "?"}</span>
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
                          {report.reporter?.fullName ?? "—"}
                        </p>
                        <p className="text-xs" style={{ color: theme.text.secondary }}>{report.reporter?.email ?? "—"}</p>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[10px] uppercase tracking-wider font-semibold"
                          style={{ color: theme.text.placeholder }}>{t.admin.reports.reportedUser}</p>
                        <p className="text-sm font-medium" style={{ color: theme.text.error }}>
                          {report.reported?.fullName ?? "—"}
                        </p>
                        <p className="text-xs" style={{ color: theme.text.secondary }}>{report.reported?.email ?? "—"}</p>
                      </div>
                    </div>

                    {report.description && (
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] uppercase tracking-wider font-semibold"
                          style={{ color: theme.text.placeholder }}>{t.admin.reports.description}</p>
                        <p className="text-sm" style={{ color: theme.text.secondary }}>{report.description}</p>
                      </div>
                    )}

                    {report.adminNotes && (
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] uppercase tracking-wider font-semibold"
                          style={{ color: theme.text.placeholder }}>{t.admin.reports.adminNotes}</p>
                        <p className="text-sm" style={{ color: theme.text.secondary }}>{report.adminNotes}</p>
                      </div>
                    )}

                    {report.status === "pending" && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setResolving(report); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
                          style={{ background: theme.text.success, color: theme.button.text }}>
                          {t.admin.reports.markResolved}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onResolve(report, { status: "dismissed" });
                            setExpanded(null);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                          style={{ background: theme.background.card, color: theme.text.secondary, border: `1px solid ${theme.border.default}` }}>
                          {t.admin.reports.dismiss}
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

      {resolving && (
        <ResolveModal
          report={resolving}
          onConfirm={(payload) => {
            onResolve(resolving, payload);
            setResolving(null);
            setExpanded(null);
          }}
          onClose={() => setResolving(null)}
        />
      )}
    </>
  );
}
