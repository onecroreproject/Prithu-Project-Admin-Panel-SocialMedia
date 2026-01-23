import { useState, useEffect } from "react";
import axios from "../../../Utils/axiosApi";
import { motion } from "framer-motion";
import { MessageCircleQuestion, Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function AddReportQuestionForm() {
  const [types, setTypes] = useState([]);
  const [typeId, setTypeId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState([{ text: "" }]);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const res = await axios.get("/api/admin/get/ReportTypes");
      setTypes(res.data.data);
    } catch {
      toast.error("Failed to load report types");
    }
  };

  const addOption = () => {
    setOptions([...options, { text: "" }]);
  };

  const handleOptionChange = (i, val) => {
    const updated = [...options];
    updated[i].text = val;
    setOptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!typeId) return toast.error("Select report type");
    if (!questionText.trim()) return toast.error("Enter question");

    const validOptions = options.filter((o) => o.text.trim() !== "");
    if (validOptions.length < 1) return toast.error("At least 1 option needed");

    try {
      await axios.post("/api/admin/add/report/questions", {
        typeId,
        questionText,
        options: validOptions,
      });

      toast.success("Question added");
      setTypeId("");
      setQuestionText("");
      setOptions([{ text: "" }]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding question");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
        <MessageCircleQuestion className="h-5 w-5 mr-2 text-blue-600" />
        Add Report Question
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Select */}
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Select Report Type</label>
          <select
            className="w-full mt-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 shadow-sm"
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
          >
            <option value="">-- Select Type --</option>
            {types.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Question Input */}
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Question</label>
          <input
            type="text"
            placeholder="Enter question"
            className="w-full mt-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
        </div>

        {/* Options */}
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Options</label>

          {options.map((opt, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Option ${index + 1}`}
              className="w-full mt-2 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
              value={opt.text}
              onChange={(e) => handleOptionChange(index, e.target.value)}
            />
          ))}

          <button
            type="button"
            onClick={addOption}
            className="mt-3 flex items-center text-blue-600"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Option
          </button>
        </div>

        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm shadow hover:bg-blue-700 transition"
        >
          Add Question
        </button>
      </form>
    </motion.div>
  );
}
