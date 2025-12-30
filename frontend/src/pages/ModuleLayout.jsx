import {
  useParams,
  useNavigate,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import ModuleRoutes from "../routes/ModuleRoutes";
import useUnsavedChangesWarning from "../hook/useUnsavedChangesWarning";
import { Home, Menu } from "lucide-react";
import ModuleNotFound from "../components/common/ModuleNotFound";
import ProfileIcon from "../components/common/ProfileIcon";

const ModuleLayout = () => {
  const { user } = useAuth();
  const { moduleName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDirty, setIsDirty] = useState(false);
  useUnsavedChangesWarning(isDirty);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const { loggedInUserPermissions: modules } = useSelector(
    (state) => state.userPermission
  );
  if (!user) return <Navigate to="/" />;

  const currentModule = modules.find(
    (module) => module.modulePath === moduleName
  );
  const isInvalidModule = !currentModule;
  const subModules = currentModule?.menus || {};
  const isEmptySubmodules = Object.keys(subModules).length === 0;

  const sensitiveRoutes = ["/create", "/edit", "/update"];
  const isSensitivePage = sensitiveRoutes.some((path) =>
    location.pathname.includes(path)
  );

  const handleHomeClick = () => {
    if (isSensitivePage && isDirty) {
      const confirmLeave = window.confirm(
        "Are you sure you want to leave this page? Unsaved changes will be lost."
      );
      if (!confirmLeave) return;
    }
    navigate("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">

      
      {/* Sidebar */}
      <Sidebar
        moduleName={moduleName}
        subModules={subModules}
        collapsed={isSidebarCollapsed}
      />

      {/* Main Content Area */}
      {/* Main Scrollable Area */}
      <div className="flex flex-col flex-grow overflow-hidden">
        {/* Top Navbar */}
        <div className="sticky top-0 z-50 flex justify-between items-center bg-white dark:bg-gray-800 p-2 shadow-md">
          {/* Left: Sidebar Toggle & Home */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className="text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white transition p-1"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={handleHomeClick}
              title="Go to Home"
              className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-400 transition text-xl"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Profile Icon */}
          <div className="flex items-center px-2">
            <ProfileIcon />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow overflow-auto">
          {isInvalidModule || isEmptySubmodules ? (
            <ModuleNotFound />
          ) : (
            <>
              <ModuleRoutes moduleName={moduleName} />
              <Outlet context={{ setIsDirty }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleLayout;