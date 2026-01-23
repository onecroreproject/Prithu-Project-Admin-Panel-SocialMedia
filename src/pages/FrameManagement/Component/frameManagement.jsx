import React, { useEffect, useState } from "react";
import api from "../../../Utils/axiosApi";
import { Trash2 } from "lucide-react";

const FrameManagementTable = () => {
  const [frames, setFrames] = useState([]);

  const fetchFrames = async () => {
    try {
      const { data } = await api.get("/get/allframe");
      if (data.success) setFrames(data.frames);
    } catch (err) {
      console.error("Error fetching frames:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this frame?")) return;

    try {
      await api.delete(`/delete/frame/${id}`);
      setFrames(frames.filter((f) => f._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete frame");
    }
  };

  useEffect(() => {
    fetchFrames();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">All Uploaded Frames</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left text-gray-700">#</th>
              <th className="py-2 px-4 border-b text-left text-gray-700">Content</th>
              <th className="py-2 px-4 border-b text-left text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {frames.length > 0 ? (
              frames.map((frame, index) => (
                <tr key={frame._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{index + 1}</td>
                  <td className="py-2 px-4 border-b flex items-center gap-4">
                    <img
                      src={frame.url}
                      alt={frame.name}
                      className="w-16 h-16 object-contain rounded border"
                    />
                    <span className="text-gray-700">{frame.name}</span>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleDelete(frame._id)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  No frames uploaded yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FrameManagementTable;
