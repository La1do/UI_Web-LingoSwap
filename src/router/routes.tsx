import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../page/login/LoginPage";
import RegisterPage from "../page/login/RegisterPage";
import GoogleCallbackPage from "../page/login/GoogleCallbackPage";
import HomePage from "../page/home/HomePage";
import WaitingPage from "../page/waiting/WaitingPage";
import MeetingPage from "../page/meeting/MeetingPage";
import ReviewPage from "../page/review/ReviewPage";
import ProfilePage from "../page/profile/ProfilePage";

export const router = createBrowserRouter([
  { path: "/",              element: <LoginPage /> },
  { path: "/register",      element: <RegisterPage /> },
  { path: "/auth/callback", element: <GoogleCallbackPage /> },
  { path: "/home",          element: <HomePage /> },
  { path: "/waiting",       element: <WaitingPage /> },
  { path: "/meeting",       element: <MeetingPage /> },
  { path: "/review",        element: <ReviewPage /> },
  { path: "/profile",       element: <ProfilePage /> },
]);
