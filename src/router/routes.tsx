import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../page/login/LoginPage";
import RegisterPage from "../page/login/RegisterPage";
import MeetingPage from "../page/meeting/MeetingPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: <MeetingPage />,
  },
]);
