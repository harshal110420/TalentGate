// components/QuestionCard.jsx
import React from "react";

const QuestionCard = ({
  question,
  selectedOption,
  onSelect,
  questionNumber,
}) => {
  return (
    <div className="bg-white text-gray-900 p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">
        Q{questionNumber}: {question.question}
      </h2>
      <div className="space-y-3">
        {question.options.map((opt, idx) => (
          <label
            key={idx}
            className={`block px-4 py-2 border rounded cursor-pointer transition-all duration-200 ${selectedOption === opt
                ? "bg-blue-100 border-blue-500"
                : "hover:bg-gray-50 border-gray-300"
              }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={opt}
              checked={selectedOption === String(opt).trim()}
              onChange={() => onSelect(opt)}
              className="mr-2"
            />
            {String.fromCharCode(65 + idx)}) {opt}
          </label>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <button
          className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100"
          onClick={() => onSelect(null)}
        >
          Clear Response
        </button>
      </div>
    </div>
  );
};

export default QuestionCard;
