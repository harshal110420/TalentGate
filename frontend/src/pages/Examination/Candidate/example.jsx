import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../../features/users/userSlice";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";
import ButtonWrapper from "../../../components/ButtonWrapper";
import { PlusCircle, Pencil } from "lucide-react";
import { getModulePathByMenu } from "../../../utils/navigation";
import { fetchModules } from "../../../features/Modules/ModuleSlice";
import { fetchGroupedMenus } from "../../../features/menus/menuSlice";
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
    dispatch(fetchModules());
    dispatch(fetchGroupedMenus());
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

      return (
        matchesText &&
        (filters.role ? user.role?.displayName === filters.role : true) &&
        (filters.department
          ? user.department?.name
              ?.toLowerCase()
              .includes(filters.department.toLowerCase())
          : true) &&
        (filters.isActive
          ? filters.isActive === "active"
            ? user.isActive === true
            : user.isActive === false
          : true)
      );
    });
  }, [userList, filters]);

  return (
    <div className="max-w-full px-4 py-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          User Management
        </h1>

        <ButtonWrapper subModule="User Management" permission="new">
          <button
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-sm transition-all duration-200 hover:shadow-md"
            onClick={() =>
              navigate(`/module/${modulePath}/user_management/create`)
            }
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create</span>
          </button>
        </ButtonWrapper>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-[1000px] w-full text-sm text-gray-700 dark:text-gray-200">
          <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase">
            <tr>
              <th className="px-3 py-1.5 text-left">User Info</th>
              <th className="px-3 py-1.5 text-left">Department</th>
              <th className="px-3 py-1.5 text-left">Role</th>
              <th className="px-3 py-1.5 text-left">Status</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
            <tr className="bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-sm text-sm">
              <th className="px-3 py-2">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => handleTextInputChange(e.target.value)}
                  placeholder="Search username, email, or mobile"
                  className="w-full px-2 py-1 border text-xs border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </th>
              <th className="px-3 py-2">
                <select
                  value={filters.department}
                  onChange={(e) =>
                    handleFilterChange("department", e.target.value)
                  }
                  className="w-full border px-2 py-1.5 text-sm rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Department</option>
                  {[
                    ...new Set(
                      userList.map((u) => u.department?.name).filter(Boolean)
                    ),
                  ].map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </th>
              <th className="px-3 py-2">
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange("role", e.target.value)}
                  className="w-full border px-2 py-1.5 text-sm rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              </th>
              <th className="px-3 py-2">
                <select
                  value={filters.isActive}
                  onChange={(e) =>
                    handleFilterChange("isActive", e.target.value)
                  }
                  className="w-full border px-2 py-1.5 text-sm rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody className="text-gray-800 dark:text-gray-100 text-sm">
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
                  className={`${
                    index % 2 === 0
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
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <ButtonWrapper
                      subModule="User Management"
                      permission="edit"
                    >
                      <button
                        onClick={() =>
                          navigate(
                            `/module/${modulePath}/user_management/update/${user.id}`
                          )
                        }
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Edit User"
                      >
                        <Pencil className="w-4 h-4 inline" />
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
