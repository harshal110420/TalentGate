// components/QuestionTimer.jsx
import React, { useEffect, useState } from "react";

const QuestionTimer = ({ questionIndex, onTimeUp, timeLimit = 20 }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [questionIndex, timeLimit]);

  useEffect(() => {
    if (timeLeft === 0) {
      onTimeUp?.();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, onTimeUp]);

  // Percent for progress ring
  const percentage = (timeLeft / timeLimit) * 100;

  // Color logic
  const timerColor =
    percentage > 60
      ? "stroke-green-500"
      : percentage > 30
        ? "stroke-yellow-500"
        : "stroke-red-600";

  return (
    <div className="flex items-center gap-3">
      {/* Circular Timer */}
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            className="stroke-gray-300"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            className={`${timerColor} transition-all duration-500`}
            strokeWidth="4"
            fill="none"
            strokeDasharray={125.6}
            strokeDashoffset={125.6 - (percentage / 100) * 125.6}
            strokeLinecap="round"
          />
        </svg>

        {/* Time Text */}
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-800">
          {timeLeft}s
        </div>
      </div>

      {/* Label */}
      <div className="text-xs font-semibold text-gray-700">
        Time Left
      </div>
    </div>
  );
};

export default QuestionTimer;
