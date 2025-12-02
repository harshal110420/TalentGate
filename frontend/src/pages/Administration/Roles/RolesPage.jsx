import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRoles } from "../../../features/Roles/rolesSlice";
import ButtonWrapper from "../../../components/ButtonWrapper";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";
import { Pencil, PlusCircle } from "lucide-react";
import { getModulePathByMenu } from "../../../utils/navigation";
import SkeletonPage from "../../../components/skeletons/skeletonPage"; // 👈 Import the skeleton

const RolesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { roles = [], loading, error } = useSelector((state) => state.roles);
  const modules = useSelector((state) => state.modules.list);
  const menus = useSelector((state) => state.menus.list);
  const modulePath = getModulePathByMenu("role_management", modules, menus);

  const [searchInput, setSearchInput] = useState(""); // raw input
  const [searchRoleName, setSearchRoleName] = useState(""); // debounced filter
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchRoleName(value);
      }, 300),
    []
  );

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  };

  const filteredRoles = roles.filter((role) => {
    const matchesName = role.displayName
      .toLowerCase()
      .includes(searchRoleName.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? role.isActive === true
        : role.isActive === false;
    return matchesName && matchesStatus;
  });

  return (
    <div className="max-w-full px-5 py-5 font-sans text-gray-800 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Role Management
        </h1>
        <ButtonWrapper subModule="Role Management" permission="new">
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 
      hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium 
      px-2 py-2 rounded-lg shadow-sm transition"
            onClick={() =>
              navigate(`/module/${modulePath}/role_management/create`)
            }
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Role</span>
          </button>
        </ButtonWrapper>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-5 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          value={searchInput}
          onChange={handleSearchChange}
          placeholder="Search role name..."
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[11px] font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Role Name</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center sticky right-0 bg-gray-100 dark:bg-gray-800 border-l">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-950">
            {loading ? (
              <SkeletonPage rows={4} columns={3} />
            ) : filteredRoles.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="text-center py-6 text-gray-500 dark:text-gray-300"
                >
                  No roles found.
                </td>
              </tr>
            ) : (
              filteredRoles.map((role, index) => (
                <tr
                  key={role.roleId}
                  className={`transition-colors duration-150 ${
                    index % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50 dark:bg-gray-800"
                  } hover:bg-blue-50 dark:hover:bg-gray-700`}
                >
                  <td className="px-4 py-2">{role.displayName}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        role.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {role.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center sticky right-0 bg-gray-50 dark:bg-gray-800 border-l">
                    <ButtonWrapper
                      subModule="Role Management"
                      permission="edit"
                    >
                      <button
                        onClick={() =>
                          navigate(
                            `/module/${modulePath}/role_management/update/${role.id}`
                          )
                        }
                        title="Edit Role"
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full transition"
                      >
                        <Pencil className="w-4 h-4" />
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

export default RolesPage;
