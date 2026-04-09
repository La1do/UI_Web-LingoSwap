import "./App.css";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ThemeToggle } from "./page/component/ThemeToggle";
import { router } from "./router/routes";

export default function App() {
  return (
    <ThemeProvider>
      <ThemeToggle />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
