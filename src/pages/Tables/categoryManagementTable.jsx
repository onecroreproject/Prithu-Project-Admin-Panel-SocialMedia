import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Trash, Check, ChevronUp, ChevronDown, Download } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { fetchCategories, deleteCategory, updateCategory } from "../../Services/FeedServices/feedServices";

export default function CategoryManagement() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingSubcategories, setEditingSubcategories] = useState("");
  const [viewingSubcatId, setViewingSubcatId] = useState(null);

  // Sort state
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  // ✅ Fetch categories
  const { data: categories = [], isLoading, isError, error } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // ✅ Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => toast.error(err.message || "Delete failed"),
  });

  // ✅ Update mutation
  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      toast.success("Category updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingId(null);
      setEditingName("");
      setEditingSubcategories("");
    },
    onError: (err) => toast.error(err.message || "Update failed"),
  });

  const handleDelete = (categoryId) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(categoryId);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.categoryId);
    setEditingName(cat.categoriesName);
    setEditingSubcategories(cat.subcategories ? cat.subcategories.join(", ") : "");
  };

  const handleUpdate = (categoryId) => {
    if (editingName.trim() === "") return toast.error("Category name cannot be empty");
    updateMutation.mutate({ 
      id: categoryId, 
      name: editingName.trim(), 
      subcategories: editingSubcategories 
    });
  };

  const handleDeleteSubcategory = (cat, subToRemove) => {
    if (confirm(`Are you sure you want to remove "${subToRemove}" from ${cat.categoriesName}?`)) {
      const updatedSubs = cat.subcategories.filter(s => s !== subToRemove);
      updateMutation.mutate({
        id: cat.categoryId,
        name: cat.categoriesName,
        subcategories: updatedSubs.join(", ")
      });
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // Toggle direction
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Sort categories based on sortConfig
  const sortedCategories = [...categories].sort((a, b) => {
    if (!sortConfig.key) return 0; // no sorting
    const valueA = a[sortConfig.key] || 0;
    const valueB = b[sortConfig.key] || 0;
    if (sortConfig.direction === "asc") return valueA - valueB;
    return valueB - valueA;
  });

  const handleExportCSV = () => {
    if (categories.length === 0) return toast.error("No data to export");
    const headers = ["ID", "Category Name", "Video Count", "Audio Count", "Image Count", "Total Content"];
    const csvContent = [
      headers.join(","),
      ...sortedCategories.map((cat, idx) => 
        [idx + 1, `"${cat.categoriesName || ''}"`, cat.videoCount || 0, cat.audioCount || 0, cat.imageCount || 0, cat.totalFeeds || 0].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "category_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <p>Loading categories...</p>;
  if (isError) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold dark:text-white/90">Category Management</h2>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      {categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-2">#</th>
              <th className="p-2">Name</th>
              <th className="p-2">Subcategories</th>

              {/* Sortable columns */}
              {["videoCount", "audioCount", "imageCount", "totalFeeds"].map((key) => (
                <th
                  key={key}
                  className="p-2 cursor-pointer select-none"
                  onClick={() => handleSort(key)}
                >
                  {key === "videoCount" && "Video Content"}
                  {key === "audioCount" && "Audio Content"}
                  {key === "imageCount" && "Image Content"}
                  {key === "totalFeeds" && "Total Content"}

                  {/* Sort icon */}
                  {sortConfig.key === key ? (
                    sortConfig.direction === "asc" ? (
                      <ChevronUp className="inline w-4 h-4 ml-1" />
                    ) : (
                      <ChevronDown className="inline w-4 h-4 ml-1" />
                    )
                  ) : (
                    <ChevronUp className="inline w-4 h-4 ml-1 opacity-40" />
                  )}
                </th>
              ))}

              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedCategories.map((cat, idx) => (
              <tr key={cat.categoryId} className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-2">{idx + 1}</td>

                {/* Editable Name */}
                <td className="p-2">
                  {editingId === cat.categoryId ? (
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700"
                    />
                  ) : (
                    <span className="font-medium text-gray-900 dark:text-gray-100">{cat.categoriesName}</span>
                  )}
                </td>

                {/* Editable Subcategories */}
                <td className="p-2">
                  {editingId === cat.categoryId ? (
                    <input
                      value={editingSubcategories}
                      onChange={(e) => setEditingSubcategories(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700"
                      placeholder="e.g. Sub1, Sub2"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      {cat.subcategories && cat.subcategories.length > 0 ? (
                        <>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.subcategories.length} Subcategories</span>
                          <button 
                            className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                            onClick={() => setViewingSubcatId(cat.categoryId)}
                            title="View Subcategories"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs italic">None</span>
                      )}
                    </div>
                  )}
                </td>

                <td className="p-2  text-center">{cat.videoCount}</td>
                <td className="p-2 text-center">{cat.audioCount || 0}</td>
                <td className="p-2 text-center">{cat.imageCount}</td>
                <td className="p-2 text-center">{cat.totalFeeds}</td>

                {/* Actions */}
                <td className="p-2 flex gap-2">
                  {editingId === cat.categoryId ? (
                    <button
                      className="btn-action text-green-600 hover:text-green-800"
                      title="Update"
                      onClick={() => handleUpdate(cat.categoryId)}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      className="btn-action"
                      title="Modify"
                      onClick={() => startEdit(cat)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    className="btn-action text-red-500 hover:text-red-700"
                    title="Delete"
                    onClick={() => handleDelete(cat.categoryId)}
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Subcategory View Modal */}
      {viewingSubcatId && (() => {
        const cat = categories.find(c => c.categoryId === viewingSubcatId);
        if (!cat) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Subcategories for {cat.categoriesName}</h3>
                <button 
                  onClick={() => setViewingSubcatId(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Close
                </button>
              </div>
              <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                {cat.subcategories.map(sub => (
                  <div key={sub} className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{sub}</span>
                    <button 
                      onClick={() => handleDeleteSubcategory(cat, sub)} 
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded transition-colors"
                      title={`Delete ${sub}`}
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  );
}
