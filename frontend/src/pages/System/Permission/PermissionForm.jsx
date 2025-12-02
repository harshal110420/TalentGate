import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllPermissions,
  savePermission,
  resetPermissions,
  fetchPermissions,
} from "../../../features/permissions/permissionSlice";
import { Check, ChevronDown, ChevronRight, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";

const actionList = [
  "view",
  "details",
  "new",
  "edit",
  "delete",
  "print",
  "export",
  "upload",
];

const PermissionForm = ({ selectedRole, onClose }) => {
  const dispatch = useDispatch();
  const { allPermissions: permissions, loading } = useSelector(
    (state) => state.permission
  );
  const { user } = useAuth();
  console.log(user)
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedTypes, setExpandedTypes] = useState({});
  const [localPermissions, setLocalPermissions] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalPermissions, setOriginalPermissions] = useState({});

  useEffect(() => {
    if (selectedRole) {
      dispatch(fetchAllPermissions());
    }
  }, [selectedRole, dispatch]);

  useEffect(() => {
    if (permissions && Array.isArray(permissions)) {
      const transformed = {};
      const originalFlat = {};

      permissions.forEach((module) => {
        const moduleName = module.moduleName;
        transformed[moduleName] = {};

        const rolePermissions =
          module.roles?.find((r) => r.roleName === selectedRole.roleName)
            ?.permissions || [];

        const assignedMap = {};
        rolePermissions.forEach((perm) => {
          const menuId =
            typeof perm.menuId === "object" ? perm.menuId.id : perm.menuId;
          assignedMap[menuId] = perm.actions || [];
          originalFlat[menuId] = perm.actions || [];
        });

        module.menus?.forEach((menu) => {
          const menuId = typeof menu.id === "object" ? menu.id.id : menu.id;
          transformed[moduleName][menuId] = {
            name: menu.name || "Unnamed Menu",
            type: menu.type || "Other",
            actions: assignedMap[menuId] || [],
          };
        });
      });

      setLocalPermissions(transformed);
      setOriginalPermissions(originalFlat);
    }
  }, [permissions]);

  // useEffect(() => {
  //   const checkChanges = () => {
  //     const original = JSON.stringify(permissions);
  //     const current = JSON.stringify(localPermissions);
  //     setHasChanges(original !== current);
  //   };

  //   checkChanges();
  // }, [localPermissions, permissions]);

  useEffect(() => {
    const hasDiff =
      JSON.stringify(permissions) !== JSON.stringify(localPermissions);
    setHasChanges(hasDiff);
  }, [permissions, localPermissions]);

  const toggleModule = (moduleName) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  };

  const toggleType = (moduleName, type) => {
    setExpandedTypes((prev) => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        [type]: !prev?.[moduleName]?.[type],
      },
    }));
  };

  const handleCheckboxChange = (module, menuId, action) => {
    setLocalPermissions((prev) => {
      const currentActions = prev?.[module]?.[menuId]?.actions || [];
      let updatedActions = [...currentActions];

      if (currentActions.includes(action)) {
        // 👉 User is UNCHECKING the action
        if (action === "view") {
          updatedActions = [];
        } else {
          updatedActions = updatedActions.filter((a) => a !== action);
        }
      } else {
        // 👉 User is CHECKING the action
        if (action === "view") {
          updatedActions.push("view");
        } else {
          if (currentActions.includes("view")) {
            updatedActions.push(action);
          } else {
            toast.warn("Please enable 'view' before selecting other actions.");
            return prev; // Prevent state change
          }
        }
      }

      return {
        ...prev,
        [module]: {
          ...prev[module],
          [menuId]: {
            ...prev[module][menuId],
            actions: updatedActions,
          },
        },
      };
    });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const changedRequests = [];

    // Flatten and compare
    for (const [moduleName, menus] of Object.entries(localPermissions)) {
      for (const [menuId, menuData] of Object.entries(menus)) {
        const newActions = menuData.actions || [];
        const oldActions = originalPermissions[menuId] || [];

        // Compare arrays (simple diff check)
        const changed =
          newActions.length !== oldActions.length ||
          newActions.some((a) => !oldActions.includes(a));

        if (changed) {
          changedRequests.push(
            dispatch(
              savePermission({
                role: selectedRole.roleName,
                menuId,
                actions: newActions,
                actionType: "replace",
              })
            )
          );
        }
      }
    }

    if (changedRequests.length === 0) {
      toast.info("No changes to save!");
      setIsSubmitting(false);
      return;
    }

    try {
      await Promise.all(changedRequests); // 🚀 Run all updates in parallel
      console.log("selectedRole:", selectedRole)
      console.log("user role:", user.role)
      if (selectedRole.role_name === user.role) {
        await dispatch(fetchAllPermissions(selectedRole));
        await dispatch(fetchPermissions(selectedRole.roleName));
      }
      toast.success("Permissions updated successfully!");
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (err) {
      console.error("Permission update error:", err);
      toast.error("Failed to update permissions!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filterMenus = (menus) =>
    Object.entries(menus).filter(([_, menu]) =>
      menu.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // useEffect(() => {
  //   const hasDiff =
  //     JSON.stringify(permissions) !== JSON.stringify(localPermissions);
  //   setHasChanges(hasDiff);
  // }, [permissions, localPermissions]);
  // console.log("REQ USER:", req.user);

  if (loading || !selectedRole) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <svg
          className="animate-spin h-8 w-8 text-blue-600 mb-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <p className="text-gray-500 text-sm">
          Loading permissions, please wait...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-6">
      {/* Search Bar */}
      <div className="">
        <input
          type="text"
          placeholder="Search menu..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
        />
      </div>
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
        {/* <span>Role:</span> */}
        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-sm font-medium">
          {selectedRole.roleName}
        </span>
      </h1>


      {/* Permission Tables */}
      {Object.entries(localPermissions).map(([moduleName, menus]) => (
        <div
          key={moduleName}
          className="border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-900"
        >
          <div
            onClick={() => toggleModule(moduleName)}
            className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 px-5 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {moduleName}
            </h2>
            {expandedModules[moduleName] ? (
              <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-300" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-300" />
            )}
          </div>

          {expandedModules[moduleName] && (
            <div className="overflow-x-auto bg-white dark:bg-gray-900">
              {["Master", "Transaction", "Report"].map((typeKey) => {
                const menusOfType = filterMenus(menus).filter(
                  ([_, menu]) =>
                    menu.type?.toLowerCase() === typeKey.toLowerCase()
                );
                if (menusOfType.length === 0) return null;

                return (
                  <div
                    key={typeKey}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    {/* Type Header */}
                    <div
                      onClick={() => toggleType(moduleName, typeKey)}
                      className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <h3 className="font-semibold text-gray-700 dark:text-gray-100">
                        {typeKey}
                      </h3>
                      {expandedTypes?.[moduleName]?.[typeKey] ? (
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                      )}
                    </div>

                    {/* Table Content */}
                    {expandedTypes?.[moduleName]?.[typeKey] && (
                      <table className="w-full text-sm border-collapse text-gray-800 dark:text-gray-100">
                        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100">
                          <tr>
                            <th className="text-left py-2 px-4 border-b border-gray-200 dark:border-gray-700">
                              Menu
                            </th>
                            <th className="text-left py-2 px-4 border-b border-gray-200 dark:border-gray-700">
                              Type
                            </th>
                            {actionList.map((action) => (
                              <th
                                key={action}
                                className="text-center py-2 px-2 border-b border-gray-200 dark:border-gray-700 capitalize"
                              >
                                {action}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {menusOfType.map(
                            ([menuId, { name, type, actions }]) => (
                              <tr
                                key={menuId}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                              >
                                <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                                  {name}
                                </td>
                                <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 capitalize">
                                  {type}
                                </td>
                                {actionList.map((action) => (
                                  <td
                                    key={action}
                                    className="text-center border-b border-gray-200 dark:border-gray-700"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={actions?.includes(action)}
                                      disabled={
                                        action !== "view" &&
                                        !actions.includes("view")
                                      }
                                      onChange={() =>
                                        handleCheckboxChange(
                                          moduleName,
                                          menuId,
                                          action
                                        )
                                      }
                                      className="w-4 h-4 accent-blue-600 dark:accent-blue-400"
                                    />
                                  </td>
                                ))}
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Action Buttons */}
      {/* <div className="flex justify-end items-center gap-3 pt-6">
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!hasChanges || isSubmitting}
          className={`px-6 py-2 rounded-lg text-white text-sm transition ${
            hasChanges && !isSubmitting
              ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              : "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </div> */}
      <div className="flex justify-end items-center gap-1.5 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="border-2 border-amber-400 text-xs font-semibold rounded-full text-black dark:text-white px-3 py-1 hover:bg-amber-400 hover:text-white disabled:opacity-50 flex items-center"
        >
          <X className="w-4 h-4 mr-1" />
          Back
        </button>

        <button
          disabled={!hasChanges || isSubmitting}
          onClick={handleSubmit}
          className={`border-2 text-xs font-semibold rounded-full text-black dark:text-white px-3 py-1 
    flex items-center transition
    ${hasChanges
              ? "border-green-400 hover:bg-green-400 hover:text-white"
              : "border-gray-300 text-gray-400 cursor-not-allowed"
            }
    disabled:opacity-50
  `}
        >
          <Check className="w-4 h-4 mr-1" />
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>

      </div>
    </div>
  );
};

export default PermissionForm;
