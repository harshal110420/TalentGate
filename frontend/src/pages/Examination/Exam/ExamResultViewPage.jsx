// src/pages/module/ExamResult/ExamResultViewPage.jsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SkeletonPage from "../../../components/skeletons/skeletonPage";
import { fetchExamResultById } from "../../../features/Exams/examResultDetailSlice";

const ExamResultViewPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    data: examResult,
    loading,
    error,
  } = useSelector((s) => s.examResultDetail);

  // Debug log: entire Redux slice state
  console.log("Redux slice examResultDetail:", { examResult, loading, error });

  useEffect(() => {
    console.log(`Fetching exam result for ID: ${id}`);
    dispatch(fetchExamResultById(id));
  }, [dispatch, id]);

  if (loading || !examResult) {
    console.log("Loading or examResult not yet available...");
    return <SkeletonPage />;
  }

  if (error) {
    console.error("Error loading exam result:", error);
    return (
      <div className="text-red-500 text-center py-6">
        Error loading exam result: {error}
      </div>
    );
  }

  // Debug logs for candidate & exam
  console.log("Candidate object:", examResult.Candidate);
  console.log("Exam object:", examResult.Exam);

  // Debug logs for candidateResponses
  if (examResult.candidateResponses && examResult.candidateResponses.length) {
    console.log("Candidate Responses:");
    examResult.candidateResponses.forEach((res, idx) => {
      console.log(`Q${idx + 1}`, res);
    });
  } else {
    console.log("No candidate responses found.");
  }

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Exam Result Details
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Back
        </button>
      </div>

      {/* Candidate & Exam Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <h2 className="font-semibold">Candidate:</h2>
          <p>{examResult.Candidate?.name || "-"}</p>
        </div>
        <div>
          <h2 className="font-semibold">Exam:</h2>
          <p>{examResult.Exam?.name || "-"}</p>
        </div>
        <div>
          <h2 className="font-semibold">Status:</h2>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              examResult.resultStatus === "pass"
                ? "bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300"
                : examResult.resultStatus === "fail"
                ? "bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-300"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-800/30 dark:text-yellow-300"
            }`}
          >
            {examResult.resultStatus}
          </span>
        </div>
        <div>
          <h2 className="font-semibold">Multiple Attempts:</h2>
          {examResult.multipleAttempts ? (
            <span className="text-red-500 font-semibold">Yes ⚠️</span>
          ) : (
            <span className="text-gray-400">No</span>
          )}
        </div>
        <div>
          <h2 className="font-semibold">Total Questions:</h2>
          <p>{examResult.totalQuestions}</p>
        </div>
        <div>
          <h2 className="font-semibold">Attempted:</h2>
          <p>{examResult.attempted}</p>
        </div>
        <div>
          <h2 className="font-semibold">Correct:</h2>
          <p>{examResult.correctAnswers}</p>
        </div>
        <div>
          <h2 className="font-semibold">Incorrect:</h2>
          <p>{examResult.incorrectAnswers}</p>
        </div>
        <div>
          <h2 className="font-semibold">Score:</h2>
          <p>{examResult.score}</p>
        </div>
      </div>

      {/* Candidate Responses */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mb-2">Candidate Responses:</h2>
        {examResult.candidateResponses &&
        examResult.candidateResponses.length ? (
          <div className="space-y-3">
            {examResult.candidateResponses.map((q, idx) => (
              <div
                key={q.questionId || idx}
                className="border border-gray-200 dark:border-gray-700 rounded-md p-3"
              >
                <p className="font-medium mb-1">
                  Q{idx + 1}: {q.question || "[Question text missing]"}
                </p>
                <p>
                  <span className="font-semibold">Selected Option:</span>{" "}
                  {q.selectedOption || "-"}
                </p>
                <p>
                  <span className="font-semibold">Correct Answer:</span>{" "}
                  {q.correctAnswer || "[Correct answer missing]"}
                </p>
                <p>
                  <span className="font-semibold">Result:</span>{" "}
                  {q.selectedOption === q.correctAnswer ? (
                    <span className="text-green-600 dark:text-green-400">
                      Correct
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">
                      Incorrect
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No responses found.
          </p>
        )}
      </div>
    </div>
  );
};

export default ExamResultViewPage;
