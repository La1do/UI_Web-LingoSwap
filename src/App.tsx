import "./App.css";
import { ThemeProvider } from "./context/ThemeContext";
import { ThemeToggle } from "./page/component/ThemeToggle";
import RegisterPage from "./page/login/RegisterPage";

export default function App() {
  return (
    <ThemeProvider>
      <ThemeToggle />
      <RegisterPage />
    </ThemeProvider>
  );
}
