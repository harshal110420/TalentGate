import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllInterviews } from "../../../features/HR_Slices/Interview/InterviewSlice";
import { useNavigate } from "react-router-dom";
import { getModulePathByMenu } from "../../../utils/navigation";
import SkeletonPage from "../../../components/skeletons/skeletonPage";

const AllInterviews = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { allInterviews, loading } = useSelector(
        (state) => state.candidatesOverview
    );
    console.log("All Interviews:", allInterviews);

    const modules = useSelector((state) => state.modules.list);
    const menus = useSelector((state) => state.menus.list);
    const modulePath = getModulePathByMenu("interview_evaluation", modules, menus);

    useEffect(() => {
        dispatch(fetchAllInterviews());
    }, [dispatch]);

    // ===== Group interviews by candidate =====
    const groupByCandidate = (interviews) => {
        const map = {};
        interviews.forEach((item) => {
            const cid = item.candidateId;
            if (!map[cid]) {
                map[cid] = {
                    candidate: item.candidate,
                    jobOpening: item.jobOpening,
                    interviews: [],
                };
            }
            map[cid].interviews.push(item);
        });
        return Object.values(map);
    };

    const candidatesWithInterviews = groupByCandidate(allInterviews);
    console.log("candidate with interviews:", candidatesWithInterviews)
    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">Interviews</h2>
                <p className="text-sm text-gray-500 mt-1">
                    All scheduled & completed interviews across hiring pipeline
                </p>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200 relative">
                <table className="min-w-full text-sm table-fixed">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b">
                        <tr className="border-b hover:bg-gray-50 even:bg-gray-50/40 transition">
                            <th className="px-4 py-3 text-left whitespace-nowrap">Candidate</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Job</th>
                            <th className="px-4 py-3 whitespace-nowrap">Rounds</th>
                            <th className="px-4 py-3 whitespace-nowrap">Last Interview Date</th>
                            <th className="px-4 py-3 whitespace-nowrap">Status</th>
                            <th className="px-4 py-3 text-center whitespace-nowrap sticky right-0 bg-white z-10">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {/* === SKELETON WHILE LOADING === */}
                        {loading && <SkeletonPage rows={6} columns={6} />}

                        {/* === EMPTY STATE === */}
                        {!loading && candidatesWithInterviews?.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-6 text-gray-500">
                                    No interviews found
                                </td>
                            </tr>
                        )}

                        {/* === CANDIDATE ROWS === */}
                        {!loading && candidatesWithInterviews.map((item) => {
                            // sort interviews by date ascending
                            const sortedRounds = item.interviews.sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate));
                            const lastInterview = sortedRounds[sortedRounds.length - 1];

                            return (
                                <tr key={item.candidate.id} className="border-t hover:bg-gray-50 transition text-gray-700">
                                    {/* Candidate */}
                                    <td className="px-4 py-3 whitespace-nowrap overflow-hidden truncate max-w-[200px]">
                                        <div className="font-medium">{item.candidate?.name}</div>
                                        <div className="text-xs text-gray-500">{item.candidate?.email}</div>
                                    </td>

                                    {/* Job */}
                                    <td className="px-4 py-3 whitespace-nowrap truncate max-w-[200px]">
                                        {item.jobOpening?.title}
                                    </td>

                                    {/* Rounds Count */}
                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                        {item.interviews.length} rounds
                                    </td>

                                    {/* Last Interview Date */}
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                        {new Date(lastInterview.interviewDate).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </td>

                                    {/* Status of Last Round */}
                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                                            ${lastInterview.status === "Scheduled"
                                                ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200"
                                                : lastInterview.status === "Completed"
                                                    ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                                                    : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"
                                            }`}>
                                            {lastInterview.status}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3 text-center whitespace-nowrap sticky right-0 bg-white shadow-[inset_8px_0_8px_-8px_rgba(0,0,0,0.1)]">
                                        <button
                                            onClick={() => navigate(`/module/${modulePath}/interview_evaluation/interviews/${item.candidate.id}`)}
                                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700 transition"
                                        >
                                            View All Rounds
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllInterviews;
