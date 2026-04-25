import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";
import { socketService, type MatchFoundPayload } from "../../services/socket.service";

type CallState = "calling" | "rejected" | "error" | "timeout";

const TIMEOUT_SEC = 30;

export default function DirectCallPage() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const targetId = searchParams.get("target") ?? "";
  const targetName = searchParams.get("name") ?? targetId;
  const targetAvatar = searchParams.get("avatar") ?? "";

  const [state, setState] = useState<CallState>("calling");
  const [countdown, setCountdown] = useState(TIMEOUT_SEC);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Emit direct call request
    socketService.emitDirectCallRequest(targetId);

    // Countdown
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          setState("timeout");
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    // Lắng nghe match_found — khi bên kia accept
    socketService.onReady((s) => {
      s.off("match_found").on("match_found", (payload: MatchFoundPayload) => {
        clearInterval(timerRef.current!);
        navigate(`/meeting?session=${payload.sessionId}&partner=${payload.partnerId}`, { replace: true });
      });

      s.off("direct_match_rejected").on("direct_match_rejected", () => {
        clearInterval(timerRef.current!);
        setState("rejected");
      });

      s.off("direct_match_error").on("direct_match_error", () => {
        clearInterval(timerRef.current!);
        setState("error");
      });
    });

    return () => {
      clearInterval(timerRef.current!);
      socketService.getSocket()?.off("match_found");
      socketService.getSocket()?.off("direct_match_rejected");
      socketService.getSocket()?.off("direct_match_error");
    };
  }, []);

  const handleCancel = () => {
    clearInterval(timerRef.current!);
    // Không có emit cancel riêng — chỉ navigate về home
    navigate("/home", { replace: true });
  };

  const isCalling = state === "calling";
  const statusText = {
    calling: t.directCall.waitingResponse,
    rejected: t.directCall.rejected,
    error: t.directCall.error,
    timeout: t.directCall.timeout,
  }[state];

  const isError = state !== "calling";

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif" }}
    >
      <div
        className="flex flex-col items-center gap-6 p-10 rounded-3xl"
        style={{
          background: theme.background.card,
          border: `1px solid ${theme.border.default}`,
          boxShadow: theme.shadow.card,
          minWidth: "320px",
        }}
      >
        {/* Avatar */}
        <div className="relative">
          {/* Pulse ring khi đang gọi */}
          {isCalling && (
            <>
              <span className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{ background: theme.button.bg }} />
              <span className="absolute inset-0 rounded-full animate-ping opacity-20 delay-300"
                style={{ background: theme.button.bg, animationDelay: "0.3s" }} />
            </>
          )}
          {targetAvatar && targetAvatar !== "default_avatar.png" ? (
            <img src={targetAvatar} alt={targetName}
              className="w-24 h-24 rounded-full object-cover relative z-10"
              style={{ border: `3px solid ${isCalling ? theme.button.bg : isError ? theme.text.error : theme.text.success}` }}
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-semibold relative z-10"
              style={{
                background: theme.button.bg,
                color: theme.button.text,
                border: `3px solid ${isCalling ? theme.button.bg : isError ? theme.text.error : theme.text.success}`,
              }}
            >
              {targetName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: theme.text.placeholder }}>
            {t.directCall.calling}
          </p>
          <h2 className="text-xl font-semibold" style={{ color: theme.text.primary }}>
            {targetName}
          </h2>
        </div>

        {/* Status */}
        <p className="text-sm" style={{ color: isError ? theme.text.error : theme.text.secondary }}>
          {statusText}
          {isCalling && (
            <span className="ml-1" style={{ color: theme.text.placeholder }}>
              ({countdown}s)
            </span>
          )}
        </p>

        {/* Spinner khi đang gọi */}
        {isCalling && (
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: theme.button.bg, borderTopColor: "transparent" }}
          />
        )}

        {/* Actions */}
        {isCalling ? (
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ background: theme.text.error, color: theme.button.text }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            {t.directCall.cancel}
          </button>
        ) : (
          <button
            onClick={() => navigate("/home", { replace: true })}
            className="text-sm hover:opacity-80 transition-opacity"
            style={{ color: theme.text.accent }}
          >
            {t.directCall.backToHome}
          </button>
        )}
      </div>
    </div>
  );
}
