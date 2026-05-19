import { useState, useEffect } from "react";
import type React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";
import { useApi } from "../../hook/useApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import PageShell from "../../layout/PageShell";
import AppLoader from "../component/AppLoader";
import StatsBar from "./component/StatsBar";
import AdminDashboardCharts from "./component/AdminDashboardCharts";
import UserTable, { type AdminUser } from "./component/UserTable";
import ReportList, { type Report, type ResolvePayload, type ApiReport, mapApiReport } from "./component/ReportList";
import AppealList from "./component/AppealList";
import { adminService, type DashboardStats, type Appeal } from "../../services/admin.service";

// ─── Nav ─────────────────────────────────────────────────────

type AdminSection = "dashboard" | "users" | "reports" | "appeals";
type LoadedSections = Record<AdminSection, boolean>;

const NAV_ITEMS: { id: AdminSection; labelKey: "dashboardSection" | "usersSection" | "reportsSection" | "appealsSection"; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    labelKey: "dashboardSection",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "users",
    labelKey: "usersSection",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    id: "reports",
    labelKey: "reportsSection",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    id: "appeals",
    labelKey: "appealsSection",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

// ─── Page ─────────────────────────────────────────────────────

export default function AdminPage() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const toast = useToast();
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");

  // Data state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [loadedSections, setLoadedSections] = useState<LoadedSections>({
    dashboard: false,
    users: false,
    reports: false,
    appeals: false,
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // API hooks
  const { execute: fetchUsers, isLoading: loadingUsers, isError: isUsersError, error: usersError } = useApi<AdminUser[]>();
  const { execute: fetchDashboard, isLoading: loadingDashboard, isError: isDashboardError, error: dashboardError } = useApi<DashboardStats>();
  const { execute: fetchAppeals, isLoading: loadingAppeals, isError: isAppealsError, error: appealsError } = useApi<Appeal[]>();
  const { execute: fetchReports, isLoading: loadingReports, isError: isReportsError, error: reportsError } = useApi<ApiReport[]>();
  const { execute: resolveReportExec } = useApi();
  const { execute: resolveAppealExec } = useApi();
  const { execute: banExec } = useApi();
  const { execute: deleteExec } = useApi();

  const markLoaded = (section: AdminSection) => {
    setLoadedSections((prev) => ({ ...prev, [section]: true }));
  };

  const loadDashboard = async () => {
    const data = await fetchDashboard(adminService.getDashboard());
    if (data) {
      setDashboard(data);
      markLoaded("dashboard");
    }
  };

  const loadUsers = async () => {
    const data = await fetchUsers(adminService.getUsers());
    if (data) {
      setUsers(data);
      markLoaded("users");
    }
  };

  const loadAppeals = async () => {
    const data = await fetchAppeals(adminService.getAppeals());
    if (data) {
      setAppeals(data);
      markLoaded("appeals");
    }
  };

  const loadReports = async () => {
    const data = await fetchReports(adminService.getReports());
    if (data) {
      setReports(data.map(mapApiReport));
      markLoaded("reports");
    }
  };

  // Fetch on section change
  useEffect(() => {
    if (loadedSections[activeSection]) return;

    if (activeSection === "dashboard") void loadDashboard();
    if (activeSection === "users") void loadUsers();
    if (activeSection === "appeals") void loadAppeals();
    if (activeSection === "reports") void loadReports();
  }, [activeSection, loadedSections]);

  // Stats — từ dashboard API hoặc tính từ users
  const stats = dashboard
    ? {
        total: dashboard.users.total,
        active: dashboard.users.active,
        banned: dashboard.users.banned,
        reports: dashboard.reports.pending,
        online: dashboard.users.online,
        newToday: dashboard.users.newToday,
        totalSessions: dashboard.matchSessions.total,
        totalMessages: dashboard.messages.total,
      }
    : {
        total: users.length,
        active: users.filter((u) => u.statusAccount === "active").length,
        banned: users.filter((u) => u.statusAccount === "banned").length,
        reports: reports.filter((r) => r.status === "pending").length,
      };

  const handleBan = async (user: AdminUser): Promise<boolean> => {
    setActionLoading(`ban:${user._id}`);
    const result = await banExec(adminService.banUser(user._id));
    setActionLoading(null);
    if (result === null) {
      toast.error(t.admin.toast.actionFailed);
      return false;
    }

    setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, statusAccount: "banned" } : u));
    toast.success(t.admin.toast.banSuccess);
    return true;
  };

  const handleDelete = async (user: AdminUser): Promise<boolean> => {
    setActionLoading(`delete:${user._id}`);
    const result = await deleteExec(adminService.deleteUser(user._id));
    setActionLoading(null);
    if (result === null) {
      toast.error(t.admin.toast.actionFailed);
      return false;
    }

    setUsers((prev) => prev.filter((u) => u._id !== user._id));
    toast.success(t.admin.toast.deleteSuccess);
    return true;
  };

  const handleResolveAppeal = async (appeal: Appeal, status: "approved" | "rejected", adminNotes: string): Promise<boolean> => {
    const result = await resolveAppealExec(adminService.resolveAppeal(appeal._id, { status, adminNotes }));
    if (result === null) {
      toast.error(t.admin.toast.actionFailed);
      return false;
    }

    setAppeals((prev) =>
      prev.map((a) => a._id === appeal._id ? { ...a, status, adminNotes } : a)
    );
    toast.success(t.admin.toast.appealResolved);
    return true;
  };

  const handleResolveReport = async (report: Report, payload: ResolvePayload): Promise<boolean> => {
    setActionLoading(`report:${report._id}`);
    const result = await resolveReportExec(adminService.resolveReport(report._id, payload));
    setActionLoading(null);
    if (result === null) {
      toast.error(t.admin.toast.actionFailed);
      return false;
    }

    setReports((prev) =>
      prev.map((r) =>
        r._id === report._id
          ? { ...r, status: payload.status, adminNotes: payload.adminNotes }
          : r
      )
    );
    toast.success(t.admin.toast.reportResolved);
    return true;
  };

  const sectionLabel: Record<AdminSection, string> = {
    dashboard: t.admin.dashboardSection,
    users: t.admin.usersSection,
    reports: t.admin.reportsSection,
    appeals: t.admin.appealsSection,
  };

  const pendingAppeals = appeals.filter((a) => a.status === "pending").length;
  const isInitialAdminLoading =
    activeSection === "dashboard" &&
    !loadedSections.dashboard &&
    loadingDashboard;

  const retryActiveSection = () => {
    if (activeSection === "dashboard") void loadDashboard();
    if (activeSection === "users") void loadUsers();
    if (activeSection === "appeals") void loadAppeals();
    if (activeSection === "reports") void loadReports();
  };

  if (isInitialAdminLoading) {
    return <AppLoader />;
  }

  function AdminLoadingState() {
    return (
      <div
        className="min-h-48 rounded-2xl flex flex-col items-center justify-center gap-3"
        style={{
          background: theme.background.card,
          border: `1px solid ${theme.border.default}`,
          boxShadow: theme.shadow.card,
        }}
      >
        <div
          className="w-8 h-8 rounded-full border-4 animate-spin"
          style={{
            borderColor: theme.border.default,
            borderTopColor: theme.button.bg,
          }}
        />
        <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>
          {t.admin.loadingSection}
        </p>
      </div>
    );
  }

  function AdminErrorState({ message }: { message: string | null }) {
    return (
      <div
        className="min-h-48 rounded-2xl flex flex-col items-center justify-center gap-3 text-center px-6"
        style={{
          background: theme.background.card,
          border: `1px solid ${theme.border.default}`,
          boxShadow: theme.shadow.card,
        }}
      >
        <p className="text-sm font-semibold" style={{ color: theme.text.error }}>
          {t.admin.loadFailed}
        </p>
        {message && (
          <p className="text-xs max-w-md" style={{ color: theme.text.secondary }}>
            {message}
          </p>
        )}
        <button
          onClick={retryActiveSection}
          className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90"
          style={{ background: theme.button.bg, color: theme.button.text }}
        >
          {t.admin.retry}
        </button>
      </div>
    );
  }

  return (
    <PageShell controlsPosition="top-right">
      <div
        className="min-h-screen flex "
        style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* ── Sidebar ── */}
        <aside
          className="w-56 shrink-0 flex flex-col py-6 px-3 gap-1 min-h-screen fixed"
          style={{ borderRight: `1px solid ${theme.border.default}`, background: theme.background.card }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 px-3 mb-6">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm"
              style={{ background: theme.button.bg, color: theme.button.text }}>
              A
            </div>
            <span className="font-semibold text-sm" style={{ color: theme.text.primary }}>Admin</span>
          </div>

          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            const badge = item.id === "appeals" && pendingAppeals > 0
              ? pendingAppeals
              : item.id === "reports" && reports.filter((r) => r.status === "pending").length > 0
              ? reports.filter((r) => r.status === "pending").length
              : null;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all hover:opacity-80"
                style={{
                  background: isActive ? `${theme.button.bg}18` : "transparent",
                  color: isActive ? theme.button.bg : theme.text.secondary,
                  borderLeft: isActive ? `3px solid ${theme.button.bg}` : "3px solid transparent",
                }}
              >
                {item.icon}
                <span className="flex-1">{t.admin[item.labelKey]}</span>
                {badge && (
                  <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{ background: theme.text.error, color: theme.button.text }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Logout */}
          <div className="mt-auto pt-4" style={{ borderTop: `1px solid ${theme.border.default}` }}>
            <button
              onClick={() => {
                toast.info(t.auth.logoutSuccess);
                logout();
                navigate("/admin/login", { replace: true });
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left hover:opacity-80 transition-opacity"
              style={{ color: theme.text.error }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {t.admin.logout}
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto p-8 ml-56">
          <div className="max-w-5xl mx-auto flex flex-col gap-6">

            {/* Section header */}
            <h1 className="text-2xl font-bold" style={{ color: theme.text.primary }}>
              {sectionLabel[activeSection]}
            </h1>

            {/* Dashboard */}
            {activeSection === "dashboard" && (
              loadingDashboard ? (
                <AdminLoadingState />
              ) : isDashboardError ? (
                <AdminErrorState message={dashboardError} />
              ) : (
                <>
                  <StatsBar {...stats} />
                  {dashboard && <AdminDashboardCharts dashboard={dashboard} />}
                </>
              )
            )}

            {/* Users */}
            {activeSection === "users" && (
              <section className="rounded-2xl p-6 flex flex-col gap-4"
                style={{ background: theme.background.card, border: `1px solid ${theme.border.default}` }}>
                {loadingUsers ? (
                  <AdminLoadingState />
                ) : isUsersError ? (
                  <AdminErrorState message={usersError} />
                ) : (
                  <UserTable users={users} onBan={handleBan} onDelete={handleDelete} actionLoading={actionLoading} />
                )}
              </section>
            )}

            {/* Reports */}
            {activeSection === "reports" && (
              <section className="rounded-2xl p-6 flex flex-col gap-4"
                style={{ background: theme.background.card, border: `1px solid ${theme.border.default}` }}>
                {loadingReports ? (
                  <AdminLoadingState />
                ) : isReportsError ? (
                  <AdminErrorState message={reportsError} />
                ) : (
                  <ReportList reports={reports} onResolve={handleResolveReport} actionLoading={actionLoading} />
                )}
              </section>
            )}

            {/* Appeals */}
            {activeSection === "appeals" && (
              <section className="rounded-2xl p-6 flex flex-col gap-4"
                style={{ background: theme.background.card, border: `1px solid ${theme.border.default}` }}>
                {loadingAppeals ? (
                  <AdminLoadingState />
                ) : isAppealsError ? (
                  <AdminErrorState message={appealsError} />
                ) : (
                  <AppealList appeals={appeals} onResolve={handleResolveAppeal} />
                )}
              </section>
            )}
          </div>
        </main>
      </div>
    </PageShell>
  );
}
