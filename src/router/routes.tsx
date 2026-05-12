import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../page/login/LoginPage";
import RegisterPage from "../page/login/RegisterPage";
import GoogleCallbackPage from "../page/login/GoogleCallbackPage";
import HomePage from "../page/home/HomePage";
import WaitingPage from "../page/waiting/WaitingPage";
import MeetingPage from "../page/meeting/MeetingPage";
import ReviewPage from "../page/review/ReviewPage";
import ProfilePage from "../page/profile/ProfilePage";
import AdminPage from "../page/admin/AdminPage";
import AdminLoginPage from "../page/admin/AdminLoginPage";
import DirectCallPage from "../page/direct-call/DirectCallPage";
import CallEndedPage from "../page/call-ended/CallEndedPage";
import ForgotPasswordPage from "../page/forgot-password/ForgotPasswordPage";
import MessagesPage from "../page/messages/MessagesPage";
import AppealPage from "../page/appeal/AppealPage";
import ProtectedRoute from "./ProtectedRoute";
import NotFoundPage from "../page/error/NotFoundPage";
import ErrorPage from "../page/error/ErrorPage";

// ─── Helpers ─────────────────────────────────────────────────

const user = (element: React.ReactNode) => (
  <ProtectedRoute role="user">{element}</ProtectedRoute>
);

const admin = (element: React.ReactNode) => (
  <ProtectedRoute role="admin">{element}</ProtectedRoute>
);

// ─── Router ──────────────────────────────────────────────────

export const router = createBrowserRouter([
  // ── Root với errorElement bắt mọi runtime crash ──────────
  {
    path: "/",
    errorElement: <ErrorPage />,
    children: [
      // ── Public (cả 2 role) ────────────────────────────────
      { index: true,              element: <LoginPage /> },
      { path: "login",            element: <LoginPage /> },
      { path: "register",         element: <RegisterPage /> },
      { path: "forgot-password",  element: <ForgotPasswordPage /> },
      { path: "auth/callback",    element: <GoogleCallbackPage /> },
      { path: "appeal",           element: <AppealPage /> },

      // ── Admin public ──────────────────────────────────────
      { path: "admin/login",      element: <AdminLoginPage /> },

      // ── User protected ────────────────────────────────────
      { path: "home",             element: user(<HomePage />) },
      { path: "waiting",          element: user(<WaitingPage />) },
      { path: "direct-call",      element: user(<DirectCallPage />) },
      { path: "call-ended",       element: user(<CallEndedPage />) },
      { path: "meeting",          element: user(<MeetingPage />) },
      { path: "review",           element: user(<ReviewPage />) },
      { path: "profile",          element: user(<ProfilePage />) },
      { path: "messages",         element: user(<MessagesPage />) },

      // ── Admin protected ───────────────────────────────────
      { path: "admin",            element: admin(<AdminPage />) },

      // ── 404 ───────────────────────────────────────────────
      { path: "*",                element: <NotFoundPage /> },
    ],
  },
]);
