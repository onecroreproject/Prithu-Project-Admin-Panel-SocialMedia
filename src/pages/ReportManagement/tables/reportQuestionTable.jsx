// components/Reports/Tables/ReportQuestionTable.jsx
import { useEffect, useState } from "react";
import axios from "../../../Utils/axiosApi";
import { motion } from "framer-motion";
import { Trash2, Edit3, Link2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ReportQuestionTable() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllQuestions();
  }, []);

  const fetchAllQuestions = async () => {
    setLoading(true);
    try {
      // assumed endpoint: GET /report/getAllQuestions
      const res = await axios.get("/api/admin/getAllQuestions");
      setQuestions(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (id) => {
    if (!confirm("Delete this question?")) return;
    try {
      // assumed endpoint: DELETE /report/deleteQuestion?questionId=...
      await axios.delete(`/api/admin/deleteQuestion?questionId=${id}`);
      toast.success("Deleted");
      fetchAllQuestions();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <motion.div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Report Questions</h3>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-4">
          {questions.length === 0 && <p className="text-sm text-gray-500">No questions found</p>}

          {questions.map((q) => (
            <div key={q._id} className="border rounded p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">{q.questionText}</div>
                  <div className="text-xs text-gray-500">Type: {q.typeId?.name || q.typeId}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => deleteQuestion(q._id)} className="text-red-600 px-2 py-1 border rounded">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-2">
                {q.options?.map((opt) => (
                  <div key={opt._id} className="flex items-center gap-3 p-2 border rounded">
                    <div className="flex-1 text-sm">{opt.text}</div>
                    <div className="text-xs text-gray-500">
                      {opt.nextQuestion ? (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">Linked</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-xs">No link</span>
                      )}
                    </div>
                    {opt.nextQuestion && (
                      <div className="ml-3 text-xs text-gray-600">→ {opt.nextQuestion.questionText || opt.nextQuestion}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
