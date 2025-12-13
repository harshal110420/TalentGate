import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCandidates, reassignExam, markResumeReviewed, shortlistCandidateForExam, rejectCandidate, scheduleInterview, markInterviewCompleted, markSelected, markHired, shortlistCandidateForInterview } from "../../../features/Candidate/candidateSlice";
import { fetchAllDepartments } from "../../../features/department/departmentSlice";
import { fetchAllExams } from "../../../features/Exams/examSlice";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Pencil, Send, RefreshCcw, Eye } from "lucide-react";
import { toast } from "react-toastify";
import SkeletonPage from "../../../components/skeletons/skeletonPage";
import { sendCandidateExamMail } from "../../../services/candidateService";
import { getModulePathByMenu } from "../../../utils/navigation";
import ButtonWrapper from "../../../components/ButtonWrapper";
import ConfirmModal from "../../../components/common/ConfirmModal";


const CandidatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sendingId, setSendingId] = useState(null);
  const NA = "Not Available";
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedReassignCandidate, setSelectedReassignCandidate] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [reassignLoading, setReassignLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedViewCandidate, setSelectedViewCandidate] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");
  const [selectedRejectCandidate, setSelectedRejectCandidate] = useState(null);


  const modules = useSelector((state) => state.modules.list);
  const menu = useSelector((state) => state.menus.list);
  const modulePath = getModulePathByMenu("candidate_management", modules, menu);
  console.log("modulePath", modulePath);
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
    // examId: "",
    applicationStage: "all",
    status: "all",
    examStatus: "all",
    source: "all"
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

      const matchesApplicationStatus =
        filters.applicationStage === "all"
          ? true
          : c.applicationStage === filters.applicationStage;

      const matchesSource =
        filters.source === "all"
          ? true
          : c.source === filters.source;

      return (
        matchesSearch &&
        matchesDept &&
        matchesExam &&
        matchesStatus &&
        matchesExamStatus &&
        matchesApplicationStatus &&
        matchesSource
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

  const stageBadgeClasses = (stage) => {
    switch (stage) {
      case "Applied":
        return "bg-gray-100 text-gray-700";

      case "Resume Reviewed":
        return "bg-blue-100 text-blue-700";

      case "Shortlisted for Exam":
        return "bg-indigo-100 text-indigo-700";

      case "Exam Assigned":
        return "bg-yellow-100 text-yellow-800";

      case "Exam Completed":
        return "bg-purple-100 text-purple-700";

      case "Shortlisted for Interview":
        return "bg-indigo-100 text-indigo-700";

      case "Interview Scheduled":
        return "bg-orange-100 text-orange-700";

      case "Interview Completed":
        return "bg-teal-100 text-teal-700";

      case "Selected":
        return "bg-green-100 text-green-700";

      case "Hired":
        return "bg-emerald-100 text-emerald-700 font-semibold";

      case "Rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleResumeReview = async (id) => {
    try {
      await dispatch(markResumeReviewed(id)).unwrap();
      toast.success("Resume reviewed!");
      dispatch(fetchAllCandidates());
    } catch (err) {
      toast.error(err || "Failed to mark resume reviewed");
    }
  };

  const handleShortlistForExam = async (id) => {
    try {
      await dispatch(shortlistCandidateForExam(id)).unwrap();
      toast.success("Candidate shortlisted for exam!");
      dispatch(fetchAllCandidates());
    } catch (err) {
      toast.error(err || "Shortlisting failed");
    }
  };

  const handleShortlistForInterview = async (id) => {
    try {
      await dispatch(shortlistCandidateForInterview(id)).unwrap();
      toast.success("Candidate shortlisted for interview!");
      dispatch(fetchAllCandidates());
    } catch (err) {
      toast.error(err || "Shortlisting failed for interview");
    }
  };

  const handleRejectCandidate = async () => {
    if (!rejectRemark.trim()) {
      toast.error("Please enter rejection remark");
      return;
    }

    try {
      await dispatch(
        rejectCandidate({
          id: selectedRejectCandidate.id,
          remarks: rejectRemark,
        })
      ).unwrap();

      toast.success("Candidate rejected successfully");

      dispatch(fetchAllCandidates());
    } catch (err) {
      toast.error(err || "Failed to reject candidate");
    } finally {
      setRejectModalOpen(false);
      setRejectRemark("");
      setSelectedRejectCandidate(null);
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
      <div className="
  bg-gray-50 dark:bg-gray-900 
  border border-gray-200 dark:border-gray-700 
  rounded-xl p-4 mb-5 
  space-y-3
">

        {/* --- Row 1 : Search (Full Width) --- */}
        <input
          type="text"
          placeholder="Search by name, email or mobile..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="
      w-full
      border border-gray-300 dark:border-gray-600 
      rounded-md px-4 py-2 text-sm 
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
      bg-white dark:bg-gray-800
    "
        />


        {/* --- Row 2 : Dropdown Grid --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">

          {/* Source */}
          <select
            value={filters.source}
            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
            className="filter-select"
          >
            <option value="all">All Sources</option>
            <option value="offline">Offline</option>
            <option value="online">Online</option>
          </select>

          {/* Department */}
          <select
            value={filters.departmentId}
            onChange={(e) =>
              setFilters({ ...filters, departmentId: e.target.value })
            }
            className="filter-select"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Application Stage */}
          <select
            value={filters.applicationStage}
            onChange={(e) =>
              setFilters({ ...filters, applicationStage: e.target.value })
            }
            className="filter-select"
          >
            <option value="all">All Application Stages</option>
            <option value="Applied">Applied</option>
            <option value="Resume Reviewed">Resume Reviewed</option>
            <option value="Shortlisted for Exam">Shortlisted for Exam</option>
            <option value="Exam Assigned">Exam Assigned</option>
            <option value="Exam Completed">Exam Completed</option>
            <option value="Shortlisted for Interview">Shortlisted for Interview</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Interview Completed">Interview Completed</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
            <option value="Hired">Hired</option>
          </select>

          {/* Candidate Status */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          {/* Exam Status */}
          <select
            value={filters.examStatus}
            onChange={(e) =>
              setFilters({ ...filters, examStatus: e.target.value })
            }
            className="filter-select"
          >
            <option value="all">All Exam Status</option>
            <option value="Assigned">Assigned</option>
            <option value="In progress">In progress</option>
            <option value="Completed">Completed</option>
            <option value="Expired">Expired</option>
          </select>

        </div>
      </div>


      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900">
        <table className="min-w-[1500px] w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[11px] font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              {/* <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Mobile</th> */}
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Source</th>
              <th className="px-4 py-3 text-left">Application Stage</th>
              <th className="px-4 py-3 text-left">Exam Status</th>
              <th className="px-4 py-3 text-center">Resume</th>
              {/* <th className="px-4 py-3 text-left">Exam</th> */}
              <th className="px-4 py-3 text-left">Last Mail</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="w-[160px] px-4 py-3 text-center sticky right-[110px] bg-gray-100 dark:bg-gray-800 z-20 shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.25)]">
                Quick Actions
              </th>
              <th className="w-[110px] px-4 py-3 text-center sticky right-0 bg-gray-100 dark:bg-gray-800 z-30 shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.35)]">
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
                  {/* <td className="px-4 py-2">{c.email}</td>
                  <td className="px-4 py-2">{c.mobile || "-"}</td> */}
                  <td className="px-4 py-2">{c.department?.name || "-"}</td>

                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                        ${c.source === "online"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                        }
                        `}
                    >
                      {c.source === "online" ? "Online" : "Offline"}
                    </span>
                  </td>

                  <td className="px-4 py-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
      ${stageBadgeClasses(c.applicationStage)}
    `}
                    >
                      {c.applicationStage}
                    </span>
                  </td>

                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.examStatus === "Assigned"
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

                  <td className="px-4 py-2 text-center">
                    {c.resumeUrl ? (
                      <a
                        href={c.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="
        inline-flex items-center gap-1 px-2 py-1 
        text-xs rounded-md bg-blue-100 text-blue-700
        hover:bg-blue-200 transition
        "
                      >
                        Download
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </td>

                  {/* <td className="px-4 py-2">{c.exam?.name || "-"}</td> */}
                  <td className="px-4 py-2">{formatToIST(c.lastMailSentAt)}</td>

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

                  <td className="w-[200px] px-1 py-1 text-center sticky right-[120px] bg-gray-50 dark:bg-gray-800 z-10 shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.25)]">
                    <div className="flex justify-center items-center gap-2">
                      <ButtonWrapper subModule="Candidate Management" permission="edit">
                        {/* ===== RESUME REVIEW ===== */}
                        {c.applicationStage === "Applied" && c.resumeReviewed !== true && (
                          <button
                            onClick={() => handleResumeReview(c.id)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                            title="Review Resume"
                          >
                            Review Resume
                          </button>
                        )}

                        {/* ===== SHORTLIST FOR EXAM ===== */}
                        {c.applicationStage === "Resume Reviewed" && (
                          <button
                            onClick={() => handleShortlistForExam(c.id)}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded text-xs"
                            title="Shortlist Candidate"
                          >
                            Shortlist for Exam
                          </button>
                        )}

                        {/* ===== SEND EXAM MAIL ===== */}
                        {c.examStatus === "Assigned" && (
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
                        )}

                        {/* ===== REASSIGN EXAM ===== */}
                        {c.examStatus === "Assigned" && (
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
                        )}

                        {/* ===== SHORTLIST FOR INTERVIEW ===== */}
                        {c.applicationStage === "Exam Completed" && (
                          <button
                            onClick={() => handleShortlistForInterview(c.id)}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs"
                            title="Shortlist Candidate for Interview"
                          >
                            Shortlist for Interview
                          </button>
                        )}
                      </ButtonWrapper>
                    </div>
                  </td>

                  <td className="w-[110px] px-4 py-2 text-center sticky right-0 bg-gray-50 dark:bg-gray-800 z-20 shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.35)]">
                    <div className="flex justify-center items-center gap-2">

                      {/* VIEW */}
                      <button
                        onClick={() => {
                          setSelectedViewCandidate(c);
                          setViewModalOpen(true);
                        }}
                        className="text-gray-600 hover:text-black p-1 rounded-full transition"
                        title="View Candidate"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* EDIT */}
                      <ButtonWrapper subModule="Candidate Management" permission="edit">
                        <button
                          onClick={() =>
                            navigate(`/module/${modulePath}/candidate_management/update/${c.id}`)
                          }
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full transition"
                          title="Edit Candidate"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </ButtonWrapper>
                      <ButtonWrapper subModule="Candidate Management" permission="edit">
                        {c.applicationStage !== "Hired" &&
                          c.applicationStage !== "Rejected" && (
                            <button
                              onClick={() => {
                                setSelectedRejectCandidate(c);
                                setRejectModalOpen(true);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs ml-1"
                            >
                              Reject
                            </button>
                          )}
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
      {/* ===== View Modal ===== */}
      {viewModalOpen && selectedViewCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center">

          <div className="
      bg-white dark:bg-gray-900
      w-[92%] max-w-6xl 
      h-[88vh]
      rounded-2xl shadow-2xl
      flex flex-col
      overflow-hidden
      border border-gray-200 dark:border-gray-700
    ">

            {/* ===== HEADER ===== */}
            <div className="px-6 py-4 flex justify-between items-center border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white leading-tight">
                  {selectedViewCandidate.name}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedViewCandidate.email}
                </p>
              </div>

              <div className="flex gap-4 items-center">
                <span className="
            text-xs px-3 py-1 rounded-full
            bg-blue-100 text-blue-700 font-medium
          ">
                  {selectedViewCandidate.applicationStage}
                </span>

                <button
                  onClick={() => setViewModalOpen(false)}
                  className="text-2xl hover:text-red-500 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ===== BODY ===== */}
            <div className="flex flex-1 overflow-hidden">

              {/* ===== LEFT PROFILE CARD ===== */}
              <aside className="w-[300px] p-6 border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">

                {/* Avatar + Basic Info */}
                <div className="text-center">
                  <div className="
              w-24 h-24 mx-auto 
              bg-gradient-to-br from-blue-200 to-blue-100
              dark:from-blue-700 dark:to-blue-600
              text-white text-4xl rounded-full 
              flex items-center justify-center font-bold shadow
            ">
                    {selectedViewCandidate.name[0]}
                  </div>

                  <h4 className="mt-3 text-xl font-semibold text-gray-800 dark:text-white">
                    {selectedViewCandidate.name}
                  </h4>

                  <p className="text-xs text-gray-500 mt-1">
                    HR Rating: {selectedViewCandidate.hrRating || "N/A"} ⭐
                  </p>
                </div>

                <hr className="my-5 border-gray-300 dark:border-gray-700" />

                {/* Basic Details */}
                <div className="text-sm space-y-3 text-gray-700 dark:text-gray-300">
                  <p><b>Mobile:</b> {selectedViewCandidate.mobile || "N/A"}</p>
                  <p><b>Experience:</b> {selectedViewCandidate.experience || "N/A"}</p>
                  <p><b>Source:</b> {selectedViewCandidate.source || "N/A"}</p>
                  <p><b>Recruiter:</b> {selectedViewCandidate.assignedRecruiterId || "N/A"}</p>
                </div>

                {/* Resume Button */}
                {selectedViewCandidate.resumeUrl && (
                  <a
                    href={selectedViewCandidate.resumeUrl}
                    target="_blank"
                    className="
                block text-center mt-6 py-2 rounded-md
                bg-blue-600 hover:bg-blue-700 
                text-white text-sm font-medium shadow
              "
                  >
                    📄 View Resume
                  </a>
                )}

              </aside>

              {/* ===== RIGHT DETAILS AREA ===== */}
              <section className="flex-1 p-6 overflow-y-auto text-sm space-y-6">

                {/* Job Details */}
                <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                  <h5 className="font-semibold mb-3 text-gray-800 dark:text-white">Job Details</h5>
                  <div className="grid grid-cols-3 gap-4 text-gray-600 dark:text-gray-300">
                    <p><b>Job Code:</b> {selectedViewCandidate?.jobCode || "N/A"}</p>
                    <p><b>Job Title:</b> {selectedViewCandidate?.job?.title || "N/A"}</p>
                    <p><b>Designation:</b> {selectedViewCandidate?.job?.designation || "N/A"}</p>
                    <p><b>Department:</b> {selectedViewCandidate?.department?.name || "N/A"}</p>
                  </div>
                </div>

                {/* Exam Status */}
                <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                  <h5 className="font-semibold mb-3 text-gray-800 dark:text-white">Exam Status</h5>
                  <div className="grid grid-cols-3 gap-4 text-gray-600 dark:text-gray-300">
                    <p><b>Exam:</b> {selectedViewCandidate.examId || "Not Assigned"}</p>
                    <p><b>Status:</b> {selectedViewCandidate.examStatus}</p>
                    <p>
                      <b>Last Mail:</b>{" "}
                      {selectedViewCandidate.lastMailSentAt
                        ? new Date(selectedViewCandidate.lastMailSentAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* HR Notes */}
                <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                  <h5 className="font-semibold mb-3 text-gray-800 dark:text-white">HR Remarks</h5>
                  <textarea
                    value={selectedViewCandidate.remarks || ""}
                    disabled
                    className="
                w-full min-h-[140px]
                px-3 py-2
                border rounded-md
                bg-white dark:bg-gray-900
                text-gray-600 dark:text-gray-300
                resize-none leading-relaxed shadow-sm
              "
                  />
                </div>

                {/* Interview Details */}
                <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                  <h5 className="font-semibold mb-3 text-gray-800 dark:text-white">Interview Details</h5>

                  <div className="grid grid-cols-3 gap-4 text-gray-600 dark:text-gray-300">
                    <p><b>Date:</b> {selectedViewCandidate?.interviewDateTime
                      ? new Date(selectedViewCandidate.interviewDateTime).toLocaleString()
                      : "N/A"}</p>
                    <p><b>Mode:</b> {selectedViewCandidate?.interviewMode || "N/A"}</p>
                    <p><b>Panel:</b> {selectedViewCandidate?.interviewPanel || "N/A"}</p>
                    <p><b>Location:</b> {selectedViewCandidate?.interviewLocation || "N/A"}</p>
                    <p className="col-span-3"><b>Remarks:</b> {selectedViewCandidate?.interviewRemarks || "N/A"}</p>
                  </div>
                </div>

                {/* Joining Details */}
                <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                  <h5 className="font-semibold mb-3 text-gray-800 dark:text-white">Joining Details</h5>

                  <div className="grid grid-cols-3 gap-4 text-gray-600 dark:text-gray-300">
                    <p><b>Joining Date:</b> {selectedViewCandidate?.joiningDate || "N/A"}</p>
                    <p><b>Stage:</b> {selectedViewCandidate?.applicationStage || "N/A"}</p>
                    <p><b>HR Rating:</b> {selectedViewCandidate?.hrRating || "N/A"} ⭐</p>
                  </div>
                </div>

                {/* Candidate Lifecycle Log */}
                <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                  <h5 className="font-semibold mb-3 text-gray-800 dark:text-white">Candidate Lifecycle</h5>

                  <div className="grid grid-cols-3 gap-4 text-gray-600 dark:text-gray-300">
                    <p><b>Resume Reviewed At:</b> {selectedViewCandidate?.resumeReviewedAt || "N/A"}</p>
                    <p><b>Shortlisted For Exam:</b> {selectedViewCandidate?.shortlistedForExamAt || "N/A"}</p>
                    <p><b>Exam Assigned At:</b> {selectedViewCandidate?.examAssignedAt || "N/A"}</p>

                    <p><b>Exam Reassigned At:</b> {selectedViewCandidate?.examReassignedAt || "N/A"}</p>
                    <p><b>Exam Completed At:</b> {selectedViewCandidate?.examCompletedAt || "N/A"}</p>
                    <p><b>Shortlisted For Interview:</b> {selectedViewCandidate?.shortlistedForInterviewAt || "N/A"}</p>

                    <p><b>Interview Scheduled At:</b> {selectedViewCandidate?.interviewScheduledAt || "N/A"}</p>
                    <p><b>Interview Completed At:</b> {selectedViewCandidate?.interviewCompletedAt || "N/A"}</p>
                    <p><b>Selected At:</b> {selectedViewCandidate?.selectedAt || "N/A"}</p>

                    <p><b>Rejected At:</b> {selectedViewCandidate?.rejectedAt || "N/A"}</p>
                  </div>
                </div>


                {/* System Metadata */}
                <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                  <h5 className="font-semibold mb-3 text-gray-800 dark:text-white">System Metadata</h5>

                  <div className="grid grid-cols-3 gap-4 text-gray-600 dark:text-gray-300">
                    <p><b>Resume Reviewed:</b> {selectedViewCandidate?.resumeReviewed ? "Yes" : "No"}</p>
                    <p><b>Active:</b> {selectedViewCandidate?.isActive ? "Yes" : "No"}</p>
                  </div>
                </div>

              </section>

            </div>

          </div>

        </div>
      )}

      {/* ===== Reject Modal ===== */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">

          <div className="bg-white rounded-lg p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Reject Candidate</h3>

            <p className="text-sm text-gray-600 mb-2">
              Please enter rejection reason for:
              <b> {selectedRejectCandidate?.name}</b>
            </p>

            <textarea
              rows={4}
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              className="w-full border rounded p-2 text-sm mb-3"
              placeholder="Enter rejection reason"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectRemark("");
                  setSelectedRejectCandidate(null);
                }}
                className="px-3 py-1 border rounded text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleRejectCandidate}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Reject
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ===== Confirm Modal ===== */}
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
      {/* ===== Reassign Modal ===== */}
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
