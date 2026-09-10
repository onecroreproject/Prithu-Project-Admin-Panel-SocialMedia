import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Edit2, Trash2, Check, X, Sparkles, Filter, Layers, Folder,
  Hash, Calendar, AlertCircle
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../Utils/axiosApi";

export default function AICategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/admin/aicategories");
      if (data && data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error("Failed to fetch AI categories.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all prompts to calculate associations
  const fetchPrompts = async () => {
    try {
      const { data } = await api.get("/api/admin/prompts");
      if (data && data.success && Array.isArray(data.data)) {
        setPrompts(data.data);
      }
    } catch (err) {
      console.error("Error fetching prompts:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchPrompts();
  }, []);

  // Create Category Handler
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return toast.error("Category name cannot be empty");

    setActionLoading(true);
    try {
      const { data } = await api.post("/api/admin/aicategories", { name: newCategoryName.trim() });
      if (data && data.success) {
        toast.success("Category added successfully! ✨");
        setNewCategoryName("");
        fetchCategories();
      }
    } catch (err) {
      console.error("Error creating category:", err);
      toast.error(err.response?.data?.message || "Failed to create category.");
    } finally {
      setActionLoading(false);
    }
  };

  // Update Category Handler
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editCategoryName.trim()) return toast.error("Category name cannot be empty");
    if (!editingCategory) return;

    setActionLoading(true);
    try {
      const { data } = await api.put(`/api/admin/aicategories/${editingCategory._id}`, { name: editCategoryName.trim() });
      if (data && data.success) {
        toast.success("Category renamed successfully! ✏️");
        setEditingCategory(null);
        setEditCategoryName("");
        fetchCategories();
        fetchPrompts(); // Refresh associations since prompts' categories might be updated
      }
    } catch (err) {
      console.error("Error updating category:", err);
      toast.error(err.response?.data?.message || "Failed to update category.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Category Handler
  const handleDeleteCategory = async (id, name) => {
    const associatedCount = prompts.filter(p => p.category?.toLowerCase() === name.toLowerCase()).length;
    
    if (associatedCount > 0) {
      return toast.error(`Cannot delete! ${associatedCount} prompt(s) are currently associated with this category.`);
    }

    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      setActionLoading(true);
      try {
        const { data } = await api.delete(`/api/admin/aicategories/${id}`);
        if (data && data.success) {
          toast.success("Category deleted successfully! 🗑️");
          fetchCategories();
        }
      } catch (err) {
        console.error("Error deleting category:", err);
        toast.error(err.response?.data?.message || "Failed to delete category.");
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Filtered Categories List
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics calculation
  const totalCategories = categories.length;
  const categoriesWithPrompts = new Set(prompts.map(p => p.category?.toLowerCase())).size;
  const totalPrompts = prompts.length;

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4 pb-12">
      <Toaster position="top-right" />

      {/* Header Panel */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Categories Management (aiCategories)
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create, view, update, and manage categories for consumer CreativeAI Photo Prompts.
          </p>
        </div>

      </header>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 block uppercase tracking-wider">
              Total Categories
            </span>
            <span className="text-2xl font-extrabold text-gray-800 dark:text-white leading-tight">
              {totalCategories}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 block uppercase tracking-wider">
              Active Categories
            </span>
            <span className="text-2xl font-extrabold text-gray-800 dark:text-white leading-tight">
              {categoriesWithPrompts}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 block uppercase tracking-wider">
              Linked Prompts
            </span>
            <span className="text-2xl font-extrabold text-gray-800 dark:text-white leading-tight">
              {totalPrompts}
            </span>
          </div>
        </div>
      </div>

      {/* Action / Search Bar */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-transparent dark:text-white"
          />
        </div>

        {/* Quick Add Form */}
        <form onSubmit={handleCreateCategory} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            required
            placeholder="New Category Name..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-full md:w-56 px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-transparent dark:text-white"
          />
          <button
            type="submit"
            disabled={actionLoading}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 shrink-0 shadow-md shadow-blue-600/10"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </form>
      </div>

      {/* Categories Grid Container */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[250px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-400 dark:text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          No AI categories found matching "{searchQuery}".
        </div>
      ) : (
        <div className="overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
                  <th className="p-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Category Name</th>
                  <th className="p-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Prompt Associations</th>
                  <th className="p-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Date Created</th>
                  <th className="p-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => {
                  const promptCount = prompts.filter(p => p.category?.toLowerCase() === cat.name.toLowerCase()).length;
                  
                  return (
                    <tr 
                      key={cat._id}
                      className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors"
                    >
                      <td className="p-4 font-bold text-gray-800 dark:text-white">
                        {cat.name}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          promptCount > 0 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950/30'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700/50'
                        }`}>
                          {promptCount} {promptCount === 1 ? 'Prompt' : 'Prompts'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(cat.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setEditCategoryName(cat.name);
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                            title="Rename Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteCategory(cat._id, cat.name)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Edit2 className="w-4 h-4 text-blue-600" />
                  Rename Category
                </h3>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
