import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";
import { useAuth } from "../../context/AuthContext";
import ErrorLayout from "./ErrorLayout";

export default function NotFoundPage() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const homeTarget = user?.role === "admin" ? "/admin" : "/home";

  return (
    <ErrorLayout
      code="404"
      title={t.error.notFoundTitle}
      description={t.error.notFoundDesc}
      actions={
        <>
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
