// UserPermissionForm.jsx
import React, { use, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAllPermissions,
} from "../../../features/permissions/permissionSlice";
import {
    fetchMyPermissions,
    fetchPermissionsByUser,
    saveUserPermission,
} from "../../../features/UserPermission/userPermissionSlice";
import { Check, ChevronDown, ChevronRight, X } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getModulePathByMenu } from "../../../utils/navigation";
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

const UserPermissionForm = ({ selectedUser, onClose }) => {
    const { user } = useAuth();
    console.log("user:", user)
    // selectedUser should be the user object (contains id, username, role etc)
    const dispatch = useDispatch();
    const { allPermissions: permissions, loading: permsLoading } = useSelector(
        (state) => state.permission
    );
    const {
        selectedUserPermissions: userPermModules,
        loading: userPermsLoading,
    } = useSelector((state) => state.userPermission);

    const [expandedModules, setExpandedModules] = useState({});
    const [expandedTypes, setExpandedTypes] = useState({});
    const [localPermissions, setLocalPermissions] = useState({});
    const [originalPermissions, setOriginalPermissions] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [hasChanges, setHasChanges] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const modules = useSelector((state) => state.modules.list);
    const menus = useSelector((state) => state.menus.list);
    const modulePath = getModulePathByMenu("user_management", modules, menus);


    useEffect(() => {
        if (selectedUser?.id) {
            dispatch(fetchAllPermissions());
            dispatch(fetchPermissionsByUser(selectedUser.id));
        }
    }, [selectedUser, dispatch]);

    // Build localPermissions after both APIs are loaded
    useEffect(() => {
        if (!permissions || !Array.isArray(permissions)) return;
        if (!userPermModules || !Array.isArray(userPermModules)) return;

        // Build a map from userPermModules: map[moduleName][menuId] => actions[]
        const userMap = {}; // { moduleName: { menuIdString: actions[] } }
        for (const mod of userPermModules) {
            const mName = mod.moduleName;
            userMap[mName] = userMap[mName] || {};
            const menusObj = mod.menus || {}; // grouped object { Master: [...], ... }
            // Flatten menus
            const flat = [...(menusObj.Master || []), ...(menusObj.Transaction || []), ...(menusObj.Report || [])];
            for (const menu of flat) {
                // menu.id might be number, menuId may be code — we will prefer numeric id
                const menuIdStr = String(menu.id);
                userMap[mName][menuIdStr] = menu.actions || [];
            }
        }

        // Now build transformed object from master permissions (fetchAllPermissions)
        const transformed = {}; // { moduleName: { menuId: { name, type, actions } } }
        const originalFlat = {}; // { menuId: actions[] }  (for change detection)

        for (const mod of permissions) {
            const moduleName = mod.moduleName;
            transformed[moduleName] = {};
            mod.menus?.forEach((menu) => {
                const menuIdStr = String(menu.id); // ensure string key
                const actions = (userMap[moduleName] && userMap[moduleName][menuIdStr]) || [];
                transformed[moduleName][menuIdStr] = {
                    name: menu.name || "Unnamed Menu",
                    type: menu.type || "Other",
                    actions: Array.isArray(actions) ? actions.slice() : [],
                };
                originalFlat[menuIdStr] = Array.isArray(actions) ? actions.slice() : [];
            });
        }

        setLocalPermissions(transformed);
        setOriginalPermissions(originalFlat);
        setHasChanges(false);
    }, [permissions, userPermModules]);

    useEffect(() => {
        // Compare originalFlat and current localPermissions to set hasChanges
        const currFlat = {};
        for (const [modName, menus] of Object.entries(localPermissions)) {
            for (const [menuId, data] of Object.entries(menus)) {
                currFlat[menuId] = data.actions || [];
            }
        }
        // simple JSON compare per menu
        let changed = false;
        const allMenuIds = new Set([...Object.keys(originalPermissions), ...Object.keys(currFlat)]);
        for (const id of allMenuIds) {
            const a = originalPermissions[id] || [];
            const b = currFlat[id] || [];
            if (a.length !== b.length || a.some(x => !b.includes(x))) {
                changed = true; break;
            }
        }
        setHasChanges(changed);
    }, [localPermissions, originalPermissions]);

    const toggleModule = (moduleName) => {
        setExpandedModules((prev) => ({ ...prev, [moduleName]: !prev[moduleName] }));
    };
    const toggleType = (moduleName, type) => {
        setExpandedTypes((prev) => ({ ...prev, [moduleName]: { ...prev[moduleName], [type]: !prev?.[moduleName]?.[type] } }));
    };

    const handleCheckboxChange = (module, menuId, action) => {
        setLocalPermissions((prev) => {
            const currentActions = prev?.[module]?.[menuId]?.actions || [];
            let updatedActions = [...currentActions];

            if (currentActions.includes(action)) {
                // uncheck
                if (action === "view") updatedActions = [];
                else updatedActions = updatedActions.filter((a) => a !== action);
            } else {
                // check
                if (action === "view") updatedActions.push("view");
                else {
                    if (currentActions.includes("view")) updatedActions.push(action);
                    else {
                        toast.warn("Please enable 'view' before selecting other actions.");
                        return prev;
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

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const requests = [];

        for (const [moduleName, menus] of Object.entries(localPermissions)) {
            for (const [menuId, menuData] of Object.entries(menus)) {
                const newActions = menuData.actions || [];
                const oldActions = originalPermissions[menuId] || [];
                const changed = newActions.length !== oldActions.length || newActions.some(a => !oldActions.includes(a));
                if (changed) {
                    // dispatch user permission save (replace)
                    requests.push(
                        dispatch(saveUserPermission({
                            userId: selectedUser.id,
                            menuId: Number(menuId), // send numeric id
                            actions: newActions,
                            actionType: "replace",
                        }))
                    );
                }
            }
        }

        if (requests.length === 0) {
            toast.info("No changes to save");
            setIsSubmitting(false);
            return;
        }

        try {
            await Promise.all(requests);
            console.log("selectedUser:", selectedUser)
            console.log("user id:", user.id)
            if (selectedUser.id === user.id) {
                await dispatch(fetchPermissionsByUser(selectedUser.id));
                await dispatch(fetchMyPermissions(user.id));
            }
            toast.success("Permissions updated successfully!");
            goBack();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save user permissions");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filterMenus = (menus) =>
        Object.entries(menus).filter(([_, menu]) => menu.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (permsLoading || userPermsLoading || !selectedUser) {
        return (
            <div className="py-10 text-center">
                <div className="animate-spin h-6 w-6 border-4 border-blue-600 rounded-full mx-auto mb-2" />
                <div>Loading permissions...</div>
            </div>
        );
    }

    const goBack = () => {
        navigate(`/module/${modulePath}/user_management`);
    };

    return (
        <div className="space-y-6 px-4 py-6">
            <div>
                <input
                    type="text"
                    placeholder="Search menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                />
            </div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                {/* <span>Role:</span> */}
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-sm font-medium">
                    {selectedUser.firstName} {selectedUser.lastName}
                </span>
            </h1>

            {Object.entries(localPermissions).map(([moduleName, menus]) => (
                <div key={moduleName} className="border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-900"
                >
                    <div onClick={() => toggleModule(moduleName)} className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 px-5 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
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
                                const menusOfType = filterMenus(menus).filter(([_, menu]) => menu.type?.toLowerCase() === typeKey.toLowerCase());
                                if (menusOfType.length === 0) return null;
                                return (
                                    <div key={typeKey}
                                        className="border-t border-gray-200 dark:border-gray-700"
                                    >
                                        <div onClick={() => toggleType(moduleName, typeKey)}
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

                                        {expandedTypes?.[moduleName]?.[typeKey] && (
                                            <table className="w-full text-sm border-collapse text-gray-800 dark:text-gray-100">
                                                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100">
                                                    <tr>
                                                        <th className="text-left py-2 px-4 border-b border-gray-200 dark:border-gray-700">
                                                            Menu</th>
                                                        <th className="text-left py-2 px-4 border-b border-gray-200 dark:border-gray-700">
                                                            Type</th>
                                                        {actionList.map(a => <th key={a}
                                                            className="text-center py-2 px-2 border-b border-gray-200 dark:border-gray-700 capitalize"
                                                        >
                                                            {a}</th>)}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {menusOfType.map(([menuId, { name, type, actions }]) => (
                                                        <tr key={menuId} className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                                        >
                                                            <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                                                                {name}
                                                            </td>
                                                            <td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                                                                {type}
                                                            </td>
                                                            {actionList.map(action => (
                                                                <td key={action} className="text-center border-b border-gray-200 dark:border-gray-700">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={actions?.includes(action)}
                                                                        disabled={action !== "view" && !actions.includes("view")}
                                                                        onChange={() => handleCheckboxChange(moduleName, menuId, action)}
                                                                        className="w-4 h-4 accent-blue-600 dark:accent-blue-400"
                                                                    />
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
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

            <div className="flex justify-end items-center gap-1.5 mt-6">
                <button
                    onClick={goBack}
                    className="border-2 border-amber-400 text-xs font-semibold rounded-full text-black dark:text-white px-3 py-1 hover:bg-amber-400 hover:text-white disabled:opacity-50 flex items-center"
                > <X className="w-4 h-4 mr-1" />
                    Back
                </button>

                <button
                    disabled={!hasChanges || isSubmitting}
                    onClick={handleSubmit}
                    className={`border-2 text-xs font-semibold rounded-full text-black dark:text-white px-3 py-1 
                                flex items-center transition
                                ${hasChanges
                            ? "border-green-400 hover:bg-green-400 hover:text-white"
                            : "border-gray-500 text-gray-600 cursor-not-allowed"
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

export default UserPermissionForm;
