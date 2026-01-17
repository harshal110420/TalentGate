import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSelector } from "react-redux";
import { useState } from "react";
import { ChevronDown, ChevronUp, Folder } from "lucide-react";

const Sidebar = ({ moduleName, collapsed }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { loggedInUserPermissions: modules } = useSelector(
    (state) => state.userPermission
  );
  const [openCategory, setOpenCategory] = useState(null);

  if (!user || !modules) return null;

  const currentModule = modules.find(
    (mod) => mod.modulePath === moduleName
  );

  if (!currentModule) {
    return (
      <div className="m-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
        🚫 No access to this module
      </div>
    );
  }

  const modulePermissions = currentModule.menus;

  const toggleCategory = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  return (
    <aside
      className={`
        ${collapsed ? "w-0 opacity-0" : "w-64 opacity-100"}
        transition-all duration-300
        h-full flex-shrink-0
        bg-[#F9FAFB]
        text-gray-900
        border-r border-gray-200
        overflow-y-auto
      `}
    >
      {!collapsed && (
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold tracking-tight">
            {currentModule.moduleName}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage & explore
          </p>
        </div>
      )}

      <nav className="px-4 py-5 space-y-5">
        {Object.keys(modulePermissions).map((category) => {
          const visibleMenus = modulePermissions[category]?.filter(
            (menu) => menu.actions?.includes("view")
          );

          if (!visibleMenus?.length) return null;

          const isOpen = openCategory === category;

          return (
            <div key={category}>
              {/* Category */}
              <button
                onClick={() => toggleCategory(category)}
                className={`
                  w-full flex items-center justify-between
                  px-4 py-2.5 rounded-lg
                  text-sm font-medium uppercase tracking-wide
                  bg-white border border-gray-200
                  hover:bg-gray-50
                  transition
                `}
              >
                <span className="flex items-center gap-2 text-gray-700">
                  <Folder size={14} className="text-indigo-500" />
                  {category}
                </span>

                {isOpen ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>

              {/* Menus */}
              <div
                className={`
                  overflow-hidden transition-all duration-300
                  ${isOpen ? "max-h-96 mt-3" : "max-h-0"}
                `}
              >
                <ul className="pl-5 space-y-1 border-l border-gray-200">
                  {visibleMenus.map((subModule) => {
                    const isActive =
                      location.pathname.includes(subModule.menuId);

                    return (
                      <li key={subModule.menuId}>
                        <Link
                          to={`/module/${moduleName}/${subModule.menuId}`}
                          className={`
                            block px-3 py-2 rounded-md text-sm
                            transition
                            ${isActive
                              ? "bg-indigo-50 text-indigo-700 font-medium ring-1 ring-indigo-200"
                              : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                            }
                          `}
                        >
                          {subModule.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
