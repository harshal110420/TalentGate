import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Dashboard from "./pages/DashboardPage";
import ModuleLayout from "./pages/ModuleLayout";
import PrivateRoute from "./components/auth/privateRoute.jsx";
import GuestRoute from "./components/auth/GuestRoute.jsx";
import LoginPage from "./pages/LoginPage";
import GlobalNotFound from "./components/common/GlobalNotFound.jsx";

import ExamLoginPage from "./pages/ExamLoginPage";
import ExamUIPreview from "./pages/ExamUIPreview.jsx";
import ExamCompleted from "./pages/ExamCompleted.jsx";
import JobList from "./pages/JobList.jsx";

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { socket } from "./socket";
import { pushNotification } from "./features/Notification/notificationSlice";

/* ---------------- SOCKET BINDER ---------------- */
function SocketBinder() {
  const { user } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?.id) return;

    console.log("🚀 SOCKET CONNECT for user:", user.id);

    socket.connect();

    socket.on("connect", () => {
      console.log("🟢 SOCKET CONNECTED:", socket.id);
      socket.emit("join_user", user.id);
    });

    socket.on("notification:new", (data) => {
      console.log("🔔 NOTIFICATION RECEIVED:", data);
      dispatch(pushNotification(data));
      toast.info(`${data.title}: ${data.message}`);
    });

    return () => {
      console.log("🔴 SOCKET CLEANUP");
      socket.off("notification:new");
      socket.disconnect();
    };
  }, [user?.id, dispatch]);

  return null;
}

/* ---------------- ROUTES ---------------- */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/jobs" element={<JobList />} />

      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />

      <Route path="/exam-login" element={<ExamLoginPage />} />
      <Route path="/exam-ui" element={<ExamUIPreview />} />
      <Route path="/exam-completed" element={<ExamCompleted />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/module/:moduleName/*"
        element={
          <PrivateRoute>
            <ModuleLayout />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<GlobalNotFound />} />
    </Routes>
  );
}

/* ---------------- APP ---------------- */
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <SocketBinder />
          <AppRoutes />
          <ToastContainer position="top-center" autoClose={1500} />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
