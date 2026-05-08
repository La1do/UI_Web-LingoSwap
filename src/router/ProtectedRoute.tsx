import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Role được phép vào route này */
  role: "user" | "admin";
}

/**
 * Guard logic:
 * - Chưa đăng nhập → redirect về login tương ứng với role yêu cầu
 * - Đăng nhập nhưng sai role → logout + redirect về login tương ứng
 * - Đúng role → render children
 */
export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, isAuthenticated, logout } = useAuth();

  // Chưa đăng nhập
  if (!isAuthenticated || !user) {
    return <Navigate to={role === "admin" ? "/admin/login" : "/login"} replace />;
  }

  // Đăng nhập nhưng sai role
  if (user.role !== role) {
    logout();
    return <Navigate to={role === "admin" ? "/admin/login" : "/login"} replace />;
  }

  return <>{children}</>;
}
