import { GoogleLogin } from "@react-oauth/google";
import { useTheme } from "../../context/ThemeContext";
import { useApi } from "../../hook/useApi";
import { authService, type LoginResponse } from "../../services/auth.service";
import { userService } from "../../services/user.service";
import type { MeResponse } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { socketService } from "../../services/socket.service";

interface GoogleSignInButtonProps {
  label?: string;
}

export default function GoogleSignInButton({ label }: GoogleSignInButtonProps) {
  const { theme, setMode } = useTheme();
  const navigate = useNavigate();
  const { execute } = useApi<LoginResponse>();
  const { execute: executeMe } = useApi<MeResponse>();
  const { setUserFromResponse, setUserFromMe } = useAuth();

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential;
    if (!idToken) return;

    const result = await execute(authService.googleLogin(idToken));
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

  return (
    <div
      className="w-full flex justify-center"
      style={{
        // Override Google button style để match theme
        colorScheme: theme.background.page === "#F0F6FF" ? "light" : "dark",
      }}
    >
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.error("Google login failed")}
        text={label?.toLowerCase().includes("up") ? "signup_with" : "signin_with"}
        shape="rectangular"
        width="100%"
        useOneTap={false}
      />
    </div>
  );
}
