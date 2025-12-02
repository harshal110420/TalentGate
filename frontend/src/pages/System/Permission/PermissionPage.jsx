/**
 * ⚠️ NOTE:
 * This page is meant for assigning/editing permissions for existing roles only.
 * No "Create New" button is shown here.
 *
 * To create a new permission entry:
 *   - First create a new Role in the Roles page.
 *   - Then it will automatically appear in this page.
 *   - Use ✏️ icon to assign permissions to it.
 */

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPermissions } from "../../../features/permissions/permissionSlice";
import { fetchAllRoles } from "../../../features/Roles/rolesSlice";
import PermissionsForm from "./PermissionForm";
import debounce from "lodash.debounce";
import ButtonWrapper from "../../../components/ButtonWrapper";
import { Pencil } from "lucide-react";

const PermissionsPage = () => {
  const dispatch = useDispatch();
  const { allPermissions, loading } = useSelector((state) => state.permission);
  const { roles } = useSelector((state) => state.roles);
  console.log("roles:", roles)
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchAllPermissions());
    dispatch(fetchAllRoles());
  }, [dispatch]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchQuery(value);
      }, 300),
    []
  );

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  };

  const filteredRoles = roles
    .map((role) => ({
      roleId: role.id,
      roleName: role.displayName || role.roleName,
      role_name: role.role_name,
    }))
    .filter((role) =>
      role.roleName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleEditClick = (role) => {
    setSelectedRole(role);
  };

  const closeForm = () => {
    setSelectedRole(null);
  };

  return (
    <div className="max-w-full px-5 py-5 font-sans text-gray-800 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Manage Permissions
        </h1>
      </div>



      {!selectedRole ? (
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900">
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-5 flex flex-wrap gap-2 items-center">
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search Name"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
            />
          </div>
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[11px] font-medium">
              <tr>
                <th className="px-4 py-3 text-left">Role Name</th>
                <th className="px-4 py-3 text-center sticky right-0 bg-gray-100 dark:bg-gray-800 border-l">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-gray-100 text-sm">
              {filteredRoles.length === 0 ? (
                <tr>
                  <td
                    colSpan="2"
                    className="text-center py-6 text-gray-500 dark:text-gray-300"
                  >
                    No roles found.
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role, index) => (
                  <tr
                    key={role.roleId}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${index % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50 dark:bg-gray-800"
                      }`}
                  >
                    <td className="px-3 py-2">{role.roleName}</td>
                    <td className="px-4 py-2 text-center sticky right-0 bg-gray-50 dark:bg-gray-800 border-l">
                      <ButtonWrapper
                        subModule="Permission Management"
                        permission="edit"
                      >
                        <button
                          onClick={() => handleEditClick(role)}
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
      ) : (
        <div className="animate-fade-in">
          <PermissionsForm selectedRole={selectedRole} onClose={closeForm} />
        </div>
      )}
    </div>
  );
};

export default PermissionsPage;
