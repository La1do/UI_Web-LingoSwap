import { useRef, useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { useI18n } from "../../../context/I18nContext";
import { useApi } from "../../../hook/useApi";
import { userService } from "../../../services/user.service";

export default function ProfileCard() {
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();
  const { t } = useI18n();
  const { execute } = useApi<{ avatar: string }>();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const avatarUrl = preview ?? (user.avatar !== "default_avatar.png" ? user.avatar : undefined);

  const handleSelect = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Chỉ chấp nhận file ảnh."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("File không được vượt quá 2MB."); return; }
    setError(null);
    setPreview(URL.createObjectURL(file));
    setPendingFile(file);
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", pendingFile);
    const result = await execute(userService.uploadAvatar(formData));
    if (result) {
      updateUser({ avatar: result.avatar });
      setPreview(null);
      setPendingFile(null);
    } else {
      setError("Tải lên thất bại. Vui lòng thử lại.");
    }
    setUploading(false);
  };

  const handleCancel = () => {
    setPreview(null);
    setPendingFile(null);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleSelect(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleSelect(file);
  };

  return (
    <div
      className="flex flex-col items-center gap-4 p-6 rounded-2xl"
      style={{ background: theme.background.card, border: `1px solid ${theme.border.default}` }}
    >
      {/* Avatar */}
      <div
        className="relative group cursor-pointer"
        onClick={() => !pendingFile && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={user.fullName}
            className="w-24 h-24 rounded-full object-cover"
            style={{
              border: `3px solid ${isDragging ? theme.text.accent : theme.button.bg}`,
              opacity: uploading ? 0.5 : 1,
            }}
          />
        ) : (
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
            style={{
              background: theme.button.bg, color: theme.button.text,
              border: `3px solid ${isDragging ? theme.text.accent : theme.button.bg}`,
              opacity: uploading ? 0.5 : 1,
            }}>
            {user.fullName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Hover overlay — chỉ hiện khi chưa có pending */}
        {!pendingFile && (
          <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "rgba(0,0,0,0.55)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} className="w-5 h-5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="text-[10px] font-medium text-white">{t.profile.uploadAvatar}</span>
          </div>
        )}

        {isDragging && (
          <div className="absolute inset-0 rounded-full border-2 border-dashed"
            style={{ borderColor: theme.text.accent }} />
        )}

        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
          className="hidden" onChange={handleFileChange} />
      </div>

      {/* Preview actions */}
      {pendingFile && (
        <div className="flex gap-2">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
            style={{ background: theme.button.bg, color: theme.button.text }}
          >
            {uploading ? t.profile.uploading : "Cập nhật ảnh"}
          </button>
          <button
            onClick={handleCancel}
            disabled={uploading}
            className="px-4 py-1.5 rounded-xl text-xs font-medium hover:opacity-80 transition-opacity"
            style={{ background: theme.background.input, color: theme.text.secondary, border: `1px solid ${theme.border.default}` }}
          >
            Huỷ
          </button>
        </div>
      )}

      {/* Hint */}
      {!pendingFile && (
        <p className="text-[11px] text-center max-w-[200px]" style={{ color: theme.text.placeholder }}>
          {t.profile.uploadAvatarHint}
        </p>
      )}

      {/* Error */}
      {error && <p className="text-xs" style={{ color: theme.text.error }}>{error}</p>}

      {/* Name & email */}
      <div className="text-center">
        <h2 className="text-xl font-semibold" style={{ color: theme.text.primary }}>{user.fullName}</h2>
        <p className="text-sm mt-0.5" style={{ color: theme.text.secondary }}>{user.email}</p>
      </div>

      {/* Stats */}
      <div className="flex gap-6 pt-2 w-full" style={{ borderTop: `1px solid ${theme.border.default}` }}>
        <div className="flex-1 text-center">
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: theme.text.placeholder }}>
            {t.profile.language}
          </p>
          <p className="text-sm font-medium" style={{ color: theme.text.primary }}>{user.language || "—"}</p>
        </div>
        <div className="flex-1 text-center" style={{ borderLeft: `1px solid ${theme.border.default}` }}>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: theme.text.placeholder }}>
            {t.profile.proficiencyLevel}
          </p>
          <p className="text-sm font-medium" style={{ color: theme.text.primary }}>{user.proficiencyLevel || "—"}</p>
        </div>
      </div>
    </div>
  );
}
