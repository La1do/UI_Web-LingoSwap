// MeetingPage.tsx — Layout chính của màn hình video call
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";
import { useAuth } from "../../context/AuthContext";
import PageShell from "../../layout/PageShell";
import RemoteVideo from "./RemoteVideo";
import LocalVideo from "./LocalVideo";
import ChatPanel from "./ChatPanel";
import { socketService } from "../../services/socket.service";
import { useWebRTC } from "../../hook/useWebRTC";

export default function MeetingPage() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isChatOpen, setIsChatOpen] = useState(true);

  const sessionId = searchParams.get("session");
  const partnerId = searchParams.get("partner");
  const startTimeRef = useRef(Date.now());

  // Caller = user có id xuất hiện đầu tiên trong sessionId (deterministic)
  // sessionId là MongoDB ObjectId — dùng hash đơn giản để tránh cả 2 cùng là callee
  const isCaller = !!user && !!sessionId && !!partnerId &&
    (sessionId + user.id) > (sessionId + partnerId);

  console.log(`[Meeting] userId=${user?.id} | partnerId=${partnerId} | isCaller=${isCaller}`);

  const {
    localStream,
    remoteStream,
    isConnected,
    isMuted,
    isCameraOff,
    permission,
    toggleMute,
    toggleCamera,
    cleanup,
  } = useWebRTC(sessionId, isCaller);

  const endCall = (replace = false) => {
    console.log("[endCall] triggered | sessionId:", sessionId, "| partnerId:", partnerId);
    cleanup();
    socketService.leaveQueue();
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    navigate(`/review?session=${sessionId}&partner=${partnerId}&duration=${duration}`, { replace });
  };

  useEffect(() => {
    socketService.onPartnerDisconnected(() => {
      endCall(true);
    });
    return () => {
      socketService.offMatchingEvents();
    };
  }, []);

  return (
    <PageShell controlsPosition="top-right" hideLanguage>
    <div
      className="min-h-screen flex flex-col"
      style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Permission banner */}
      {(permission === "denied" || permission === "unavailable") && (
        <div className="px-4 py-3 text-sm flex items-center gap-3"
          style={{ background: `${theme.text.error}18`, borderBottom: `1px solid ${theme.text.error}40`, color: theme.text.error }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 shrink-0">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {permission === "unavailable"
            ? "Camera/mic không khả dụng. Trang cần chạy trên HTTPS hoặc localhost."
            : "Quyền truy cập camera/mic bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt và tải lại trang."}
        </div>
      )}
      {/* Main content */}
      <div className="flex flex-1 gap-3 p-4 overflow-hidden" style={{ minHeight: 0 }}>

        {/* Video area */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Remote video — full area */}
          <div className="flex-1 relative" style={{ minHeight: 0 }}>
            <RemoteVideo isConnected={isConnected} participantName={partnerId ?? t.meeting.waitingForConnection} stream={remoteStream} />

            {/* Local video — picture-in-picture */}
            <div className="absolute bottom-4 right-4">
              <LocalVideo isMuted={isMuted} isCameraOff={isCameraOff} stream={localStream} />
            </div>
          </div>

          {/* Controls bar */}
          <div
            className="flex items-center justify-center gap-3 py-3 px-4 rounded-2xl"
            style={{
              background: theme.background.card,
              border: `1px solid ${theme.border.default}`,
            }}
          >
            {/* Mute */}
            <ControlBtn active={isMuted} activeColor={theme.text.error} inactiveColor={theme.button.bg}
              onClick={toggleMute} label={isMuted ? t.meeting.unmuteMic : t.meeting.muteMic}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                {isMuted ? (
                  <>
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
                    <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </>
                ) : (
                  <>
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                    <path d="M19 10v2a7 7 0 01-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </>
                )}
              </svg>
            </ControlBtn>

            {/* Camera */}
            <ControlBtn
              active={isCameraOff}
              activeColor={theme.text.error}
              inactiveColor={theme.button.bg}
              onClick={toggleCamera}
              label={isCameraOff ? t.meeting.turnOnCamera : t.meeting.turnOffCamera}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                {isCameraOff ? (
                  <>
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M21 21H3a2 2 0 01-2-2V8a2 2 0 012-2h3m3-3h6l2 3h4a2 2 0 012 2v9.34" />
                    <circle cx="12" cy="13" r="3" />
                  </>
                ) : (
                  <>
                    <path d="M23 7l-7 5 7 5V7z" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </>
                )}
              </svg>
            </ControlBtn>

            {/* Chat toggle */}
            <ControlBtn
              active={isChatOpen}
              activeColor={theme.button.bg}
              inactiveColor={theme.background.input}
              onClick={() => setIsChatOpen((v) => !v)}
              label={t.meeting.chat}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </ControlBtn>

            {/* End call */}
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: theme.text.error, color: "#fff" }} aria-label={t.meeting.endCall}
              onClick={() => endCall()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7 2 2 0 012 2v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.42 19.42 0 013.43 9.19 19.79 19.79 0 01.36 .54 2 2 0 012.35 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.33 7.91" />
                <line x1="23" y1="1" x2="1" y2="23" />
              </svg>
              {t.meeting.endCall}
            </button>
          </div>
        </div>

        {/* Chat panel */}
        {isChatOpen && (
          <div className="w-72 shrink-0" style={{ minHeight: 0 }}>
            <div className="h-full" style={{ minHeight: "500px" }}>
              <ChatPanel partnerId={partnerId ?? ""} sessionId={sessionId ?? ""} />
            </div>
          </div>
        )}
      </div>
    </div>
    </PageShell>
  );
}

// --- Small helper for control buttons ---
function ControlBtn({
  children,
  active,
  activeColor,
  inactiveColor,
  onClick,
  label,
}: {
  children: React.ReactNode;
  active: boolean;
  activeColor: string;
  inactiveColor: string;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all hover:opacity-80"
      style={{ background: active ? activeColor : inactiveColor, color: "#fff" }}
    >
      {children}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
