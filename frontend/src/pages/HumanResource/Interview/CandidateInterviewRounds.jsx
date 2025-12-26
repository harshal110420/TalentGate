import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllInterviews } from "../../../features/HR_Slices/Interview/InterviewSlice";
import SkeletonPage from "../../../components/skeletons/skeletonPage";
import { getModulePathByMenu } from "../../../utils/navigation";
import { StepBack } from "lucide-react";

const CandidateInterviewRounds = () => {
    const { candidateId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { allInterviews, loading } = useSelector(
        (state) => state.candidatesOverview
    );

    useEffect(() => {
        dispatch(fetchAllInterviews());
    }, [dispatch]);

    const candidateRounds = allInterviews?.filter(
        (item) => item.candidateId === Number(candidateId)
    );

    const sortedRounds = candidateRounds?.sort(
        (a, b) => new Date(a.interviewDate) - new Date(b.interviewDate)
    );
    console.log("sorted rounds:", sortedRounds)
    const candidate = sortedRounds?.[0]?.candidate;
    const job = sortedRounds?.[0]?.jobOpening;

    const modules = useSelector((state) => state.modules.list);
    const menus = useSelector((state) => state.menus.list);
    const modulePath = getModulePathByMenu("interview_evaluation", modules, menus);

    return (
        <div className="p-6">
            <button
                onClick={() => navigate(-1)}
                className="
        inline-flex items-center gap-2
        px-3 py-1.5
        text-sm font-medium
        text-indigo-600 dark:text-indigo-400
        bg-indigo-50 dark:bg-indigo-900/20
        border border-indigo-200 dark:border-indigo-700
        rounded-md
        hover:bg-indigo-100 dark:hover:bg-indigo-900/30
        hover:text-indigo-700 dark:hover:text-indigo-300
        transition-all duration-200
        shadow-sm hover:shadow-md
    "
            >
                <StepBack className="w-4 h-4" />
                Back
            </button>


            <h2 className="text-2xl font-semibold tracking-tight">
                Interview Rounds for {candidate?.name}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
                Job Applied: {job?.title} ({job?.jobCode})
            </p>

            <div className="overflow-x-auto mt-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <table className="min-w-full text-sm table-fixed">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b">
                        <tr>
                            <th className="px-3 py-2 text-left">Round</th>
                            <th className="px-3 py-2 text-left">Type</th>
                            <th className="px-3 py-2 text-left">Date</th>
                            <th className="px-3 py-2 text-left">Time</th>
                            <th className="px-3 py-2 text-left">Panel Members</th>
                            <th className="px-3 py-2 text-left">Status</th>
                            <th className="px-3 py-2 text-left">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && <SkeletonPage rows={5} columns={8} />}

                        {!loading && sortedRounds?.length === 0 && (
                            <tr>
                                <td colSpan="8" className="py-6 text-center text-gray-500">
                                    No rounds found for this candidate
                                </td>
                            </tr>
                        )}

                        {!loading && sortedRounds?.map((round) => {
                            const formattedDate = new Date(round.interviewDate).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            });

                            const formattedTime = `${new Date(`1970-01-01T${round.startTime}`).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })} - ${new Date(`1970-01-01T${round.endTime}`).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })}`;

                            const panelMembersFull = round.panel?.map(
                                (p) => `${p.user.firstName} ${p.user.lastName} (${p.role})`
                            );

                            return (
                                <tr
                                    key={round.id}
                                    className="border-t hover:bg-gray-50 transition"
                                >
                                    <td className="px-4 py-3">{round.round}</td>
                                    <td className="px-4 py-3">{round.interviewType}</td>
                                    <td className="px-4 py-3">{formattedDate}</td>
                                    <td className="px-4 py-3">{formattedTime}</td>



                                    {/* PANEL MEMBERS — compact vertical list */}
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1.5">
                                            {round.panel?.map((p) => {
                                                const initials = `${p.user?.firstName?.[0]}${p.user?.lastName?.[0]}`;
                                                const fullName = `${p.user?.firstName} ${p.user?.lastName}`;

                                                return (
                                                    <div
                                                        key={p.id}
                                                        className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700
          px-1.5 py-1 rounded-md"
                                                    >
                                                        {/* smaller initials avatar */}
                                                        <div className="w-5 h-5 rounded-full bg-indigo-300 flex items-center justify-center
          font-semibold text-indigo-900 text-[10px]">
                                                            {initials}
                                                        </div>

                                                        {/* compact text */}
                                                        <div className="flex flex-col leading-tight">
                                                            <span className="text-[11px] font-medium text-gray-800 dark:text-gray-100 truncate max-w-[120px]">
                                                                {fullName}
                                                            </span>
                                                            <span className="text-[10px] text-gray-500 dark:text-gray-300 font-medium">
                                                                {p.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </td>



                                    {/* STATUS */}
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium block
            ${round.status === "Scheduled"
                                                    ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200"
                                                    : round.status === "Completed"
                                                        ? "bg-green-50 text-green-600 ring-1 ring-green-200"
                                                        : "bg-gray-100 text-gray-600 ring-1 ring-gray-300"
                                                }`}
                                        >
                                            {round.status}
                                        </span>
                                    </td>

                                    {/* ACTION (only if completed) */}
                                    <td className="px-4 py-3">
                                        {round.status === "Completed" ? (
                                            <button
                                                onClick={() => navigate(`/module/${modulePath}/interview_evaluation/review/${round.id}`)}
                                                className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                                            >
                                                View Feedback / Scores
                                            </button>
                                        ) : (
                                            <span className="text-[11px] text-gray-400">—</span>
                                        )}
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

export default CandidateInterviewRounds;
