// ============================================================
//  theme.ts — Light & Dark tokens (Blue + White palette)
// ============================================================

export const lightTheme = {
  background: {
    page:    "#F0F6FF",
    card:    "#FFFFFF",
    input:   "#F5F9FF",
  },
  text: {
    primary:     "#0A1628",
    secondary:   "#4A6080",
    placeholder: "#9BB0C8",
    accent:      "#1A6FD4",
    error:       "#D94F4F",
    success:     "#2E9E6B",
  },
  border: {
    default: "#C8DDEF",
    focused: "#1A6FD4",
    error:   "#D94F4F",
  },
  button: {
    bg:         "#1A6FD4",
    bgHover:    "#1560BE",
    bgDisabled: "#C8DDEF",
    text:       "#FFFFFF",
  },
  shadow: {
    card:  "0 8px 40px rgba(26,111,212,0.10)",
    glow:  "0 0 24px rgba(26,111,212,0.08)",
    input: "0 0 0 3px rgba(26,111,212,0.15)",
  },
} as const;

export const darkTheme = {
  background: {
    page:    "#0A1628",
    card:    "#0F1E38",
    input:   "#162340",
  },
  text: {
    primary:     "#E8F1FF",
    secondary:   "#7A9CC0",
    placeholder: "#3A5470",
    accent:      "#4D9FFF",
    error:       "#FF6B6B",
    success:     "#4DC98A",
  },
  border: {
    default: "#1E3A5F",
    focused: "#4D9FFF",
    error:   "#FF6B6B",
  },
  button: {
    bg:         "#1A6FD4",
    bgHover:    "#2280F0",
    bgDisabled: "#1E3A5F",
    text:       "#FFFFFF",
  },
  shadow: {
    card:  "0 8px 48px rgba(0,0,0,0.5)",
    glow:  "0 0 32px rgba(77,159,255,0.10)",
    input: "0 0 0 3px rgba(77,159,255,0.18)",
  },
} as const;

// Use a structural type with string values so both themes are assignable
export interface AppTheme {
  background: { page: string; card: string; input: string };
  text: { primary: string; secondary: string; placeholder: string; accent: string; error: string; success: string };
  border: { default: string; focused: string; error: string };
  button: { bg: string; bgHover: string; bgDisabled: string; text: string };
  shadow: { card: string; glow: string; input: string };
}
