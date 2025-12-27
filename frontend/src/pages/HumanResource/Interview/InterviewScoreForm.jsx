import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchMyScore,
    saveDraftScore,
    submitFinalScore,
} from "../../../features/HR_Slices/Interview_scores/interviewScoreSlice";
import { useParams, useNavigate } from "react-router-dom";
import { StepBack } from "lucide-react";

const InterviewScoreForm = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const [scoreError, setScoreError] = useState("");
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
        if (!loading && myScore) {
            setForm({
                score: myScore.score ?? "",
                recommendation: myScore.recommendation ?? "",
                strengths: myScore.strengths ?? "",
                weaknesses: myScore.weaknesses ?? "",
                comments: myScore.comments ?? "",
            });
        }
    }, [loading, myScore]);

    const isLocked =
        myScore?.status === "Submitted" || myScore?.status === "Locked";

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "score") {
            const numericValue = Number(value);

            if (numericValue < 0 || numericValue > 10) {
                setScoreError("Score must be between 0 and 10");
                return;
            } else {
                setScoreError(""); // clear when valid
            }
        }
        setForm({ ...form, [name]: value });
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

    const sectionTitle = "text-[15px] tracking-wide text-gray-800 font-semibold";

    const strengthsSuggestions = [
        "Quick learner",
        "Strong analytical thinking",
        "Clear communication",
        "Attention to detail",
        "Ownership mindset",
        "Problem solving ability",
        "Adaptable to challenges",
    ];

    const addSuggestion = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field]
                ? `${prev[field]}\n• ${value}`
                : `• ${value}`
        }));
    };

    return (
        <div className="w-full flex justify-center">
            <div className="max-w-6xl w-full mx-auto px-6 md:px-10 pb-24">

                {/* ==== HEADER ==== */}
                <div className="flex items-center justify-between z-10 pb-4 pt-6 border-b">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">Interview Evaluation</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Fill out your feedback with clarity — it shapes the hiring decision.
                        </p>

                        {myScore?.status && (
                            <span
                                className={`inline-block mt-3 text-xs px-3 py-[5px] rounded-full font-medium shadow-sm
                        ${myScore.status === "Draft"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : myScore.status === "Submitted"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-200 text-gray-700"
                                    }`}
                            >
                                {myScore.status}
                            </span>
                        )}

                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md">
                        <StepBack className="w-4 h-4" />
                        Back
                    </button>

                </div>

                {/* ==== READ ONLY NOTICE ==== */}
                {isLocked && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg mt-4 p-4 text-[13px] text-blue-700 flex items-center gap-2">
                        <span>🔒</span> This score sheet is finalized and cannot be edited.
                    </div>
                )}

                {/* ==== BODY GRID ==== */}
                <div className="grid md:grid-cols-[280px,1fr] gap-6 mt-6">

                    {/* SUMMARY PANEL */}
                    <aside className="bg-gray-50 border rounded-xl p-5 space-y-5 shadow-inner">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Quick Summary</h3>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Current Score</span>
                                <span className="text-gray-900 font-bold">
                                    {form.score || "—"} <span className="text-xs font-medium text-gray-500">/ 10</span>
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Recommendation</span>
                                <span className="font-medium text-gray-900 text-right">
                                    {form.recommendation || "—"}
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 border-t text-xs text-gray-500">
                            💡 Tip: press <span className="font-medium text-gray-700">Save as Draft</span> to keep changes.
                        </div>
                    </aside>

                    {/* FORM SIDE */}
                    <div className="space-y-8">

                        {/* SCORE */}
                        <div className="bg-white border rounded-xl p-5 shadow-sm relative">
                            <label className="block text-sm font-semibold text-gray-800 mb-1">Overall Score</label>
                            <p className="text-xs text-gray-500 mb-2">Rate the candidate from 0 to 10</p>

                            <div className="relative inline-block">
                                <input
                                    type="number"
                                    name="score"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={form.score}
                                    onChange={handleChange}
                                    disabled={isLocked}
                                    className={`w-28 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${scoreError ? "border-red-500" : ""}`} />

                                {scoreError && (
                                    <span
                                        className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-red-50 text-red-700 border border-red-200 text-xs px-3 py-[4px] rounded-full shadow-sm whitespace-nowrap">
                                        {scoreError}
                                    </span>
                                )}

                            </div>
                        </div>


                        {/* RECOMMENDATION */}
                        <div className="bg-white border rounded-xl p-5 shadow-sm">
                            <label className="block text-sm font-semibold text-gray-800 mb-1">Recommendation</label>
                            <p className="text-xs text-gray-500 mb-2">Your final hiring judgment</p>
                            <select
                                name="recommendation"
                                value={form.recommendation}
                                onChange={handleChange}
                                disabled={isLocked}
                                className="w-64 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                <option value="">Select</option>
                                {["Strong Yes", "Yes", "Neutral", "No", "Strong No"].map(item => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                        </div>

                        {/* STRENGTHS */}
                        <div className="bg-white border rounded-xl p-5 shadow-sm">
                            <label className="block text-sm font-semibold text-gray-800 mb-1">Strengths</label>
                            <textarea
                                name="strengths"
                                rows="3"
                                value={form.strengths}
                                onChange={handleChange}
                                disabled={isLocked}
                                className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                placeholder="Example: Strong communication, deep understanding of concepts..."
                            />

                            <div className="mt-3 flex flex-wrap gap-2">
                                {strengthsSuggestions.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => addSuggestion("strengths", item)}
                                        className="px-3 py-[5px] text-xs bg-gray-100 border rounded-full hover:bg-gray-200 transition"
                                    >
                                        + {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* WEAKNESSES */}
                        <div className="bg-white border rounded-xl p-5 shadow-sm">
                            <label className="block text-sm font-semibold text-gray-800 mb-1">Areas of Improvement</label>
                            <textarea
                                name="weaknesses"
                                rows="3"
                                value={form.weaknesses}
                                onChange={handleChange}
                                disabled={isLocked}
                                placeholder="Where candidate needs development..."
                                className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                        </div>

                        {/* COMMENTS */}
                        <div className="bg-white border rounded-xl p-5 shadow-sm">
                            <label className="block text-sm font-semibold text-gray-800 mb-1">Additional Comments</label>
                            <textarea
                                name="comments"
                                rows="3"
                                value={form.comments}
                                onChange={handleChange}
                                disabled={isLocked}
                                placeholder="Any important notes for HR / next round?"
                                className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                        </div>

                    </div>
                </div>

                {/* ==== ACTION BUTTONS (bottom-right inside page) ==== */}
                {!isLocked && (
                    <div className="w-full flex justify-end gap-3 mt-10 pb-10">
                        <button
                            onClick={saveDraft}
                            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
                        >
                            💾 Save as Draft
                        </button>

                        <button
                            onClick={submitFinal}
                            className="px-5 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            🚀 Submit Final Score
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

};

export default InterviewScoreForm;
