// GoogleCallbackPage.tsx
// Backend redirect về đây sau khi Google OAuth hoàn tất
// URL dạng: /auth/callback?token=xxx hoặc /auth/callback?code=xxx

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useApi } from "../../hook/useApi";
import { authService, type LoginResponse } from "../../services/auth.service";
import { socketService } from "../../services/socket.service";

export default function GoogleCallbackPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { execute } = useApi<LoginResponse>();

  useEffect(() => {
    const token = searchParams.get("token");
    const code = searchParams.get("code");

    if (token) {
      // Backend trả token thẳng qua query param
      localStorage.setItem("access_token", token);
      socketService.connect();
      navigate("/home", { replace: true });
    } else if (code) {
      // Backend trả code → frontend đổi lấy token
      execute(authService.googleCallback(code)).then((result) => {
        if (result?.token) {
          localStorage.setItem("access_token", result.token);
          socketService.connect();
          navigate("/home", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      });
    } else {
      // Không có gì → về login
      navigate("/", { replace: true });
    }
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: theme.background.page }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: theme.button.bg, borderTopColor: "transparent" }}
        />
        <p className="text-sm" style={{ color: theme.text.secondary }}>
          Signing in...
        </p>
      </div>
    </div>
  );
}
