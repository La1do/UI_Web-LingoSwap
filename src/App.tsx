import "./App.css";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { I18nProvider } from "./context/I18nContext";
import { AuthProvider } from "./context/AuthContext";
import { FriendProvider } from "./context/FriendContext";
import { router } from "./router/routes";

export default function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <FriendProvider>
            <RouterProvider router={router} />
          </FriendProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
