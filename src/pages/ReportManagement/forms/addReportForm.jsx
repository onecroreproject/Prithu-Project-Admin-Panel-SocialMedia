import { useState } from "react";
import axios from "../../../Utils/axiosApi";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function AddReportTypeForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Type name is required");
      return;
    }

    try {
      await axios.post("/api/admin/report-type", { name, description });
      toast.success("Report Type Added");
      setName("");
      setDescription("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding report type");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <PlusCircle className="h-5 w-5 mr-2 text-blue-600" />
        Add Report Type
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Report Type Name
          </label>
          <input
            type="text"
            placeholder="Ex: Abuse, Spam, Fake Account"
            className="w-full mt-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Description (Optional)
          </label>
          <textarea
            className="w-full mt-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Short description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm shadow hover:bg-blue-700 transition"
        >
          Add Type
        </button>
      </form>
    </motion.div>
  );
}
