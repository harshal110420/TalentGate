import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import React from "react";


const ConfirmModal = ({ open, title, message, onConfirm, onCancel, loading }) => {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md p-6"
        >
          <div className="flex items-center mb-4 gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {title || "Confirm Action"}
            </h2>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 
              transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-green-600 text-white 
              hover:bg-green-700 transition disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {loading ? "Confirming..." : "Confirm"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};


export default ConfirmModal;