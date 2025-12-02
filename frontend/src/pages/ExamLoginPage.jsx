import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import {
  AlertCircle,
  ShieldCheck,
  Loader2,
  FileText,
  Rocket,
} from "lucide-react";
import { motion } from "framer-motion";
import ExamAccessDenied from "../components/common/ExamAccessDenied";

const BrandingHeader = () => (
  <div className="flex items-center justify-center mb-6 sm:mb-8">
    <h1 className="text-2xl font-bold text-blue-700 tracking-wide">
      Talent Gate
    </h1>
  </div>
);

const Stepper = () => (
  <div className="flex justify-between items-center mb-6">
    <div className="flex-1 flex items-center gap-2 text-blue-600 font-medium">
      <ShieldCheck className="w-5 h-5" />
      <span>Precautions</span>
    </div>

    <div className="flex-1 flex items-center gap-2 text-blue-600 font-medium">
      <FileText className="w-5 h-5" />
      <span>Instructions</span>
    </div>

    <div className="flex-1 flex items-center gap-2 text-blue-600 font-medium">
      <Rocket className="w-5 h-5" />
      <span>Exam Start</span>
    </div>
  </div>
);

const ExamLoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);

  // ---------------- TOKEN VERIFICATION ----------------
  useEffect(() => {
    const verifyToken = async () => {
      try {
        await axiosInstance.post("/candidate/verify-token", { token });
        setValid(true);
      } catch (err) {
        setError("Invalid or expired token.");
      } finally {
        setLoading(false);
      }
    };

    if (token) verifyToken();
    else {
      setError("No token provided.");
      setLoading(false);
    }
  }, [token]);

  // ---------------- START EXAM ----------------
  const handleStartExam = async () => {
    try {
      await axiosInstance.post("/candidate/start-exam", { token });
      navigate(`/exam-ui?token=${token}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start exam.");
    }
  };

  // ---------------- UI STATES ----------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600 font-semibold text-lg">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Verifying token...
      </div>
    );
  }

  if (!valid) {
    return <ExamAccessDenied reason={error || "invalid"} />;
  }

  // ---------------- MAIN COMPONENT ----------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white p-5 sm:p-8 rounded-xl shadow-lg max-w-xl w-full border border-gray-200"
      >
        <BrandingHeader />
        <Stepper />

        <p className="text-gray-600 text-sm sm:text-base mb-4">
          Please read the following instructions carefully before proceeding.
        </p>

        {/* PRECAUTIONS & RULES */}
        <ul className="list-disc pl-5 sm:pl-6 text-sm text-gray-700 space-y-2 mb-6">
          <li>Stable and uninterrupted internet is mandatory.</li>
          <li>Do NOT refresh or close the browser tab once the exam starts.</li>
          <li>Switching devices is strictly not allowed.</li>
          <li>Screen and webcam (if enabled) must remain unobstructed.</li>
          <li>
            Exiting Fullscreen mode will result in
            <strong>automatic exam submission</strong>.
          </li>
          <li>
            Tab switching or opening a new tab will cause
            <strong>automatic submission</strong>.
          </li>
          <li>
            Using keyboard shortcuts like <strong>ALT + TAB</strong> will cause
            auto-submit.
          </li>
          <li>Minimizing the browser window will auto-submit the exam.</li>
          <li>Use only one device and one window for the entire exam.</li>
        </ul>

        {/* ACCEPT CHECKBOX */}
        <div className="mb-6 flex items-start sm:items-center">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            id="accept"
            className="mt-1 sm:mt-0 w-4 h-4 mr-2"
          />
          <label
            htmlFor="accept"
            className="text-sm text-gray-800 leading-tight"
          >
            I have read and accept all the above precautions and rules.
          </label>
        </div>

        {/* START BUTTON */}
        <button
          disabled={!accepted}
          onClick={handleStartExam}
          className={`w-full py-2 px-4 rounded-md text-white text-sm font-semibold transition-all duration-200 ${accepted
              ? "bg-blue-600 hover:bg-blue-700 shadow-sm"
              : "bg-gray-300 cursor-not-allowed"
            }`}
        >
          🚀 Start Exam
        </button>
      </motion.div>
    </div>
  );
};

export default ExamLoginPage;
