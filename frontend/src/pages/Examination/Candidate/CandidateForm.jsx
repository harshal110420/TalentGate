import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchAllDepartments } from "../../../features/department/departmentSlice";
import { fetchAllExams } from "../../../features/Exams/examSlice";
import {
  createCandidate,
  updateCandidate,
  fetchCandidateById,
  clearSelectedCandidate,
  resetCandidateStatus,
} from "../../../features/Candidate/candidateSlice";
import { getModulePathByMenu } from "../../../utils/navigation";
import SkeletonForm from "../../../components/skeletons/skeletonForm";
import FormActionButtons from "../../../components/common/FormActionButtons";

const steps = ["Basic Info"];

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  experience: "",
  departmentId: "",
  examId: "",
  isActive: true,
};

const experienceOptions = [
  { value: "0-1", label: "0-1 years" },
  { value: "1-2", label: "1-2 years" },
  { value: "2-3", label: "2-3 years" },
  { value: "3-4", label: "3-4 years" },
  { value: "4-5", label: "4-5 years" },
  { value: "5-6", label: "5-6 years" },
  { value: "6-7", label: "6-7 years" },
  { value: "7-8", label: "7-8 years" },
  { value: "8-9", label: "8-9 years" },
  { value: "9-10", label: "9-10 years" },
  { value: "10-11", label: "10-11 years" },
  { value: "11-12", label: "11-12 years" },
  { value: "12-13", label: "12-13 years" },
  { value: "13-14", label: "13-14 years" },
  { value: "14-15", label: "14-15 years" },
  { value: "15-16", label: "15-16 years" },
  { value: "16-17", label: "16-17 years" },
  { value: "17-18", label: "17-18 years" },
  { value: "18-19", label: "18-19 years" },
  { value: "19-20", label: "19-20 years" },
  { value: "20-21", label: "20-21 years" },
  { value: "21-22", label: "21-22 years" },
  { value: "22-23", label: "22-23 years" },
  { value: "23-24", label: "23-24 years" },
  { value: "24-25", label: "24-25 years" },
  { value: "25-26", label: "25-26 years" },
  { value: "26-27", label: "26-27 years" },
  { value: "27-28", label: "27-28 years" },
  { value: "28-29", label: "28-29 years" },
  { value: "29-30", label: "29-30 years" },
];

const CandidateForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const { selected, loading } = useSelector((state) => state.candidate);
  const departments = useSelector((state) => state.department.list);
  const deptLoading = useSelector((state) => state.department.loading);
  const modules = useSelector((state) => state.modules.list);
  const menus = useSelector((state) => state.menus.list);
  const modulePath = getModulePathByMenu(
    "candidate_management",
    modules,
    menus
  );
  const examLoading = useSelector((state) => state.exam.loading);
  const exams = useSelector((state) => state.exam.list);

  const [form, setForm] = useState(initialForm);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    dispatch(fetchAllDepartments());
    dispatch(fetchAllExams());
    if (isEditMode) dispatch(fetchCandidateById(id));
    return () => {
      dispatch(clearSelectedCandidate());
      dispatch(resetCandidateStatus());
    };
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && selected) {
      setForm({
        name: selected.name || "",
        email: selected.email || "",
        mobile: selected.mobile || "",
        experience: selected.experience || "",
        departmentId: selected.departmentId
          ? String(selected.departmentId)
          : "",
        examId: selected.examId ? String(selected.examId) : "",
        isActive:
          typeof selected.isActive === "boolean" ? selected.isActive : true,
      });
    }
  }, [selected, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      departmentId: form.departmentId ? parseInt(form.departmentId) : null,
      examId: form.examId ? parseInt(form.examId) : null,
    };
    try {
      if (isEditMode) {
        await dispatch(updateCandidate({ id, data: payload })).unwrap();
        toast.success("Candidate updated successfully");
      } else {
        await dispatch(createCandidate(payload)).unwrap();
        toast.success("Candidate created successfully");
        setForm(initialForm);
      }
      navigate(`/module/${modulePath}/candidate_management`);
    } catch (err) {
      toast.error(err || "Something went wrong");
    }
  };

  if (loading || deptLoading || examLoading) return <SkeletonForm />;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-grow max-w-full pt-5 pr-5 pl-5 pb-2 bg-white dark:bg-gray-900 rounded-lg shadow-md"
        noValidate
      >
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-3 mb-6">
            {isEditMode ? "Edit Candidate" : "Create New Candidate"}
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
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-white border-b pb-2">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Ex - Candidate Name"
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Ex - Candidate Mail"
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Mobile
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="Ex - Mobile Number"
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Experience <span className="text-red-500">*</span>
                </label>
                <select
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  required
                  className="w-full border px-2 py-1.5 text-sm rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Experience</option>
                  {experienceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  required
                  className="w-full border px-2 py-1.5 text-sm rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Exam
                </label>
                <select
                  name="examId"
                  value={form.examId}
                  onChange={handleChange}
                  className="w-full border px-2 py-1.5 text-sm rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Exam</option>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2 pt-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 border-gray-300 rounded text-green-600"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm text-gray-700 dark:text-white"
                >
                  Active Candidate
                </label>
              </div>
            </div>
          </section>
        </div>
        <FormActionButtons
          loading={loading}
          onBackClick={() =>
            navigate(`/module/${modulePath}/candidate_management`)
          }
          onSubmitClick={handleSubmit}
          isEditMode={isEditMode}
        />
      </form>
    </div>
  );
};

export default CandidateForm;
