// components/FormActionButtons.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, ChevronLeft, ChevronRight } from "lucide-react";

const FormActionButtons = ({
  loading = false,
  isEditMode = false,

  // Step controls
  currentStep = 0,
  totalSteps = 1,
  isLastStep = true,

  // Validation flag
  isFormValid = false,
  hideSubmit = false,

  // Handlers
  onBackClick,
  onPrevious,
  onNext,
  onSubmitClick,
}) => {
  const navigate = useNavigate();

  const isMultiStep = totalSteps > 1;

  const showPrevious = isMultiStep && currentStep > 0;
  const showNext = isMultiStep && !isLastStep;
  const showSubmit = isLastStep && !hideSubmit;

  return (
    <div className="flex justify-end items-center gap-2 mt-6">

      {/* ---------- BACK ---------- */}
      <button
        type="button"
        onClick={onBackClick || (() => navigate(-1))}
        className="border-2 border-amber-400 text-xs font-semibold rounded-full
          text-black dark:text-white px-3 py-1
          hover:bg-amber-400 hover:text-white flex items-center"
      >
        <X className="w-4 h-4 mr-1" />
        Back
      </button>

      {/* ---------- PREVIOUS ---------- */}
      {showPrevious && (
        <button
          type="button"
          onClick={onPrevious}
          className="border-2 border-blue-400 text-xs font-semibold rounded-full
            text-black dark:text-white px-3 py-1
            hover:bg-blue-400 hover:text-white flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>
      )}

      {/* ---------- NEXT ---------- */}
      {showNext && (
        <button
          type="button"
          onClick={onNext}
          className="border-2 border-blue-500 text-xs font-semibold rounded-full
            text-black dark:text-white px-3 py-1
            hover:bg-blue-500 hover:text-white flex items-center"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      )}

      {/* ---------- SUBMIT / UPDATE ---------- */}
      {showSubmit && (
        <button
          type="submit"
          onClick={onSubmitClick}
          disabled={!isFormValid || loading}
          className={`
            border-2 text-xs font-semibold rounded-full px-3 py-1
            flex items-center transition
            ${!isFormValid || loading
              ? "border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
              : "border-green-400 bg-green-400 text-white hover:bg-green-500"
            }
          `}
        >
          <Check className="w-4 h-4 mr-1" />
          {loading
            ? "Saving..."
            : isEditMode
              ? "Update"
              : "Submit"}
        </button>
      )}

    </div>
  );
};

export default FormActionButtons;
