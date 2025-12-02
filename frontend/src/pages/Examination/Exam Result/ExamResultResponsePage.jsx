// src/pages/Exams/ExamResultResponsePage.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchExamResultById } from "../../../features/Exams/examResultDetailSlice";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Info,
} from "lucide-react";
import SkeletonPage from "../../../components/skeletons/skeletonPage";

const ExamResultResponsePage = () => {
  const { id } = useParams(); // examResultId
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(
    (state) => state.examResultDetail
  );
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchExamResultById(id));
  }, [dispatch, id]);

  if (loading) return <SkeletonPage rows={6} columns={10} />;
  if (error)
    return (
      <div className="text-center text-red-500 mt-10 text-sm">
        {error || "Something went wrong"}
      </div>
    );
  if (!data)
    return (
      <div className="text-center text-gray-400 mt-10">
        No data found for this exam result.
      </div>
    );

  const {
    candidateName,
    examName,
    resultStatus,
    score,
    totalQuestions,
    candidateResponses,
    candidate,
    skipped = 0,
    correctAnswers,
    incorrectAnswers,
    exam,
  } = data;

  const positiveMarking = exam?.positiveMarking ?? 1;
  const negativeMarking = exam?.negativeMarking ?? 0;

  // 💡 Derived scoring details
  const totalPositive = correctAnswers * positiveMarking;
  const totalNegative = incorrectAnswers * negativeMarking;
  const finalScore = score.toFixed(2);

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 font-sans text-gray-800 dark:text-gray-100">
      {/* Back Button */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold">{examName}</h2>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="text-gray-500 text-sm mt-1">
              Candidate:{" "}
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {candidateName}
              </span>
              <br />
              Email: <span className="text-gray-800">{candidate?.email}</span>
            </p>
          </div>

          <div className="flex flex-col sm:items-end">
            <div
              className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg ${
                resultStatus === "pass"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {resultStatus === "pass" ? (
                <CheckCircle2 size={16} />
              ) : (
                <XCircle size={16} />
              )}
              {resultStatus.toUpperCase()}
            </div>

            {/* Score Info */}
            <div className="flex flex-col items-start sm:items-end mt-2 text-sm">
              <div className="flex items-center gap-1">
                <Award size={16} className="text-blue-500" />
                Final Score:
                <span className="font-semibold">
                  {finalScore}/{totalQuestions}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mt-1">
                <MinusCircle size={14} className="text-gray-400" />
                Skipped:{" "}
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  {skipped}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 💬 Marking Breakdown */}
        <div className="mt-4 text-sm border-t border-gray-200 dark:border-gray-700 pt-3 flex flex-wrap gap-4 text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-blue-500" />
            <span>Positive Mark: +{positiveMarking}</span>
          </div>
          <div className="flex items-center gap-2">
            <Info size={14} className="text-red-500" />
            <span>Negative Mark: -{negativeMarking}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-500" />
            <span>
              Correct: {correctAnswers} × {positiveMarking} = {totalPositive}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle size={14} className="text-red-500" />
            <span>
              Incorrect: {incorrectAnswers} × {negativeMarking} ={" "}
              {totalNegative}
            </span>
          </div>
        </div>
      </div>

      {/* Candidate Responses Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 shadow-sm">
        <table className="min-w-[1000px] w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[11px] font-medium">
            <tr>
              <th className="px-4 py-3 text-left w-[50px]">No.</th>
              <th className="px-4 py-3 text-left">Question</th>
              <th className="px-4 py-3 text-left">Selected Answer</th>
              <th className="px-4 py-3 text-left">Correct Answer</th>
              <th className="px-4 py-3 text-left">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {candidateResponses.map((q, index) => {
              const selected = q.selectedOption?.trim();
              const correct = q.correctAnswer?.trim();

              let rowColor = "";
              let resultDisplay = null;

              if (!selected) {
                rowColor = "bg-gray-100 dark:bg-gray-800/40";
                resultDisplay = (
                  <span className="text-gray-500 flex items-center gap-1">
                    <MinusCircle size={14} /> Skipped
                  </span>
                );
              } else if (selected === correct) {
                rowColor = "bg-green-100 dark:bg-green-950/20";
                resultDisplay = (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Correct
                  </span>
                );
              } else {
                rowColor = "bg-red-100 dark:bg-red-950/20";
                resultDisplay = (
                  <span className="text-red-600 flex items-center gap-1">
                    <XCircle size={14} /> Incorrect
                  </span>
                );
              }

              return (
                <tr key={q.questionId} className={rowColor}>
                  <td className="px-4 py-2 text-center">{index + 1}</td>
                  <td className="px-4 py-2">{q.question}</td>
                  <td className="px-4 py-2">
                    {selected || <em className="text-gray-400">—</em>}
                  </td>
                  <td className="px-4 py-2">{correct}</td>
                  <td className="px-4 py-2 font-medium">{resultDisplay}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 🧮 Score Breakdown Footer */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center shadow-sm">
          <p className="text-sm text-green-600 font-medium">Marks Gained</p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            +{totalPositive}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center shadow-sm">
          <p className="text-sm text-red-600 font-medium">Marks Lost</p>
          <p className="text-2xl font-bold text-red-700 mt-1">
            -{totalNegative}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center shadow-sm">
          <p className="text-sm text-blue-600 font-medium">Final Score</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{finalScore}</p>
        </div>
      </div>
    </div>
  );
};

export default ExamResultResponsePage;
