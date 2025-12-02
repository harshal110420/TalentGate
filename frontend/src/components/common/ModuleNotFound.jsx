// src/pages/common/ModuleNotFound.jsx

import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const ModuleNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Module Not Found</h1>
      <p className="text-gray-700 dark:text-gray-100 mb-4">
        The module you're trying to access doesn't exist or is not assigned to
        you.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Go to Home
      </button>
    </div>
  );
};

export default ModuleNotFound;
