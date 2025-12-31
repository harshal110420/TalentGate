import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyScore } from "../../../features/HR_Slices/Interview_scores/interviewScoreSlice";
import { useParams, useNavigate } from "react-router-dom";
import { StepBack } from "lucide-react";

const ViewScore = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { myScore, loading } = useSelector(state => state.interviewScores);

    useEffect(() => {
        dispatch(fetchMyScore(interviewId));
    }, [dispatch, interviewId]);

    if (loading)
        return (
            <div className="p-10 text-gray-500 text-center">Loading score...</div>
        );

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Interview Score
                </h2>
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition"
                >
                    <StepBack className="w-4 h-4" /> Back
                </button>
            </div>

            {/* Score Card */}
            <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Score & Status */}
                <div className="flex flex-col gap-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 pb-4 md:pb-0 pr-0 md:pr-6">
                    <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">Overall Score</div>
                    <div className="text-5xl font-extrabold text-blue-600 dark:text-blue-400">{myScore?.score ?? "—"}/10</div>

                    <div className="mt-4">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium
                            ${myScore?.status === "Draft" ? "bg-yellow-100 text-yellow-800" :
                                myScore?.status === "Submitted" ? "bg-green-100 text-green-700" :
                                    "bg-gray-200 text-gray-700"
                            }`}
                        >
                            {myScore?.status ?? "—"}
                        </span>
                    </div>
                </div>

                {/* Recommendations & Feedback */}
                <div className="flex flex-col gap-5">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Recommendation</h3>
                        <p className="text-gray-900 dark:text-gray-100 text-base">{myScore?.recommendation ?? "—"}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Strengths</h3>
                        <p className="text-gray-900 dark:text-gray-100">{myScore?.strengths ?? "—"}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Areas of Improvement</h3>
                        <p className="text-gray-900 dark:text-gray-100">{myScore?.weaknesses ?? "—"}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Comments</h3>
                        <p className="text-gray-900 dark:text-gray-100">{myScore?.comments ?? "—"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewScore;
