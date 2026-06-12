import { useState } from "react";
import type { AxiosError } from "axios";
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
import { useToast } from "../../context/ToastContext";
import { clearAuthSession } from "../../library/authSession";
import { isBannedAuthError } from "../../library/authError";
import instance from "../../library/axios.customize";
import LoadingDots from "./LoadingDots";

interface GoogleSignInButtonProps {
  intent: "signin" | "signup";
}

type AuthErrorResponse = {
  message?: string;
  error?: string;
  errors?: string[];
};

function getAuthErrorMessage(error: unknown): string | null {
  const axiosError = error as AxiosError<AuthErrorResponse>;
  const data = axiosError.response?.data;

  return (
    data?.message ??
    data?.error ??
    (Array.isArray(data?.errors) && data.errors.length > 0 ? data.errors[0] : null) ??
    axiosError.message ??
    null
  );
}

export default function GoogleSignInButton({ intent }: GoogleSignInButtonProps) {
  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  if (!hasGoogleClientId) return <GoogleSignInButtonFallback intent={intent} />;

  return <GoogleSignInButtonInner intent={intent} />;
}

function GoogleSignInButtonFallback({ intent }: GoogleSignInButtonProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const toast = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const label = intent === "signup" ? t.auth.googleSignUp : t.auth.googleSignIn;

  return (
    <button
      type="button"
      onClick={() => toast.error(t.auth.googleUnavailable)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={label}
      className="w-full h-10 rounded-md flex items-center justify-center gap-3 text-sm font-medium transition-all"
      style={{
        background: isHovered ? theme.background.input : theme.background.card,
        border: `1px solid ${isHovered ? theme.border.focused : theme.border.default}`,
        boxShadow: isHovered ? theme.shadow.input : "none",
        color: isHovered ? theme.text.accent : theme.text.primary,
        cursor: "pointer",
        opacity: 1,
        transform: isHovered ? "translateY(-1px)" : "translateY(0)",
      }}
    >
      <span
        className="h-5 w-5 flex items-center justify-center rounded-full text-xs font-semibold"
        aria-hidden="true"
        style={{
          border: `1px solid ${isHovered ? theme.border.focused : theme.border.default}`,
          color: theme.text.accent,
          pointerEvents: "none",
        }}
      >
        G
      </span>
      <span style={{ pointerEvents: "none" }}>{label}</span>
    </button>
  );
}

function GoogleSignInButtonInner({ intent }: GoogleSignInButtonProps) {
  const { theme, setMode } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { execute: executeMe } = useApi<MeResponse>();
  const { setUserFromResponse, setUserFromMe } = useAuth();
  const toast = useToast();
  const { scriptLoadedSuccessfully } = useGoogleOAuth();
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const label = intent === "signup" ? t.auth.googleSignUp : t.auth.googleSignIn;
  const disabled = isAuthorizing || !scriptLoadedSuccessfully;
  const isInteractiveHover = isHovered && !disabled;

  const handleLoginResult = async (result: LoginResponse | null) => {
    if (result?.token) {
      setUserFromResponse(result);
      const me = await executeMe(userService.getMe());
      if (me) {
        if (me.statusAccount === "banned") {
          clearAuthSession();
          toast.error(t.auth.accountBanned);
          return;
        }

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
    prompt: "select_account",
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token;
      if (!accessToken) {
        setIsAuthorizing(false);
        return;
      }

      try {
        const response = await instance.request<LoginResponse>(authService.googleLogin(accessToken));
        await handleLoginResult(response.data);
      } catch (error) {
        const message = getAuthErrorMessage(error);
        if (isBannedAuthError(message)) {
          toast.error(t.auth.accountBanned);
        } else {
          console.error("Google backend login failed", error);
        }
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
        {isAuthorizing || !scriptLoadedSuccessfully ? <LoadingDots label={t.common.loading} /> : label}
      </span>
    </button>
  );
}
