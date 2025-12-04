import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import SkeletonForm from "../../../components/skeletons/skeletonForm";
import { getModulePathByMenu } from "../../../utils/navigation";

import { fetchJobOpeningsById } from "../../../features/HR_Slices/jobOpening/jobOpeningSlice";
import { fetchAllDepartments } from "../../../features/department/departmentSlice";
import { ViewField, ViewTextarea } from "../../../components/common/ViewField";
import FormActionButtons from "../../../components/common/FormActionButtons";

const steps = ["Basic Info", "Job Description"];

const JobDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const { loading, selectedJob } = useSelector(
        (state) => state.jobOpening
    );

    const { list: departments = [] } = useSelector(
        (state) => state.department
    );

    const modules = useSelector((state) => state.modules.list);
    const menus = useSelector((state) => state.menus.list);

    const modulePath = getModulePathByMenu(
        "job_management",
        modules,
        menus
    );

    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        dispatch(fetchAllDepartments());

        if (id) {
            dispatch(fetchJobOpeningsById(id));
        }
    }, [id, dispatch]);

    if (loading || !selectedJob) return <SkeletonForm />;

    const getDepartmentName = () => {
        const dept = departments.find(
            (d) => d.id === selectedJob.departmentId
        );
        return dept?.name || "—";
    };

    return (
        <div className="flex flex-col h-full">
            <form
                className="flex flex-col flex-grow max-w-full pt-5 pr-5 pl-5 pb-2 bg-white dark:bg-gray-900 rounded-lg shadow-md"
            >
                {/* ---------------- Header ---------------- */}
                <div>
                    <h2 className="text-2xl font-semibold border-b pb-3 mb-6">
                        Job Details
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

                <div className="flex-grow overflow-auto">

                    {/* ---------------- STEP 1 ---------------- */}
                    {currentStep === 0 && (
                        <section className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                <ViewField label="Job Title" value={selectedJob.jobCode} />
                                <ViewField label="Job Title" value={selectedJob.title} />

                                <ViewField
                                    label="Department"
                                    value={getDepartmentName()}
                                />

                                <ViewField
                                    label="Designation"
                                    value={selectedJob.designation}
                                />

                                <ViewField
                                    label="Employment Type"
                                    value={selectedJob.employmentType}
                                />

                                <ViewField
                                    label="Location"
                                    value={selectedJob.location}
                                />

                                <ViewField
                                    label="Experience"
                                    value={`${selectedJob.minExperience || 0} yrs - ${selectedJob.maxExperience || 0} yrs`}
                                />

                                <ViewField
                                    label="Vacancy Count"
                                    value={selectedJob.vacancyCount}
                                />

                                <ViewField
                                    label="Priority Level"
                                    value={selectedJob.priorityLevel}
                                />

                                <ViewField
                                    label="Notice Period"
                                    value={selectedJob.noticePeriod}
                                />

                                <ViewField
                                    label="Opening Date"
                                    value={selectedJob.openingDate}
                                />

                                <ViewField
                                    label="Closing Date"
                                    value={selectedJob.closingDate}
                                />

                                <ViewField
                                    label="Published"
                                    value={
                                        selectedJob.isPublished ? "Yes" : "No"
                                    }
                                />

                            </div>
                        </section>
                    )}

                    {/* ---------------- STEP 2 ---------------- */}
                    {currentStep === 1 && (

                        <section className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <ViewTextarea
                                    label="Description"
                                    value={selectedJob.jobDescription}
                                />

                                <ViewTextarea
                                    label="Education Qualifications"
                                    value={selectedJob.educationQualifications}
                                />

                                <ViewField
                                    label="Required Skills"
                                    value={selectedJob.requiredSkills}
                                />
                                <ViewField
                                    label="Status"
                                    value={selectedJob.status}
                                />

                                <ViewField
                                    label="Salary"
                                    value={`Min ${selectedJob.salaryMin || 0} ₹ - Max ${selectedJob.salaryMax || 0} ₹`}
                                />
                            </div>
                        </section>
                    )}
                    {/* {currentStep === 2 && (
                        <section className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            </div>
                        </section>
                    )} */}

                </div>

                {/* ---------------- Footer ---------------- */}
                <FormActionButtons
                    currentStep={currentStep}
                    totalSteps={steps.length}
                    isLastStep={currentStep === steps.length - 1}

                    onBackClick={() =>
                        navigate(`/module/${modulePath}/job_management`)
                    }

                    onPrevious={() =>
                        setCurrentStep((p) => p - 1)
                    }

                    onNext={() =>
                        setCurrentStep((p) => p + 1)
                    }

                    // ❌ submit related flags bypass kar diye
                    hideSubmit={true}
                    loading={false}
                />

            </form>
        </div>
    );
};

export default JobDetails;
