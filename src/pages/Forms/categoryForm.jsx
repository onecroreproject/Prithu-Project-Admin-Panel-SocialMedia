import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCategory } from "../../Services/FeedServices/feedServices";
import { Layers, Plus, X, Tag, Sparkles } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function CategoryUploadForm() {
  const [name, setName] = useState("");
  const [subcatInput, setSubcatInput] = useState("");
  const [subcatTags, setSubcatTags] = useState([]);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: addCategory,
    onSuccess: () => {
      toast.success("Category saved successfully!");
      setName("");
      setSubcatInput("");
      setSubcatTags([]);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => toast.error(err.message || "Failed to save category"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter a category name");
    const allSubs = [...subcatTags];
    if (subcatInput.trim()) allSubs.push(...subcatInput.split(",").map((s) => s.trim()).filter(Boolean));
    mutate({ name: name.trim(), subcategories: allSubs.join(", ") });
  };

  const addTag = () => {
    const parts = subcatInput.split(",").map((s) => s.trim()).filter(Boolean);
    const newTags = parts.filter((p) => !subcatTags.includes(p));
    if (newTags.length) {
      setSubcatTags((prev) => [...prev, ...newTags]);
      setSubcatInput("");
    }
  };

  const removeTag = (tag) => setSubcatTags((prev) => prev.filter((t) => t !== tag));

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Content Structure
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Add Category</h2>
            <p className="text-blue-200 text-sm mt-1">
              Create a new category with optional subcategories for content organization.
            </p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
            <Layers className="w-8 h-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. God, Special Days, News..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Subcategories */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Subcategories
          </label>

          {/* Tag chips */}
          {subcatTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {subcatTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs font-semibold border border-blue-200 dark:border-blue-800/60"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 text-blue-500 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={subcatInput}
              onChange={(e) => setSubcatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              placeholder="e.g. Murugan, Vishnu — comma separated, press Enter to add"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Type one or more subcategories separated by commas, then press Enter or click +.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {isPending ? "Saving..." : "Save Category"}
        </button>
      </form>
    </div>
  );
}
