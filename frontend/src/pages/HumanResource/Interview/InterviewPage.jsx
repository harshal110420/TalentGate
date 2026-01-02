import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCandidatesOverview } from "../../../features/HR_Slices/Interview/InterviewSlice";
import { fetchAllCandidates, rejectCandidate, scheduleInterview, markInterviewCompleted, markSelected, markHired, markInterviewCancelled } from "../../../features/Candidate/candidateSlice";
import SkeletonPage from "../../../components/skeletons/skeletonPage";
import ButtonWrapper from "../../../components/ButtonWrapper";
import { toast } from "react-toastify";
import CustomCalendar from "../../../components/common/CustomCalendar";
import { createInterview, rescheduleInterview } from "../../../features/Interview/InterviewSlice";
import { fetchUsers } from "../../../features/users/userSlice";
import Select from "react-select";
import { UserRoundX } from "lucide-react";
import { fetchAllInterviews } from "../../../features/HR_Slices/Interview/InterviewSlice";
const CandidatesOverviewPage = () => {
  const dispatch = useDispatch();

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    departmentId: "",
    examId: "",
    sortBy: "name",
    sortOrder: "asc",
    applicationStage: "",
  });

  const [interviewForm, setInterviewForm] = useState({
    interviewDate: "",
    startTime: "",
    endTime: "",
    round: "",
    interviewType: "Online", // Online | Offline | Telephonic
    locationOrLink: "",
    panel: [],
    notes: "",
  });



  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const { userList = [] } = useSelector((state) => state.users);
  const { candidates, loading } = useSelector((state) => state.candidatesOverview);
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
  // Cancel Interview states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedRescheduleInterview, setSelectedRescheduleInterview] = useState(null);
  const { allInterviews } = useSelector((state) => state.candidatesOverview);
  console.log("all interviewes:", allInterviews)
  const departments = useSelector((state) => state.department.list);
  const exams = useSelector((state) => state.exam.list);

  const panelOptions = userList.map((user) => ({
    value: user.id,
    label: `${user.firstName} ${user.lastName || ""}`,
  }));

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchCandidatesOverview());
    dispatch(fetchAllInterviews())
  }, [dispatch]);

  // Filtering + Sorting
  const filteredList = useMemo(() => {
    let data = [...candidates];

    // 🔍 SEARCH
    if (filters.search.trim()) {
      const s = filters.search.toLowerCase();
      data = data.filter(
        (i) =>
          i.name?.toLowerCase().includes(s) ||
          i.email?.toLowerCase().includes(s) ||
          i.mobile?.toLowerCase().includes(s)
      );
    }

    // 🏢 DEPARTMENT FILTER
    if (filters.departmentId) {
      data = data.filter(
        (i) => i.department?.id == filters.departmentId
      );
    }

    // 💼 JOB FILTER (not examId)
    if (filters.examId) {
      data = data.filter(
        (i) => i.job?.id == filters.examId
      );
    }

    // 🔃 SORTING
    data.sort((a, b) => {
      let valA;
      let valB;

      switch (filters.sortBy) {
        case "name":
          valA = a.name || "";
          valB = b.name || "";
          break;

        case "date":
          valA = new Date(a.created_at);
          valB = new Date(b.created_at);
          break;

        default:
          return 0;
      }

      if (filters.sortOrder === "asc") return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    return data;
  }, [candidates, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredList.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredList.slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => {
    if (interviewModalOpen) {
      setInterviewForm({
        interviewDate: "",
        startTime: "",
        endTime: "",
        round: "",
        interviewType: "Online",
        locationOrLink: "",
        panel: [],
        notes: "",
      });
    }
  }, [interviewModalOpen]);

  const stageBadgeClasses = (stage) => {
    switch (stage) {
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

      dispatch(fetchCandidatesOverview());
      dispatch(fetchAllInterviews());
    } catch (err) {
      toast.error(err || "Failed to reject candidate");
    } finally {
      setRejectModalOpen(false);
      setRejectRemark("");
      setSelectedRejectCandidate(null);
    }
  };

  const handleScheduleInterview = async () => {
    // ❗ Interview round mandatory
    if (!interviewForm.round) {
      toast.error("Please select interview round");
      return;
    }

    // ❗ Panel must have at least one member
    if (!interviewForm.panel || interviewForm.panel.length === 0) {
      toast.error("Please select interview panel");
      return;
    }
    // ❗ Required fields
    if (
      !interviewForm.interviewDate ||
      !interviewForm.startTime ||
      !interviewForm.endTime ||
      !interviewForm.panel
    ) {
      toast.error("Please fill all required interview details");
      return;
    }

    try {
      await dispatch(
        createInterview({
          candidateId: selectedInterviewCandidate.id,
          jobId: selectedInterviewCandidate.job?.id,

          round: interviewForm.round,
          interviewType: interviewForm.interviewType,

          interviewDate: interviewForm.interviewDate,
          startTime: interviewForm.startTime,
          endTime: interviewForm.endTime,

          meetingLink:
            interviewForm.interviewType === "Online"
              ? interviewForm.locationOrLink
              : null,

          location:
            interviewForm.interviewType !== "Online"
              ? interviewForm.locationOrLink
              : null,

          panel: interviewForm.panel,   // ✅ ONLY THIS
          notes: interviewForm.notes,
        })
      ).unwrap();


      toast.success("Interview scheduled successfully");

      dispatch(fetchCandidatesOverview());
      dispatch(fetchAllInterviews());
      setInterviewModalOpen(false);
      setSelectedInterviewCandidate(null);

      // reset form
      setInterviewForm({
        interviewDate: "",
        startTime: "",
        endTime: "",
        round: "",
        interviewType: "Online",
        locationOrLink: "",
        panel: [],
        notes: "",
      });

    } catch (err) {
      toast.error(err || "Failed to schedule interview");
    }
  };

  const handleInterviewCompleted = async (id) => {
    try {
      await dispatch(markInterviewCompleted(id)).unwrap();
      toast.success("Interview completed");
      dispatch(fetchCandidatesOverview());
      dispatch(fetchAllInterviews());
    } catch (err) {
      toast.error(err || "Failed to mark interview completed");
    }
  };

  const handleSelectCandidate = async (id) => {
    try {
      await dispatch(markSelected(id)).unwrap();
      toast.success("Candidate Selected");
      dispatch(fetchCandidatesOverview());
      dispatch(fetchAllInterviews());
    } catch (err) {
      toast.error(err || "Failed to mark candidate selected");
    }
  };

  const handleCancelInterview = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    try {
      await dispatch(
        markInterviewCancelled({
          interviewId: selectedInterviewId,
          cancelReason,
        })
      ).unwrap();

      toast.success("Interview cancelled successfully");
      dispatch(fetchCandidatesOverview());
      dispatch(fetchAllInterviews());
      // Reset modal & state
      setCancelModalOpen(false);
      setCancelReason("");
      setSelectedInterviewId(null);
    } catch (err) {
      toast.error(err || "Failed to cancel interview");
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
      dispatch(fetchCandidatesOverview());
      setShowHireModal(false);
      setHireCandidateId(null);
    } catch (err) {
      toast.error(err);
    }
  };

  const calculateDuration = (start, end) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    if (endMinutes <= startMinutes) return "Invalid time range";

    const diff = endMinutes - startMinutes;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    return `${hours ? `${hours}h ` : ""}${minutes}m`;
  };

  const getInterviewInfo = (interviews = []) => {
    if (!interviews.length) {
      return {
        activeInterview: null,
        lastInterview: null,
        canScheduleNext: true,
      };
    }

    const activeInterview = interviews.find((i) =>
      ["Scheduled", "Rescheduled"].includes(i.status)
    );
    console.log("Active Interview:", activeInterview)
    const sorted = [...interviews].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const lastInterview = sorted[0];
    console.log("last Interview:", lastInterview)
    return {
      activeInterview,
      lastInterview,
      canScheduleNext: !activeInterview, // 🔥 key rule
    };
  };

  const smallCuteBtn =
    "w-full px-2 py-1 text-[12px] font-medium rounded-xl shadow-sm transition hover:scale-[1.02] active:scale-[0.98]";




  return (
    <div className="max-w-full px-5 py-5 font-sans text-gray-800 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Interview Scheduled Screen</h1>
      </div>

      {/* -------------------------------- FILTERS -------------------------------- */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-5 space-y-3">

        {/* Search */}
        <input
          type="text"
          placeholder="Search candidate..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-gray-800"
        />

        {/* Grid Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

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
            <option value="">All Stages</option>
            <option value="Shortlisted for Interview">Shortlisted for Interview</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Interview Completed">Interview Completed</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
            <option value="Hired">Hired</option>
          </select>

          {/* Sort By */}
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters({ ...filters, sortBy: e.target.value })
            }
            className="filter-select"
          >
            <option value="name">Sort by Name</option>
            <option value="score">Sort by Score</option>
            <option value="date">Sort by Date</option>
          </select>

          {/* Sort Order */}
          <select
            value={filters.sortOrder}
            onChange={(e) =>
              setFilters({ ...filters, sortOrder: e.target.value })
            }
            className="filter-select"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>

        </div>
      </div>

      {/* -------------------------------- TABLE -------------------------------- */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900">
        <table className="min-w-[1400px] w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[11px] font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Candidate</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Exam Result</th>
              <th className="px-4 py-3 text-left">Application Stage</th>
              <th className="px-4 py-3 text-left">Job </th>
              <th className="px-4 py-3 text-left">Interview Status</th>
              <th className="px-4 py-3 text-left">Interview Round</th>
              <th className="w-[160px] px-4 py-3 text-center sticky right-[120px] bg-gray-100 dark:bg-gray-800 z-20 shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.25)]">
                Quick Actions
              </th>
              <th className="w-[120px] px-4 py-3 text-center sticky right-0 bg-gray-100 dark:bg-gray-800 z-30 shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.35)]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <SkeletonPage rows={4} columns={8} />
            ) : currentRows.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-5 text-gray-500">
                  No records found.
                </td>
              </tr>
            ) : (
              currentRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">{row.name}</td>

                  <td className="px-4 py-3">
                    {row.department?.name ?? "-"}
                  </td>

                  <td
                    className={`px-4 py-3 font-semibold text-center capitalize ${row.examResults?.[0]?.resultStatus === "pass"
                      ? "text-green-600"
                      : row.examResults?.[0]?.resultStatus === "fail"
                        ? "text-red-600"
                        : "text-gray-500"
                      }`}
                  >
                    {row.examResults?.[0]?.resultStatus ?? "-"}
                  </td>

                  <td className="px-4 py-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
      ${stageBadgeClasses(row.applicationStage)}
    `}
                    >
                      {row.applicationStage}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      {/* Job Title */}
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {row.job?.title ?? "-"}
                      </span>

                      {/* Designation */}
                      <span className="text-xs text-gray-500">
                        {row.job?.designation}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {(() => {
                      const { activeInterview, lastInterview } =
                        getInterviewInfo(row.interviews);

                      if (activeInterview) {
                        return (
                          <span className="text-yellow-600 font-semibold">
                            {activeInterview.status}
                          </span>
                        );
                      }

                      if (lastInterview) {
                        return (
                          <span
                            className={`font-semibold ${lastInterview.status === "Completed"
                              ? "text-green-600"
                              : "text-red-600"
                              }`}
                          >
                            {lastInterview.status}
                          </span>
                        );
                      }

                      return <span className="text-gray-400">Not Started</span>;
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const { activeInterview, lastInterview } =
                        getInterviewInfo(row.interviews);

                      return (
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {activeInterview?.round ||
                            lastInterview?.round ||
                            "-"}
                        </span>
                      );
                    })()}
                  </td>


                  <td className="w-[160px] px-4 py-2 text-center sticky right-[120px] bg-gray-50 dark:bg-gray-800 z-10 shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.25)]">
                    <div className="flex flex-col items-center gap-2">
                      <ButtonWrapper subModule="Candidate Management" permission="edit">

                        {/* ===== SCHEDULE ===== */}
                        {(() => {
                          const { canScheduleNext, lastInterview } = getInterviewInfo(row.interviews);

                          // text decide karna
                          const scheduleLabel = lastInterview ? "Next Interview" : "Schedule Interview";

                          return (
                            canScheduleNext &&
                            row.applicationStage !== "Selected" &&
                            row.applicationStage !== "Hired" &&
                            row.applicationStage !== "Rejected" && (
                              <button
                                onClick={() => {
                                  setSelectedInterviewCandidate(row);
                                  setInterviewModalOpen(true);
                                }}
                                className={`${smallCuteBtn} bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-800 truncate w-32 h-8 text-xs`}
                              >
                                {scheduleLabel}
                              </button>
                            )
                          );
                        })()}


                        {/* ===== RESCHEDULE ===== */}
                        {row.applicationStage === "Interview Scheduled" && (
                          <button
                            onClick={() => {
                              setSelectedRescheduleInterview(row.interviews?.[0]);
                              setRescheduleModalOpen(true);
                            }}
                            className={`${smallCuteBtn} bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700 dark:hover:bg-yellow-800 truncate w-32 h-8 text-xs`}
                          >
                            Reschedule
                          </button>
                        )}

                        {/* ===== MARK COMPLETED ===== */}
                        {(row.applicationStage === "Interview Scheduled" ||
                          row.applicationStage === "Interview Rescheduled") && (
                            <button
                              onClick={() =>
                                handleInterviewCompleted(row.interviews?.[0]?.id)
                              }
                              className={`${smallCuteBtn} bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-800 truncate w-32 h-8 text-xs`}
                            >
                              Mark Completed
                            </button>
                          )}

                        {/* ===== SELECT ===== */}
                        {(() => {
                          const { lastInterview } = getInterviewInfo(row.interviews);

                          return (
                            lastInterview &&
                            (lastInterview.round === "HR" ||
                              lastInterview.round === "Managerial" ||
                              lastInterview.round === "Technical") &&
                            lastInterview.status === "Completed" &&
                            row.applicationStage !== "Selected" &&
                            row.applicationStage !== "Rejected" &&     // <-- prevent showing after rejection
                            row.applicationStage !== "Hired" &&   // <-- add this line
                            (
                              <button
                                onClick={() => handleSelectCandidate(row.id)}
                                className={`${smallCuteBtn} bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700 dark:hover:bg-indigo-800 truncate w-32 h-8 text-xs`}
                              >
                                Select Candidate
                              </button>
                            )
                          );
                        })()}



                        {/* ===== HIRE ===== */}
                        {row.applicationStage === "Selected" && (
                          <button
                            onClick={() => openHireModal(row.id)}
                            className={`${smallCuteBtn} bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700 dark:hover:bg-emerald-800 truncate w-32 h-8 text-xs`}
                          >
                            Hire
                          </button>
                        )}

                      </ButtonWrapper>
                    </div>
                  </td>



                  <td className="w-[120px] px-4 py-2 text-center sticky right-0 bg-gray-50 dark:bg-gray-800 z-20 shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.35)]">
                    <div className="flex flex-col items-center gap-2">

                      <ButtonWrapper subModule="Candidate Management" permission="edit">
                        {row.applicationStage !== "Hired" &&
                          row.applicationStage !== "Rejected" && (
                            <button
                              onClick={() => {
                                setSelectedRejectCandidate(row);
                                setRejectModalOpen(true);
                              }}
                              className={`${smallCuteBtn} bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-800 truncate w-20 h-8 text-xs`}
                              title="Reject Candidate"
                            >
                              {/* <UserRoundX className="w-4 h-4" /> */}
                              Reject
                            </button>
                          )}
                      </ButtonWrapper>

                      {row.applicationStage === "Interview Scheduled" && (
                        <button
                          onClick={() => {
                            setSelectedInterviewId(row.interviews?.[0]?.id);
                            setCancelModalOpen(true);
                          }}
                          className={`${smallCuteBtn} bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-800 truncate w-20 h-8 text-xs`}
                        >
                          Cancel Interview
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
      {/* ===== Reject Modal ===== */}
      {
        rejectModalOpen && (
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
        )
      }

      {/* ===== Hire Modal ===== */}
      {
        showHireModal && (
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
        )
      }

      {/* ===== Interview Scheduling Modal ===== */}
      {
        interviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">

              {/* ===== HEADER ===== */}
              <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  Schedule Interview — {selectedInterviewCandidate?.name}
                </h2>
                <button
                  onClick={() => setInterviewModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg"
                >
                  ✕
                </button>
              </div>

              {/* ===== BODY ===== */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 overflow-y-auto">

                {/* ---------------- LEFT : DATE ---------------- */}
                <div className="rounded-xl p-4 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold uppercase  mb-3 text-gray-700">
                    Select Interview Date
                  </h4>

                  <CustomCalendar
                    selectedDate={interviewForm.interviewDate}
                    onSelect={(date) => setInterviewForm({ ...interviewForm, interviewDate: date })}
                    scheduledInterviews={allInterviews} // array from state or backend

                  />



                  <p className="text-xs text-gray-500 mt-2">
                    Choose a suitable date for the interview
                  </p>
                </div>


                {/* ---------------- RIGHT : DETAILS ---------------- */}
                <div className="space-y-3">

                  {/* Round Type */}
                  <select
                    value={interviewForm.round}
                    onChange={(e) =>
                      setInterviewForm({ ...interviewForm, round: e.target.value })
                    }
                    className="w-full rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 
             border border-slate-300 focus:ring-2 focus:ring-teal-500 
             focus:border-transparent outline-none"
                  >
                    {/* ❌ Placeholder (select nahi hona chahiye) */}
                    <option value="" disabled>
                      Select interview round
                    </option>

                    {/* ✅ Actual options */}
                    <option value="Technical">Technical Round</option>
                    <option value="HR">HR Round</option>
                    <option value="Managerial">Managerial Round</option>
                  </select>



                  {/* Time */}
                  {/* ---------------- TIME SLOT ---------------- */}
                  <div className="rounded-xl p-4 space-y-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Interview Time Slot
                    </h4>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                      {/* Start Time */}
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={interviewForm.startTime}
                          onChange={(e) =>
                            setInterviewForm({
                              ...interviewForm,
                              startTime: e.target.value,
                            })
                          }
                          className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>

                      {/* Arrow */}
                      <div className="mt-5 text-gray-400 text-lg">
                        →
                      </div>

                      {/* End Time */}
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={interviewForm.endTime}
                          onChange={(e) =>
                            setInterviewForm({
                              ...interviewForm,
                              endTime: e.target.value,
                            })
                          }
                          className="w-full rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    {/* Duration (future-ready) */}
                    {interviewForm.startTime && interviewForm.endTime && (
                      <p className="text-xs text-gray-600">
                        Duration:{" "}
                        <span className="font-medium">
                          {calculateDuration(
                            interviewForm.startTime,
                            interviewForm.endTime
                          )}
                        </span>
                      </p>
                    )}
                  </div>


                  {/* Mode */}
                  <select
                    value={interviewForm.interviewType}
                    onChange={(e) =>
                      setInterviewForm({ ...interviewForm, interviewType: e.target.value })
                    }
                    className="w-full rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"

                  >
                    <option value="">Select Mode</option>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Telephonic">Telephonic</option>
                  </select>


                  {/* Location / Link */}
                  <input
                    placeholder="Interview Location or Meeting Link"
                    className="w-full rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    value={interviewForm.locationOrLink}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        locationOrLink: e.target.value,
                      })
                    }
                  />


                  {/* ===== Interview Panel ===== */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      Interview Panel
                      <span className="ml-1 text-xs text-gray-400">(Select interviewers)</span>
                    </label>

                    {/* Multi-select dropdown */}
                    <Select
                      isMulti
                      options={panelOptions}
                      placeholder="Search and select panel members..."
                      value={panelOptions.filter((opt) =>
                        interviewForm.panel.some((p) => p.userId === opt.value)
                      )}
                      onChange={(selectedOptions) => {
                        setInterviewForm({
                          ...interviewForm,
                          panel: selectedOptions.map((opt, index) => {
                            const existing = interviewForm.panel.find(
                              (p) => p.userId === opt.value
                            );

                            return (
                              existing || {
                                userId: opt.value,
                                role: index === 0 ? "Lead" : "Panelist",
                              }
                            );
                          }),
                        });
                      }}
                      className="react-select-container text-sm"
                      classNamePrefix="react-select"
                    />

                    {/* Selected panel list */}
                    {interviewForm.panel.length > 0 && (
                      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Assigned Panel Members
                        </p>

                        {interviewForm.panel.map((member) => {
                          const user = userList.find((u) => u.id === member.userId);

                          return (
                            <div
                              key={member.userId}
                              className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 hover:shadow-sm transition"
                            >
                              {/* Name */}
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-800">
                                  {user?.firstName} {user?.lastName}
                                </span>
                                <span className="text-xs text-gray-400">
                                  Interview Panel
                                </span>
                              </div>

                              {/* Role selector */}
                              <select
                                value={member.role}
                                onChange={(e) => {
                                  setInterviewForm({
                                    ...interviewForm,
                                    panel: interviewForm.panel.map((p) =>
                                      p.userId === member.userId
                                        ? { ...p, role: e.target.value }
                                        : p
                                    ),
                                  });
                                }}
                                className="text-sm rounded-md border border-gray-300 bg-white px-2 py-1
                         focus:outline-none focus:ring-2 focus:ring-teal-500"
                              >
                                <option value="Lead">Lead Interviewer</option>
                                <option value="Panelist">Panelist</option>
                                <option value="Observer">Observer</option>
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Remarks */}
                  <textarea
                    rows={3}
                    placeholder="Remarks (optional)"
                    className="w-full rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    value={interviewForm.notes}
                    onChange={(e) =>
                      setInterviewForm({ ...interviewForm, notes: e.target.value })
                    }
                  />

                </div>
              </div>

              {/* ===== FOOTER ===== */}
              <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800">
                <button
                  onClick={() => setInterviewModalOpen(false)}
                  className="px-5 py-2 text-sm border border-slate-300 text-slate-600 hover:bg-slate-100 rounded-lg"              >
                  Cancel
                </button>

                <button
                  onClick={handleScheduleInterview}
                  className="px-5 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg"              >
                  Schedule Interview
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* ===== Interview Cancel Modal ===== */}
      {
        cancelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-slate-900 w-[420px] rounded-xl shadow-xl p-6">

              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  Cancel Interview
                </h3>
                <button
                  onClick={() => {
                    setCancelModalOpen(false);
                    setCancelReason("");
                    setSelectedInterviewId(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-lg"
                >
                  ✕
                </button>
              </div>

              {/* Info */}
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Please provide a reason for cancelling this interview. This action
                cannot be undone.
              </p>

              {/* Textarea */}
              <textarea
                rows={4}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Eg: Candidate unavailable, interviewer unavailable..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 
                   bg-white dark:bg-slate-800 px-3 py-2 text-sm 
                   focus:ring-2 focus:ring-red-500 outline-none"
              />

              {/* Footer */}
              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => {
                    setCancelModalOpen(false);
                    setCancelReason("");
                    setSelectedInterviewId(null);
                  }}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-300 
                     text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>

                <button
                  onClick={handleCancelInterview}
                  className="px-4 py-2 text-sm rounded-lg 
                     bg-red-600 hover:bg-red-700 text-white"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* ===== Interview Rescheduling Modal ===== */}
      {
        rescheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">

              {/* ===== HEADER ===== */}
              <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  Reschedule Interview
                </h2>

                <button
                  onClick={() => {
                    setRescheduleModalOpen(false);
                    setSelectedRescheduleInterview(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-lg"
                >
                  ✕
                </button>
              </div>

              {/* ===== BODY ===== */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 overflow-y-auto">

                {/* ================= LEFT : CALENDAR ================= */}
                <div className="rounded-xl p-4 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold uppercase mb-3 text-gray-700">
                    Select New Date
                  </h4>

                  <CustomCalendar
                    selectedDate={interviewForm.interviewDate}
                    onSelect={(date) =>
                      setInterviewForm({
                        ...interviewForm,
                        interviewDate: date,
                      })
                    }
                  />

                  <p className="text-xs text-gray-500 mt-2">
                    Choose a new interview date
                  </p>
                </div>

                {/* ================= RIGHT : DETAILS ================= */}
                <div className="space-y-4">

                  {/* -------- TIME SLOT -------- */}
                  <div className="rounded-xl p-4 space-y-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-semibold text-gray-700">
                      New Time Slot
                    </h4>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                      {/* Start Time */}
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={interviewForm.startTime}
                          onChange={(e) =>
                            setInterviewForm({
                              ...interviewForm,
                              startTime: e.target.value,
                            })
                          }
                          className="w-full rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900
                    border border-slate-300 focus:ring-2 focus:ring-yellow-500 outline-none"
                        />
                      </div>

                      <div className="mt-5 text-gray-400 text-lg">→</div>

                      {/* End Time */}
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={interviewForm.endTime}
                          onChange={(e) =>
                            setInterviewForm({
                              ...interviewForm,
                              endTime: e.target.value,
                            })
                          }
                          className="w-full rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900
                    border border-slate-300 focus:ring-2 focus:ring-yellow-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Duration */}
                    {interviewForm.startTime && interviewForm.endTime && (
                      <p className="text-xs text-gray-600">
                        Duration:{" "}
                        <span className="font-medium">
                          {calculateDuration(
                            interviewForm.startTime,
                            interviewForm.endTime
                          )}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* -------- NOTES -------- */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">
                      Reschedule Reason / Notes
                    </label>

                    <textarea
                      rows={3}
                      placeholder="Mention reason for rescheduling (optional)"
                      className="w-full rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900
                border border-slate-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                      value={interviewForm.notes}
                      onChange={(e) =>
                        setInterviewForm({
                          ...interviewForm,
                          notes: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* ===== FOOTER ===== */}
              <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800">
                <button
                  onClick={() => {
                    setRescheduleModalOpen(false);
                    setSelectedRescheduleInterview(null);
                  }}
                  className="px-5 py-2 text-sm border border-slate-300 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    try {
                      await dispatch(
                        rescheduleInterview({
                          interviewId: selectedRescheduleInterview.id,
                          payload: {
                            interviewDate: interviewForm.interviewDate,
                            startTime: interviewForm.startTime,
                            endTime: interviewForm.endTime,
                            notes: interviewForm.notes,
                          },
                        })
                      ).unwrap();

                      toast.success("Interview rescheduled successfully");
                      dispatch(fetchCandidatesOverview());

                      setRescheduleModalOpen(false);
                      setSelectedRescheduleInterview(null);
                    } catch (err) {
                      toast.error(err);
                    }
                  }}
                  className="px-5 py-2 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
                >
                  Reschedule Interview
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* -------------------------------- PAGINATION -------------------------------- */}
      <div className="mt-5 flex justify-center gap-2">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded-md border text-sm ${currentPage === i + 1
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600"
              }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div >
  );
};

export default CandidatesOverviewPage;
