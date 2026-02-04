import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAllScores,
    lockInterviewScores
} from "../../../features/HR_Slices/Interview_scores/interviewScoreSlice";
import { useParams, useNavigate } from "react-router-dom";
import { StepBack } from "lucide-react";

const InterviewScoreReview = () => {
    const { interviewId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showLockModal, setShowLockModal] = useState(false);

    const { allScores, loading } = useSelector((state) => state.interviewScores);
    console.log("all scores:", allScores)
    useEffect(() => {
        dispatch(fetchAllScores(interviewId));
    }, [interviewId, dispatch]);

    const allSubmitted =
        allScores.length > 0 &&
        allScores.every((s) => s.status === "Submitted");

    const handleLock = () => {
        dispatch(lockInterviewScores(interviewId));
        setShowLockModal(false);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Interview Score Review
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Review scores submitted by each panel member
                    </p>
                </div>

                 <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md">
                    <StepBack className="w-4 h-4" />
                    Back
                </button>
            </div>

            {/* LOADING STATE */}
            {/* LOADING STATE → SHOW SKELETON CARDS */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 animate-pulse">
                    {[...Array(4)].map((_, idx) => (
                        <div
                            key={idx}
                            className="bg-white border rounded-xl shadow-sm p-5 flex flex-col gap-4"
                        >
                            {/* STATUS BADGE */}
                            <div className="h-4 w-20 bg-gray-200 rounded-full self-end"></div>

                            {/* AVATAR + INFO */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-28 bg-gray-200 rounded"></div>
                                    <div className="h-3 w-40 bg-gray-200 rounded"></div>
                                    <div className="flex gap-2 mt-2">
                                        <div className="h-4 w-16 bg-gray-200 rounded-full"></div>
                                        <div className="h-4 w-16 bg-gray-200 rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            {/* SCORE BAR */}
                            <div className="space-y-2">
                                <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-10 bg-gray-200 rounded"></div>
                                    <div className="h-2 flex-1 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>

                            {/* RECOMMENDATION */}
                            <div className="space-y-2">
                                <div className="h-3 w-28 bg-gray-200 rounded"></div>
                                <div className="h-3 w-full bg-gray-200 rounded"></div>
                            </div>

                            {/* STRENGTHS */}
                            <div className="space-y-2">
                                <div className="h-3 w-20 bg-gray-200 rounded"></div>
                                <div className="h-3 w-full bg-gray-200 rounded"></div>
                            </div>

                            {/* WEAKNESSES */}
                            <div className="space-y-2">
                                <div className="h-3 w-20 bg-gray-200 rounded"></div>
                                <div className="h-3 w-full bg-gray-200 rounded"></div>
                            </div>

                            {/* COMMENTS */}
                            <div className="space-y-2">
                                <div className="h-3 w-20 bg-gray-200 rounded"></div>
                                <div className="h-3 w-full bg-gray-200 rounded"></div>
                            </div>

                            {/* DATE */}
                            <div className="h-3 w-32 bg-gray-200 rounded mt-3"></div>
                        </div>
                    ))}
                </div>
            )}


            {/* GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
                {allScores.map((score) => {
                    const initials =
                        `${score.interviewer?.firstName?.[0] ?? ""}${score.interviewer?.lastName?.[0] ?? ""}`;

                    return (
                        <div
                            key={score.id}
                            className="
                                bg-white border rounded-xl shadow-sm hover:shadow-md transition 
                                p-5 flex flex-col gap-3 relative
                            "
                        >
                            {/* STATUS BADGE */}
                            <span
                                className={`
                                    absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide
                                    ${score.status === "Submitted"
                                        ? "bg-green-100 text-green-700 border border-green-300"
                                        : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                    }
                                `}
                            >
                                {score.status}
                            </span>

                            {/* INTERVIEWER NAME + AVATAR + DEPT/ROLE */}
                            <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                    {initials}
                                </div>

                                {/* Info */}
                                <div className="flex flex-col leading-tight">
                                    {/* Name */}
                                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                        {score.interviewer?.firstName} {score.interviewer?.lastName}
                                    </span>

                                    {/* Email */}
                                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                        {score.interviewer?.mail}
                                    </span>

                                    {/* Department + Role with labels */}
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {score.interviewer?.department?.name && (
                                            <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-medium bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                                                Dept: {score.interviewer.department.name}
                                            </span>
                                        )}
                                        {score.interviewer?.role?.displayName && (
                                            <span className="text-[10px] text-green-700 dark:text-green-400 font-medium bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                                Role: {score.interviewer.role.displayName}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>



                            {/* SCORE */}
                            <div className="mt-1">
                                <p className="text-xs text-gray-500 mb-1">Overall Score</p>
                                <div className="flex items-center gap-2">
                                    <div className="text-xl font-bold text-indigo-600">
                                        {(score.score * 10).toFixed(0)}%
                                    </div>
                                    <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${score.score * 10}%` }}
                                        ></div>

                                    </div>
                                </div>
                            </div>

                            {/* RECOMMENDATION */}
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Recommendation</p>
                                <p className="text-sm font-medium text-gray-800">
                                    {score.recommendation || "—"}
                                </p>
                            </div>

                            {/* STRENGTHS */}
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Strengths</p>
                                <p className="text-sm text-gray-800">
                                    {score.strengths || "—"}
                                </p>
                            </div>

                            {/* WEAKNESSES */}
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Weaknesses</p>
                                <p className="text-sm text-gray-800">
                                    {score.weaknesses || "—"}
                                </p>
                            </div>

                            {/* COMMENTS */}
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Comments</p>
                                <p className="text-sm text-gray-800">
                                    {score.comments || "—"}
                                </p>
                            </div>

                            {/* DATE */}
                            <p className="text-xs text-gray-500 mt-2 pt-2 border-t">
                                {score.submittedAt
                                    ? `Submitted on ${new Date(
                                        score.submittedAt
                                    ).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}`
                                    : "Not submitted yet"}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* LOCK BUTTON */}
            {allSubmitted && (
                <div className="mt-10 flex justify-end">
                    <button
                        onClick={() => setShowLockModal(true)}
                        className="px-6 py-2.5 text-sm bg-red-600 text-white rounded-lg font-semibold
                        hover:bg-red-700 shadow-sm"
                    >
                        Lock Interview Scores
                    </button>
                </div>
            )}

            {/* LOCK MODAL */}
            {showLockModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-semibold mb-3 text-red-600">
                            Confirm Lock
                        </h3>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            Once locked, no panel member can update their score.
                            <br />
                            <span className="font-semibold">
                                This action is permanent.
                            </span>
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLockModal(false)}
                                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLock}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                            >
                                Confirm & Lock
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewScoreReview;
