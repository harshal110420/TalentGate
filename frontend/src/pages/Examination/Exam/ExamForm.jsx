import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import SkeletonForm from "../../../components/skeletons/skeletonForm";
import FormActionButtons from "../../../components/common/FormActionButtons";
import { getModulePathByMenu } from "../../../utils/navigation";
import {
  createExam,
  updateExam,
  fetchExamById,
} from "../../../features/Exams/examSlice";
import { fetchAllDepartments } from "../../../features/department/departmentSlice";
import { fetchAllLevels } from "../../../features/level/levelSlice";
import { fetchSubjectsByDepartment } from "../../../features/subject/subjectSlice";
import axiosInstance from "../../../api/axiosInstance";

const initialFormData = {
  name: "",
  departmentId: "",
  levelId: "",
  positiveMarking: 1,
  negativeMarking: 0,
  isActive: true,
  questionIds: [],
};

const steps = ["Basic Info", "Add Questions", "Random Questions"];

const ExamForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const { selected: examData, loading } = useSelector((state) => state.exam);
  const departments = useSelector((state) => state.department.list);
  const levels = useSelector((state) => state.level.list);
  const { list: subjectsByDept, loading: subjectLoading } = useSelector(
    (state) => state.subjects
  );

  const [formData, setFormData] = useState(initialFormData);
  const [initialValues, setInitialValues] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [questionBank, setQuestionBank] = useState([]);
  const [manuallySelectedQuestions, setManuallySelectedQuestions] = useState(
    []
  );
  const [randomSelectedQuestions, setRandomSelectedQuestions] = useState([]);
  const [questionFilters, setQuestionFilters] = useState({
    questionDepartmentId: "",
    subjectId: "",
    levelId: "",
    count: "",
  });

  const [randomConfig, setRandomConfig] = useState({
    count: "",
    levelId: "",
  });

  const modules = useSelector((state) => state.modules.list);
  const menus = useSelector((state) => state.menus.list);
  const modulePath = getModulePathByMenu("exam_management", modules, menus);

  // Load dropdown data
  useEffect(() => {
    dispatch(fetchAllDepartments());
    dispatch(fetchAllLevels());
  }, [dispatch]);

  // Fetch subjects when department changes
  useEffect(() => {
    if (formData.departmentId) {
      dispatch(fetchSubjectsByDepartment(formData.departmentId));
    }
  }, [formData.departmentId, dispatch]);

  // Fetch exam if editing
  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchExamById(id));
    }
  }, [dispatch, id, isEditMode]);

  // Populate form in edit mode
  useEffect(() => {
    if (isEditMode && examData) {
      const loadedData = {
        name: examData.name || "",
        departmentId: examData.departmentId || "",
        levelId: examData.levelId || "",
        positiveMarking: examData.positiveMarking || 1,
        negativeMarking: examData.negativeMarking || 0,
        isActive: examData.isActive ?? true,
        questionIds: examData.questionIds || [],
      };
      setFormData(loadedData);
      setInitialValues(loadedData);
      // Separate manual vs random based on a flag if you have one, else all in manual
      setManuallySelectedQuestions(examData.questions || []);
      setRandomSelectedQuestions([]);
    }
  }, [examData, isEditMode]);


  // -----------------------------
  // 1) useEffect -> fetch subjects FOR questionDepartmentId
  // Replace your existing subject-fetch useEffect with this
  // -----------------------------
  useEffect(() => {
    if (questionFilters.questionDepartmentId) {
      dispatch(fetchSubjectsByDepartment(questionFilters.questionDepartmentId));
    }
  }, [questionFilters.questionDepartmentId, dispatch]);


  // ===========================
  // Question fetch & manage
  // ===========================
  const fetchQuestions = async () => {
    // Require exam department (main) to be set so exam remains consistent
    if (!formData.departmentId) {
      toast.warn("Please select the exam's Department in Basic Info (Step 1) first");
      return;
    }

    // Require a department to fetch questions from (question-specific)
    if (!questionFilters.questionDepartmentId) {
      toast.warn("Please select a Department for fetching questions (Step 2)");
      return;
    }

    if (!questionFilters.subjectId) {
      toast.warn("Please select a subject to fetch questions");
      return;
    }

    try {
      const limit =
        Number(questionFilters.count) > 0 ? Number(questionFilters.count) : 10;

      const params = {
        subjectId: questionFilters.subjectId,
        levelId: questionFilters.levelId || undefined,
        departmentId: questionFilters.questionDepartmentId, // <-- use questionDepartmentId
        limit,
        page: 1,
      };


      const res = await axiosInstance.get("/exam/fetch-questions", { params });


      if (!res.data.questions?.length) {
        toast.info("No questions found for the selected filters");
        setQuestionBank([]);
        return;
      }

      setQuestionBank(res.data.questions);
      toast.success(`${res.data.questions.length} questions fetched`);
    } catch (err) {
      console.error("fetchQuestions error:", err);
      toast.error("Failed to fetch questions");
    }
  };

  const fetchRandomQuestions = async () => {
    if (!formData.departmentId) {
      toast.warn("Please select the exam's Department in Basic Info (Step 1) first");
      return;
    }


    if (!randomConfig.count || Number(randomConfig.count) <= 0) {
      toast.warn("Please enter number of questions");
      return;
    }

    try {

      const params = {
        departmentId: formData.departmentId, // <-- use questionDepartmentId
        levelId: randomConfig.levelId || undefined,
        limit: Number(randomConfig.count),
      };

      const res = await axiosInstance.get("/exam/random-questions", { params });

      if (!res.data.questions?.length) {
        toast.info("No questions found for this department/level");
        return;
      }

      // Remove duplicates (already in manual or existing random list)
      const filteredQuestions = res.data.questions.filter(
        (q) =>
          !manuallySelectedQuestions.some((mq) => mq.id === q.id) &&
          !randomSelectedQuestions.some((rq) => rq.id === q.id)
      );

      if (filteredQuestions.length === 0) {
        toast.info("All fetched questions are already selected");
        return;
      }

      setRandomSelectedQuestions((prev) => [...filteredQuestions, ...prev]);
      toast.success(`${filteredQuestions.length} new random questions added`);
    } catch (err) {
      console.error("fetchRandomQuestions error:", err);
      toast.error("Failed to fetch random questions");
    }
  };


  const addQuestion = (q) => {
    if (
      !manuallySelectedQuestions.find((x) => x.id === q.id) &&
      !randomSelectedQuestions.find((x) => x.id === q.id)
    ) {
      setManuallySelectedQuestions((prev) => [q, ...prev]); // Add at top
    }
  };

  const removeQuestion = (id) => {
    setManuallySelectedQuestions((prev) => prev.filter((q) => q.id !== id));
    setRandomSelectedQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // ===========================
  // Form handlers
  // ===========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setQuestionFilters((prev) => ({ ...prev, [name]: value }));
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
      formData.departmentId !== "" &&
      formData.levelId !== "" &&
      formData.questionIds !== "" &&
      formData.positiveMarking !== "" &&
      formData.negativeMarking !== "";
    return requiredFilled && (!isEditMode || hasChanges());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allSelectedQuestions = [
      ...manuallySelectedQuestions,
      ...randomSelectedQuestions,
    ];

    if (
      !formData.name ||
      !formData.departmentId ||
      !formData.levelId ||
      allSelectedQuestions.length === 0
    ) {
      toast.error(
        "Please fill all required fields and add at least one question"
      );
      return;
    }

    const payload = {
      ...formData,
      departmentId: Number(formData.departmentId),
      levelId: Number(formData.levelId),
      positiveMarking: Number(formData.positiveMarking),
      negativeMarking: Number(formData.negativeMarking),
      questionIds: allSelectedQuestions.map((q) => ({ questionId: q.id })),
    };

    const action = isEditMode ? updateExam : createExam;
    const data = isEditMode ? { id, data: payload } : payload;

    try {
      await dispatch(action(data)).unwrap();
      toast.success(`Exam ${isEditMode ? "updated" : "created"} successfully`);
      navigate(`/module/${modulePath}/exam_management`);
    } catch (err) {
      console.error("❌ Exam form error:", err);
      toast.error(err?.message || "Something went wrong");
    }
  };

  if (loading) return <SkeletonForm />;

  // ===========================
  // UI rendering
  // ===========================
  {
    questionBank.map((q) => {
      console.log("Question:", q);
      return null;
    });
  }

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
            {isEditMode ? "Edit Exam" : "Create New Exam"}
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
              <h3 className="text-xl font-semibold text-gray-700 dark:text-white border-b pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Exam Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Aptitude Test"
                    className="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm dark:bg-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Exam Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm dark:bg-gray-900"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Exam Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="levelId"
                    value={formData.levelId}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm dark:bg-gray-900"
                  >
                    <option value="">Select Level</option>
                    {levels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Positive Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="positiveMarking"
                    value={formData.positiveMarking}
                    onChange={handleChange}
                    min="0"
                    className="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm dark:bg-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Negative Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="negativeMarking"
                    value={formData.negativeMarking}
                    onChange={handleChange}
                    min="0"
                    className="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm dark:bg-gray-900"
                  />
                </div>

                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Active?
                  </label>
                </div>
              </div>
            </section>
          )}

          {/* Step 2 - Question Selection */}
          {currentStep === 1 && (
            <section className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">
                {isEditMode ? "Edit Questions" : "Add Questions"}
              </h3>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-end mb-4">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Questions Department
                  </label>
                  <select
                    name="questionDepartmentId"
                    value={questionFilters.questionDepartmentId || ""}
                    onChange={(e) =>
                      setQuestionFilters((prev) => ({
                        ...prev,
                        questionDepartmentId: e.target.value,
                        subjectId: "", // reset subject when dept changes
                      }))
                    }
                    className="w-full border px-2 py-1.5 rounded text-sm"
                  >
                    <option value="">Select Department (for questions)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Subject
                  </label>
                  <select
                    name="subjectId"
                    value={questionFilters.subjectId}
                    onChange={handleFilterChange}
                    disabled={!questionFilters.questionDepartmentId || subjectLoading}
                    className="w-full border px-2 py-1.5 rounded text-sm"
                  >
                    <option value="">Select Subject</option>
                    {subjectsByDept.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Question Level
                  </label>
                  <select
                    name="levelId"
                    value={questionFilters.levelId}
                    onChange={handleFilterChange}
                    className="rounded-md border px-2 py-1 text-sm"
                  >
                    <option value="">Select Level</option>
                    {levels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    No. of Questions
                  </label>
                  <input
                    type="number"
                    name="count"
                    value={questionFilters.count}
                    onChange={handleFilterChange}
                    min="1"
                    placeholder="e.g. 10"
                    className="rounded-md border px-2 py-1 text-sm w-24"
                  />
                </div>

                <button
                  type="button"
                  onClick={fetchQuestions}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  Fetch Questions
                </button>
              </div>

              {/* Question Bank */}
              <div className="max-h-[400px] overflow-y-auto border rounded-md p-2 bg-gray-50 dark:bg-gray-900 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {questionBank
                  .filter(
                    (q) =>
                      !manuallySelectedQuestions.find((sq) => sq.id === q.id) &&
                      !randomSelectedQuestions.find((sq) => sq.id === q.id)
                  )
                  .map((q) => (
                    <div
                      key={q.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1 line-clamp-2">
                        {q.question}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {q.level?.name || q.level || "—"}
                        </span>

                        <button
                          type="button"
                          onClick={() => addQuestion(q)}
                          className="px-2 py-0.5 rounded text-xs bg-green-600 hover:bg-green-700 text-white transition"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Selected Questions - Manual */}
              {manuallySelectedQuestions.length > 0 && (
                <>
                  <h4 className="font-semibold mt-6 mb-3 text-blue-700 text-sm uppercase tracking-wide">
                    📝 Manually Added Questions ({manuallySelectedQuestions.length})
                  </h4>

                  <div className="max-h-[450px] overflow-y-auto border rounded-lg bg-white dark:bg-gray-900 shadow-sm">
                    {manuallySelectedQuestions.map((q, index) => (
                      <details
                        key={q.id}
                        className="group border-b border-gray-200 dark:border-gray-700"
                      >
                        <summary className="flex justify-between items-center cursor-pointer select-none p-3 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-150">
                          <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                            {index + 1}. {q.question}
                          </span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeQuestion(q.id);
                              }}
                              className="text-red-500 text-[11px] font-semibold px-2 py-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                            >
                              Remove
                            </button>
                            <svg
                              className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </summary>

                        <div className="p-3 pt-0 text-sm space-y-1">
                          {q.options.map((opt, idx) => (
                            <p
                              key={idx}
                              className={`px-2 py-1 rounded-md text-xs ${String(opt).trim() === String(q.correct).trim()
                                ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium"
                                : "text-gray-600 dark:text-gray-400"
                                }`}
                            >
                              {opt}
                            </p>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}


          {/* Step 3 - Random Questions */}
          {currentStep === 2 && (
            <section className="space-y-4">
              {/* <h3 className="text-xl font-semibold border-b pb-2">
                Random Questions
              </h3> */}

              <div className="flex flex-wrap gap-4 items-end mb-4">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Level
                  </label>
                  <select
                    name="levelId"
                    value={randomConfig.levelId}
                    onChange={(e) =>
                      setRandomConfig((prev) => ({
                        ...prev,
                        levelId: e.target.value,
                      }))
                    }
                    className="rounded-md border px-2 py-1 text-sm"
                  >
                    <option value="">Any Level</option>
                    {levels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    No. of Questions
                  </label>
                  <input
                    type="number"
                    value={randomConfig.count}
                    onChange={(e) =>
                      setRandomConfig((prev) => ({
                        ...prev,
                        count: e.target.value,
                      }))
                    }
                    min="1"
                    className="rounded-md border px-2 py-1 text-sm w-24"
                  />
                </div>

                <button
                  type="button"
                  onClick={fetchRandomQuestions}
                  className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  Add Random Questions
                </button>
              </div>

              {/* Selected Questions - Random */}
              {randomSelectedQuestions.length > 0 && (
                <>
                  <h4 className="font-semibold mt-6 mb-3 text-purple-700 text-sm uppercase tracking-wide">
                    🎲 Randomly Added Questions (
                    {randomSelectedQuestions.length})
                  </h4>

                  <div className="max-h-[450px] overflow-y-auto border rounded-lg bg-white dark:bg-gray-900 shadow-sm">
                    {randomSelectedQuestions.map((q, index) => (
                      <details
                        key={q.id}
                        className="group border-b border-gray-200 dark:border-gray-700"
                      >
                        <summary className="flex justify-between items-center cursor-pointer select-none p-3 hover:bg-purple-50 dark:hover:bg-gray-800 transition-all duration-150">
                          <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                            {index + 1}. {q.question}
                          </span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeQuestion(q.id);
                              }}
                              className="text-red-500 text-[11px] font-semibold px-2 py-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                            >
                              Remove
                            </button>
                            <svg
                              className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </summary>

                        <div className="p-3 pt-0 text-sm space-y-1">
                          {q.options.map((opt, idx) => (
                            <p
                              key={idx}
                              className={`px-2 py-1 rounded-md text-xs ${String(opt).trim() === String(q.correct).trim()
                                ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium"
                                : "text-gray-600 dark:text-gray-400"
                                }`}
                            >
                              {opt}
                            </p>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </>
              )}
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

export default ExamForm;
