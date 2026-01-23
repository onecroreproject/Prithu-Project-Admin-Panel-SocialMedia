import React, { useState } from "react";
import api from "../../../Utils/axiosApi";
import { ImagePlus, Loader2 } from "lucide-react";

const FrameUploadForm = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return alert("Please select frames");

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("frame", file));

    try {
      setUploading(true);
      const { data } = await api.post("/upload/frame", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        alert("Frames uploaded successfully!");
        setSelectedFiles([]);
        setPreviews([]);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-lg bg-gray-50">
        <label className="flex flex-col items-center cursor-pointer">
          <ImagePlus className="h-10 w-10 text-gray-500 mb-2" />
          <span className="text-gray-600">Select PNG Frames</span>
          <input
            type="file"
            accept="image/png"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {previews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {previews.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`frame-${i}`}
                className="w-32 h-32 object-contain border rounded-lg shadow"
              />
            ))}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" /> Uploading...
            </>
          ) : (
            "Upload Frames"
          )}
        </button>
      </div>
    </div>
  );
};

export default FrameUploadForm;
