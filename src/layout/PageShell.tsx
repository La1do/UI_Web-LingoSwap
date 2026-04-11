import type { ReactNode } from "react";
import { ThemeToggle } from "../page/component/ThemeToggle";
import { LanguageToggle } from "../page/component/LanguageToggle";

// ─── Types ───────────────────────────────────────────────────

type Position =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "none";

interface PageShellProps {
  children: ReactNode;
  /** Vị trí của cụm controls (theme + language). Default: "none" */
  controlsPosition?: Position;
  /** Chỉ hiện ThemeToggle, ẩn LanguageToggle */
  hideLanguage?: boolean;
  /** Chỉ hiện LanguageToggle, ẩn ThemeToggle */
  hideTheme?: boolean;
}

// ─── Position styles ─────────────────────────────────────────

const POSITION_STYLE: Record<Position, string> = {
  "top-left":     "top-3 left-3",
  "top-right":    "top-4 right-4",
  "bottom-left":  "bottom-3 left-3",
  "bottom-right": "bottom-3 right-3",
  "none":         "hidden",
};

// ─── Component ───────────────────────────────────────────────

export default function PageShell({
  children,
  controlsPosition = "none",
  hideLanguage = false,
  hideTheme = false,
}: PageShellProps) {
  const showControls = controlsPosition !== "none" && (!hideLanguage || !hideTheme);

  return (
    <div className="relative min-h-screen">
      {children}

      {showControls && (
        <div className={`fixed z-50 flex items-center gap-2 ${POSITION_STYLE[controlsPosition]}`}>
          {!hideLanguage && <LanguageToggle />}
          {!hideTheme && <ThemeToggle />}
        </div>
      )}
    </div>
  );
}
