import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const GlobalNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4 bg-white dark:bg-gray-900">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        404 - Page Not Found
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
        The page you're trying to reach doesn’t exist. It might have been moved,
        deleted, or you mistyped the URL.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-5 py-2 bg-blue-600 dark:bg-blue-800 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-900 transition"
      >
        Go to Homepage
      </button>
    </div>
  );
};

export default GlobalNotFound;
