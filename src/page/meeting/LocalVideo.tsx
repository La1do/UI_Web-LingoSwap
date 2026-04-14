// LocalVideo.tsx — Camera của người dùng hiện tại
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

interface LocalVideoProps {
  stream?: MediaStream | null;
  isMuted?: boolean;
  isCameraOff?: boolean;
}

export default function LocalVideo({
  stream,
  isMuted = false,
  isCameraOff = false,
}: LocalVideoProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStream, setHasStream] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      setHasStream(true);
    }
  }, [stream]);

  return (
    <div
      className="relative rounded-xl overflow-hidden flex items-center justify-center"
      style={{
        background: theme.background.input,
        border: `1px solid ${theme.border.default}`,
        width: "180px",
        height: "120px",
      }}
    >
      {hasStream && !isCameraOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
      ) : (
        <div className="flex flex-col items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-8 h-8" style={{ color: theme.text.placeholder }}>
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            {isCameraOff && <line x1="1" y1="1" x2="23" y2="23" />}
          </svg>
          <span className="text-[10px]" style={{ color: theme.text.placeholder }}>
            {isCameraOff ? "Camera tắt" : "Không có camera"}
          </span>
        </div>
      )}

      {/* Mute indicator */}
      {isMuted && (
        <div
          className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: theme.text.error }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} className="w-3 h-3">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
            <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </div>
      )}

      {/* Label */}
      <div
        className="absolute bottom-1.5 left-2 text-[10px] font-medium"
        style={{ color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
      >
        {user?.fullName ?? "Bạn"}
      </div>
    </div>
  );
}
