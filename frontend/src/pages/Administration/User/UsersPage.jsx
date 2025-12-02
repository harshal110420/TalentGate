import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../../features/users/userSlice";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";
import ButtonWrapper from "../../../components/ButtonWrapper";
import { PlusCircle, Pencil, Key } from "lucide-react";
import { getModulePathByMenu } from "../../../utils/navigation";
import { fetchAllModules } from "../../../features/Modules/ModuleSlice";
import { fetchAllGroupedMenus } from "../../../features/menus/menuSlice";
import SkeletonPage from "../../../components/skeletons/skeletonPage";

const UsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userList = [], loading, error } = useSelector((state) => state.users);
  const modules = useSelector((state) => state.modules.list);
  const menus = useSelector((state) => state.menus.list);
  const modulePath = getModulePathByMenu("user_management", modules, menus);

  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    searchText: "",
    role: "",
    isActive: "",
    department: "",
  });

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({
          ...prev,
          searchText: value,
        }));
      }, 300),
    []
  );

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchAllModules());
    dispatch(fetchAllGroupedMenus());
    return () => debouncedSetSearch.cancel();
  }, [dispatch, debouncedSetSearch]);

  const handleTextInputChange = (value) => {
    setSearchText(value);
    debouncedSetSearch(value);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filteredUsers = useMemo(() => {
    const text = filters.searchText.toLowerCase();

    return userList.filter((user) => {
      const matchesText =
        (user.username || "").toLowerCase().includes(text) ||
        (user.mail || "").toLowerCase().includes(text) ||
        (user.mobile || "").toLowerCase().includes(text);

      const matchesRole = filters.role
        ? user.role?.displayName === filters.role
        : true;

      const matchesDepartment = filters.department
        ? user.department?.name
          ?.toLowerCase()
          .includes(filters.department.toLowerCase())
        : true;

      const matchesActive =
        filters.isActive === "true"
          ? user.isActive === true
          : filters.isActive === "false"
            ? user.isActive === false
            : true;

      return matchesText && matchesRole && matchesDepartment && matchesActive;
    });
  }, [userList, filters]);

  return (
    <div className="max-w-full px-5 py-5 font-sans text-gray-800 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          User Management
        </h1>

        <ButtonWrapper subModule="User Management" permission="new">
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 
      hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium 
      px-2 py-2 rounded-lg shadow-sm transition"
            onClick={() =>
              navigate(`/module/${modulePath}/user_management/create`)
            }
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </ButtonWrapper>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-5 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search username, email, or mobile"
          value={searchText}
          onChange={(e) => handleTextInputChange(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
        />
        <select
          value={filters.department}
          onChange={(e) => handleFilterChange("department", e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
        >
          <option value="">All Department</option>
          {[
            ...new Set(userList.map((u) => u.department?.name).filter(Boolean)),
          ].map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
        <select
          value={filters.role}
          onChange={(e) => handleFilterChange("role", e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
        >
          <option value="">All Roles</option>
          {[
            ...new Set(
              userList.map((u) => u.role?.displayName).filter(Boolean)
            ),
          ].map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <select
          value={filters.isActive}
          onChange={(e) => handleFilterChange("isActive", e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[11px] font-medium">
            <tr>
              <th className="px-4 py-3 text-left">User Info</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center sticky right-0 bg-gray-100 dark:bg-gray-800 border-l">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-950">
            {loading ? (
              <SkeletonPage rows={4} columns={5} />
            ) : error ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-red-500">
                  {error}
                </td>
              </tr>
            ) : !filteredUsers || filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-500 dark:text-gray-300"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr
                  key={user._id || user.id || index}
                  className={`${index % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-gray-50 dark:bg-gray-800"
                    } hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
                >
                  <td className="px-4 py-2">
                    <div className="font-semibold">{user.username}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {user.mail} | {user.mobile}
                    </div>
                  </td>
                  <td className="px-4 py-2">{user.department?.name || "-"}</td>
                  <td className="px-4 py-2">{user.role?.displayName || "-"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${user.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center sticky right-0 bg-gray-50 dark:bg-gray-800 border-l">

                    {/* Edit User */}
                    <ButtonWrapper subModule="User Management" permission="edit">
                      <button
                        onClick={() =>
                          navigate(
                            `/module/${modulePath}/user_management/update/${user.id}`
                          )
                        }
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full transition mr-2"
                        title="Edit User"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </ButtonWrapper>

                    {/* User Permission */}
                    <ButtonWrapper subModule="User Management" permission="edit">
                      <button
                        onClick={() =>
                          navigate(
                            `/module/${modulePath}/user_management/permission/${user.id}`
                          )
                        }
                        className="text-amber-600 hover:text-amber-800 p-1 rounded-full transition"
                        title="User Permissions"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                    </ButtonWrapper>

                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
