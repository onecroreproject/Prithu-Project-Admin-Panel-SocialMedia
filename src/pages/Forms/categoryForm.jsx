import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCategory } from "../../Services/FeedServices/feedServices";

export default function CategoryUploadForm() {
  const [name, setName] = useState("");
  const [subcategories, setSubcategories] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: addCategory,
    onSuccess: () => {
      alert("Category saved successfully!");
      setName("");
      setSubcategories("");
      queryClient.invalidateQueries({ queryKey: ["categories"] }); 
    },
    onError: (err) => {
      alert(err.message || "Failed to save category");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter a category name");
    mutate({ name, subcategories });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Add Category & Subcategories
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Fashion"
            className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subcategories (Comma separated)
          </label>
          <textarea
            value={subcategories}
            onChange={(e) => setSubcategories(e.target.value)}
            placeholder="e.g. Men, Women, Kids"
            className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-md bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Saving..." : "Save Category"}
        </button>
      </form>
    </div>
  );
}
