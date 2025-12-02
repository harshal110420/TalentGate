import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchExamResultsGrouped } from "../../../features/Exams/examResultSlice";
import { ArrowLeft, BookOpen, Eye } from "lucide-react";
import SkeletonPage from "../../../components/skeletons/skeletonPage";
import { getModulePathByMenu } from "../../../utils/navigation";
import { downloadExamResultPDF } from "../../../features/Exams/examResultPdfSlice";

const ExamResultDetailPage = ({ resultId }) => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const modules = useSelector((state) => state.modules.list);
  const menu = useSelector((state) => state.menus.list);
  const modulePath = getModulePathByMenu("exam_results", modules, menu);

  const { downloading } = useSelector((state) => state.examResultPdf);
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadPDF = async (id) => {
    setDownloadingId(id);
    await dispatch(downloadExamResultPDF(id));
    setDownloadingId(null);
  };
  const { groupedList, loading, error } = useSelector(
    (state) => state.examResult
  );

  const [candidateData, setCandidateData] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5; // Set number of exams per page

  useEffect(() => {
    if (!groupedList?.length) {
      dispatch(fetchExamResultsGrouped());
    }
  }, [dispatch, groupedList]);

  useEffect(() => {
    if (groupedList?.length) {
      const found = groupedList.find(
        (item) => item.candidateId === parseInt(candidateId)
      );
      setCandidateData(found || null);
    }
  }, [groupedList, candidateId]);

  // Pagination logic for exams
  const totalPages = candidateData
    ? Math.ceil(candidateData.exams?.length / rowsPerPage)
    : 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentExams = candidateData?.exams?.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-full px-5 py-5 font-sans text-gray-800 dark:text-gray-100">
      {/* Back Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
          Candidate Exam Details
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {loading ? (
        <SkeletonPage rows={5} columns={7} />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : !candidateData ? (
        <p className="text-gray-500">No data found for this candidate.</p>
      ) : (
        <>
          {/* Candidate Info */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-5">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
              Candidate Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Name:
                </span>{" "}
                {candidateData.candidateName}
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Email:
                </span>{" "}
                {candidateData.email}
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Department:
                </span>{" "}
                {candidateData.candidateDepartment || "-"}
              </div>
            </div>
          </div>

          {/* Exam Table */}
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900">
            <table className="min-w-[1000px] w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[11px] font-medium">
                <tr>
                  <th className="px-4 py-3 text-left">Exam Name</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Level</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-center">Result</th>
                  <th className="px-4 py-3 text-center">Submitted At</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-950">
                {currentExams?.length ? (
                  currentExams.map((exam, idx) => (
                    <tr
                      key={exam.id}
                      className={`transition-colors duration-150 ${
                        idx % 2 === 0
                          ? "bg-white dark:bg-gray-900"
                          : "bg-gray-50 dark:bg-gray-800"
                      } hover:bg-blue-50 dark:hover:bg-gray-700`}
                    >
                      <td className="px-4 py-2 text-[14px] font-medium">
                        {exam.examName}
                      </td>
                      <td className="px-4 py-2">
                        {exam.examDepartment || "-"}
                      </td>
                      <td className="px-4 py-2">{exam.examLevel || "-"}</td>
                      <td className="px-4 py-2 text-center">
                        {exam.score ?? "-"}
                      </td>
                      <td
                        className={`px-4 py-2 text-center font-medium ${
                          exam.resultStatus === "pass"
                            ? "text-green-600"
                            : exam.resultStatus === "fail"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {exam.resultStatus || "Pending"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {exam.submittedAt
                          ? new Date(exam.submittedAt).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() =>
                            navigate(
                              `/module/${modulePath}/exam_results/${candidateId}/exam/${exam.id}`
                            )
                          }
                          className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition"
                          title="View Question-wise Details"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline text-sm">View</span>
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(exam.id)}
                          disabled={downloading}
                          className="inline-flex items-center gap-1 px-3 py-1 ml-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                          title="Download Candidate Report PDF"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span className="hidden sm:inline text-sm">
                            {downloadingId === exam.id
                              ? "Generating..."
                              : "Download PDF"}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-5 text-gray-500 dark:text-gray-400"
                    >
                      No exams found for this candidate.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3 py-1.5 border rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1.5 border rounded-md text-sm font-medium transition ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white border-blue-600"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3 py-1.5 border rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExamResultDetailPage;
