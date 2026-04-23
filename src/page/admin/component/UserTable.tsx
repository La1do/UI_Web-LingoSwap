import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";

export interface AdminUser {
  _id: string;
  email: string;
  profile: { fullName: string; avatar?: string };
  settings?: { theme?: string };
  statusAccount: "active" | "banned";
  role: "user" | "admin";
  createdAt: string;
}

interface UserTableProps {
  users: AdminUser[];
  onBan: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

export default function UserTable({ users, onBan, onDelete }: UserTableProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.profile.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const avatarUrl = (u: AdminUser) =>
    u.profile.avatar && u.profile.avatar !== "default_avatar.png" ? u.profile.avatar : undefined;

  const headers = [
    t.admin.table.user, t.admin.table.email, t.admin.table.role,
    t.admin.table.status, t.admin.table.joined, t.admin.table.actions,
  ];

  return (
    <div className="flex flex-col gap-3">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t.admin.table.searchPlaceholder}
        className="w-full max-w-sm rounded-xl px-4 py-2 text-sm outline-none"
        style={{
          background: theme.background.input,
          color: theme.text.primary,
          border: `1px solid ${theme.border.default}`,
        }}
        onFocus={(e) => (e.target.style.borderColor = theme.border.focused)}
        onBlur={(e) => (e.target.style.borderColor = theme.border.default)}
      />

      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${theme.border.default}` }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: theme.background.input }}>
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: theme.text.placeholder }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-xs"
                  style={{ color: theme.text.placeholder }}>
                  {t.admin.table.noUsers}
                </td>
              </tr>
            ) : (
              filtered.map((user, i) => (
                <tr key={user._id}
                  style={{ background: i % 2 === 0 ? theme.background.card : theme.background.page }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {avatarUrl(user) ? (
                        <img src={avatarUrl(user)} alt={user.profile.fullName}
                          className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: theme.button.bg, color: theme.button.text }}>
                          {user.profile.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium truncate max-w-[120px]" style={{ color: theme.text.primary }}>
                        {user.profile.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="truncate max-w-[160px] block" style={{ color: theme.text.secondary }}>
                      {user.email}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: user.role === "admin" ? `${theme.text.accent}20` : theme.background.input,
                        color: user.role === "admin" ? theme.text.accent : theme.text.secondary,
                      }}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: user.statusAccount === "active"
                          ? `${theme.text.success}20` : `${theme.text.error}20`,
                        color: user.statusAccount === "active" ? theme.text.success : theme.text.error,
                      }}>
                      {user.statusAccount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: theme.text.placeholder }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {user.statusAccount === "active" && user.role !== "admin" && (
                        <button onClick={() => onBan(user)}
                          className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                          style={{ background: `${theme.text.error}18`, color: theme.text.error }}>
                          {t.admin.table.ban}
                        </button>
                      )}
                      {user.role !== "admin" && (
                        <button onClick={() => setConfirmDelete(user)}
                          className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                          style={{ background: theme.background.input, color: theme.text.secondary }}>
                          {t.admin.table.delete}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirm dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: theme.overlay.default }}>
          <div className="w-80 rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: theme.background.card, border: `1px solid ${theme.border.default}` }}>
            <h3 className="text-base font-semibold" style={{ color: theme.text.primary }}>
              {t.admin.deleteDialog.title}
            </h3>
            <p className="text-sm" style={{ color: theme.text.secondary }}>
              {t.admin.deleteDialog.description.replace("{name}", confirmDelete.profile.fullName)}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 rounded-xl text-sm font-medium hover:opacity-80"
                style={{ background: theme.background.input, color: theme.text.secondary }}>
                {t.admin.deleteDialog.cancel}
              </button>
              <button onClick={() => { onDelete(confirmDelete); setConfirmDelete(null); }}
                className="flex-1 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                style={{ background: theme.text.error, color: theme.button.text }}>
                {t.admin.deleteDialog.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
