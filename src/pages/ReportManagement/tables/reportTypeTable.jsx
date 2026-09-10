// components/Reports/Tables/ReportTypeTable.jsx
import { useEffect, useState } from "react";
import axios from "../../../Utils/axiosApi";
import { motion } from "framer-motion";
import { Trash2, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";

export default function ReportTypeTable() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/get/ReportTypes");
      setTypes(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load types");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id, current) => {
    try {
      // assumed endpoint: PATCH /report/toggleReportType
      await axios.patch(`/api/admin/toggleReportType`, { typeId: id, isActive: !current });
      toast.success("Updated");
      fetchTypes();
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  const deleteType = async (id) => {
    if (!confirm("Delete this type? This will not remove associated questions.")) return;
    try {
      // assumed endpoint: DELETE /report/deleteReportType?typeId=...
      await axios.delete(`/admin/deleteReportType?typeId=${id}`);
      toast.success("Deleted");
      fetchTypes();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <motion.div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Report Types</h3>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-3">
          {types.length === 0 && <p className="text-sm text-gray-500">No types found</p>}
          {types.map((t) => (
            <div key={t._id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium text-gray-800 dark:text-white">{t.name}</div>
                <div className="text-sm text-gray-500">{t.description}</div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleActive(t._id, t.isActive)}
                  className="flex items-center gap-2 px-3 py-2 border rounded"
                >
                  <ToggleRight className="h-4 w-4" />
                  <span className="text-sm">{t.isActive ? "Active" : "Disabled"}</span>
                </button>

                <button onClick={() => deleteType(t._id)} className="px-3 py-2 border rounded text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
