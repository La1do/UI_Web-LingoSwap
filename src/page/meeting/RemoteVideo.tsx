// RemoteVideo.tsx — Màn hình hiển thị video của đối phương
import { useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

interface RemoteVideoProps {
  stream?: MediaStream | null;
  participantName?: string;
  isConnected?: boolean;
}

export default function RemoteVideo({
  stream,
  participantName = "Đối phương",
  isConnected = false,
}: RemoteVideoProps) {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (stream) {
      video.srcObject = stream;
      video.play().catch(() => {});
    } else {
      video.srcObject = null;
    }
  }, [stream]);

  const hasVideo = !!stream;

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
        style={{ display: hasVideo ? "block" : "none" }}
      />

      {/* Placeholder */}
      {!hasVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-semibold"
            style={{ background: theme.button.bg, color: theme.button.text }}
          >
            {participantName.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm" style={{ color: theme.text.secondary }}>
            {isConnected ? `${participantName} đã tắt camera` : "Đang chờ kết nối..."}
          </p>
        </div>
      )}

      {/* Name tag */}
      <div
        className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-medium"
        style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}
      >
        {participantName}
      </div>

      {/* Connection status */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full"
          style={{ background: isConnected ? theme.text.success : theme.text.error }} />
        <span className="text-xs" style={{ color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
          {isConnected ? "Đã kết nối" : "Chưa kết nối"}
        </span>
      </div>
    </div>
  );
}
