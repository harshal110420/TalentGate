import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCandidatesOverview } from "../../../features/HR_Slices/Interview/InterviewSlice";
import { fetchAllCandidates, rejectCandidate, scheduleInterview, markInterviewCompleted, markSelected, markHired } from "../../../features/Candidate/candidateSlice";
import SkeletonPage from "../../../components/skeletons/skeletonPage";
import ButtonWrapper from "../../../components/ButtonWrapper";
import { toast } from "react-toastify";


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
    date: "",
    startTime: "",
    endTime: "",
    roundType: "Technical",
    mode: "",
    location: "",
    panel: "",
    remarks: "",
  });


  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

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


  const departments = useSelector((state) => state.department.list);
  const exams = useSelector((state) => state.exam.list);

  useEffect(() => {
    dispatch(fetchCandidatesOverview());
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

      dispatch(fetchAllCandidates());
    } catch (err) {
      toast.error(err || "Failed to reject candidate");
    } finally {
      setRejectModalOpen(false);
      setRejectRemark("");
      setSelectedRejectCandidate(null);
    }
  };

  const handleScheduleInterview = async (id) => {
    try {
      await dispatch(
        scheduleInterview({
          id,
          payload: interviewForm,
        })
      ).unwrap();

      toast.success("Interview Scheduled");

      // 🔥 IMPORTANT: Refresh overview list
      dispatch(fetchCandidatesOverview());

      setInterviewModalOpen(false);
      setSelectedInterviewCandidate(null);
    } catch (err) {
      toast.error(err || "Failed to schedule interview");
    }
  };


  const handleInterviewCompleted = async (id) => {
    try {
      await dispatch(markInterviewCompleted(id)).unwrap();
      toast.success("Interview completed");
      dispatch(fetchCandidatesOverview());

    } catch (err) {
      toast.error(err || "Failed to mark interview completed");
    }
  };

  const handleSelectCandidate = async (id) => {
    try {
      await dispatch(markSelected(id)).unwrap();
      toast.success("Candidate Selected");
      dispatch(fetchCandidatesOverview());

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
      dispatch(fetchCandidatesOverview());
      setShowHireModal(false);
      setHireCandidateId(null);
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="max-w-full px-5 py-5 font-sans text-gray-800 dark:text-gray-100">

      {/* -------------------------------- HEADER -------------------------------- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-semibold">Interview Scheduled Screen</h1>
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
        <table className="min-w-[1150px] w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[11px] font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Candidate</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Exam Result</th>
              <th className="px-4 py-3 text-left">Application Stage</th>
              <th className="px-4 py-3 text-left">Job </th>
              <th className="w-[160px] px-4 py-3 text-center sticky right-[110px] bg-gray-100 dark:bg-gray-800 z-20 shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.25)]">
                Quick Actions
              </th>
              <th className="w-[110px] px-4 py-3 text-center sticky right-0 bg-gray-100 dark:bg-gray-800 z-30 shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.35)]">
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
                    className={`px-4 py-3 font-semibold capitalize ${row.examResults?.[0]?.resultStatus === "pass"
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

                  <td className="w-[160px] px-4 py-2 text-center sticky right-[110px] bg-gray-50 dark:bg-gray-800 z-10 shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.25)]">
                    <div className="flex justify-center items-center gap-2">
                      <ButtonWrapper subModule="Candidate Management" permission="edit">
                        {/* ===== SCHEDULE INTERVIEW ===== */}
                        {row.applicationStage === "Shortlisted for Interview" && (
                          <button
                            onClick={() => {
                              setSelectedInterviewCandidate(row);
                              setInterviewModalOpen(true);
                            }}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 rounded text-xs"
                            title="Schedule Interview"
                          >
                            Schedule Interview
                          </button>

                        )}

                        {/* ===== INTERVIEW Completed ===== */}
                        {row.applicationStage === "Interview Scheduled" && (
                          <button
                            onClick={() => handleInterviewCompleted(row.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                            title="Mark Interview Completed"
                          >
                            Mark as Completed
                          </button>
                        )}

                        {/* ===== SELECT CANDIDATE ===== */}
                        {row.applicationStage === "Interview Completed" && (
                          <button
                            onClick={() => handleSelectCandidate(row.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-xs"
                            title="Mark Selected"
                          >
                            Mark as Selected
                          </button>
                        )}

                        {/* ===== HIRE BUTTON ===== */}
                        {row.applicationStage === "Selected" && (
                          <button
                            onClick={() => openHireModal(row.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-xs"
                          >
                            Hire
                          </button>
                        )}
                      </ButtonWrapper>
                    </div>
                  </td>


                  <td className="w-[110px] px-4 py-2 text-center sticky right-0 bg-gray-50 dark:bg-gray-800 z-20 shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.35)]">
                    <div className="flex justify-center items-center gap-2">
                      <ButtonWrapper subModule="Candidate Management" permission="edit">
                        {row.applicationStage !== "Hired" &&
                          row.applicationStage !== "Rejected" && (
                            <button
                              onClick={() => {
                                setSelectedRejectCandidate(row);
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
      {interviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">

            {/* ===== HEADER ===== */}
            <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Schedule Interview — {selectedInterviewCandidate?.name}
              </h2>
              <button
                onClick={() => setInterviewModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            {/* ===== BODY ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">

              {/* ---------------- LEFT : DATE ---------------- */}
              <div className="border rounded-xl p-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">
                  Select Interview Date
                </h4>

                <input
                  type="date"
                  value={interviewForm.date}
                  onChange={(e) =>
                    setInterviewForm({ ...interviewForm, date: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />

                <p className="text-xs text-gray-500 mt-2">
                  Choose a suitable date for the interview
                </p>
              </div>

              {/* ---------------- RIGHT : DETAILS ---------------- */}
              <div className="space-y-3">

                {/* Round Type */}
                <select
                  value={interviewForm.roundType}
                  onChange={(e) =>
                    setInterviewForm({ ...interviewForm, roundType: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="Technical">Technical Round</option>
                  <option value="HR">HR Round</option>
                  <option value="Managerial">Managerial Round</option>
                </select>

                {/* Time */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="time"
                    value={interviewForm.startTime}
                    onChange={(e) =>
                      setInterviewForm({ ...interviewForm, startTime: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2 text-sm"
                  />

                  <input
                    type="time"
                    value={interviewForm.endTime}
                    onChange={(e) =>
                      setInterviewForm({ ...interviewForm, endTime: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                {/* Mode */}
                <select
                  value={interviewForm.mode}
                  onChange={(e) =>
                    setInterviewForm({ ...interviewForm, mode: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select Mode</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Telephonic">Telephonic</option>
                </select>

                {/* Location / Link */}
                <input
                  placeholder="Interview Location or Meeting Link"
                  value={interviewForm.location}
                  onChange={(e) =>
                    setInterviewForm({ ...interviewForm, location: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />

                {/* Panel */}
                <input
                  placeholder="Interviewer / Panel"
                  value={interviewForm.panel}
                  onChange={(e) =>
                    setInterviewForm({ ...interviewForm, panel: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />

                {/* Remarks */}
                <textarea
                  rows={3}
                  placeholder="Remarks (optional)"
                  value={interviewForm.remarks}
                  onChange={(e) =>
                    setInterviewForm({ ...interviewForm, remarks: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* ===== FOOTER ===== */}
            <div className="px-6 py-4 border-t dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setInterviewModalOpen(false)}
                className="px-4 py-2 text-sm border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  handleScheduleInterview(selectedInterviewCandidate.id)
                }
                className="px-5 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default CandidatesOverviewPage;
