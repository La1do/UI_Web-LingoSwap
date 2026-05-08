import { useTheme } from "../../context/ThemeContext";

// ─── Logo placeholder — thay bằng import thật khi có logo ────
// import logoUrl from "../../assets/logo.png";
const LOGO_URL: string | null = null;

interface ErrorLayoutProps {
  code: string;
  title: string;
  description: string;
  actions: React.ReactNode;
}

export default function ErrorLayout({ code, title, description, actions }: ErrorLayoutProps) {
  const { theme } = useTheme();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 gap-8"
      style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Logo */}
      <div>
        {LOGO_URL ? (
          <img src={LOGO_URL} alt="LingoSwap" className="w-12 h-12 rounded-2xl object-contain" />
        ) : (
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black"
            style={{ background: theme.button.bg, color: theme.button.text }}
          >
            L
          </div>
        )}
      </div>

      {/* Error code — decorative background */}
      <div className="relative flex items-center justify-center select-none">
        <span
          className="text-[8rem] font-black leading-none pointer-events-none"
          style={{ color: `${theme.text.placeholder}18` }}
        >
          {code}
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: `${theme.text.error}12`,
              border: `1.5px solid ${theme.text.error}30`,
            }}
          >
            {code === "404" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7"
                style={{ color: theme.text.error }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7"
                style={{ color: theme.text.error }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-2 text-center max-w-sm">
        <h1 className="text-2xl font-bold" style={{ color: theme.text.primary }}>
          {title}
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: theme.text.secondary }}>
          {description}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        {actions}
      </div>

      {/* App name footer */}
      <p className="text-xs tracking-widest uppercase" style={{ color: theme.text.placeholder }}>
        LingoSwap
      </p>
    </div>
  );
}
