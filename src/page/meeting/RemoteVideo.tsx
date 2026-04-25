// RemoteVideo.tsx — Màn hình hiển thị video của đối phương
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";

interface RemoteVideoProps {
  stream?: MediaStream | null;
  participantName?: string;
  isConnected?: boolean;
  trackCount?: number; // tăng mỗi khi có track mới → trigger re-check
}

export default function RemoteVideo({
  stream,
  participantName = "Đối phương",
  isConnected = false,
  trackCount = 0,
}: RemoteVideoProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideoTrack, setHasVideoTrack] = useState(false);

  // Set srcObject khi stream thay đổi
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (stream) {
      video.srcObject = stream;
      video.play().catch(() => {});
    } else {
      video.srcObject = null;
      setHasVideoTrack(false);
    }
  }, [stream]);

  // Re-check video tracks mỗi khi trackCount tăng (có track mới được add)
  useEffect(() => {
    if (!stream) return;
    const hasVid = stream.getVideoTracks().length > 0;
    console.log(`[RemoteVideo] trackCount=${trackCount}, videoTracks=${stream.getVideoTracks().length}, hasVid=${hasVid}`);
    setHasVideoTrack(hasVid);
    // Đảm bảo video đang play
    if (hasVid && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [stream, trackCount]);

  const showVideo = !!stream && hasVideoTrack;

  return (
    <div
      className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center"
      style={{
        background: theme.background.card,
        border: `1px solid ${theme.border.default}`,
        minHeight: "360px",
      }}
    >
      {/* Video luôn mount */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
        style={{ display: showVideo ? "block" : "none" }}
      />

      {/* Placeholder */}
      {!showVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-semibold"
            style={{ background: theme.button.bg, color: theme.button.text }}
          >
            {participantName.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm" style={{ color: theme.text.secondary }}>
            {isConnected ? `${participantName} ${t.meeting.cameraOff}` : t.meeting.waitingForConnection}
          </p>
        </div>
      )}

      {/* Name tag */}
      <div
        className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-medium"
        style={{ background: theme.overlay.default, color: theme.button.text }}
      >
        {participantName}
      </div>

      {/* Connection status */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full"
          style={{ background: isConnected ? theme.text.success : theme.text.error }} />
        <span className="text-xs" style={{ color: theme.button.text, textShadow: `0 1px 3px ${theme.overlay.default}` }}>
          {isConnected ? t.meeting.connected : t.meeting.notConnected}
        </span>
      </div>
    </div>
  );
}
