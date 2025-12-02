import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createQuestion,
  updateQuestion,
  getQuestionById,
  clearSelectedQuestion,
} from "../../../features/questions/questionsSlice";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchAllSubjects } from "../../../features/subject/subjectSlice";
import { fetchAllLevels } from "../../../features/level/levelSlice";
import { fetchAllDepartments } from "../../../features/department/departmentSlice";
import { getModulePathByMenu } from "../../../utils/navigation";
import SkeletonForm from "../../../components/skeletons/skeletonForm";
import { fetchSubjectsByDepartment } from "../../../features/subject/subjectSlice";
import FormActionButtons from "../../../components/common/FormActionButtons";

const steps = ["Basic Info"];

const QuestionForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const { selectedQuestion, loading } = useSelector((state) => state.questions);
  const subjects = useSelector((state) => state.subjects?.list || []);
  const levels = useSelector((state) => state.level?.list || []);
  const departments = useSelector((state) => state.department?.list || []);
  const modules = useSelector((state) => state.modules.list);
  const menus = useSelector((state) => state.menus.list);
  const modulePath = getModulePathByMenu("question_management", modules, menus);
  const { list: subjectsByDept, loading: subjectLoading } = useSelector(
    (state) => state.subjects
  );

  const [currentStep, setCurrentStep] = useState(0);

  const [form, setForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correct: "",
    timeLimit: "",
    subjectId: "",
    levelId: "",
    departmentId: "",
    isActive: true,
  });

  useEffect(() => {
    dispatch(fetchAllSubjects());
    dispatch(fetchAllLevels());
    dispatch(fetchAllDepartments());
  }, [dispatch]);

  useEffect(() => {
    if (id) dispatch(getQuestionById(id));
    return () => dispatch(clearSelectedQuestion());
  }, [id, dispatch]);

  useEffect(() => {
    if (selectedQuestion && id) {
      setForm({
        question: selectedQuestion.question || "",
        options: selectedQuestion.options || ["", "", "", ""],
        correct: selectedQuestion.correct || "",
        timeLimit: selectedQuestion.timeLimit || "",
        subjectId: selectedQuestion.subjectId || "",
        levelId: selectedQuestion.levelId || "",
        departmentId: selectedQuestion.departmentId || "",
        isActive:
          typeof selectedQuestion.isActive === "boolean"
            ? selectedQuestion.isActive
            : true,
      });
    }
  }, [selectedQuestion, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  useEffect(() => {
    if (form.departmentId) {
      dispatch(fetchSubjectsByDepartment(form.departmentId));
    }
  }, [form.departmentId, dispatch]);

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...form.options];
    updatedOptions[index] = value;
    setForm({ ...form, options: updatedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      question: form.question,
      options: form.options,
      correct: form.correct,
      timeLimit: parseInt(form.timeLimit),
      subjectId: form.subjectId,
      levelId: form.levelId,
      departmentId: form.departmentId,
      isActive: form.isActive,
    };

    try {
      if (id) {
        await dispatch(updateQuestion({ id, ...payload })).unwrap();
        toast.success("Question updated successfully");
      } else {
        await dispatch(createQuestion(payload)).unwrap();
        toast.success("Question created successfully");
        setForm({
          question: "",
          options: ["", "", "", ""],
          correct: "",
          timeLimit: "",
          subjectId: "",
          levelId: "",
          departmentId: "",
        });
      }
      navigate(`/module/${modulePath}/question_management`);
    } catch (err) {
      toast.error(err || "Something went wrong");
    }
  };

  if (loading) return <SkeletonForm />;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-grow max-w-full pt-5 pr-5 pl-5 pb-2 bg-white dark:bg-gray-900 rounded-lg shadow-md"
        noValidate
      >
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-3 mb-6">
          {isEditMode ? "Edit Question" : "Create New Question"}
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
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-white border-b pb-2">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                name="subjectId"
                value={form.subjectId}
                onChange={handleChange}
                required
                className="w-full border px-2 py-1.5 text-sm rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!form.departmentId || subjectLoading}
              >
                <option value="">Select Subject</option>
                {subjectsByDept.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Level <span className="text-red-500">*</span>
              </label>
              <select
                name="levelId"
                value={form.levelId}
                onChange={handleChange}
                required
                className="w-full border px-2 py-1.5 text-sm rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Level</option>
                {levels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Question Text */}
          <div>
            <label className="block font-medium text-sm text-gray-700 dark:text-white mb-1">
              Question <span className="text-red-500">*</span>
            </label>
            <textarea
              name="question"
              value={form.question}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {form.options.map((opt, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Option {idx + 1} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
            ))}
          </div>

          {/* Correct Answer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-sm text-gray-700 dark:text-white mb-1">
                Correct Answer <span className="text-red-500">*</span>
              </label>
              <select
                name="correct"
                value={form.correct}
                onChange={handleChange}
                required
                className="w-full border px-2 py-1.5 text-sm rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select correct option</option>
                {form.options.map((opt, idx) => (
                  <option key={idx} value={opt}>
                    Option {idx + 1}: {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-sm text-gray-700 dark:text-white mb-1">
                Time Limit (seconds) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="timeLimit"
                value={form.timeLimit}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Active Status */}
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
                Active Question
              </label>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <FormActionButtons
          loading={loading}
          onBackClick={() =>
            navigate(`/module/${modulePath}/question_management`)
          }
          onSubmitClick={handleSubmit}
          isEditMode={isEditMode}
        />
      </form>
    </div>
  );
};

export default QuestionForm;
