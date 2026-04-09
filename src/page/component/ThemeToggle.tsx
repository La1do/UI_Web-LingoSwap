import { useTheme } from "../../context/ThemeContext";

export function ThemeToggle() {
  const { mode, toggle, theme } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 999,
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: "50%",
        border: `1px solid ${theme.border.default}`,
        background: theme.background.card,
        color: theme.text.accent,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.1rem",
        boxShadow: theme.shadow.card,
        transition: "background 0.2s, border 0.2s",
      }}
    >
      {mode === "light" ? "🌙" : "☀️"}
    </button>
  );
}
