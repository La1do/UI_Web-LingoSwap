import "./App.css";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { I18nProvider } from "./context/I18nContext";
import { router } from "./router/routes";

export default function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </I18nProvider>
  );
}
