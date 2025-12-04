import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import SkeletonForm from "../../../components/skeletons/skeletonForm";
import FormActionButtons from "../../../components/common/FormActionButtons";
import { getModulePathByMenu } from "../../../utils/navigation";

import {
    createJobOpening,
    updateJobOpening,
    fetchJobOpeningsById
} from "../../../features/HR_Slices/jobOpening/jobOpeningSlice";

import { fetchAllDepartments } from "../../../features/department/departmentSlice";

const initialFormData = {
    jobCode: "",
    title: "",
    departmentId: "",
    designation: "",
    employmentType: "Full-Time",
    location: "",
    minExperience: "",
    maxExperience: "",
    vacancyCount: 1,
    status: "Open",
    priorityLevel: "Medium",
    noticePeriod: "",
    openingDate: "",
    closingDate: "",
    isPublished: true,
    jobDescription: "",
    educationQualifications: "",
    requiredSkills: [],
    salaryMin: "",
    salaryMax: "",
    examId: "",
};

const steps = ["Basic Info", "Job Description", "Other"];

const JobOpeningForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();
    const isEditMode = Boolean(id);

    const { loading, selectedJob } = useSelector(
        (state) => state.jobOpening
    );

    const { list: departments = [] } = useSelector(
        (state) => state.department
    );

    const modules = useSelector((state) => state.modules.list);
    const menus = useSelector((state) => state.menus.list);

    const modulePath = getModulePathByMenu("job_management", modules, menus);

    const [formData, setFormData] = useState(initialFormData);
    const [currentStep, setCurrentStep] = useState(0);

    // Load departments and job details if edit mode
    useEffect(() => {
        dispatch(fetchAllDepartments());
        if (id) dispatch(fetchJobOpeningsById(id));
    }, [dispatch, id]);

    const [initialValues, setInitialValues] = useState(initialFormData);

    // jab edit mode me data load ho
    useEffect(() => {
        if (isEditMode && selectedJob) {
            const loadedData = {
                jobCode: selectedJob.jobCode || "",
                title: selectedJob.title || "",
                departmentId: String(selectedJob.departmentId || ""),
                designation: selectedJob.designation || "",
                employmentType: selectedJob.employmentType || "Full-Time",
                location: selectedJob.location || "",
                minExperience: selectedJob.minExperience || "",
                maxExperience: selectedJob.maxExperience || "",
                vacancyCount: selectedJob.vacancyCount || "",
                status: selectedJob.status || "Open",
                priorityLevel: selectedJob.priorityLevel || "Medium",
                noticePeriod: selectedJob.noticePeriod || "",
                openingDate: selectedJob.openingDate || "",
                closingDate: selectedJob.closingDate || "",
                isPublished: selectedJob.isPublished ?? true,
                jobDescription: selectedJob.jobDescription || "",
                educationQualifications: selectedJob.educationQualifications || "",
                requiredSkills: selectedJob.requiredSkills || [],
                salaryMin: selectedJob.salaryMin || "",
                salaryMax: selectedJob.salaryMax || "",
                examId: selectedJob.examId || "",
            };
            setFormData(loadedData);
            setInitialValues(loadedData); // 👈 track initial values
        }
    }, [selectedJob, isEditMode]);

    // check if form has changes
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
            formData.title &&
            formData.departmentId &&
            formData.designation &&
            formData.employmentType &&
            formData.location &&
            formData.minExperience !== "" &&
            formData.maxExperience !== "" &&
            formData.openingDate;

        return requiredFilled && (!isEditMode || hasChanges());
    };



    // Generic input change handler
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = { ...formData };
        delete payload.jobCode;

        payload.departmentId = Number(formData.departmentId);
        payload.examId = formData.examId ? Number(formData.examId) : null;
        payload.minExperience = Number(formData.minExperience || 0);
        payload.maxExperience = Number(formData.maxExperience || 0);
        payload.vacancyCount = Number(formData.vacancyCount || 1);
        payload.salaryMin = Number(formData.salaryMin || 0);
        payload.salaryMax = Number(formData.salaryMax || 0);
        payload.requiredSkills = formData.requiredSkills;



        try {
            const action = isEditMode ? updateJobOpening : createJobOpening;
            const data = isEditMode ? { id, data: payload } : payload;

            await dispatch(action(data)).unwrap();

            toast.success(`Job ${isEditMode ? "updated" : "created"} successfully`);
            navigate(`/module/${modulePath}/job_management`);
        } catch (err) {
            console.error("❌ Job form error:", err);
            toast.error(err || "Something went wrong");
        }
    };

    if (loading) return <SkeletonForm />;

    return (
        <div className="flex flex-col h-full">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col flex-grow max-w-full pt-5 pr-5 pl-5 pb-2 bg-white dark:bg-gray-900 rounded-lg shadow-md"
                noValidate
            >
                {/* Header + Steps */}
                <div>
                    <h2 className="text-2xl font-semibold border-b pb-3 mb-6">
                        {isEditMode ? "Edit Job" : "Create Job"}
                    </h2>
                    <div className="flex border-b border-gray-300 dark:border-gray-700 mb-6">
                        {steps.map((step, index) => (
                            <button
                                type="button"
                                key={index}
                                onClick={() => setCurrentStep(index)}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition
                                    ${currentStep === index
                                        ? "border-blue-600 text-blue-600 dark:border-blue-400"
                                        : "border-transparent text-gray-500 hover:text-blue-500"
                                    }`}
                            >
                                {step}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-grow overflow-auto space-y-4">

                    {/* ---------------- STEP 1 ---------------- */}
                    {currentStep === 0 && (
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Job Code *</label>
                                <input
                                    name="jobCode"
                                    value={isEditMode ? formData.jobCode : "Auto Generated"}
                                    disabled
                                    className="w-full rounded-md border px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Job Title *</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Frontend Developer"
                                    className="w-full rounded-md border px-2 py-1 text-sm dark:bg-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Department *</label>
                                <select
                                    name="departmentId"
                                    value={formData.departmentId}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border px-2 py-1 text-sm dark:bg-gray-900"
                                >
                                    <option value="">Select</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Designation *</label>
                                <input
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border px-2 py-1 text-sm dark:bg-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Employment Type</label>
                                <select
                                    name="employmentType"
                                    value={formData.employmentType}
                                    onChange={handleChange}
                                    className="w-full rounded-md border px-2 py-1 text-sm dark:bg-gray-900"
                                >
                                    <option>Full-Time</option>
                                    <option>Part-Time</option>
                                    <option>Internship</option>
                                    <option>Contract</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Location *</label>
                                <input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nagpur / Remote"
                                    className="w-full rounded-md border px-2 py-1 text-sm dark:bg-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1"> Experience (Years) *
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        name="minExperience"
                                        value={formData.minExperience}
                                        onChange={handleChange}
                                        placeholder="Min"
                                        className="w-full rounded-md border px-2 py-1 text-sm dark:bg-gray-900" />
                                    <span className="text-gray-500">–</span>
                                    <input
                                        type="number"
                                        min="0"
                                        name="maxExperience"
                                        value={formData.maxExperience}
                                        onChange={handleChange}
                                        placeholder="Max"
                                        className="w-full rounded-md border px-2 py-1 text-sm dark:bg-gray-900" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Vacancy Count *</label>
                                <input
                                    type="number"
                                    name="vacancyCount"
                                    value={formData.vacancyCount}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border px-2 py-1 text-sm dark:bg-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Priority Level *</label>
                                <select
                                    name="priorityLevel"
                                    value={formData.priorityLevel}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border px-2 py-1 text-sm dark:bg-gray-900"
                                >
                                    <option>High</option>
                                    <option>Medium</option>
                                    <option>Low</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Notice Period (days)</label>
                                <input
                                    type="number"
                                    name="noticePeriod"
                                    value={formData.noticePeriod}
                                    onChange={handleChange}
                                    className="w-full rounded-md border px-2 py-1 text-sm dark:bg-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Opening Date *</label>
                                <input
                                    type="date"
                                    name="openingDate"
                                    value={formData.openingDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border px-2 py-1 text-sm dark:bg-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Closing Date</label>
                                <input
                                    type="date"
                                    name="closingDate"
                                    value={formData.closingDate}
                                    onChange={handleChange}
                                    className="w-full rounded-md border px-2 py-1 text-sm dark:bg-gray-900"
                                />
                            </div>

                            <div className="flex items-center mt-2">
                                <input
                                    type="checkbox"
                                    id="isPublished"
                                    name="isPublished"
                                    checked={formData.isPublished}
                                    onChange={handleChange}
                                    className="w-5 h-5"
                                />
                                <label htmlFor="isPublished" className="text-sm ml-2">Publish?</label>
                            </div>
                        </section>
                    )}

                    {/* ---------------- STEP 2 ---------------- */}
                    {currentStep === 1 && (
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Job Description</label>
                                <textarea
                                    name="jobDescription"
                                    value={formData.jobDescription}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full rounded-md border px-2 py-1 text-sm dark:bg-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Education Qualifications</label>
                                <textarea
                                    name="educationQualifications"
                                    value={formData.educationQualifications}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full rounded-md border px-2 py-1 text-sm dark:bg-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Required Skills</label>

                                <div className="flex flex-wrap gap-2 border rounded-md p-2 dark:bg-gray-900">

                                    {/* Render existing skills as tags */}
                                    {formData.requiredSkills.map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                                        >
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        requiredSkills: prev.requiredSkills.filter((_, i) => i !== idx)
                                                    }))
                                                }
                                                className="w-3 h-3 flex items-center justify-center text-white bg-black rounded-full text-xs"
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))}

                                    {/* Input for new skill */}
                                    <input
                                        type="text"
                                        placeholder="Type and press Enter"
                                        className="flex-1 border-none focus:ring-0 text-sm dark:bg-gray-900"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                const value = e.target.value.trim();
                                                if (value && !formData.requiredSkills.includes(value)) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        requiredSkills: [...prev.requiredSkills, value]
                                                    }));
                                                }
                                                e.target.value = "";
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Status *</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full rounded-md border px-2 py-1 text-sm dark:bg-gray-900"
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Open">Open</option>
                                    <option value="Hold">Hold</option>
                                    <option value="Closed">Closed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Salary Min</label>
                                <input
                                    type="number"
                                    name="salaryMin"
                                    value={formData.salaryMin}
                                    onChange={handleChange}
                                    className="w-full rounded-md border px-2 py-1 text-sm dark:bg-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Salary Max</label>
                                <input
                                    type="number"
                                    name="salaryMax"
                                    value={formData.salaryMax}
                                    onChange={handleChange}
                                    className="w-full rounded-md border px-2 py-1 text-sm dark:bg-gray-900"
                                />
                            </div>


                        </section>
                    )}

                    {/* ---------------- STEP 3 ---------------- */}
                    {currentStep === 2 && (
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Assign Exam</label>
                                <select
                                    name="examId"
                                    value={formData.examId}
                                    onChange={handleChange}
                                    className="w-full rounded-md border px-2 py-1 text-sm dark:bg-gray-900"
                                >
                                    <option value="">Select Exam</option>
                                    {/* Map exams here if available */}
                                </select>
                            </div>
                        </section>
                    )}
                </div>

                {/* ---------------- Action Buttons ---------------- */}
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

export default JobOpeningForm;
