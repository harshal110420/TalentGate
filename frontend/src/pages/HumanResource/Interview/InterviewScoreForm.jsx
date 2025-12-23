import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchMyScore,
    saveDraftScore,
    submitFinalScore,
} from "../../../features/HR_Slices/Interview_scores/interviewScoreSlice";
import { useParams } from "react-router-dom";

const InterviewScoreForm = () => {
    const { interviewId } = useParams();
    const dispatch = useDispatch();

    const { myScore, loading } = useSelector(
        (state) => state.interviewScore
    );

    const [form, setForm] = useState({
        score: "",
        recommendation: "",
        strengths: "",
        weaknesses: "",
        comments: "",
    });

    useEffect(() => {
        dispatch(fetchMyScore(interviewId));
    }, [dispatch, interviewId]);

    useEffect(() => {
        if (myScore) {
            setForm({
                score: myScore.score || "",
                recommendation: myScore.recommendation || "",
                strengths: myScore.strengths || "",
                weaknesses: myScore.weaknesses || "",
                comments: myScore.comments || "",
            });
        }
    }, [myScore]);

    const isLocked =
        myScore?.status === "Submitted" || myScore?.status === "Locked";

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const saveDraft = () => {
        dispatch(saveDraftScore({ interviewId, payload: form }));
    };

    const submitFinal = () => {
        dispatch(submitFinalScore({ interviewId, payload: form }));
    };

    if (loading) {
        return (
            <div className="p-6 text-gray-500 text-center">
                Loading score sheet...
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Interview Evaluation
                </h2>

                {myScore?.status && (
                    <span
                        className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium
              ${myScore.status === "Draft"
                                ? "bg-yellow-100 text-yellow-700"
                                : myScore.status === "Submitted"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-200 text-gray-700"
                            }`}
                    >
                        Status: {myScore.status}
                    </span>
                )}
            </div>

            {/* Locked Info */}
            {isLocked && (
                <div className="mb-6 border border-gray-200 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                    This score sheet has been finalized and is no longer editable.
                </div>
            )}

            {/* Form */}
            <div className="bg-white border rounded-xl p-6 shadow-sm space-y-5">
                {/* Score */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Overall Score (0–10)
                    </label>
                    <input
                        type="number"
                        name="score"
                        min="0"
                        max="10"
                        step="0.5"
                        value={form.score}
                        onChange={handleChange}
                        disabled={isLocked}
                        className="w-40 border rounded-md px-3 py-2 text-sm disabled:bg-gray-100"
                    />
                </div>

                {/* Recommendation */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recommendation
                    </label>
                    <select
                        name="recommendation"
                        value={form.recommendation}
                        onChange={handleChange}
                        disabled={isLocked}
                        className="w-64 border rounded-md px-3 py-2 text-sm disabled:bg-gray-100"
                    >
                        <option value="">Select</option>
                        <option value="Strong Yes">Strong Yes</option>
                        <option value="Yes">Yes</option>
                        <option value="Neutral">Neutral</option>
                        <option value="No">No</option>
                        <option value="Strong No">Strong No</option>
                    </select>
                </div>

                {/* Strengths */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Strengths
                    </label>
                    <textarea
                        name="strengths"
                        rows="3"
                        placeholder="Key strengths observed during the interview"
                        value={form.strengths}
                        onChange={handleChange}
                        disabled={isLocked}
                        className="w-full border rounded-md px-3 py-2 text-sm resize-none disabled:bg-gray-100"
                    />
                </div>

                {/* Weaknesses */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Areas of Improvement
                    </label>
                    <textarea
                        name="weaknesses"
                        rows="3"
                        placeholder="Areas where the candidate needs improvement"
                        value={form.weaknesses}
                        onChange={handleChange}
                        disabled={isLocked}
                        className="w-full border rounded-md px-3 py-2 text-sm resize-none disabled:bg-gray-100"
                    />
                </div>

                {/* Comments */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Comments
                    </label>
                    <textarea
                        name="comments"
                        rows="3"
                        placeholder="Any additional feedback for HR or next round"
                        value={form.comments}
                        onChange={handleChange}
                        disabled={isLocked}
                        className="w-full border rounded-md px-3 py-2 text-sm resize-none disabled:bg-gray-100"
                    />
                </div>
            </div>

            {/* Actions */}
            {!isLocked && (
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={saveDraft}
                        className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
                    >
                        Save as Draft
                    </button>

                    <button
                        onClick={submitFinal}
                        className="px-5 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Submit Final Score
                    </button>
                </div>
            )}
        </div>
    );
};

export default InterviewScoreForm;
