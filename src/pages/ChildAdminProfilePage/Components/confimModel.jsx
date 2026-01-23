// ConfirmModal.jsx
import React from "react";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const fadeModal = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", duration: 0.5, bounce: 0.2 } },
  exit: { opacity: 0, x: 50, transition: { duration: 0.3 } },
};

export default function ConfirmModal({ actionType, handleClose, handleConfirm, isProcessing }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center"
      variants={fadeModal}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="absolute inset-0" onClick={handleClose} />
      <motion.div
        className="relative bg-white p-6 rounded-xl shadow-xl max-w-sm mx-auto w-full border-t-4 border-red-400"
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition"
          onClick={handleClose}
        >
          <FaTimes />
        </button>
        <h3 className="text-lg font-semibold mb-4 text-center">
          Confirm to {actionType}
        </h3>
        <p className="mb-4 text-center text-gray-700">
          Are you sure you want to {actionType} this child admin?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 text-white rounded ${
              isProcessing ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
