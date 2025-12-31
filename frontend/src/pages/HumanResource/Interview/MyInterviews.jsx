import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyInterviews } from "../../../features/HR_Slices/Interview/InterviewSlice";
import { useNavigate } from "react-router-dom";
import { getModulePathByMenu } from "../../../utils/navigation";
import SkeletonPage from "../../../components/skeletons/skeletonPage";

const MyInterviews = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { myInterviews, loading } = useSelector((state) => state.candidatesOverview);
    const modules = useSelector((state) => state.modules.list);
    const menus = useSelector((state) => state.menus.list);
    const modulePath = getModulePathByMenu("interview_evaluation", modules, menus);

    const [filters, setFilters] = useState({ search: "", job: "", round: "", status: "" });

    useEffect(() => {
        dispatch(fetchMyInterviews());
    }, [dispatch]);

    const filteredInterviews = useMemo(() => {
        const searchTerm = filters.search.toLowerCase();
        return myInterviews.filter((interview) => {
            const candidate = interview.candidate?.name?.toLowerCase() || "";
            const job = interview.jobOpening?.title?.toLowerCase() || "";
            const round = interview.round?.toLowerCase() || "";
            const status = interview.status?.toLowerCase() || "";

            const matchesSearch =
                candidate.includes(searchTerm) || job.includes(searchTerm) || round.includes(searchTerm);
            const matchesJob = filters.job ? job === filters.job.toLowerCase() : true;
            const matchesRound = filters.round ? round === filters.round.toLowerCase() : true;
            const matchesStatus = filters.status ? status === filters.status.toLowerCase() : true;

            return matchesSearch && matchesJob && matchesRound && matchesStatus;
        });
    }, [filters, myInterviews]);

    const getUniqueValues = (key) => [...new Set(myInterviews.map((i) => i[key]))].filter(Boolean);

    return (
        <div className="max-w-full px-5 py-5 font-sans text-gray-800 dark:text-gray-100">
            <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
                Interviews Assigned to You as Panel Member
            </h1>

            {/* Filters */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-5 space-y-3">
                <input
                    type="text"
                    placeholder="Search by candidate, job, or round"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
                />

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
                    {[
                        { label: "Job", key: "job", options: getUniqueValues("jobOpening")?.map((j) => j?.title) },
                        { label: "Round", key: "round", options: getUniqueValues("round") },
                        { label: "Status", key: "status", options: getUniqueValues("status") },
                    ].map((filter) => (
                        <select
                            key={filter.key}
                            value={filters[filter.key]}
                            onChange={(e) => setFilters({ ...filters, [filter.key]: e.target.value })}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
                        >
                            <option value="">All {filter.label}</option>
                            {filter.options?.map((opt, idx) => (
                                <option key={`${opt}-${idx}`} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900">
                <table className="min-w-[1000px] w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[11px] font-medium">
                        <tr>
                            {["Candidate", "Job", "Round", "Date", "Time", "Status", "Action"].map((th, idx) => (
                                <th
                                    key={idx}
                                    className={`px-4 py-3 text-left ${th === "Action" ? "w-[110px] text-center sticky right-0 bg-gray-100 dark:bg-gray-800 z-30 shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.35)]" : ""}`}
                                >
                                    {th}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-950">
                        {loading ? (
                            <SkeletonPage rows={5} columns={7} />
                        ) : filteredInterviews.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-4 text-gray-500">
                                    No interviews assigned yet.
                                </td>
                            </tr>
                        ) : (
                            filteredInterviews.map((interview, idx) => (
                                <tr
                                    key={interview.id}
                                    className={`transition-colors duration-150 ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"
                                        } hover:bg-blue-50 dark:hover:bg-gray-700`}
                                >
                                    <td className="px-4 py-3">{interview.candidate?.name}</td>
                                    <td className="px-4 py-3">{interview.jobOpening?.title}</td>
                                    <td className="px-4 py-3">{interview.round}</td>
                                    <td className="px-4 py-3">
                                        {new Date(interview.interviewDate).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </td>
                                    <td className="px-4 py-3">
                                        {new Date(`1970-01-01T${interview.startTime}`).toLocaleTimeString("en-IN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        })}{" "}
                                        –{" "}
                                        {new Date(`1970-01-01T${interview.endTime}`).toLocaleTimeString("en-IN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${interview.status === "Scheduled"
                                                ? "bg-blue-100 text-blue-700"
                                                : interview.status === "Completed"
                                                    ? "bg-green-100 text-green-700"
                                                    : interview.status === "Locked"
                                                        ? "bg-gray-200 text-gray-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {interview.status}
                                        </span>
                                    </td>
                                    <td className="w-[120px] px-2 py-1 text-center sticky right-0 bg-gray-50 dark:bg-gray-800 z-20 shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.35)]">
                                        {(() => {
                                            const scoreStatus = interview.interviewScore?.status;
                                            const interviewStatus = interview.status;

                                            const isViewScore =
                                                scoreStatus === "Locked" ||
                                                scoreStatus === "Submitted" ||
                                                (interviewStatus === "Completed" && scoreStatus !== "Draft");

                                            const buttonText = isViewScore ? "View Score" : "Add Score";

                                            const navigateTo = isViewScore
                                                ? `/module/${modulePath}/assigned_interviews/view-score/${interview.id}`
                                                : `/module/${modulePath}/assigned_interviews/enter-score/${interview.id}`;

                                            return (
                                                <button
                                                    onClick={() => navigate(navigateTo)}
                                                    className={`text-xs px-3 py-1 rounded-full border transition-all duration-200 shadow-sm hover:shadow
                                                        ${isViewScore
                                                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-800"
                                                            : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-800"
                                                        }`}
                                                >
                                                    {buttonText}
                                                </button>
                                            );
                                        })()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyInterviews;
