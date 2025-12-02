import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createUser,
  updateUser,
  getUserById,
} from "../../../features/users/userSlice";
import { fetchAllRoles } from "../../../features/Roles/rolesSlice";
import { fetchAllDepartments } from "../../../features/department/departmentSlice";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Check, X } from "lucide-react";
import { getModulePathByMenu } from "../../../utils/navigation";
import SkeletonForm from "../../../components/skeletons/skeletonForm";
import FormActionButtons from "../../../components/common/FormActionButtons";

const initialFormData = {
  mail: "",
  username: "",
  password: "",
  roleId: "",
  mobile: "",
  departmentId: "",
  isActive: true,
};

const steps = ["Basic Info"];

const UserForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);

  const modules = useSelector((state) => state.modules.list);
  const menus = useSelector((state) => state.menus.list);
  const modulePath = getModulePathByMenu("user_management", modules, menus);

  const { roles, loading: rolesLoading } = useSelector((state) => state.roles);
  const departmentList = useSelector((state) => state.department.list);
  const deptLoading = useSelector((state) => state.department.loading);
  const { selectedUser, loading: userLoading } = useSelector(
    (state) => state.users
  );

  useEffect(() => {
    dispatch(fetchAllRoles());
    dispatch(fetchAllDepartments());
    if (id) dispatch(getUserById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (isEditMode && selectedUser && Object.keys(selectedUser).length > 0) {
      setFormData({
        mail: selectedUser.mail || "",
        username: selectedUser.username || "",
        password: "",
        mobile: selectedUser.mobile || "",
        roleId: selectedUser.roleId?.toString() || "",
        departmentId: selectedUser.departmentId?.toString() || "",
        isActive: selectedUser.isActive ?? true,
      });
    }
  }, [isEditMode, selectedUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEditMode ? updateUser : createUser;
    const dataToSend = isEditMode ? { ...formData, id } : formData;

    try {
      await dispatch(action(dataToSend)).unwrap();
      toast.success(`User ${isEditMode ? "updated" : "created"} successfully`);
      navigate(`/module/${modulePath}/user_management`);
    } catch (err) {
      console.error("❌ User form submission error:", err);
      const errorMsg =
        err?.message ||
        err?.error ||
        "Something went wrong. Please check the form and try again.";
      toast.error(errorMsg);
    }
  };

  // ✅ Show skeleton when form dependencies are loading
  const isLoading = rolesLoading || deptLoading || (isEditMode && userLoading);
  if (isLoading) return <SkeletonForm />;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-grow max-w-full pt-5 pr-5 pl-5 pb-2 bg-white dark:bg-gray-900 rounded-lg shadow-md"
        noValidate
      >
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-3 mb-6">
          {isEditMode ? "Edit User Details" : "Create New User"}
        </h2>
        <div className="flex border-b border-gray-300 dark:border-gray-700 mb-6 overflow-x-auto">
          {steps.map((step, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentStep(index)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 rounded-t-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                ${currentStep === index
                  ? "border-blue-600 text-blue-600 dark:text-blue-300 dark:border-blue-400 bg-gray-100 dark:bg-gray-800"
                  : "border-transparent text-gray-500 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }
              `}
            >
              {step}
            </button>
          ))}
        </div>

        <div className="flex-grow overflow-auto">
          {currentStep === 0 && (
            <div>
              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-white border-b pb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label
                      htmlFor="username"
                      className="block mb-1 text-gray-700 dark:text-gray-100 text-sm"
                    >
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="mail"
                      className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="mail"
                      name="mail"
                      value={formData.mail}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
                    >
                      Password {isEditMode && "(Leave blank to keep unchanged)"}
                      {!isEditMode && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required={!isEditMode}
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="mobile"
                      className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
                    >
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="departmentId"
                      className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
                    >
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="departmentId"
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                      required
                      className="w-full border px-2 py-1.5 text-sm rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departmentList.map((dep) => (
                        <option key={dep.id} value={dep.id.toString()}>
                          {dep.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="roleId"
                      className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
                    >
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="roleId"
                      name="roleId"
                      value={formData.roleId}
                      onChange={handleChange}
                      required
                      className="w-full border px-2 py-1.5 text-sm rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id.toString()}>
                          {role.displayName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center space-x-2 pt-3">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="h-4 w-4 border-gray-300 rounded text-green-600"
                    />
                    <label
                      htmlFor="isActive"
                      className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
                    >
                      Active User
                    </label>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        <FormActionButtons
          loading={isLoading}
          onBackClick={() => navigate(`/module/${modulePath}/user_management`)}
          onSubmitClick={handleSubmit}
          isEditMode={isEditMode}
        />
      </form>
    </div>
  );
};

export default UserForm;
