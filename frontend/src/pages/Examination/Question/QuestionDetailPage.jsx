import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getQuestionById,
  clearSelectedQuestion,
} from "../../../features/questions/questionsSlice";
import { useParams, useNavigate } from "react-router-dom";
import SkeletonPage from "../../../components/skeletons/skeletonPage";
import { ArrowLeft } from "lucide-react";
import { getModulePathByMenu } from "../../../utils/navigation";

const QuestionDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedQuestion, loading } = useSelector((state) => state.questions);
  const modules = useSelector((state) => state.modules.list);
  const menus = useSelector((state) => state.menus.list);
  const modulePath = getModulePathByMenu("question_management", modules, menus);

  useEffect(() => {
    dispatch(getQuestionById(id));
    return () => dispatch(clearSelectedQuestion());
  }, [dispatch, id]);

  if (loading || !selectedQuestion) return <SkeletonPage />;

  const {
    question,
    options = [],
    correct,
    timeLimit,
    subject,
    level,
    department,
    isActive,
  } = selectedQuestion;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2">
      {/* ======= Top Section ======= */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-3">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() =>
              navigate(`/module/${modulePath}/question_management`)
            }
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isActive
                ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Question Details
        </h2>

        {/* Meta Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Department", value: department?.name || "-" },
            { label: "Subject", value: subject?.name || "-" },
            { label: "Level", value: level?.name || "-" },
            { label: "Time Limit", value: `${timeLimit} seconds` },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
            >
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-1">
                {item.label}
              </p>
              <p className="text-gray-800 dark:text-gray-100 font-medium">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ======= Bottom Section ======= */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 space-y-8">
        {/* Question */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Question
          </h3>
          <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
            {question}
          </div>
        </div>

        {/* Options */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((opt, index) => {
              const isCorrect = opt === correct;
              return (
                <div
                  key={index}
                  className={`rounded-xl p-4 border text-sm sm:text-base transition-all duration-200 ${
                    isCorrect
                      ? "border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-400"
                      : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      <span className="text-gray-600 dark:text-gray-400">
                        Option {index + 1}:
                      </span>{" "}
                      {opt}
                    </p>
                    {isCorrect && (
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        ✓ Correct
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailPage;
