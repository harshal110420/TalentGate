// src/components/common/UploadStatusModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const UploadStatusModal = ({ open, message }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col items-center gap-4 w-[300px]"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-gray-700 dark:text-gray-200 font-medium text-center">
              {message || "Uploading... Please wait"}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UploadStatusModal;
