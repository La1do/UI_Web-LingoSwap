// GoogleCallbackPage.tsx
// Google redirect về đây sau OAuth
// implicit flow: /auth/callback#access_token=xxx
// auth-code flow: /auth/callback?code=xxx
// legacy: /auth/callback?token=xxx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useApi } from "../../hook/useApi";
import { authService, type LoginResponse } from "../../services/auth.service";
import { userService } from "../../services/user.service";
import type { MeResponse } from "../../context/AuthContext";
import { useAuth } from "../../context/AuthContext";
import { socketService } from "../../services/socket.service";

export default function GoogleCallbackPage() {
  const { theme, setMode } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { execute } = useApi<LoginResponse>();
  const { execute: executeMe } = useApi<MeResponse>();
  const { setUserFromResponse, setUserFromMe } = useAuth();

  useEffect(() => {
    const handleLogin = async (result: LoginResponse | null | undefined) => {
      if (!result?.token) { navigate("/", { replace: true }); return; }
      setUserFromResponse(result);
      const me = await executeMe(userService.getMe());
      if (me) {
        setUserFromMe(me);
        if (me.settings?.theme === "light" || me.settings?.theme === "dark") {
          setMode(me.settings.theme);
        }
      }
      socketService.connect();
      navigate("/home", { replace: true });
    };

    // 1. Legacy: ?token=xxx
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("access_token", token);
      socketService.connect();
      navigate("/home", { replace: true });
      return;
    }

    // 2. auth-code flow: ?code=xxx
    const code = searchParams.get("code");
    if (code) {
      execute(authService.googleCallback(code)).then(handleLogin);
      return;
    }

    // 3. implicit flow: #access_token=xxx (URL fragment)
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get("access_token");
    if (accessToken) {
      execute(authService.googleLogin(accessToken)).then(handleLogin);
      return;
    }

    // Không có gì → về login
    navigate("/", { replace: true });
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: theme.background.page }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{ borderColor: theme.button.bg, borderTopColor: "transparent" }}
        />
        <p className="text-sm" style={{ color: theme.text.secondary }}>
          Signing in...
        </p>
      </div>
    </div>
  );
}
