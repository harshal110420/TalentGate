// src/components/skeletons/LoadingScreen.jsx
import { Loader2 } from "lucide-react";
import React from "react";

const LoadingScreen = () => {
  return (
    <div
      className="
        flex h-screen items-center justify-center 
        bg-white dark:bg-gray-900
        transition-colors duration-300
      "
    >
      <div className="flex flex-col items-center space-y-4 animate-fade-in">

        {/* Glow Circle Effect */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>

          <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin relative" />
        </div>

        {/* Loading text */}
        <p className="text-gray-700 dark:text-gray-300 text-sm font-medium tracking-wide">
          Initializing dashboard…
        </p>

        {/* Subtle Progress Line */}
        <div className="w-40 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 dark:bg-blue-400 animate-loader-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
