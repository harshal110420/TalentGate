import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCandidates, reassignExam } from "../../../features/Candidate/candidateSlice";
import { fetchAllDepartments } from "../../../features/department/departmentSlice";
import { fetchAllExams } from "../../../features/Exams/examSlice";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Pencil, Send, RefreshCcw } from "lucide-react";
import { toast } from "react-toastify";
import SkeletonPage from "../../../components/skeletons/skeletonPage";
import { sendCandidateExamMail } from "../../../services/candidateService";
import { getModulePathByMenu } from "../../../utils/navigation";
import ButtonWrapper from "../../../components/ButtonWrapper";
import ConfirmModal from "../../../components/common/ConfirmModal";
import { m } from "framer-motion";

const CandidatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sendingId, setSendingId] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedReassignCandidate, setSelectedReassignCandidate] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [reassignLoading, setReassignLoading] = useState(false);

  const modules = useSelector((state) => state.modules.list);
  console.log("Modules:", modules)
  const menu = useSelector((state) => state.menus.list);
  console.log("menu:", menu)
  const modulePath = getModulePathByMenu("candidate_management", modules, menu);
  console.log("modulePath:", modulePath);
  const {
    list: candidates,
    loading,
    error,
  } = useSelector((state) => state.candidate);
  const departments = useSelector((state) => state.department.list);
  const exams = useSelector((state) => state.exam.list);

  const [filters, setFilters] = useState({
    search: "",
    departmentId: "",
    examId: "",
    status: "all",
    examStatus: "all",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const formatToIST = (utcString) => {
    if (!utcString) return "-";
    const date = new Date(utcString);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
    });
  };

  useEffect(() => {
    dispatch(fetchAllCandidates());
    dispatch(fetchAllDepartments());
    dispatch(fetchAllExams());
  }, [dispatch]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const searchText = filters.search.toLowerCase();
      const matchesSearch =
        c.name?.toLowerCase().includes(searchText) ||
        c.email?.toLowerCase().includes(searchText) ||
        c.mobile?.toLowerCase().includes(searchText);

      const matchesDept = filters.departmentId
        ? c.departmentId === Number(filters.departmentId)
        : true;
      const matchesExam = filters.examId
        ? c.examId === Number(filters.examId)
        : true;
      const matchesStatus =
        filters.status === "all"
          ? true
          : filters.status === "true"
            ? c.isActive
            : !c.isActive;
      const matchesExamStatus =
        filters.examStatus === "all"
          ? true
          : c.examStatus === filters.examStatus;

      return (
        matchesSearch &&
        matchesDept &&
        matchesExam &&
        matchesStatus &&
        matchesExamStatus
      );
    });
  }, [candidates, filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCandidates.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentCandidates = filteredCandidates.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSendMail = async () => {
    if (!selectedCandidate) return;

    setLoadingConfirm(true); // start loading

    if (!selectedCandidate.examId) {
      toast.error("This candidate has no assigned exam.");
      setLoadingConfirm(false);
      return;
    }

    try {
      const { data } = await sendCandidateExamMail(selectedCandidate.id);
      toast.success(data?.message || `Mail sent successfully!`);
      dispatch(fetchAllCandidates());
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send mail.");
    } finally {
      setLoadingConfirm(false); // stop loading
      setConfirmModalOpen(false);
      setSelectedCandidate(null);
    }
  };

  const handleReassign = async () => {
    if (!selectedReassignCandidate || !selectedExamId) {
      toast.error("Please select an exam.");
      return;
    }

    setReassignLoading(true);

    try {
      await dispatch(
        reassignExam({
          candidateId: selectedReassignCandidate.id,
          examId: selectedExamId,
        })
      ).unwrap();

      toast.success("Exam reassigned successfully!");
      dispatch(fetchAllCandidates());

      // Modal ko success ke baad hi close karna
      setReassignModalOpen(false);
      setSelectedReassignCandidate(null);
      setSelectedExamId("");
    } catch (err) {
      toast.error(err || "Failed to reassign exam");
    } finally {
      // Ye rehne do — but modal close yaha nahi hoga
      setReassignLoading(false);
    }
  };



  return (
    <div className="max-w-full px-5 py-5 font-sans text-gray-800 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Candidate Management
        </h1>
        <ButtonWrapper subModule="Candidate Management" permission="new">
          <button
            onClick={() =>
              navigate(`/module/${modulePath}/candidate_management/create`)
            }
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 
      hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium 
      px-2 py-2 rounded-lg shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            Add Candidate
          </button>
        </ButtonWrapper>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-5 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search candidates..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
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
          value={filters.examId}
          onChange={(e) => setFilters({ ...filters, examId: e.target.value })}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
        >
          <option value="">All Exams</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
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
        <select
          value={filters.examStatus}
          onChange={(e) =>
            setFilters({ ...filters, examStatus: e.target.value })
          }
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
        >
          <option value="all">All Exam Status</option>
          <option value="Assigned">Assigned</option>
          <option value="In progress">In progress</option>
          <option value="Completed">Completed</option>
          <option value="Expired">Expired</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[11px] font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Mobile</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Exam</th>
              <th className="px-4 py-3 text-left">Exam Status</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Last Mail</th>
              <th className="px-4 py-3 text-center sticky right-0 bg-gray-100 dark:bg-gray-800 border-l">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-950">
            {loading ? (
              <SkeletonPage rows={4} columns={9} />
            ) : currentCandidates.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-5 text-gray-500">
                  No candidates found.
                </td>
              </tr>
            ) : (
              currentCandidates.map((c, idx) => (
                <tr
                  key={c.id}
                  className={`transition-colors duration-150 ${idx % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-gray-50 dark:bg-gray-800"
                    } hover:bg-blue-50 dark:hover:bg-gray-700`}
                >
                  <td className="px-4 py-2 text-[14px] font-medium">
                    {c.name}
                  </td>
                  <td className="px-4 py-2">{c.email}</td>
                  <td className="px-4 py-2">{c.mobile || "-"}</td>
                  <td className="px-4 py-2">{c.department?.name || "-"}</td>
                  <td className="px-4 py-2">{c.exam?.name || "-"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${c.examStatus === "Assigned"
                        ? "bg-blue-100 text-blue-700"
                        : c.examStatus === "In progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : c.examStatus === "Completed"
                            ? "bg-green-100 text-green-700"
                            : c.examStatus === "Expired"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-200 text-gray-800"
                        }`}
                    >
                      {c.examStatus || "Not assigned"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${c.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2">{formatToIST(c.lastMailSentAt)}</td>
                  <td className="px-4 py-2 text-center sticky right-0 bg-gray-50 dark:bg-gray-800 border-l">
                    <div className="flex justify-center items-center gap-2">
                      <ButtonWrapper
                        subModule="Candidate Management"
                        permission="edit"
                      >
                        <button
                          onClick={() =>
                            navigate(
                              `/module/${modulePath}/candidate_management/update/${c.id}`
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full transition"
                          title="Edit Candidate"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </ButtonWrapper>
                      <button
                        onClick={() => {
                          setSelectedCandidate(c);
                          setConfirmModalOpen(true);
                        }}
                        disabled={sendingId === c.id}
                        className={`${sendingId === c.id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          } text-white p-1.5 rounded-full transition`}
                        title="Send Exam Mail"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReassignCandidate(c);
                          setSelectedExamId(c.examId || "");
                          setReassignModalOpen(true);
                        }}
                        className="text-purple-600 hover:text-purple-800 p-1 rounded-full transition"
                        title="Reassign Exam"
                      >
                        <RefreshCcw className="w-4 h-4" />
                      </button>

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

      <ConfirmModal
        open={confirmModalOpen}
        title="Send Exam Mail"
        message={`Are you sure you want to send the exam mail to ${selectedCandidate?.name}?`}
        onConfirm={handleSendMail}
        onCancel={() => {
          if (!loadingConfirm) {
            setConfirmModalOpen(false);
            setSelectedCandidate(null);
          }
        }}
        loading={loadingConfirm}
      />

      <ConfirmModal
        open={reassignModalOpen}
        title="Reassign Exam"
        message={
          selectedReassignCandidate &&
          `Do you really want to reassign the exam to ${selectedReassignCandidate.name}?`
        }
        onConfirm={handleReassign}
        onCancel={() => {
          if (!reassignLoading) {
            setReassignModalOpen(false);
            setSelectedReassignCandidate(null);
          }
        }}
        loading={reassignLoading}
      />


    </div>
  );
};

export default CandidatePage;
