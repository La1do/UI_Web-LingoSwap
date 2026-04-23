import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";
import PageShell from "../../layout/PageShell";
import StatsBar from "./component/StatsBar";
import UserTable, { type AdminUser } from "./component/UserTable";
import ReportList, { type Report } from "./component/ReportList";

// ─── Mock data ───────────────────────────────────────────────

const MOCK_USERS: AdminUser[] = [
  {
    _id: "1", email: "admin@lingoswap.com",
    profile: { fullName: "Admin" },
    statusAccount: "active", role: "admin",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "2", email: "alice@example.com",
    profile: { fullName: "Alice Nguyen" },
    statusAccount: "active", role: "user",
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    _id: "3", email: "bob@example.com",
    profile: { fullName: "Bob Tran" },
    statusAccount: "active", role: "user",
    createdAt: "2024-04-20T08:30:00Z",
  },
  {
    _id: "4", email: "charlie@example.com",
    profile: { fullName: "Charlie Le" },
    statusAccount: "banned", role: "user",
    createdAt: "2024-02-10T14:00:00Z",
  },
  {
    _id: "5", email: "diana@example.com",
    profile: { fullName: "Diana Pham" },
    statusAccount: "active", role: "user",
    createdAt: "2024-05-01T09:00:00Z",
  },
];

const MOCK_REPORTS: Report[] = [
  {
    _id: "r1",
    reporter: { _id: "2", fullName: "Alice Nguyen", email: "alice@example.com" },
    reported: { _id: "3", fullName: "Bob Tran", email: "bob@example.com" },
    reason: "Inappropriate language",
    description: "User used offensive language during the video call session.",
    status: "pending",
    createdAt: "2024-05-10T10:00:00Z",
  },
  {
    _id: "r2",
    reporter: { _id: "5", fullName: "Diana Pham", email: "diana@example.com" },
    reported: { _id: "3", fullName: "Bob Tran", email: "bob@example.com" },
    reason: "Harassment",
    description: "Repeatedly sending unwanted messages after the session ended.",
    status: "pending",
    createdAt: "2024-05-11T14:30:00Z",
  },
  {
    _id: "r3",
    reporter: { _id: "3", fullName: "Bob Tran", email: "bob@example.com" },
    reported: { _id: "2", fullName: "Alice Nguyen", email: "alice@example.com" },
    reason: "Spam",
    status: "resolved",
    createdAt: "2024-04-28T09:00:00Z",
  },
  {
    _id: "r4",
    reporter: { _id: "5", fullName: "Diana Pham", email: "diana@example.com" },
    reported: { _id: "2", fullName: "Alice Nguyen", email: "alice@example.com" },
    reason: "Fake profile",
    status: "dismissed",
    createdAt: "2024-04-15T11:00:00Z",
  },
];

// ─── Page ─────────────────────────────────────────────────────

export default function AdminPage() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);

  const stats = {
    total: users.length,
    active: users.filter((u) => u.statusAccount === "active").length,
    banned: users.filter((u) => u.statusAccount === "banned").length,
    reports: reports.filter((r) => r.status === "pending").length,
  };

  const handleBan = (user: AdminUser) => {
    // TODO: gọi PUT /api/admin/users/{id}/ban
    setUsers((prev) =>
      prev.map((u) => u._id === user._id ? { ...u, statusAccount: "banned" } : u)
    );
  };

  const handleDelete = (user: AdminUser) => {
    // TODO: gọi DELETE /api/admin/users/{id}
    setUsers((prev) => prev.filter((u) => u._id !== user._id));
  };

  const handleResolve = (report: Report) => {
    // TODO: gọi API resolve report
    setReports((prev) => prev.map((r) => r._id === report._id ? { ...r, status: "resolved" as const } : r));
  };

  const handleDismiss = (report: Report) => {
    // TODO: gọi API dismiss report
    setReports((prev) => prev.map((r) => r._id === report._id ? { ...r, status: "dismissed" as const } : r));
  };

  return (
    <PageShell controlsPosition="top-right">
      <div
        className="min-h-screen px-6 py-8"
        style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col gap-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                {t.admin.title}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: theme.text.secondary }}>
                {t.admin.subtitle}
              </p>
            </div>
            {/* <button onClick={() => navigate("/home")}
              className="text-sm hover:opacity-70 transition-opacity"
              style={{ color: theme.text.accent }}>
              ← Back to home
            </button> */}
          </div>

          {/* Stats */}
          <StatsBar {...stats} />

          {/* Reports */}
          <section className="rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: theme.background.card, border: `1px solid ${theme.border.default}` }}>
            <h2 className="text-base font-semibold" style={{ color: theme.text.primary }}>
              {t.admin.reportsSection}
            </h2>
            <ReportList reports={reports} onResolve={handleResolve} onDismiss={handleDismiss} />
          </section>
          {/* Users table */}
          <section className="rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: theme.background.card, border: `1px solid ${theme.border.default}` }}>
            <h2 className="text-base font-semibold" style={{ color: theme.text.primary }}>
              {t.admin.usersSection}
            </h2>
            <UserTable users={users} onBan={handleBan} onDelete={handleDelete} />
          </section>


        </div>
      </div>
    </PageShell>
  );
}
