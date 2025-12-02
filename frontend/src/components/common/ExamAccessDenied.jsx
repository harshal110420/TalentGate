import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const ExamAccessDenied = ({ reason }) => {
  const navigate = useNavigate();

  // Friendly messages based on reason
  const getMessage = () => {
    switch (reason) {
      case "expired":
        return {
          title: "⏰ Exam Link Expired",
          description:
            "Your exam link has expired. Please contact the administrator to request a new exam link.",
        };
      case "submitted":
        return {
          title: "✅ Exam Already Submitted",
          description:
            "You have already completed this exam. Re-attempts are not allowed.",
        };
      case "backNavigation":
        return {
          title: "🚫 Action Not Allowed",
          description:
            "You cannot navigate back to the exam after submission. Please check your dashboard for further instructions.",
        };
      default:
        return {
          title: "⚠️ Invalid or Expired Token",
          description:
            "The token you used is invalid or has expired. Please request a new exam link.",
        };
    }
  };

  const { title, description } = getMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-md w-full border border-red-300 text-center animate-fadeIn">
        <AlertTriangle className="mx-auto text-red-500 w-12 h-12 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">{description}</p>
      </div>
    </div>
  );
};

export default ExamAccessDenied;
