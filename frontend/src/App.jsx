import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./pages/DashboardPage"; // ✅
import ModuleLayout from "./pages/ModuleLayout"; // ✅
import PrivateRoute from "./components/auth/privateRoute.jsx"; // ✅
import { AuthProvider } from "./context/AuthContext"; // ✅
import LoginPage from "./pages/LoginPage"; // ✅
import GlobalNotFound from "./components/common/GlobalNotFound.jsx";
import GuestRoute from "./components/auth/GuestRoute.jsx";
import { ThemeProvider } from "./context/ThemeContext";
import ExamLoginPage from "./pages/ExamLoginPage"; // ✅ Add this
import ExamUIPreview from "./pages/ExamUIPreview.jsx";
import ExamCompleted from "./pages/ExamCompleted.jsx";
import JobList from "./pages/JobList.jsx";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* ✅ PUBLIC ROUTE */}
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

            {/* 🔴 Catch-All Global Fallback */}
            <Route path="*" element={<GlobalNotFound />} />
          </Routes>

          {/* ToastContainer is placed here to display notifications globally */}
          <ToastContainer position="top-center" autoClose={1500} />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
