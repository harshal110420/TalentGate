import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchExamById } from "../../../features/Exams/examSlice";
import { getModulePathByMenu } from "../../../utils/navigation";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

const ExamViewPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected: exam, loading } = useSelector((state) => state.exam);
  const [openIndex, setOpenIndex] = useState(null);
  const modules = useSelector((state) => state.modules.list);
  const menus = useSelector((state) => state.menus.list);
  const modulePath = getModulePathByMenu("exam_management", modules, menus);
  useEffect(() => {
    if (id) dispatch(fetchExamById(id));
  }, [dispatch, id]);

  if (loading || !exam) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const toggleAccordion = (index) =>
    setOpenIndex(openIndex === index ? null : index);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2">
      {/* ======= Top Section ======= */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-3">
        {/* Header */}

        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(`/module/${modulePath}/exam_management`)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              exam.isActive
                ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
            }`}
          >
            {exam.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Exam Details
        </h2>

        {/* Meta Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-1">
              Exam Name
            </p>
            <p className="text-gray-800 dark:text-gray-100 font-medium">
              {exam.name || "-"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-1">
              Department
            </p>
            <p className="text-gray-800 dark:text-gray-100 font-medium">
              {exam.department?.name || "-"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-1">
              Level
            </p>
            <p className="text-gray-800 dark:text-gray-100 font-medium">
              {exam.level?.name || "-"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-1">
              Total Questions
            </p>
            <p className="text-gray-800 dark:text-gray-100 font-medium">
              {exam.questions?.length || 0}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-1">
              Positive Marking
            </p>
            <p className="text-gray-800 dark:text-gray-100 font-medium">
              {exam.positiveMarking ?? "-"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-1">
              Negative Marking
            </p>
            <p className="text-gray-800 dark:text-gray-100 font-medium">
              {exam.negativeMarking ?? "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Questions Accordion */}
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Questions</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total: {exam.questions?.length || 0}
          </span>
        </div>

        {exam.questions?.length > 0 ? (
          <div className="space-y-3">
            {exam.questions.map((q, index) => (
              <div
                key={q.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex justify-between items-center px-4 py-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-100 flex-1">
                    {index + 1}. {q.question}
                  </span>
                  <div className="flex items-center gap-2">
                    {q.timeLimit && (
                      <span className="flex items-center text-xs text-blue-600 dark:text-blue-400 gap-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                        <Clock size={12} /> {q.timeLimit}s
                      </span>
                    )}
                    {openIndex === index ? (
                      <ChevronUp size={18} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-500" />
                    )}
                  </div>
                </button>

                {/* Accordion Body */}
                {openIndex === index && (
                  <div className="px-5 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {q.options.map((opt, i) => (
                        <span
                          key={i}
                          className={`px-3 py-1 text-xs rounded-full border font-medium ${
                            opt === q.correct
                              ? "bg-green-100 border-green-400 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center text-sm text-green-700 dark:text-green-400">
                      <CheckCircle2 size={16} className="mr-1" />
                      <span>Correct: {q.correct}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-6">
            No questions found
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamViewPage;
