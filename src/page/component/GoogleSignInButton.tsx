import { useState } from "react";
import { useGoogleLogin, useGoogleOAuth } from "@react-oauth/google";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";
import { useApi } from "../../hook/useApi";
import { authService, type LoginResponse } from "../../services/auth.service";
import { userService } from "../../services/user.service";
import type { MeResponse } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { socketService } from "../../services/socket.service";

interface GoogleSignInButtonProps {
  intent: "signin" | "signup";
}

export default function GoogleSignInButton({ intent }: GoogleSignInButtonProps) {
  const { theme, setMode } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { execute, isLoading } = useApi<LoginResponse>();
  const { execute: executeMe } = useApi<MeResponse>();
  const { setUserFromResponse, setUserFromMe } = useAuth();
  const { scriptLoadedSuccessfully } = useGoogleOAuth();
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const label = intent === "signup" ? t.auth.googleSignUp : t.auth.googleSignIn;
  const disabled = isAuthorizing || isLoading || !scriptLoadedSuccessfully;
  const isInteractiveHover = isHovered && !disabled;

  const handleLoginResult = async (result: LoginResponse | null) => {
    if (result?.token) {
      setUserFromResponse(result);
      const me = await executeMe(userService.getMe());
      if (me) {
        setUserFromMe(me);
        if (me.settings?.theme === "light" || me.settings?.theme === "dark") {
          setMode(me.settings.theme);
        }
      }
      socketService.connect();
      navigate("/home");
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token;
      if (!accessToken) {
        setIsAuthorizing(false);
        return;
      }

      try {
        const result = await execute(authService.googleLogin(accessToken));
        await handleLoginResult(result);
      } catch (error) {
        console.error("Google backend login failed", error);
      } finally {
        setIsAuthorizing(false);
      }
    },
    onError: (errorResponse) => {
      console.error("Google login failed", errorResponse);
      setIsAuthorizing(false);
    },
    onNonOAuthError: (errorResponse) => {
      console.error("Google login popup failed", errorResponse);
      setIsAuthorizing(false);
    },
  });

  const handleClick = () => {
    if (disabled) return;
    setIsAuthorizing(true);
    loginWithGoogle();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      aria-label={label}
      className="w-full h-10 rounded-md flex items-center justify-center gap-3 text-sm font-medium transition-all"
      style={{
        background: isInteractiveHover ? theme.background.input : theme.background.card,
        border: `1px solid ${isInteractiveHover ? theme.border.focused : theme.border.default}`,
        boxShadow: isInteractiveHover ? theme.shadow.input : "none",
        color: isInteractiveHover ? theme.text.accent : theme.text.primary,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
        transform: isInteractiveHover ? "translateY(-1px)" : "translateY(0)",
      }}
    >
      <span
        className="h-5 w-5 flex items-center justify-center rounded-full text-xs font-semibold"
        aria-hidden="true"
        style={{
          border: `1px solid ${isInteractiveHover ? theme.border.focused : theme.border.default}`,
          color: theme.text.accent,
          pointerEvents: "none",
        }}
      >
        G
      </span>
      <span style={{ pointerEvents: "none" }}>
        {isAuthorizing || isLoading || !scriptLoadedSuccessfully ? t.common.loading : label}
      </span>
    </button>
  );
}
