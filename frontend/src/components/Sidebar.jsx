import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSelector } from "react-redux";
import { useState } from "react";

const Sidebar = ({ moduleName, collapsed }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { loggedInUserPermissions: modules } = useSelector(
    (state) => state.userPermission
  );
  const [openCategory, setOpenCategory] = useState(null);

  if (!user || !modules) return null;

  const currentModule = modules.find((mod) => mod.modulePath === moduleName);

  if (!currentModule)
    return (
      <div className="p-6 text-sm text-red-600 bg-red-100 rounded-md m-4">
        🚫 No access to this module
      </div>
    );

  const modulePermissions = currentModule.menus;

  const toggleCategory = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  return (
    <aside
      className={`${collapsed ? "w-0" : "w-52"
        } h-full bg-[#1F2937] dark:bg-gray-900 text-white dark:text-gray-100 p-3 shadow-md overflow-y-auto transition-all duration-300 flex-shrink-0`}
    >
      {!collapsed && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold tracking-wide border-b border-gray-700 dark:border-gray-600 pb-2">
            {currentModule.moduleName}
          </h2>
        </div>
      )}

      <nav className="space-y-3">
        {Object.keys(modulePermissions).map((category) => {
          const categoryPermissions = modulePermissions[category];

          // Filter out menus that do not have "view" permission
          const visibleMenus = categoryPermissions?.filter((menu) =>
            menu.actions?.includes("view")
          );

          // If no visible menus in this category, don't show it
          if (!visibleMenus?.length) return null;

          return (
            <div key={category}>
              {!collapsed && (
                <>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex justify-between items-center px-4 py-2 rounded-md uppercase tracking-wider text-sm bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span>{category}</span>
                    <span className="text-xs">
                      {openCategory === category ? "\u25b2" : "\u25bc"}
                    </span>
                  </button>

                  {openCategory === category && (
                    <ul className="mt-2 pl-4 border-l border-gray-600 dark:border-gray-500 space-y-1">
                      {visibleMenus.map((subModule) => (
                        <li key={subModule.menuId}>
                          <Link
                            to={`/module/${moduleName}/${subModule.menuId}`}
                            className={`block px-2 py-2 rounded-md text-xs hover:bg-gray-700 dark:hover:bg-gray-600 transition-all ${location.pathname.includes(subModule.menuId)
                              ? "bg-gray-700 dark:bg-gray-600 font-semibold"
                              : "text-gray-300 dark:text-gray-300"
                              }`}
                          >
                            {subModule.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
