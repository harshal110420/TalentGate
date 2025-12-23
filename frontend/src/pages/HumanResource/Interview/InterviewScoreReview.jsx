import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAllScores,
    lockInterviewScores
} from "../../../features/HR_Slices/Interview_scores/interviewScoreSlice";
import { useParams, useNavigate } from "react-router-dom";

const InterviewScoreReview = () => {
    const { interviewId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [showLockModal, setShowLockModal] = useState(false);

    const { allScores, loading } = useSelector(
        (state) => state.interviewScore
    );

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
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">
                    Interview Score Review
                </h2>

                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
                >
                    ← Back
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="text-gray-500">Loading scores...</div>
            )}

            {/* Scores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allScores.map((score) => (
                    <div
                        key={score.id}
                        className="border rounded-xl p-4 bg-white shadow-sm"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">
                                {score.interviewer?.firstName}{" "}
                                {score.interviewer?.lastName}
                            </h4>

                            <span
                                className={`text-xs px-2 py-1 rounded-full font-medium
                  ${score.status === "Submitted"
                                        ? "bg-green-100 text-green-700"
                                        : score.status === "Draft"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-gray-200 text-gray-600"
                                    }`}
                            >
                                {score.status}
                            </span>
                        </div>

                        <p className="text-sm">
                            <b>Score:</b>{" "}
                            <span className="font-semibold">{score.score}</span>
                        </p>

                        <p className="text-sm mt-1">
                            <b>Recommendation:</b> {score.recommendation}
                        </p>

                        <p className="text-xs text-gray-500 mt-2">
                            Submitted At:{" "}
                            {score.submittedAt
                                ? new Date(score.submittedAt).toLocaleString()
                                : "—"}
                        </p>
                    </div>
                ))}
            </div>

            {/* Lock Section */}
            {allSubmitted && (
                <div className="mt-8 border-t pt-6 flex justify-end">
                    <button
                        onClick={() => setShowLockModal(true)}
                        className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Lock Interview Scores
                    </button>
                </div>
            )}

            {/* Lock Confirmation Modal */}
            {showLockModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-3 text-red-600">
                            Confirm Lock
                        </h3>

                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to lock this candidate’s interview
                            scores?
                            <br />
                            <b>This action cannot be undone.</b>
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLockModal(false)}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleLock}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
