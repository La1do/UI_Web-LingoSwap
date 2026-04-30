import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { useApi } from "../../../hook/useApi";
import { adminService, type Appeal } from "../../../services/admin.service";

interface AppealListProps {
  appeals: Appeal[];
  onResolve: (appeal: Appeal, status: "approved" | "rejected", notes: string) => void;
}

type FilterStatus = "all" | "pending" | "approved" | "rejected";

export default function AppealList({ appeals, onResolve }: AppealListProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { execute, isLoading } = useApi();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  const filtered = filter === "all" ? appeals : appeals.filter((a) => a.status === filter);

  const statusColor = (status: Appeal["status"]) => {
    if (status === "pending") return theme.star;
    if (status === "approved") return theme.text.success;
    return theme.text.error;
  };

  const statusLabel = (status: Appeal["status"]) => {
    if (status === "pending") return t.admin.appeals.pending;
    if (status === "approved") return t.admin.appeals.approved;
    return t.admin.appeals.rejected;
  };

  const handleResolve = async (appeal: Appeal, status: "approved" | "rejected") => {
    setProcessing(appeal._id + status);
    const adminNotes = notes[appeal._id] ?? "";
    await execute(adminService.resolveAppeal(appeal._id, { status, adminNotes }));
    onResolve(appeal, status, adminNotes);
    setProcessing(null);
    setExpanded(null);
  };

  const tabs: { key: FilterStatus; label: string }[] = [
    { key: "all", label: t.admin.appeals.all },
    { key: "pending", label: t.admin.appeals.pending },
    { key: "approved", label: t.admin.appeals.approved },
    { key: "rejected", label: t.admin.appeals.rejected },
  ];

  const validAvatar = (a: Appeal) => {
    const av = a.userId?.profile?.avatar;
    return av && av !== "default_avatar.png" ? av : undefined;
  };

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
          {t.admin.appeals.noAppeals}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((appeal) => (
            <div key={appeal._id} className="rounded-xl overflow-hidden"
              style={{ border: `1px solid ${theme.border.default}` }}>
              {/* Header row */}
              <div
                className="flex items-center gap-4 px-4 py-3 cursor-pointer"
                style={{ background: theme.background.card }}
                onClick={() => setExpanded(expanded === appeal._id ? null : appeal._id)}
              >
                <div className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: statusColor(appeal.status) }} />

                {/* Avatar + name */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {validAvatar(appeal) ? (
                    <img src={validAvatar(appeal)} alt={appeal.userId?.profile?.fullName}
                      className="w-8 h-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: theme.button.bg, color: theme.button.text }}>
                      {(appeal.userId?.profile?.fullName ?? "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: theme.text.primary }}>
                      {appeal.userId?.profile?.fullName ?? appeal.userId?.email}
                    </p>
                    <p className="text-xs truncate" style={{ color: theme.text.placeholder }}>
                      {appeal.userId?.email}
                    </p>
                  </div>
                </div>

                <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                  style={{ background: `${statusColor(appeal.status)}18`, color: statusColor(appeal.status) }}>
                  {statusLabel(appeal.status)}
                </span>

                <span className="text-xs shrink-0" style={{ color: theme.text.placeholder }}>
                  {new Date(appeal.createdAt).toLocaleDateString()}
                </span>

                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                  className="w-4 h-4 shrink-0 transition-transform"
                  style={{
                    color: theme.text.placeholder,
                    transform: expanded === appeal._id ? "rotate(180deg)" : "rotate(0deg)",
                  }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* Expanded detail */}
              {expanded === appeal._id && (
                <div className="px-4 py-4 flex flex-col gap-4"
                  style={{ background: theme.background.input, borderTop: `1px solid ${theme.border.default}` }}>

                  {appeal.banReason && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                        style={{ color: theme.text.placeholder }}>{t.admin.appeals.banReason}</p>
                      <p className="text-sm" style={{ color: theme.text.error }}>{appeal.banReason}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                      style={{ color: theme.text.placeholder }}>{t.admin.appeals.appealContent}</p>
                    <p className="text-sm" style={{ color: theme.text.secondary }}>{appeal.content}</p>
                  </div>

                  {appeal.adminNotes && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                        style={{ color: theme.text.placeholder }}>{t.admin.appeals.adminNotes}</p>
                      <p className="text-sm" style={{ color: theme.text.secondary }}>{appeal.adminNotes}</p>
                    </div>
                  )}

                  {appeal.status === "pending" && (
                    <div className="flex flex-col gap-3">
                      <textarea
                        value={notes[appeal._id] ?? ""}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [appeal._id]: e.target.value }))}
                        placeholder={t.admin.appeals.adminNotesPlaceholder}
                        rows={2}
                        className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
                        style={{
                          background: theme.background.card,
                          color: theme.text.primary,
                          border: `1px solid ${theme.border.default}`,
                        }}
                        onFocus={(e) => (e.target.style.borderColor = theme.border.focused)}
                        onBlur={(e) => (e.target.style.borderColor = theme.border.default)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolve(appeal, "rejected")}
                          disabled={isLoading || processing !== null}
                          className="px-4 py-2 rounded-xl text-xs font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
                          style={{ background: theme.background.card, color: theme.text.error, border: `1px solid ${theme.text.error}40` }}>
                          {processing === appeal._id + "rejected" ? t.admin.appeals.processing : t.admin.appeals.reject}
                        </button>
                        <button
                          onClick={() => handleResolve(appeal, "approved")}
                          disabled={isLoading || processing !== null}
                          className="px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
                          style={{ background: theme.text.success, color: theme.button.text }}>
                          {processing === appeal._id + "approved" ? t.admin.appeals.processing : t.admin.appeals.approve}
                        </button>
                      </div>
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
