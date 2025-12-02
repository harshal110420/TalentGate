// components/FormActionButtons.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";

const FormActionButtons = ({
  loading,
  onBackClick,
  onSubmitClick,
  disableSubmit = false,
  isEditMode = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-end items-center gap-1.5 mt-6">
      <button
        type="button"
        onClick={onBackClick || (() => navigate(-1))}
        className="border-2 border-amber-400 text-xs font-semibold rounded-full text-black dark:text-white px-3 py-1 hover:bg-amber-400 hover:text-white disabled:opacity-50 flex items-center"
      >
        <X className="w-4 h-4 mr-1" />
        Back
      </button>

      <button
        type="submit"
        onClick={onSubmitClick}
        disabled={loading || disableSubmit}
        className="border-2 border-green-400 text-xs font-semibold rounded-full text-black dark:text-white px-3 py-1 hover:bg-green-400 hover:text-white disabled:opacity-50 flex items-center"
      >
        <Check className="w-4 h-4 mr-1" />
        {loading ? "Saving..." : isEditMode ? "Update" : "Submit"}
      </button>
    </div>
  );
};

export default FormActionButtons;
