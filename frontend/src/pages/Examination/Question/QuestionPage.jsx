import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchQuestions,
  deleteQuestion,
  bulkUploadQuestions,
  exportQuestionsToExcel,
} from "../../../features/questions/questionsSlice";
import { fetchAllSubjects } from "../../../features/subject/subjectSlice";
import { fetchAllDepartments } from "../../../features/department/departmentSlice";
import { fetchAllLevels } from "../../../features/level/levelSlice";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Download,
  FileUp,
  Loader2,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";
import SkeletonPage from "../../../components/skeletons/skeletonPage";
import ButtonWrapper from "../../../components/ButtonWrapper";
import ConfirmModal from "../../../components/common/ConfirmModal";
import { getModulePathByMenu } from "../../../utils/navigation";
import UploadStatusModal from "../../../components/common/UploadStatusModal";

const QuestionPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const modules = useSelector((state) => state.modules.list);
  const menu = useSelector((state) => state.menus.list);
  const modulePath = getModulePathByMenu("question_management", modules, menu);

  const {
    list: questions,
    loading,
    error,
  } = useSelector((state) => state.questions);
  const departments = useSelector((state) => state.department.list);
  const levels = useSelector((state) => state.level.list);
  const subjects = useSelector((state) => state.subjects.list);
  const { bulkUploadLoading } = useSelector((state) => state.questions);
  const fileInputRef = useRef();

  const [filters, setFilters] = useState({
    search: "",
    departmentId: "",
    subjectId: "",
    levelId: "",
    status: "all",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    questionId: null,
  });

  // ---------------------- useEffect ----------------------

  // Fetch dropdown data only once (departments, subjects, levels)
  useEffect(() => {
    dispatch(fetchAllDepartments());
    dispatch(fetchAllSubjects());
    dispatch(fetchAllLevels());
  }, [dispatch]);

  // ✅ Fetch questions with debounce (500ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        departmentId: filters.departmentId || undefined,
        subjectId: filters.subjectId || undefined,
        levelId: filters.levelId || undefined,
        search: filters.search || undefined,
        isActive: filters.status, // "all", "true", or "false"
      };
      dispatch(fetchQuestions(params));
    }, []);

    // Cleanup function to cancel the timeout if user keeps typing or changing filters
    return () => clearTimeout(handler);
  }, [
    dispatch,
    filters.search,
    filters.departmentId,
    filters.subjectId,
    filters.levelId,
    filters.status,
    currentPage,
  ]);

  const totalPages = useSelector((state) => state.questions.totalPages);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentQuestions = questions;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteQuestion(id)).unwrap();
      toast.success("Question deleted successfully");
    } catch {
      toast.error("Failed to delete question");
    }
    setConfirmModal({ isOpen: false, questionId: null });
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    dispatch(bulkUploadQuestions(formData))
      .unwrap()
      .then(() => {
        toast.success("Bulk upload successful");
        dispatch(fetchQuestions());
      })
      .catch((err) => {
        toast.error(`Upload failed: ${err}`);
      })
      .finally(() => {
        // 👇 important: reset file input value
        fileInputRef.current.value = "";
      });
  };

  return (
    <div className="max-w-full px-5 py-5 font-sans text-gray-800 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Question Management
        </h1>
        <div className="flex items-center gap-2">
          {/* Bulk Upload */}
          <ButtonWrapper subModule="Question Management" permission="upload">
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  document.getElementById("bulk-upload-input").click()
                }
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 
        hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium 
        px-2 py-2 rounded-lg shadow-sm transition disabled:opacity-60"
                disabled={bulkUploadLoading}
              >
                <FileUp className="w-4 h-4" />
                <span className="flex items-center gap-1">
                  {bulkUploadLoading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {bulkUploadLoading ? "Uploading..." : "Bulk Upload"}
                </span>
              </button>

              <input
                ref={fileInputRef}
                id="bulk-upload-input"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleBulkUpload}
                style={{ display: "none" }}
              />
              <a
                href="/static/QuestionBank_Upload_Format.xlsx"
                download
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 
        hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium 
        px-2 py-2 rounded-lg shadow-sm transition disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                <span>Download Format</span>
              </a>
            </div>
          </ButtonWrapper>
          <ButtonWrapper subModule="Question Management" permission="new">
            <button
              onClick={() =>
                navigate(`/module/${modulePath}/question_management/create`)
              }
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 
              hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium 
              px-2 py-2 rounded-lg shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              Add Question
            </button>
          </ButtonWrapper>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-5 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search questions..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm flex-1 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
        />

        <select
          value={filters.departmentId}
          onChange={(e) =>
            setFilters({ ...filters, departmentId: e.target.value })
          }
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={filters.subjectId}
          onChange={(e) =>
            setFilters({ ...filters, subjectId: e.target.value })
          }
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={filters.levelId}
          onChange={(e) => setFilters({ ...filters, levelId: e.target.value })}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
        >
          <option value="">All Levels</option>
          {levels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
        >
          <option value="all">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[11px] font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Question</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Subject</th>
              <th className="px-4 py-3 text-left">Level</th>
              <th className="px-4 py-3 text-left">Time Limit</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center sticky right-0 bg-gray-100 dark:bg-gray-800 border-l">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-950">
            {loading ? (
              <SkeletonPage rows={5} columns={7} />
            ) : currentQuestions.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-5 text-gray-500">
                  No questions found.
                </td>
              </tr>
            ) : (
              currentQuestions.map((q, idx) => (
                <tr
                  key={q.id}
                  className={`transition-colors duration-150 ${idx % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-gray-50 dark:bg-gray-800"
                    } hover:bg-blue-50 dark:hover:bg-gray-700`}
                >
                  <td className="px-4 py-2 text-[14px] font-medium truncate max-w-[300px]">
                    {q.question}
                  </td>
                  <td className="px-4 py-2">{q.department?.name || "-"}</td>
                  <td className="px-4 py-2">{q.subject?.name || "-"}</td>
                  <td className="px-4 py-2">{q.level?.name || "-"}</td>
                  <td className="px-4 py-2">{q.timeLimit || "-"} sec</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${q.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {q.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center sticky right-0 bg-gray-50 dark:bg-gray-800 border-l">
                    <div className="flex justify-center items-center gap-2">
                      <ButtonWrapper
                        subModule="Question Management"
                        permission="edit"
                      >
                        <button
                          onClick={() =>
                            navigate(
                              `/module/${modulePath}/question_management/update/${q.id}`
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full transition"
                          title="Edit Question"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </ButtonWrapper>
                      <ButtonWrapper
                        subModule="Question Management"
                        permission="details"
                      >
                        <button
                          onClick={() =>
                            navigate(
                              `/module/${modulePath}/question_management/view/${q.id}`
                            )
                          }
                          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
                          title="Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </ButtonWrapper>
                    </div>
                  </td>
                </tr>
              ))
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
              className={`px-3 py-1.5 border rounded-md text-sm font-medium transition ${currentPage === i + 1
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

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmModal.isOpen}
        title="Delete Question"
        message="Are you sure you want to delete this question?"
        onConfirm={() => handleDelete(confirmModal.questionId)}
        onCancel={() => setConfirmModal({ isOpen: false, questionId: null })}
      />

      <UploadStatusModal
        open={bulkUploadLoading}
        message="Uploading questions..."
      />
    </div>
  );
};

export default QuestionPage;
