// src/pages/system-module/ModuleForm.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createModule,
  updateModule,
  getModuleById,
} from "../../../features/Modules/ModuleSlice";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Check, X } from "lucide-react";
import SkeletonForm from "../../../components/skeletons/skeletonForm";
import { getModulePathByMenu } from "../../../utils/navigation";

const initialFormData = {
  moduleId: "",
  name: "",
  path: "",
  version: "1.0",
  orderBy: "",
  isActive: true,
};

const steps = ["Basic Info"];

const ModuleForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const { selected, loading } = useSelector((state) => state.modules);
  console.log("selected module:", selected)
  const menus = useSelector((state) => state.menus.list);
  const modules = useSelector((state) => state.modules.list);
  const modulePath = getModulePathByMenu("module_management", modules, menus);

  useEffect(() => {
    if (isEditMode) {
      dispatch(getModuleById(id));
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && selected) {
      setFormData({
        moduleId: selected.moduleId || "",
        name: selected.name || "",
        path: selected.path || "",
        version: selected.version || "1.0",
        orderBy: selected.orderBy || "",
        isActive: selected.isActive ?? true,
      });
    }
  }, [selected, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEditMode ? updateModule : createModule;
    const dataToSend = isEditMode ? { id, data: formData } : formData;

    try {
      await dispatch(action(dataToSend)).unwrap();
      toast.success(`Module ${isEditMode ? "updated" : "created"} successfully`);
      navigate(`/module/${modulePath}/module_management`);
    } catch (err) {
      console.error("❌ Module form error:", err);
      toast.error(err?.message || "Something went wrong!");
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
          {isEditMode ? "Edit Module" : "Create New Module"}
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
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
                    >
                      ModuleID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="moduleId"
                      name="moduleId"
                      value={formData.moduleId}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
                    >
                      Module Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="path"
                      className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
                    >
                      Path <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="path"
                      name="path"
                      value={formData.path}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="version"
                      className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
                    >
                      Version <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="version"
                      name="version"
                      value={formData.version}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="orderBy"
                      className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
                    >
                      Order By
                    </label>
                    <input
                      type="number"
                      id="orderBy"
                      name="orderBy"
                      value={formData.orderBy}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="isActive"
                      className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
                    >
                      Is Active?
                    </label>
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="w-6 h-6"
                    />
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        <div className="flex justify-end items-center gap-1.5 mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="border-2 border-amber-400 text-xs font-semibold rounded-full text-black dark:text-white px-3 py-1 hover:bg-amber-400 hover:text-white disabled:opacity-50 flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            Back
          </button>

          <button
            type="submit"
            disabled={loading}
            className="border-2 border-green-400 text-xs font-semibold rounded-full text-black dark:text-white px-3 py-1 hover:bg-green-400 hover:text-white disabled:opacity-50 flex items-center"
          >
            <Check className="w-4 h-4 mr-1" />
            {loading ? "Saving..." : isEditMode ? "Update" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModuleForm;
