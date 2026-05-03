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
import StreakDemoPage from "../page/streak-demo/StreakDemoPage";
import DirectCallPage from "../page/direct-call/DirectCallPage";
import CallEndedPage from "../page/call-ended/CallEndedPage";
import ForgotPasswordPage from "../page/forgot-password/ForgotPasswordPage";
import MessagesPage from "../page/messages/MessagesPage";

export const router = createBrowserRouter([
  { path: "/",                element: <LoginPage /> },
  { path: "/login",           element: <LoginPage /> },
  { path: "/register",        element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/auth/callback",   element: <GoogleCallbackPage /> },
  { path: "/home",            element: <HomePage /> },
  { path: "/waiting",         element: <WaitingPage /> },
  { path: "/direct-call",     element: <DirectCallPage /> },
  { path: "/call-ended",      element: <CallEndedPage /> },
  { path: "/meeting",         element: <MeetingPage /> },
  { path: "/review",          element: <ReviewPage /> },
  { path: "/profile",         element: <ProfilePage /> },
  { path: "/admin",           element: <AdminPage /> },
  { path: "/admin/login",     element: <AdminLoginPage /> },
  { path: "/streak-demo",     element: <StreakDemoPage /> },
  { path: "/messages",        element: <MessagesPage /> },
]);
