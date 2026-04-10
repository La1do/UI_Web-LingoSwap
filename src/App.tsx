import "./App.css";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { I18nProvider } from "./context/I18nContext";
import { ThemeToggle } from "./page/component/ThemeToggle";
import { LanguageToggle } from "./page/component/LanguageToggle";
import { router } from "./router/routes";

export default function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
        <RouterProvider router={router} />
      </ThemeProvider>
    </I18nProvider>
  );
}
