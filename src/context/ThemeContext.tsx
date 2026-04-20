import React, { createContext, useContext, useEffect, useState } from "react";
import { lightTheme, darkTheme, type AppTheme } from "../theme/theme";

type Mode = "light" | "dark";

interface ThemeContextValue {
  mode: Mode;
  theme: AppTheme;
  toggle: () => void;
  setMode: (mode: Mode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "light",
  theme: lightTheme,
  toggle: () => {},
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    return (localStorage.getItem("theme") as Mode) ?? "light";
  });

  const theme = mode === "light" ? lightTheme : darkTheme;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", mode);
    localStorage.setItem("theme", mode);
  }, [mode]);

  const toggle = () => setMode((m) => (m === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ mode, theme, toggle, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
