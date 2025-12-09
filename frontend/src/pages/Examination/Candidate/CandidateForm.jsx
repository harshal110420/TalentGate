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
import { fetchJobOpenings } from "../../../features/HR_Slices/jobOpening/jobOpeningSlice";

import { getModulePathByMenu } from "../../../utils/navigation";
import SkeletonForm from "../../../components/skeletons/skeletonForm";
import FormActionButtons from "../../../components/common/FormActionButtons";

const steps = ["Basic Info", "Job Tracking", "Screening / HR tools", "Exam Info"];

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

const applicationStageOptions = [
  "Applied",
  "Resume Reviewed",
  "Shortlisted",
  "Exam Assigned",
  "Exam Completed",
  "Interview Scheduled",
  "Interview Passed",
  "Selected",
  "Rejected",
  "Hired",
];

const hrRatingOptions = [1, 2, 3, 4, 5];

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  experience: "",
  departmentId: "",
  examId: "",
  isActive: true,
  resumeFile: null,
  resumeUrl: "",
  source: "offline",
  jobCode: "",
  jobTitle: "",
  jobDesignation: "",
  applicationStage: "Applied",
  assignedRecruiterId: "",
  remarks: "",
  // resumeReviewed: false,
  hrRating: "",
};

const CandidateForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [jobSearch, setJobSearch] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const { jobOpenings = [] } = useSelector(
    (s) => s.jobOpening
  );
  const { selected, loading } = useSelector((state) => state.candidate);
  const departments = useSelector((state) => state.department.list);
  const deptLoading = useSelector((state) => state.department.loading);
  const exams = useSelector((state) => state.exam.list);
  const examLoading = useSelector((state) => state.exam.loading);
  const modules = useSelector((state) => state.modules.list);
  const menus = useSelector((state) => state.menus.list);
  const modulePath = getModulePathByMenu(
    "candidate_management",
    modules,
    menus
  );

  const [form, setForm] = useState(initialForm);
  const [currentStep, setCurrentStep] = useState(0);

  // ----- Fetch data -----
  useEffect(() => {
    dispatch(fetchAllDepartments());
    dispatch(fetchAllExams());
    dispatch(fetchJobOpenings());   // ✅ MISSING DISPATCH

    if (isEditMode) dispatch(fetchCandidateById(id));
    return () => {
      dispatch(clearSelectedCandidate());
      dispatch(resetCandidateStatus());
    };
  }, [dispatch, id, isEditMode]);


  const [initialValues, setInitialValues] = useState(initialForm);

  // ----- Populate form in edit mode -----
  useEffect(() => {
    if (isEditMode && selected) {
      const loadedData = {
        name: selected.name || "",
        email: selected.email || "",
        mobile: selected.mobile || "",
        experience: selected.experience || "",
        departmentId: selected.departmentId ? String(selected.departmentId) : "",
        examId: selected.examId ? String(selected.examId) : "",
        isActive: typeof selected.isActive === "boolean" ? selected.isActive : true,
        resumeUrl: selected.resumeUrl || "",
        resumeFile: null,
        jobCode: selected.jobCode || "",
        jobTitle: selected.jobTitle || "",
        jobDesignation: selected.jobDesignation || "",
        applicationStage: selected.applicationStage || "Applied",
        assignedRecruiterId: selected.assignedRecruiterId || "",
        remarks: selected.remarks || "",
        // resumeReviewed: selected.resumeReviewed || false,
        hrRating: selected.hrRating || "",
      };
      setForm(loadedData);
      setInitialValues(loadedData);
    }
  }, [selected, isEditMode]);

  // ----- Handle field changes -----
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setForm((prev) => ({ ...prev, resumeFile: files[0] }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const hasChanges = () => {
    return Object.keys(form).some(key => {
      if (Array.isArray(form[key])) {
        return JSON.stringify(form[key]) !== JSON.stringify(initialValues[key]);
      }
      return form[key] !== initialValues[key];
    });
  };

  // update isFormValid to include change check
  const isFormValid = () => {
    const requiredFilled =
      form.name.trim() !== "" &&
      form.email.trim() !== "" &&
      form.experience !== "" &&
      form.departmentId !== "";

    return requiredFilled && (!isEditMode || hasChanges());
  };

  // search job logic 
  useEffect(() => {
    if (!jobSearch) return setFilteredJobs([]);

    const q = jobSearch.toLowerCase();

    const results = jobOpenings.filter(job =>
      job.jobCode?.toLowerCase().includes(q) ||
      job.title?.toLowerCase().includes(q) ||
      job.designation?.toLowerCase().includes(q)
    );

    setFilteredJobs(results);
  }, [jobSearch, jobOpenings]);

  // Job Select Handler

  const handleJobSelect = (job) => {
    setForm(prev => ({
      ...prev,
      jobCode: job.jobCode,
      jobTitle: job.title,
      jobDesignation: job.designation,
      jobId: job.id
    }));

    setJobSearch("");
    setFilteredJobs([]);
  };

  const clearSelectedJob = () => {
    setForm(prev => ({
      ...prev,
      jobCode: "",
      jobTitle: "",
      jobDesignation: "",
      jobId: job.id
    }));

    setJobSearch("");
    setFilteredJobs([]);
  };

  const getOriginalFileName = (url) => {
    if (!url) return "";
    const fullName = url.split("/").pop(); // 1707123123-john_resume.pdf
    const cleaned = fullName.replace(/^\d+-/, "");
    return cleaned;
  };


  // ----- Submit handler -----
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Append normal fields only
    Object.entries(form).forEach(([key, value]) => {
      if (key === "resumeFile" || key === "resumeUrl") return;

      // Safe handling for integer fields
      if (
        ["departmentId", "examId", "assignedRecruiterId", "hrRating", "jobId"].includes(key)
      ) {
        formData.append(key, value || null);
        return;
      }

      // Boolean handling
      if (typeof value === "boolean") {
        formData.append(key, value);
        return;
      }

      // Normal fields
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });



    // Append file using multer expected field
    if (form.resumeFile) {
      formData.append("resume", form.resumeFile);
    }

    try {
      if (isEditMode) {
        await dispatch(updateCandidate({ id, data: formData })).unwrap();
        toast.success("Candidate updated successfully");
      } else {
        await dispatch(createCandidate(formData)).unwrap();
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
    <div className="flex flex-col h-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-grow max-w-full pt-5 pr-5 pl-5 pb-2 bg-white dark:bg-gray-900 rounded-lg shadow-md"
        noValidate
      >
        {/* Header & Steps */}
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
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 rounded-t-md
                  ${currentStep === index
                    ? "border-blue-600 text-blue-600 dark:text-blue-300 dark:border-blue-400 bg-gray-100 dark:bg-gray-800"
                    : "border-transparent text-gray-500 dark:text-gray-300 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                {step}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-grow overflow-auto">
          {/* Step 1 - Basic Info */}
          {currentStep === 0 && (
            <section className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Name */}
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

                {/* Email */}
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

                {/* Mobile */}
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

                {/* Experience */}
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

                {/* Department */}
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
                    Resume
                  </label>
                  <input
                    type="file"
                    name="resume"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setForm((prev) => ({ ...prev, resumeFile: file }));
                    }}
                    accept=".pdf,.doc,.docx"
                    className="block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-1 file:px-4
               file:rounded-md file:border-0 file:text-sm file:font-semibold
               file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {form.resumeUrl && (
                    <p className="text-sm mt-1 text-gray-500 dark:text-gray-300">
                      Current File: {getOriginalFileName(form.resumeUrl)}
                    </p>
                  )}
                </div>

                {/* Active */}
                <div className="flex items-center space-x-2 pt-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 border-gray-300 rounded text-green-600"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-white">
                    Active Candidate
                  </label>
                </div>
              </div>
            </section>
          )}

          {/* Step 1 - Job Tracking */}
          {currentStep === 1 && (
            <section className="space-y-5">
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Application Stage
                </label>
                <select
                  name="applicationStage"
                  value={form.applicationStage}
                  onChange={handleChange}
                  className="w-full border px-2 py-1.5 text-sm rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {applicationStageOptions.map((stage) => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Search Job (Code / Title / Designation)
                </label>

                <input
                  type="text"
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  placeholder="Search job..."
                  className="w-full border px-2 py-1.5 text-sm rounded border-gray-300 dark:border-gray-700
        bg-white dark:bg-gray-900"
                />

                {/* Results */}
                {filteredJobs.length > 0 && (
                  <div className="mt-2 border rounded max-h-48 overflow-y-auto bg-white dark:bg-gray-900">

                    {filteredJobs.map(job => (
                      <div
                        key={job.id}
                        className="px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 text-sm"
                        onClick={() => handleJobSelect(job)}
                      >
                        <p className="font-medium">
                          {job.jobCode} - {job.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {job.designation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Job Preview */}
              {form.jobCode && (
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 p-3 border rounded-md bg-gray-50 dark:bg-gray-800">

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={clearSelectedJob}
                    className="
        absolute top-2 right-2 text-xs
        px-2 py-1 rounded-md
        bg-red-100 text-red-600
        hover:bg-red-200
        dark:bg-red-500 dark:text-white dark:hover:bg-red-600
      "
                  >
                    ✕ Remove Job
                  </button>

                  {/* Job Code */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Selected Job Code
                    </label>

                    <input
                      value={form.jobCode}
                      disabled
                      className="w-full px-2 py-1 text-sm bg-gray-100 dark:bg-gray-900 rounded border"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Job Title
                    </label>

                    <input
                      value={form.jobTitle}
                      disabled
                      className="w-full px-2 py-1 text-sm bg-gray-100 dark:bg-gray-900 rounded border"
                    />
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Designation
                    </label>

                    <input
                      value={form.jobDesignation}
                      disabled
                      className="w-full px-2 py-1 text-sm bg-gray-100 dark:bg-gray-900 rounded border"
                    />
                  </div>

                </div>
              )}

              {/* </div> */}
            </section>
          )}


          {currentStep === 2 && (
            <section className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Assigned Recruiter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Assigned Recruiter
                  </label>
                  <select
                    name="assignedRecruiterId"
                    value={form.assignedRecruiterId}
                    onChange={handleChange}
                    className="w-full border px-2 py-1.5 text-sm rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Recruiter</option>
                    {/* TODO: populate from redux / API */}
                  </select>
                </div>

                {/* HR Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    HR Rating
                  </label>
                  <select
                    name="hrRating"
                    value={form.hrRating}
                    onChange={handleChange}
                    className="w-full border px-2 py-1.5 text-sm rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Rating</option>
                    {hrRatingOptions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Remarks */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    placeholder="Any remarks..."
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    rows={3}
                  />
                </div>

                {/* Resume Reviewed */}
                {/* <div className="flex items-center space-x-2 pt-3">
                  <input
                    type="checkbox"
                    name="resumeReviewed"
                    checked={form.resumeReviewed}
                    onChange={handleChange}
                    className="h-4 w-4 border-gray-300 rounded text-green-600"
                  />
                  <label htmlFor="resumeReviewed" className="text-sm text-gray-700 dark:text-white">
                    Resume Reviewed
                  </label>
                </div> */}


              </div>
            </section>
          )}

          {currentStep === 3 && (
            <section className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              </div>
            </section>
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

export default CandidateForm;
