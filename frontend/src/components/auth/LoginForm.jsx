import { use, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const LoginForm = () => {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/auth/login", {
        username,
        password,
      });
      handleLogin(response.data);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">
        Welcome Back 👋
      </h2>
      {/* <p className="text-sm text-gray-500 text-center mb-6">
        Sign in to continue to InvoTrack
      </p> */}

      {error && (
        <div className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-sm rounded-md p-2 mb-4 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-100 text-sm">Username</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </div>

        <div className="mb-6 relative">
          <label className="block mb-1 text-gray-700 dark:text-gray-100 text-sm">
            Password
          </label>

          <input
            type={showPassword ? "text" : "password"}
            className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10 
               focus:outline-none focus:ring-2 focus:ring-blue-500 
               dark:bg-gray-900 dark:text-gray-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          {/* Eye Icon Button */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>


        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
        >
          Sign In
        </button>
      </form>
    </>
  );
};

export default LoginForm;
