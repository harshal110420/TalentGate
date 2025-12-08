import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  createSubject,
  updateSubject,
  getSubjectById,
  clearSubjects,
} from "../../../features/subject/subjectSlice";
import { fetchAllDepartments } from "../../../features/department/departmentSlice";
import { toast } from "react-toastify";
import { Check, X } from "lucide-react";
import { getModulePathByMenu } from "../../../utils/navigation";
import SkeletonForm from "../../../components/skeletons/skeletonForm";
import FormActionButtons from "../../../components/common/FormActionButtons";

const initialFormData = {
  name: "",
  departmentId: "",
  isActive: true,
};

const steps = ["Basic Info"];

const SubjectForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { selected: subjectData, loading } = useSelector(
    (state) => state.subjects
  );
  const { list: departments } = useSelector((state) => state.department);
  const [formData, setFormData] = useState(initialFormData);
  const [initialValues, setInitialValues] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const modules = useSelector((state) => state.modules.list);
  const menus = useSelector((state) => state.menus.list);
  const modulePath = getModulePathByMenu("subject_management", modules, menus);

  useEffect(() => {
    dispatch(fetchAllDepartments());
    if (isEditMode) {
      dispatch(getSubjectById(id));
    }
    return () => {
      dispatch(clearSubjects());
    };
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && subjectData && subjectData.id === parseInt(id)) {
      const loadedData = {
        name: subjectData.name || "",
        departmentId: subjectData.departmentId
          ? String(subjectData.departmentId)
          : "",
        isActive: subjectData.isActive ?? true,
      };
      setFormData(loadedData);
      setInitialValues(loadedData);
    }
  }, [subjectData, isEditMode, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const hasChanges = () => {
    return Object.keys(formData).some(key => {
      if (Array.isArray(formData[key])) {
        return JSON.stringify(formData[key]) !== JSON.stringify(initialValues[key]);
      }
      return formData[key] !== initialValues[key];
    });
  };

  // update isFormValid to include change check
  const isFormValid = () => {
    const requiredFilled =
      formData.name.trim() !== "" &&
      formData.departmentId !== "";
    return requiredFilled && (!isEditMode || hasChanges());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEditMode ? updateSubject : createSubject;
    const payload = isEditMode ? { id, data: formData } : formData;
    try {
      await dispatch(action(payload)).unwrap();
      toast.success(
        `Subject ${isEditMode ? "updated" : "created"} successfully`
      );
      navigate(`/module/${modulePath}/subject_management`);
    } catch (err) {
      const errorMsg =
        err?.message ||
        err?.error ||
        "Something went wrong. Please check the form and try again.";
      toast.error(errorMsg);
    }
  };

  if (loading && isEditMode) {
    return <SkeletonForm />;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-grow max-w-full pt-5 pr-5 pl-5 pb-2 bg-white dark:bg-gray-900 rounded-lg shadow-md"
        noValidate
      >
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-3 mb-6">
            {isEditMode ? "Edit Subject" : "Create New Subject"}
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
                      className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1"
                    >
                      Subject Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Mathematics"
                      className="block w-full rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
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
                      {departments.map((dept) => (
                        <option key={dept.id} value={String(dept.id)}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
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
        <FormActionButtons
          loading={loading}
          isEditMode={isEditMode}
          currentStep={currentStep}
          totalSteps={steps.length}
          isLastStep={currentStep === steps.length - 1}
          isFormValid={isFormValid()}
          hideSubmit={false}
          onPrevious={() => setCurrentStep(p => p - 1)}
          onNext={() => setCurrentStep(p => p + 1)}
          onSubmitClick={() => { }}
        />
      </form>
    </div>
  );
};

export default SubjectForm;
