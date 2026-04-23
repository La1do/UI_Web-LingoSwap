import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { socketService } from "../../../services/socket.service";
import { useApi } from "../../../hook/useApi";
import { userService } from "../../../services/user.service";

interface CallerInfo {
  _id: string;
  profile: { fullName: string; avatar?: string };
}

const AUTO_DISMISS_MS = 30_000;

export default function IncomingCallModal() {
  const { theme } = useTheme();
  const { locale } = useI18n();
  const navigate = useNavigate();
  const { execute } = useApi<CallerInfo>();

  const [callerId, setCallerId] = useState<string | null>(null);
  const [caller, setCaller] = useState<CallerInfo | null>(null);
  const [rejected, setRejected] = useState(false);

  const t = locale === "vi"
    ? { incoming: "Cuộc gọi đến", accept: "Bắt máy", reject: "Từ chối", rejected: "Cuộc gọi bị từ chối" }
    : { incoming: "Incoming call", accept: "Accept", reject: "Decline", rejected: "Call declined" };

  // Listen for incoming calls
  useEffect(() => {
    socketService.onDirectCallOffer(({ callerId: id }) => {
      setCallerId(id);
      setRejected(false);
      // Fetch caller info
      execute(userService.getPublicProfile(id)).then((data) => {
        if (data) setCaller(data);
      });
    });

    socketService.onDirectCallRejected(() => {
      setRejected(true);
      setTimeout(() => { setCallerId(null); setCaller(null); setRejected(false); }, 2000);
    });

    socketService.onDirectCallError(({ message }) => {
      console.warn("[DirectCall] Error:", message);
      setCallerId(null);
      setCaller(null);
    });

    return () => socketService.offDirectCallEvents();
  }, []);

  // Auto dismiss after 30s
  useEffect(() => {
    if (!callerId) return;
    const timer = setTimeout(() => {
      if (callerId) {
        socketService.emitDirectCallResponse(callerId, false);
        setCallerId(null);
        setCaller(null);
      }
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [callerId]);

  const handleAccept = () => {
    if (!callerId) return;
    socketService.emitDirectCallResponse(callerId, true);
    setCallerId(null);
    setCaller(null);
    // Backend sẽ emit match_found → navigate handled by useMatching
    // Tạm thời navigate waiting để xử lý
    navigate("/meeting");
  };

  const handleReject = () => {
    if (!callerId) return;
    socketService.emitDirectCallResponse(callerId, false);
    setCallerId(null);
    setCaller(null);
  };

  if (!callerId) return null;

  const avatarUrl = caller?.profile.avatar && caller.profile.avatar !== "default_avatar.png"
    ? caller.profile.avatar : undefined;
  const displayName = caller?.profile.fullName ?? callerId;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-72 rounded-2xl p-4 flex flex-col gap-4"
      style={{
        background: theme.background.card,
        border: `1px solid ${theme.border.default}`,
        boxShadow: theme.shadow.card,
      }}
    >
      {/* Caller info */}
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-12 h-12 rounded-full object-cover shrink-0"
            style={{ border: `2px solid ${theme.button.bg}` }} />
        ) : (
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
            style={{ background: theme.button.bg, color: theme.button.text }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium" style={{ color: theme.text.accent }}>{t.incoming}</p>
          <p className="text-sm font-semibold truncate" style={{ color: theme.text.primary }}>{displayName}</p>
        </div>

        {/* Ringing animation */}
        <div className="ml-auto shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6"
            style={{ color: theme.text.accent, animation: "ring 1s ease-in-out infinite" }}>
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </div>
      </div>

      {/* Actions */}
      {rejected ? (
        <p className="text-xs text-center" style={{ color: theme.text.placeholder }}>{t.rejected}</p>
      ) : (
        <div className="flex gap-2">
          <button onClick={handleReject}
            className="flex-1 py-2 rounded-xl text-xs font-medium hover:opacity-80 transition-opacity"
            style={{ background: theme.background.input, color: theme.text.secondary, border: `1px solid ${theme.border.default}` }}>
            {t.reject}
          </button>
          <button onClick={handleAccept}
            className="flex-1 py-2 rounded-xl text-xs font-semibold hover:opacity-80 transition-opacity"
            style={{ background: theme.text.success, color: theme.button.text }}>
            {t.accept}
          </button>
        </div>
      )}

      <style>{`
        @keyframes ring {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-15deg); }
          40% { transform: rotate(15deg); }
          60% { transform: rotate(-10deg); }
          80% { transform: rotate(10deg); }
        }
      `}</style>
    </div>
  );
}
