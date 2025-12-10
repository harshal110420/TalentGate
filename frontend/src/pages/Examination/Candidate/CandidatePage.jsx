import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCandidates, reassignExam, markResumeReviewed, shortlistCandidate, rejectCandidate, scheduleInterview, markInterviewPassed, markSelected, markHired } from "../../../features/Candidate/candidateSlice";
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
  // Interview scheduling states
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [selectedInterviewCandidate, setSelectedInterviewCandidate] = useState(null);
  // Selecting states
  const [showHireModal, setShowHireModal] = useState(false);
  const [hireCandidateId, setHireCandidateId] = useState(null);
  const [joiningDate, setJoiningDate] = useState("");

  const [interviewForm, setInterviewForm] = useState({
    interviewDateTime: "",
    interviewMode: "",
    interviewLocation: "",
    interviewPanel: "",
    interviewRemarks: "",
  });

  const modules = useSelector((state) => state.modules.list);
  const menu = useSelector((state) => state.menus.list);
  const modulePath = getModulePathByMenu("candidate_management", modules, menu);
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

      case "Shortlisted":
        return "bg-indigo-100 text-indigo-700";

      case "Exam Assigned":
        return "bg-yellow-100 text-yellow-800";

      case "Exam Completed":
        return "bg-purple-100 text-purple-700";

      case "Interview Scheduled":
        return "bg-orange-100 text-orange-700";

      case "Interview Passed":
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

  const handleShortlist = async (id) => {
    try {
      await dispatch(shortlistCandidate(id)).unwrap();
      toast.success("Candidate shortlisted!");
      dispatch(fetchAllCandidates());
    } catch (err) {
      toast.error(err || "Shortlisting failed");
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

  const handleScheduleInterview = async () => {
    if (!interviewForm.interviewDateTime || !interviewForm.interviewMode) {
      toast.error("Interview Date and Mode required");
      return;
    }

    try {
      await dispatch(
        scheduleInterview({
          id: selectedInterviewCandidate.id,
          payload: interviewForm,
        })
      ).unwrap();

      toast.success("Interview scheduled");

      setInterviewModalOpen(false);
      setInterviewForm({
        interviewDateTime: "",
        interviewMode: "",
        interviewLocation: "",
        interviewPanel: "",
        interviewRemarks: "",
      })
    } catch (err) {
      toast.error(err);
    }
  };

  const handleInterviewPassed = async (id) => {
    try {
      await dispatch(markInterviewPassed(id)).unwrap();
      toast.success("Interview Passed");
    } catch (err) {
      toast.error(err || "Failed to mark interview passed");
    }
  };

  const handleSelectCandidate = async (id) => {
    try {
      await dispatch(markSelected(id)).unwrap();
      toast.success("Candidate Selected");
    } catch (err) {
      toast.error(err || "Failed to mark candidate selected");
    }
  };

  const openHireModal = (id) => {
    setHireCandidateId(id);
    setJoiningDate("");
    setShowHireModal(true);
  };

  const submitHiring = async () => {
    if (!joiningDate) {
      toast.error("Joining date required");
      return;
    }

    try {
      await dispatch(
        markHired({ id: hireCandidateId, joiningDate })
      ).unwrap();

      toast.success("Candidate Hired Successfully");

      setShowHireModal(false);
      setHireCandidateId(null);
    } catch (err) {
      toast.error(err);
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
            <option value="Shortlisted">Shortlisted</option>
            <option value="Exam Assigned">Exam Assigned</option>
            <option value="Exam Completed">Exam Completed</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Interview Passed">Interview Passed</option>
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
        <table className="min-w-[1400px] w-full text-sm">
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
              <th className="w-[110px] px-4 py-3 text-center sticky right-[150px] bg-gray-100 dark:bg-gray-800 border-l-2 border-r-2 z-20">
                Quick Actions
              </th>

              <th className="w-[110px] px-4 py-3 text-center sticky right-0 bg-gray-100 dark:bg-gray-800 border-l-2 border-r-2 z-30">
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

                  <td className="w-[110px] px-4 py-2 text-center sticky right-[150px] bg-gray-50 dark:bg-gray-800 border-l-2 border-r-2 z-10">
                    <div className="flex justify-center items-center gap-2">
                      {/* ===== RESUME REVIEW ===== */}
                      {c.applicationStage === "Applied" && c.resumeReviewed !== true && (
                        <button
                          onClick={() => handleResumeReview(c.id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                          title="Review Resume"
                        >
                          Review
                        </button>
                      )}

                      {/* ===== SHORTLIST ===== */}
                      {c.applicationStage === "Resume Reviewed" && (
                        <button
                          onClick={() => handleShortlist(c.id)}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded text-xs"
                          title="Shortlist Candidate"
                        >
                          Shortlist
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

                      {/* ===== SCHEDULE INTERVIEW ===== */}
                      {c.applicationStage === "Exam Completed" && (
                        <button
                          onClick={() => {
                            setSelectedInterviewCandidate(c);
                            setInterviewModalOpen(true);
                          }}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 rounded text-xs"
                          title="Schedule Interview"
                        >
                          Schedule Interview
                        </button>
                      )}

                      {/* ===== INTERVIEW PASSED ===== */}
                      {c.applicationStage === "Interview Scheduled" && (
                        <button
                          onClick={() => handleInterviewPassed(c.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                          title="Mark Interview Passed"
                        >
                          Pass
                        </button>
                      )}

                      {/* ===== SELECT CANDIDATE ===== */}
                      {c.applicationStage === "Interview Passed" && (
                        <button
                          onClick={() => handleSelectCandidate(c.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-xs"
                          title="Mark Selected"
                        >
                          Select
                        </button>
                      )}
                      {/* ===== HIRE BUTTON ===== */}
                      {c.applicationStage === "Selected" && (
                        <button
                          onClick={() => openHireModal(c.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-xs"
                        >
                          Hire
                        </button>
                      )}

                    </div>
                  </td>

                  <td className="w-[110px] px-4 py-2 text-center sticky right-0 bg-gray-50 dark:bg-gray-800 border-l-2 border-r-2 z-20">
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
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">

          <div className="
      bg-white dark:bg-gray-900
      w-[90%] max-w-6xl 
      h-[90vh]
      rounded-2xl shadow-2xl
      flex flex-col
      overflow-hidden
    ">

            {/* ===== HEADER ===== */}
            <div className="px-6 py-4 flex justify-between items-center border-b dark:border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {selectedViewCandidate.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedViewCandidate.email}
                </p>
              </div>

              <div className="flex gap-4 items-center">
                <span className="
            text-xs px-3 py-1 rounded-full
            bg-blue-100 text-blue-700
          ">
                  {selectedViewCandidate.applicationStage}
                </span>

                <button
                  onClick={() => setViewModalOpen(false)}
                  className="text-xl hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ===== BODY ===== */}
            <div className="flex flex-1 overflow-hidden">

              {/* ===== LEFT PROFILE CARD ===== */}
              <aside className="w-[280px] border-r dark:border-gray-700 p-5 space-y-4 bg-gray-50 dark:bg-gray-800">

                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-blue-700">
                    {selectedViewCandidate.name[0]}
                  </div>

                  <h4 className="mt-3 font-semibold">
                    {selectedViewCandidate.name}
                  </h4>

                  <p className="text-xs text-gray-500">
                    Rating : {selectedViewCandidate.hrRating || "N/A"}⭐
                  </p>
                </div>

                <hr />

                <div className="text-sm space-y-2">
                  <p><b>Mobile:</b> {selectedViewCandidate.mobile || "N/A"}</p>
                  <p><b>Experience:</b> {selectedViewCandidate.experience || "N/A"}</p>
                  <p><b>Source:</b> {selectedViewCandidate.source}</p>

                  <p>
                    <b>Recruiter:</b> {selectedViewCandidate.assignedRecruiterId || "N/A"}
                  </p>
                </div>

                {selectedViewCandidate.resumeUrl && (
                  <a
                    href={selectedViewCandidate.resumeUrl}
                    target="_blank"
                    className="
                block text-center py-2 rounded-md
                bg-blue-600 hover:bg-blue-700 text-white text-sm
              "
                  >
                    📄 View Resume
                  </a>
                )}

              </aside>


              {/* ===== RIGHT DETAILS AREA ===== */}
              <section className="
          flex-1 p-6
          overflow-y-auto
          text-sm
          space-y-4
        ">

                {/* ----- Job Details ----- */}
                <div>
                  <h5 className="font-bold mb-1">Job Details</h5>

                  <div className="grid grid-cols-3 gap-4 text-gray-600">
                    <p>
                      <b>Job Code:</b>
                      {selectedViewCandidate?.jobCode || NA}
                    </p>
                    <p>
                      <b>Job Title:</b>
                      {selectedViewCandidate?.job?.title || NA}
                    </p>
                    <p>
                      <b>Job Designation:</b>
                      {selectedViewCandidate?.job?.designation || NA}
                    </p>
                    <p>
                      <b>Department:</b>
                      {selectedViewCandidate?.department?.name || NA}
                    </p>
                  </div>
                </div>


                {/* ----- Exam Status ----- */}
                <div>
                  <h5 className="font-bold mb-1">Exam Status</h5>

                  <div className="grid grid-cols-3 gap-3 text-gray-600">
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

                {/* ----- HR Notes ----- */}
                <div>
                  <h5 className="font-bold mb-1">HR Remarks</h5>

                  <textarea
                    value={selectedViewCandidate.remarks || ""}
                    disabled
                    className="
                w-full min-h-[120px]
                px-3 py-2
                border rounded-md
                bg-gray-50 dark:bg-gray-800
                resize-none
              "
                  />
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
      {/* ===== Interview Modal ===== */}
      {interviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md">

            <h3 className="text-lg font-bold mb-4">
              Schedule Interview — {selectedInterviewCandidate?.name}
            </h3>

            <div className="space-y-3">

              <input
                type="datetime-local"
                value={interviewForm.interviewDateTime}
                onChange={(e) =>
                  setInterviewForm({
                    ...interviewForm,
                    interviewDateTime: e.target.value,
                  })
                }
                className="w-full input"
              />

              <select
                value={interviewForm.interviewMode}
                onChange={(e) =>
                  setInterviewForm({
                    ...interviewForm,
                    interviewMode: e.target.value,
                  })
                }
                className="w-full input"
              >
                <option value="">Select Mode</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Telephonic">Telephonic</option>
              </select>

              <input
                placeholder="Interview location or Meeting link"
                value={interviewForm.interviewLocation}
                onChange={(e) =>
                  setInterviewForm({
                    ...interviewForm,
                    interviewLocation: e.target.value,
                  })
                }
                className="w-full input"
              />

              <input
                placeholder="Interviewer / Panel"
                value={interviewForm.interviewPanel}
                onChange={(e) =>
                  setInterviewForm({
                    ...interviewForm,
                    interviewPanel: e.target.value,
                  })
                }
                className="w-full input"
              />

              <textarea
                rows={3}
                placeholder="Remarks"
                value={interviewForm.interviewRemarks}
                onChange={(e) =>
                  setInterviewForm({
                    ...interviewForm,
                    interviewRemarks: e.target.value,
                  })
                }
                className="w-full input"
              />

            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setInterviewModalOpen(false)}
                className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleScheduleInterview}
                className="px-4 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded"
              >
                Schedule
              </button>
            </div>

          </div>
        </div>
      )}
      {/* ===== Hire Modal ===== */}
      {showHireModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-5 w-[320px]">
            <h3 className="text-lg font-semibold mb-3">Confirm Hiring</h3>

            <input
              type="date"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
              className="w-full border px-3 py-2 mb-3 rounded"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowHireModal(false)}
                className="border px-3 py-1 rounded"
              >
                Cancel
              </button>

              <button
                onClick={submitHiring}
                className="bg-emerald-600 text-white px-3 py-1 rounded"
              >
                Confirm
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
