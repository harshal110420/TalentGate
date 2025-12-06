import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCandidates, reassignExam } from "../../../features/Candidate/candidateSlice";
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
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedReassignCandidate, setSelectedReassignCandidate] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [reassignLoading, setReassignLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedViewCandidate, setSelectedViewCandidate] = useState(null);
  console.log("selected candidate data:", selectedViewCandidate)
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
    examId: "",
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
          value={filters.source}
          onChange={(e) => setFilters({ ...filters, source: e.target.value })}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800"

        >
          <option value="all">All Sources</option>
          <option value="offline">Offline</option>
          <option value="online">Online</option>
        </select>

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
        <table className="min-w-[1500px] w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[11px] font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Mobile</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Exam</th>
              <th className="px-4 py-3 text-left">Source</th>
              <th className="px-4 py-3 text-left">Exam Status</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center">Resume</th>
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
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
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

                  <td className="px-4 py-2">{formatToIST(c.lastMailSentAt)}</td>
                  <td className="px-4 py-2 text-center sticky right-0 bg-gray-50 dark:bg-gray-800 border-l">
                    <div className="flex justify-center items-center gap-2">
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
                    <p><b>Job Code:</b> {selectedViewCandidate.jobCode}</p>
                    <p><b>Job Title:</b> {selectedViewCandidate.job?.title}</p>
                    <p><b>Job Designation:</b> {selectedViewCandidate?.job.designation}</p>
                    <p><b>Department:</b> {selectedViewCandidate.department.name}</p>
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
