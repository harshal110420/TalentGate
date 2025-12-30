import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./pages/DashboardPage";
import ModuleLayout from "./pages/ModuleLayout";
import PrivateRoute from "./components/auth/privateRoute.jsx";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import GlobalNotFound from "./components/common/GlobalNotFound.jsx";
import GuestRoute from "./components/auth/GuestRoute.jsx";
import { ThemeProvider } from "./context/ThemeContext";
import ExamLoginPage from "./pages/ExamLoginPage";
import ExamUIPreview from "./pages/ExamUIPreview.jsx";
import ExamCompleted from "./pages/ExamCompleted.jsx";
import JobList from "./pages/JobList.jsx";

// -------------- 🔔 Notification + Socket Setup --------------
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "./socket";                                     // ⭐ socket connect
import { pushNotification } from "./features/Notification/notificationSlice";

function AppContent() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  socket.on("connect", () => console.log("🟢 socket connected:", socket.id));
  socket.on("disconnect", () => console.log("🔴 socket disconnected"));

  // ------ 🔔 Real-time notification listener ------
  useEffect(() => {
    if (!user?.id) return;

    // join private room
    socket.emit("join_user", user.id);

    // listen new notifications
    socket.on("notification:new", (data) => {
      console.log("🔥 Realtime:", data);
      dispatch(pushNotification(data));
      toast.info(`${data.title}: ${data.message}`);
    });

    return () => socket.off("notification:new");
  }, [user, dispatch]);

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

// ---------- 🧭 App Wrapper ----------
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
          <ToastContainer position="top-center" autoClose={1500} />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
