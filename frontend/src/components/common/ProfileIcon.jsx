import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const ProfileIcon = () => {
  const { user, handleLogout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogoutClick = () => {
    handleLogout();
    setTimeout(() => navigate("/login"), 200);
  };


  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold text-gray-700 hover:bg-gray-300 border border-gray-300"
      >
        {user.username.charAt(0).toUpperCase()}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 shadow-xl rounded-md border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 text-sm text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 break-words max-w-full">
            {user.mail || "Email not available"}
          </div>
          <button
            onClick={toggleTheme}
            className="block w-full text-left px-4 py-2 text-blue-600 dark:text-blue-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? "🌙 Dark Mode On" : "☀️ Light Mode On"}
          </button>
          <button
            onClick={handleLogoutClick}
            className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileIcon;
