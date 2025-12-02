import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchRoleById,
  createRole,
  updateRole,
} from "../../../features/Roles/roleFormSlice";
import { Check, X } from "lucide-react";
import { toast } from "react-toastify";
import { getModulePathByMenu } from "../../../utils/navigation";
import SkeletonForm from "../../../components/skeletons/skeletonForm";
import FormActionButtons from "../../../components/common/FormActionButtons";

const initialFormData = {
  role_name: "",
  displayName: "",
  status: true,
  isSystemRole: false,
};

const steps = ["Basic Info"];

const RoleForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roleId } = useParams();
  const isEditMode = Boolean(roleId);
  const { currentRole, loading } = useSelector((state) => state.roleForm);
  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const modules = useSelector((state) => state.modules.list);
  const menus = useSelector((state) => state.menus.list);
  const modulePath = getModulePathByMenu("role_management", modules, menus);

  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchRoleById(roleId));
    }
  }, [dispatch, isEditMode, roleId]);

  useEffect(() => {
    if (isEditMode && currentRole) {
      setFormData({
        role_name: currentRole.role_name || "",
        displayName: currentRole.displayName || "",
        status: currentRole.status ?? true,
        isSystemRole: currentRole.isSystemRole ?? false,
      });
    }
  }, [currentRole, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const action = isEditMode ? updateRole : createRole;
    const formattedRoleName = formData.role_name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    const dataToSend = isEditMode
      ? { id: roleId, data: { ...formData, role_name: formattedRoleName } }
      : { ...formData, role_name: formattedRoleName };

    try {
      await dispatch(action(dataToSend)).unwrap(); // success or error throw
      toast.success(`Role ${isEditMode ? "updated" : "created"} successfully`);
      navigate(`/module/${modulePath}/role_management`);
    } catch (err) {
      console.error("❌ Role form submission error:", err);
      const errorMsg =
        err?.message ||
        err?.error ||
        "Something went wrong. Please check the form and try again.";

      toast.error(errorMsg);
    }
  };

  if (loading) {
    return <SkeletonForm />;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-grow max-w-full pt-5 pr-5 pl-5 pb-2 bg-white dark:bg-gray-900 rounded-lg shadow-md"
        noValidate
      >
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-3 mb-6">
          {isEditMode ? "Edit Role" : "Create New Role"}
        </h2>
        <div className="flex border-b border-gray-300 mb-6 overflow-x-auto">
          {steps.map((step, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentStep(index)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                currentStep === index
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-blue-500"
              }`}
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
                      htmlFor="role_name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1"
                    >
                      Role Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="role_name"
                      name="role_name"
                      value={formData.role_name}
                      onChange={handleChange}
                      required
                      disabled={isEditMode}
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
 (e.g. accounts_manager)
</span>


                  </div>
                  <div>
                    <label
                      htmlFor="displayName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1"
                    >
                      Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
                    >
                      Is Active? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="checkbox"
                      id="status"
                      name="status"
                      checked={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.checked,
                        }))
                      }
                      className="w-6 h-6"
                    />
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Submit and Cancel Buttons */}
        <FormActionButtons
          loading={loading}
          onBackClick={() => navigate(`/module/${modulePath}/role_management`)}
          onSubmitClick={handleSubmit}
          isEditMode={isEditMode}
        />
      </form>
    </div>
  );
};

export default RoleForm;
