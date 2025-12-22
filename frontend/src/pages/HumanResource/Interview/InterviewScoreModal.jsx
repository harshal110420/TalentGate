import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    submitInterviewScore,
    fetchMyInterviewScore,
} from "../../../features/HR_Slices/Interview_scores/interviewScoreSlice";
import { toast } from "react-toastify";

const InterviewScoreModal = ({ interview, onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const { myScore } = useSelector((state) => state.interviewScore || {});

    const [form, setForm] = useState({
        score: "",
        recommendation: "",
        strengths: "",
        weaknesses: "",
        comments: "",
    });

    useEffect(() => {
        if (interview?.id) {
            dispatch(fetchMyInterviewScore(interview.id));
        }
    }, [interview?.id, dispatch]);

    useEffect(() => {
        if (myScore) {
            setForm({
                score: myScore.score ?? "",
                recommendation: myScore.recommendation ?? "",
                strengths: myScore.strengths ?? "",
                weaknesses: myScore.weaknesses ?? "",
                comments: myScore.comments ?? "",
            });
        }
    }, [myScore]);

    const isSubmitted = myScore?.status === "Submitted";

    const handleSave = async (submit) => {
        try {
            await dispatch(
                submitInterviewScore({
                    interviewId: interview.id,
                    payload: { ...form, submit },
                })
            ).unwrap();

            toast.success(submit ? "Score submitted" : "Draft saved");
            if (submit) onSuccess?.();
        } catch {
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* ===== HEADER ===== */}
                <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800 flex-shrink-0">
                    <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Interview Evaluation — {myScore?.candidateName || "—"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 text-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* ===== BODY ===== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto flex-1">

                    {/* ---------- LEFT : INTERVIEW INFO ---------- */}
                    <div className="rounded-xl p-4 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-sm space-y-3">
                        <Info label="Candidate" value={myScore?.candidateName} />
                        <Info label="Round" value={myScore?.round} />
                        <Info label="Type" value={myScore?.interviewType} />
                        <Info label="Date" value={myScore?.interviewDate} />
                        <Info
                            label="Time"
                            value={`${myScore?.startTime} - ${myScore?.endTime}`}
                        />
                        <Info label="Status" value={myScore?.status} />

                        {isSubmitted && (
                            <div className="mt-4 text-xs text-green-700 bg-green-50 px-3 py-2 rounded">
                                Score already submitted. Editing disabled.
                            </div>
                        )}
                    </div>

                    {/* ---------- RIGHT : SCORE FORM ---------- */}
                    <div className="space-y-4">

                        <Field label="Score (0–10)">
                            <input
                                type="number"
                                min="0"
                                max="10"
                                disabled={isSubmitted}
                                value={form.score}
                                onChange={(e) =>
                                    setForm({ ...form, score: e.target.value })
                                }
                                className="w-full rounded-lg px-3 py-2 text-sm
                           bg-white dark:bg-slate-900
                           border border-slate-300
                           focus:ring-2 focus:ring-slate-400 outline-none"
                            />
                        </Field>

                        <Field label="Recommendation">
                            <select
                                disabled={isSubmitted}
                                value={form.recommendation}
                                onChange={(e) =>
                                    setForm({ ...form, recommendation: e.target.value })
                                }
                                className="w-full rounded-lg px-3 py-2 text-sm
                           bg-white dark:bg-slate-900
                           border border-slate-300
                           focus:ring-2 focus:ring-slate-400 outline-none"
                            >
                                <option value="">Select recommendation</option>
                                <option>Strong Yes</option>
                                <option>Yes</option>
                                <option>Neutral</option>
                                <option>No</option>
                                <option>Strong No</option>
                            </select>
                        </Field>

                        <Field label="Strengths">
                            <textarea
                                rows={2}
                                disabled={isSubmitted}
                                value={form.strengths}
                                onChange={(e) =>
                                    setForm({ ...form, strengths: e.target.value })
                                }
                                className="w-full rounded-lg px-3 py-2 text-sm
                           bg-white dark:bg-slate-900
                           border border-slate-300
                           focus:ring-2 focus:ring-slate-400 outline-none"
                            />
                        </Field>

                        <Field label="Weaknesses">
                            <textarea
                                rows={2}
                                disabled={isSubmitted}
                                value={form.weaknesses}
                                onChange={(e) =>
                                    setForm({ ...form, weaknesses: e.target.value })
                                }
                                className="w-full rounded-lg px-3 py-2 text-sm
                           bg-white dark:bg-slate-900
                           border border-slate-300
                           focus:ring-2 focus:ring-slate-400 outline-none"
                            />
                        </Field>

                        <Field label="Comments">
                            <textarea
                                rows={3}
                                disabled={isSubmitted}
                                value={form.comments}
                                onChange={(e) =>
                                    setForm({ ...form, comments: e.target.value })
                                }
                                className="w-full rounded-lg px-3 py-2 text-sm
                           bg-white dark:bg-slate-900
                           border border-slate-300
                           focus:ring-2 focus:ring-slate-400 outline-none"
                            />
                        </Field>
                    </div>
                </div>

                {/* ===== FOOTER ===== */}
                <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700
                        flex justify-end gap-3 bg-slate-50 dark:bg-slate-800">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm border border-slate-300
                       text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        Cancel
                    </button>

                    {!isSubmitted && (
                        <>
                            <button
                                onClick={() => handleSave(false)}
                                className="px-5 py-2 text-sm border border-slate-300
                           text-slate-700 hover:bg-slate-100 rounded-lg"
                            >
                                Save Draft
                            </button>

                            <button
                                onClick={() => handleSave(true)}
                                className="px-5 py-2 text-sm bg-slate-700
                           hover:bg-slate-800 text-white rounded-lg"
                            >
                                Submit Score
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const Info = ({ label, value }) => (
    <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
            {value || "—"}
        </p>
    </div>
);

const Field = ({ label, children }) => (
    <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
            {label}
        </label>
        {children}
    </div>
);

export default InterviewScoreModal;
