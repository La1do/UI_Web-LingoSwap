import { useTheme } from "../../context/ThemeContext";

// ─── Thay đường dẫn này khi có logo thật ─────────────────────
// Đặt file logo vào src/assets/logo.png rồi đổi dòng dưới thành:
// import logoUrl from "../../assets/logo.png";
const LOGO_URL: string | null = null; // null = dùng placeholder chữ "L"

export default function AppLoader() {
  const { theme } = useTheme();

  return (
    <div
      className="fixed inset-0 z-9 flex flex-col items-center justify-center gap-6"
      style={{ background: theme.background.page }}
    >
      <style>{`
        @keyframes spinLogo {
          0%   { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.08); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scaleX(1); }
          50%       { opacity: 1;   transform: scaleX(1.15); }
        }
        .spin-logo {
          animation: spinLogo 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .pulse-bar {
          animation: pulse 1.4s ease-in-out infinite;
        }
      `}</style>

      {/* Logo spinner */}
      <div className="spin-logo">
        {LOGO_URL ? (
          <img
            src={LOGO_URL}
            alt="LingoSwap"
            className="w-16 h-16 rounded-2xl object-contain"
            style={{ boxShadow: `0 8px 32px ${theme.button.bg}40` }}
          />
        ) : (
          /* Placeholder — xoá khi có logo thật */
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black"
            style={{
              background: theme.button.bg,
              color: theme.button.text,
              boxShadow: `0 8px 32px ${theme.button.bg}50`,
            }}
          >
            L
          </div>
        )}
      </div>

      {/* Loading bar */}
      <div
        className="w-24 h-1 rounded-full overflow-hidden"
        style={{ background: `${theme.button.bg}25` }}
      >
        <div
          className="pulse-bar h-full rounded-full"
          style={{ background: theme.button.bg }}
        />
      </div>

      {/* App name */}
      <p
        className="text-xs font-semibold tracking-[0.25em] uppercase"
        style={{ color: theme.text.placeholder }}
      >
        LingoSwap
      </p>
    </div>
  );
}
