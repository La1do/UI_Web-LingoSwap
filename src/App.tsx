import "./App.css";
import { useEffect } from "react";
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
import AuthSocketBanListener from "./page/component/AuthSocketBanListener";

function AppContent() {
  const { isInitializing } = useAuth();

  useEffect(() => {
    window.history.scrollRestoration = "manual";

    let previousLocationKey = router.state.location.key;
    const unsubscribe = router.subscribe((state) => {
      if (state.location.key === previousLocationKey) return;

      previousLocationKey = state.location.key;
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    return () => {
      unsubscribe();
      window.history.scrollRestoration = "auto";
    };
  }, []);

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
              <AuthSocketBanListener />
              <ToastContainer />
            </ToastProvider>
          </FriendProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
