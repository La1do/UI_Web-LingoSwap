import { useNavigate, useRouteError } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";
import { useAuth } from "../../context/AuthContext";
import ErrorLayout from "./ErrorLayout";

export default function ErrorPage() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const routeError = useRouteError() as { status?: number } | null;

  // Nếu React Router báo 404 → dùng NotFoundPage style
  const is404 = routeError?.status === 404;
  const homeTarget = user?.role === "admin" ? "/admin" : "/home";

  return (
    <ErrorLayout
      code={is404 ? "404" : "500"}
      title={is404 ? t.error.notFoundTitle : t.error.errorTitle}
      description={is404 ? t.error.notFoundDesc : t.error.errorDesc}
      actions={
        <>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{
              background: theme.background.input,
              color: theme.text.secondary,
              border: `1px solid ${theme.border.default}`,
            }}
          >
            {t.error.retry}
          </button>

          {isAuthenticated ? (
            <button
              onClick={() => navigate(homeTarget, { replace: true })}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ background: theme.button.bg, color: theme.button.text }}
            >
              {t.error.backToHome}
            </button>
          ) : (
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ background: theme.button.bg, color: theme.button.text }}
            >
              {t.error.backToLogin}
            </button>
          )}
        </>
      }
    />
  );
}
