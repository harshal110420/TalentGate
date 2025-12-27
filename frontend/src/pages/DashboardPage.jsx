import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyPermissions } from "../features/UserPermission/userPermissionSlice";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import DashboardSkeleton from "../components/skeletons/DashboardSkeleton";
import Navbar from "../components/Navbar";           // ⭐ New import

const Dashboard = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchMyPermissions(user.id));
    }
  }, [user, dispatch]);

  const { loggedInUserPermissions = [], loading } = useSelector(
    (state) => state.userPermission || {}
  );

  if (!user) return null;

  const visibleModules = loggedInUserPermissions.filter((module) => {
    const menus = module?.menus || {};
    const allMenus = Object.values(menus).flat();
    return allMenus.some((menu) => menu.actions?.includes("view"));
  });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">

      {/* ⭐ Navbar now included here */}
      <Navbar />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          Welcome, {user.username}
        </h1>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {visibleModules.map((mod) => (
              <Link
                key={mod.modulePath}
                to={`/module/${mod.modulePath}`}
                className="bg-white dark:bg-gray-800 p-6 shadow-md rounded-xl hover:shadow-lg"
              >
                <h3 className="text-lg font-bold">
                  {mod.moduleName} Module
                </h3>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
