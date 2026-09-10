import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast"; // ✅ added
import { fetchCategories, uploadFeed } from "../../Services/FeedServices/feedServices";

export default function FeedUploadForm() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [categoryIds, setCategoryIds] = useState([]);
  const [selectedCategoryNames, setSelectedCategoryNames] = useState([]);
  const [language, setLanguage] = useState("en");
  const [fileType, setFileType] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const categoryRef = useRef(null);

  // Fetch categories
  const { data: categoriesData = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const categories = categoriesData || [];



  // Upload mutation
  const { mutate, isLoading: uploading } = useMutation({
    mutationFn: uploadFeed,
    onSuccess: () => {
      toast.success("Feed uploaded successfully!");
      setFiles([]);
      setSelectedFiles([]);
      setCategoryIds([]);
      setSelectedCategoryNames([]);
      setLanguage("en");
      setFileType("");
    },
    onError: (err) => {
      toast.error(err.message || "Upload failed");
    },
  });

  // Close category dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent duplicate files
  const handleFileChange = (e) => {
    const chosenFiles = Array.from(e.target.files);

    const uniqueNewFiles = chosenFiles.filter(
      (newFile) =>
        !files.some(
          (existingFile) =>
            existingFile.name === newFile.name && existingFile.size === newFile.size
        )
    );

    const updatedFiles = [...files, ...uniqueNewFiles];
    setFiles(updatedFiles);
    setSelectedFiles(updatedFiles.map((file) => file.name)); // auto-select all
  };

  const toggleSelectFile = (fileName) => {
    setSelectedFiles((prev) =>
      prev.includes(fileName)
        ? prev.filter((f) => f !== fileName)
        : [...prev, fileName]
    );
  };

  // Handle upload
  const handleUpload = () => {
    if (categoryIds.length === 0) return toast.error("Please select at least one category");
    if (!fileType) return toast.error("Please select a file type (image or video)");

    const formData = new FormData();
    formData.append("language", language);
    // Send as array
    categoryIds.forEach(id => formData.append("categoryIds[]", id));
    // also send as single for compatibility if needed by some older logic, 
    // but the backend we just changed expects categoryIds or categoryId
    formData.append("categoryId", categoryIds[0]);
    formData.append("type", fileType);

    const uniqueFiles = files.filter(
      (f, idx, arr) => arr.findIndex(x => x.name === f.name && x.size === f.size) === idx
    );

    uniqueFiles
      .filter((f) => selectedFiles.includes(f.name))
      .forEach((file) => formData.append("file", file));

    console.log("Uploading files:", uniqueFiles.map(f => f.name));

    mutate(formData);
  };

  const toggleCategory = (cat) => {
    const isSelected = categoryIds.includes(cat.categoryId);
    if (isSelected) {
      setCategoryIds(categoryIds.filter(id => id !== cat.categoryId));
      setSelectedCategoryNames(selectedCategoryNames.filter(name => name !== cat.categoriesName));
    } else {
      setCategoryIds([...categoryIds, cat.categoryId]);
      setSelectedCategoryNames([...selectedCategoryNames, cat.categoriesName]);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.categoriesName.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div>
      {/* Toast container */}
      <Toaster position="top-right" reverseOrder={false} />

      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Upload Feed
      </h2>

      {/* Language */}
      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Language
      </label>
      <select
        className="w-full rounded-md border border-gray-300 px-3 py-2 mb-4 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="hi">Hindi</option>
        <option value="ta">Tamil</option>
        <option value="te">Telugu</option>
      </select>

      {/* File Type */}
      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        File Type
      </label>
      <select
        className="w-full rounded-md border border-gray-300 px-3 py-2 mb-4 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        value={fileType}
        onChange={(e) => setFileType(e.target.value)}
      >
        <option value="">Select file type</option>
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>

      {/* Category selection */}
      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Category
      </label>
      <div className="relative w-full" ref={categoryRef}>
        <div
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className="w-full cursor-pointer rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white flex justify-between items-center"
        >
          <span className="truncate">
            {selectedCategoryNames.length > 0
              ? selectedCategoryNames.join(", ")
              : "Select categories"}
          </span>
          <span className={`transition-transform ${isCategoryOpen ? "rotate-180" : ""}`}>
            &#9662;
          </span>
        </div>

        {isCategoryOpen && (
          <div className="absolute z-50 w-full mt-1 max-h-40 overflow-y-auto rounded-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900 shadow-lg">
            <input
              type="text"
              placeholder="Search..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-full px-3 py-2 border-b border-gray-300 dark:border-gray-700 focus:outline-none dark:bg-gray-900 dark:text-white"
            />

            {filteredCategories.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                No results found
              </div>
            ) : (
              filteredCategories.map((cat, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 flex items-center gap-2 ${categoryIds.includes(cat.categoryId) ? "bg-blue-50 dark:bg-blue-900/40" : ""
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={categoryIds.includes(cat.categoryId)}
                    readOnly
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="dark:text-white">{cat.categoriesName}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* File input & preview */}
      <div className="mt-4">
        <input
          type="file"
          multiple
          accept={
            fileType === "image"
              ? "image/*"
              : fileType === "video"
                ? "video/*"
                : ""
          }
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-md file:border file:border-gray-200 file:bg-gray-50 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-gray-100 dark:file:border-gray-700 dark:file:bg-gray-800 dark:file:text-gray-300"
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {files.map((file, index) => {
            const isImage = file.type.startsWith("image/");
            const isSelected = selectedFiles.includes(file.name);

            return (
              <div
                key={`${file.name}-${index}`}
                className={`relative border rounded-md p-2 ${isSelected ? "border-blue-500" : "border-gray-200"
                  }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelectFile(file.name)}
                  className="absolute top-2 right-2"
                />
                {isImage ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-24 w-full object-cover rounded"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(file)}
                    className="h-24 w-full object-cover rounded"
                    controls
                  />
                )}
                <span className="absolute bottom-1 left-1 px-1 text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded">
                  {isImage ? "Image" : "Video"}
                </span>
                <p className="mt-1 text-xs truncate text-gray-600 dark:text-gray-400">
                  {file.name}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="mt-6 w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload Feed"}
      </button>
    </div>
  );
}
