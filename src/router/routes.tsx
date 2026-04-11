import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../page/login/LoginPage";
import RegisterPage from "../page/login/RegisterPage";
import HomePage from "../page/home/HomePage";
import MeetingPage from "../page/meeting/MeetingPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/home",
    element: <HomePage />,
  },
  {
    path: "/meeting",
    element: <MeetingPage />,
  },
]);
