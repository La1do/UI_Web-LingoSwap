import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";
import { useApi } from "../../hook/useApi";
import { userService } from "../../services/user.service";

interface PublicProfile {
  _id: string;
  profile: { fullName: string; avatar: string };
}

export default function CallEndedPage() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { execute } = useApi<PublicProfile>();

  const partnerId = searchParams.get("partner") ?? "";
  const duration = Number(searchParams.get("duration") ?? 0);
  const [profile, setProfile] = useState<PublicProfile | null>(null);

  useEffect(() => {
    if (!partnerId) return;
    execute(userService.getPublicProfile(partnerId)).then((data) => {
      if (data) setProfile(data);
    });
  }, [partnerId]);

  const mins = Math.floor(duration / 60);
  const secs = String(duration % 60).padStart(2, "0");
  const durationStr = `${mins}:${secs}`;

  const name = profile?.profile.fullName ?? partnerId;
  const avatar = profile?.profile.avatar;
  const validAvatar = avatar && avatar !== "default_avatar.png" ? avatar : undefined;

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif" }}
    >
      <div
        className="flex flex-col items-center gap-5 p-10 rounded-3xl"
        style={{
          background: theme.background.card,
          border: `1px solid ${theme.border.default}`,
          boxShadow: theme.shadow.card,
          minWidth: "300px",
        }}
      >
        {/* Icon kết thúc */}
        <div className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: `${theme.text.error}18`, border: `2px solid ${theme.text.error}` }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"
            style={{ color: theme.text.error }}>
            <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7 2 2 0 012 2v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.42 19.42 0 013.43 9.19 19.79 19.79 0 01.36.54 2 2 0 012.35 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.33 7.91" />
            <line x1="23" y1="1" x2="1" y2="23" />
          </svg>
        </div>

        <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>{t.callEnded.ended}</p>

        {/* Avatar + tên */}
        <div className="flex flex-col items-center gap-2">
          {validAvatar ? (
            <img src={validAvatar} alt={name}
              className="w-20 h-20 rounded-full object-cover"
              style={{ border: `3px solid ${theme.border.default}` }} />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ background: theme.button.bg, color: theme.button.text }}>
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="text-lg font-semibold" style={{ color: theme.text.primary }}>{name}</p>
          {duration > 0 && (
            <p className="text-xs px-3 py-1 rounded-full"
              style={{ background: theme.background.input, color: theme.text.placeholder }}>
              ⏱ {durationStr}
            </p>
          )}
        </div>

        <button
          onClick={() => navigate("/home", { replace: true })}
          className="mt-2 px-8 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
          style={{ background: theme.button.bg, color: theme.button.text }}
        >
          {t.callEnded.backHome}
        </button>
      </div>
    </div>
  );
}
