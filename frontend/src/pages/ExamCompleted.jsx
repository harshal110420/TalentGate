import React from "react";
import { useNavigate } from "react-router-dom";

const ExamCompleted = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          🎉 Exam Completed!
        </h1>
        <p className="text-gray-700 mb-6">
          Your exam has been successfully submitted. You will receive your
          results soon.
        </p>
      </div>
    </div>
  );
};

export default ExamCompleted;
