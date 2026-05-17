import "./App.css";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { I18nProvider } from "./context/I18nContext";
import { AuthProvider } from "./context/AuthContext";
import { FriendProvider } from "./context/FriendContext";
import { ToastProvider } from "./context/ToastContext";
import { router } from "./router/routes";
import { useAuth } from "./context/AuthContext";
import AppLoader from "./page/component/AppLoader";
import ToastContainer from "./page/component/ToastContainer";

function AppContent() {
  const { isInitializing } = useAuth();
  if (isInitializing) return <AppLoader />;
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <FriendProvider>
            <ToastProvider>
              <AppContent />
              <ToastContainer />
            </ToastProvider>
          </FriendProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
