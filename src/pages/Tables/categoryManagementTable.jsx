import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye, Pencil, Trash, Check, ChevronUp, ChevronDown,
  Download, X, Folder, Tag, Plus, Search, Sparkles, Layers,
  Video, Music, Image as ImageIcon, ChevronLeft, ChevronRight, ArrowUpDown,
  ListOrdered, ArrowUp, ArrowDown
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  fetchCategories,
  deleteCategory,
  updateCategory,
  addCategory,
  reorderCategories,
  assignCategoryOrder,
} from "../../Services/FeedServices/feedServices";

export default function CategoryManagement() {
  const queryClient = useQueryClient();

  // ── Modal states ─────────────────────────────────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addOrder, setAddOrder] = useState("");
  const [addSubsInput, setAddSubsInput] = useState("");
  const [addSubsTags, setAddSubsTags] = useState([]);

  const [editModal, setEditModal] = useState(null);
  const [editName, setEditName] = useState("");
  const [editOrder, setEditOrder] = useState(0);
  const [editSubsInput, setEditSubsInput] = useState("");
  const [editSubsTags, setEditSubsTags] = useState([]);

  const [viewingCat, setViewingCat] = useState(null);

  // ── Reorder Modal State ──────────────────────────────────────────────────────
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [reorderList, setReorderList] = useState([]);

  // ── Inline Order Editing State ───────────────────────────────────────────────
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [tempOrderVal, setTempOrderVal] = useState("");

  // ── Search, Sort & Pagination ───────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("order-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);

  // ── Queries & Mutations ──────────────────────────────────────────────────────
  const { data: categories = [], isLoading, isError, error } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const addMutation = useMutation({
    mutationFn: addCategory,
    onSuccess: () => {
      toast.success("Category added successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeAddModal();
    },
    onError: (err) => toast.error(err.message || "Failed to add category"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => toast.error(err.message || "Delete failed"),
  });

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      toast.success("Category updated!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditModal(null);
    },
    onError: (err) => toast.error(err.message || "Update failed"),
  });

  const assignOrderMutation = useMutation({
    mutationFn: assignCategoryOrder,
    onSuccess: (data) => {
      toast.success(data?.message || "Order updated!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingOrderId(null);
    },
    onError: (err) => toast.error(err.message || "Failed to assign order"),
  });

  const reorderMutation = useMutation({
    mutationFn: reorderCategories,
    onSuccess: () => {
      toast.success("All categories reordered successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsReorderModalOpen(false);
    },
    onError: (err) => toast.error(err.message || "Failed to reorder categories"),
  });

  // ── Add Modal helpers ────────────────────────────────────────────────────────
  const openAddModal = () => {
    setAddName("");
    setAddOrder("");
    setAddSubsInput("");
    setAddSubsTags([]);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setAddName("");
    setAddOrder("");
    setAddSubsInput("");
    setAddSubsTags([]);
  };

  const addAddTag = () => {
    const parts = addSubsInput.split(",").map((s) => s.trim()).filter(Boolean);
    const newTags = parts.filter((p) => !addSubsTags.includes(p));
    if (newTags.length) { setAddSubsTags((prev) => [...prev, ...newTags]); setAddSubsInput(""); }
  };

  const handleSaveAdd = () => {
    if (!addName.trim()) return toast.error("Category name is required");
    const allSubs = [...addSubsTags];
    if (addSubsInput.trim()) allSubs.push(...addSubsInput.split(",").map((s) => s.trim()).filter(Boolean));
    addMutation.mutate({ 
      name: addName.trim(), 
      subcategories: allSubs.join(", "),
      order: addOrder !== "" ? Number(addOrder) : 0
    });
  };

  // ── Edit Modal helpers ───────────────────────────────────────────────────────
  const openEditModal = (cat) => {
    setEditModal(cat);
    setEditName(cat.categoriesName || "");
    setEditOrder(cat.order !== undefined && cat.order !== null ? cat.order : 0);
    const subs = cat.subcategories || [];
    setEditSubsTags(Array.isArray(subs) ? subs : subs.split(",").map((s) => s.trim()).filter(Boolean));
    setEditSubsInput("");
  };

  const addEditTag = () => {
    const parts = editSubsInput.split(",").map((s) => s.trim()).filter(Boolean);
    const newTags = parts.filter((p) => !editSubsTags.includes(p));
    if (newTags.length) { setEditSubsTags((prev) => [...prev, ...newTags]); setEditSubsInput(""); }
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return toast.error("Category name cannot be empty");
    const allSubs = [...editSubsTags];
    if (editSubsInput.trim()) allSubs.push(...editSubsInput.split(",").map((s) => s.trim()).filter(Boolean));
    updateMutation.mutate({ 
      id: editModal.categoryId, 
      name: editName.trim(), 
      subcategories: allSubs.join(", "),
      order: Number(editOrder) || 0
    });
  };

  // ── Reorder Modal helpers ────────────────────────────────────────────────────
  const openReorderModal = () => {
    // Sort copy by existing order
    const sorted = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    setReorderList(sorted);
    setIsReorderModalOpen(true);
  };

  const moveReorderItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= reorderList.length) return;
    const newList = [...reorderList];
    const [movedItem] = newList.splice(index, 1);
    newList.splice(targetIndex, 0, movedItem);
    setReorderList(newList);
  };

  const moveReorderToTop = (index) => {
    if (index === 0) return;
    const newList = [...reorderList];
    const [movedItem] = newList.splice(index, 1);
    newList.unshift(movedItem);
    setReorderList(newList);
  };

  const handleSaveReorderModal = () => {
    const payload = reorderList.map((cat, idx) => ({
      id: cat.categoryId || cat._id,
      order: idx + 1,
    }));
    reorderMutation.mutate(payload);
  };

  // ── Quick Move Up / Down on Card ─────────────────────────────────────────────
  const handleQuickShift = (cat, direction) => {
    const currentOrder = cat.order !== undefined && cat.order !== null ? cat.order : 0;
    const newOrder = Math.max(0, currentOrder + direction);
    assignOrderMutation.mutate({ id: cat.categoryId || cat._id, order: newOrder });
  };

  const handleSaveInlineOrder = (catId) => {
    const newOrder = Number(tempOrderVal);
    if (isNaN(newOrder)) {
      toast.error("Please enter a valid numeric order");
      return;
    }
    assignOrderMutation.mutate({ id: catId, order: newOrder });
  };

  // ── Other helpers ────────────────────────────────────────────────────────────
  const handleDelete = (cat) => {
    if (confirm(`Delete category "${cat.categoriesName}"?`)) deleteMutation.mutate(cat.categoryId);
  };

  const handleDeleteSubcategory = (cat, sub) => {
    if (confirm(`Remove "${sub}" from ${cat.categoriesName}?`)) {
      const updatedSubs = (cat.subcategories || []).filter((s) => s !== sub);
      updateMutation.mutate({ 
        id: cat.categoryId, 
        name: cat.categoriesName, 
        subcategories: updatedSubs.join(", "),
        order: cat.order || 0
      });
      setViewingCat((prev) => prev ? { ...prev, subcategories: updatedSubs } : null);
    }
  };

  const handleExportCSV = () => {
    if (!categories.length) return toast.error("No data to export");
    const headers = ["Order", "Category Name", "Subcategories", "Videos", "Audio", "Images", "Total"];
    const rows = categories.map((cat) => [
      cat.order || 0,
      `"${cat.categoriesName || ""}"`,
      `"${(cat.subcategories || []).join("; ")}"`,
      cat.videoCount || 0, cat.audioCount || 0, cat.imageCount || 0, cat.totalFeeds || 0,
    ].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.setAttribute("download", "categories.csv");
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  // ── Derived data ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...categories];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.categoriesName?.toLowerCase().includes(q) ||
          (c.subcategories || []).some((s) => s.toLowerCase().includes(q))
      );
    }
    if (sortBy === "order-asc") {
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
    } else if (sortBy === "order-desc") {
      list.sort((a, b) => (b.order || 0) - (a.order || 0));
    } else if (sortBy === "name-asc") {
      list.sort((a, b) => (a.categoriesName || "").localeCompare(b.categoriesName || ""));
    } else if (sortBy === "name-desc") {
      list.sort((a, b) => (b.categoriesName || "").localeCompare(a.categoriesName || ""));
    } else if (sortBy === "feeds-desc") {
      list.sort((a, b) => (b.totalFeeds || 0) - (a.totalFeeds || 0));
    } else if (sortBy === "subs-desc") {
      list.sort((a, b) => (b.subcategories?.length || 0) - (a.subcategories?.length || 0));
    }
    return list;
  }, [categories, searchQuery, sortBy]);

  const totalPages = itemsPerPage === "all" ? 1 : Math.ceil(filtered.length / itemsPerPage) || 1;

  const paginatedCategories = useMemo(() => {
    if (itemsPerPage === "all") return filtered;
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const TagChips = ({ tags, onRemove }) => (
    tags.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mb-2 max-h-48 overflow-y-auto p-2 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/60 dark:bg-gray-800/40 [scrollbar-width:thin]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200/70 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Tag className="w-3 h-3 text-blue-500 shrink-0" />
            <span className="max-w-[200px] truncate" title={tag}>{tag}</span>
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="ml-0.5 text-blue-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    )
  );

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* ── Header Banner ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Content Taxonomy & Display Order
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Category Management
            </h1>
            <p className="text-blue-200 text-xs sm:text-sm mt-1 max-w-xl">
              Organize, assign display orders, and manage subcategories for all mobile app feeds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={openReorderModal}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-400/40 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <ListOrdered className="w-4 h-4" />
              Reorder All Categories
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* ── Toolbar: Search, Sort & Counter ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/70 dark:bg-gray-800/40 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
        {/* Search */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search category or subcategory..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort & Pagination Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
            >
              <option value="order-asc">Sort: Display Order (1 → N)</option>
              <option value="order-desc">Sort: Display Order (N → 1)</option>
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="feeds-desc">Most Feeds</option>
              <option value="subs-desc">Most Subcategories</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <span className="text-xs text-gray-400">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(e.target.value === "all" ? "all" : Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
            >
              <option value={8}>8 per page</option>
              <option value={16}>16 per page</option>
              <option value={24}>24 per page</option>
              <option value={32}>32 per page</option>
              <option value={48}>48 per page</option>
              <option value="all">All ({filtered.length})</option>
            </select>
          </div>

          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
            {filtered.length} total
          </span>
        </div>
      </div>

      {/* ── Cards Grid ───────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
          <Folder className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-base">No categories found</p>
          <p className="text-sm mt-1 mb-4">Try a different search or add a new category.</p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {paginatedCategories.map((cat, idx) => {
              const globalIdx = itemsPerPage === "all" ? idx + 1 : (currentPage - 1) * itemsPerPage + idx + 1;
              const catOrder = cat.order !== undefined && cat.order !== null ? cat.order : 0;
              const isInlineEditing = editingOrderId === cat.categoryId;

              return (
                <div
                  key={cat.categoryId}
                  className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600/60 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:-translate-y-0.5"
                >
                  <div className="space-y-3">
                    {/* Header: Icon + Name + Feeds Badge */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/60 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
                          <Folder className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h3
                            className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base leading-snug truncate"
                            title={cat.categoriesName}
                          >
                            {cat.categoriesName}
                          </h3>
                          <span className="text-[11px] font-medium text-gray-400">
                            #{globalIdx}
                          </span>
                        </div>
                      </div>

                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/60">
                        {cat.totalFeeds || 0} feeds
                      </span>
                    </div>

                    {/* Order Assignment Bar */}
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-200">
                        <ListOrdered className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>Order Position:</span>
                      </div>

                      {isInlineEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            autoFocus
                            value={tempOrderVal}
                            onChange={(e) => setTempOrderVal(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveInlineOrder(cat.categoryId);
                              if (e.key === "Escape") setEditingOrderId(null);
                            }}
                            className="w-14 px-1.5 py-0.5 text-xs text-center font-bold bg-white dark:bg-gray-800 border border-indigo-400 rounded-md outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveInlineOrder(cat.categoryId)}
                            className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                            title="Save"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingOrderId(null)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingOrderId(cat.categoryId);
                              setTempOrderVal(String(catOrder));
                            }}
                            className="px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 font-extrabold border border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 transition-all cursor-pointer shadow-2xs"
                            title="Click to change order"
                          >
                            #{catOrder}
                          </button>
                          <button
                            type="button"
                            disabled={assignOrderMutation.isPending}
                            onClick={() => handleQuickShift(cat, -1)}
                            className="p-1 rounded bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 text-indigo-600 hover:bg-indigo-100 disabled:opacity-40 transition-colors cursor-pointer"
                            title="Move Up (Decrease Order Number)"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={assignOrderMutation.isPending}
                            onClick={() => handleQuickShift(cat, 1)}
                            className="p-1 rounded bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 text-indigo-600 hover:bg-indigo-100 disabled:opacity-40 transition-colors cursor-pointer"
                            title="Move Down (Increase Order Number)"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Subcategories preview */}
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gray-50/90 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0 font-medium text-gray-600 dark:text-gray-300">
                        <Tag className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">
                          {cat.subcategories?.length ? `${cat.subcategories.length} subcategories` : "No subcategories"}
                        </span>
                      </div>
                      {cat.subcategories?.length > 0 && (
                        <button
                          onClick={() => setViewingCat(cat)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-900/40 text-gray-700 dark:text-gray-200 text-[11px] font-semibold transition-all cursor-pointer shrink-0 shadow-2xs"
                        >
                          <Eye className="w-3 h-3 text-blue-500" /> View
                        </button>
                      )}
                    </div>

                    {/* Media counts segmented pill (Videos & Images) */}
                    <div className="grid grid-cols-2 gap-1 py-1.5 px-3 rounded-xl bg-gray-50/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-center text-xs">
                      <div className="flex flex-col items-center">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <Video className="w-3 h-3 text-red-500" /> Videos
                        </span>
                        <span className="font-bold text-gray-800 dark:text-gray-200 text-xs mt-0.5">
                          {cat.videoCount || 0}
                        </span>
                      </div>
                      <div className="flex flex-col items-center border-l border-gray-200/80 dark:border-gray-700">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <ImageIcon className="w-3 h-3 text-emerald-500" /> Images
                        </span>
                        <span className="font-bold text-gray-800 dark:text-gray-200 text-xs mt-0.5">
                          {cat.imageCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-2.5 mt-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-gray-50 hover:bg-blue-50 dark:bg-gray-800 dark:hover:bg-blue-900/30 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 text-xs font-semibold transition-all cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                    >
                      <Pencil className="w-3.5 h-3.5 text-blue-500" /> Edit & Order
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="inline-flex items-center justify-center p-2 rounded-xl bg-gray-50 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-all cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-800"
                      title="Delete"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Pagination ──────────────────────────────────────────────────────── */}
          {itemsPerPage !== "all" && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Showing <span className="font-bold text-gray-900 dark:text-gray-100">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
                <span className="font-bold text-gray-900 dark:text-gray-100">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of{" "}
                <span className="font-bold text-gray-900 dark:text-gray-100">{filtered.length}</span> categories
              </span>

              <div className="flex items-center gap-1.5 self-center sm:self-auto">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, i, arr) => (
                    <span key={p} className="flex items-center">
                      {i > 0 && arr[i - 1] !== p - 1 && (
                        <span className="px-1 text-xs text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentPage === p
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: REORDER ALL CATEGORIES                                         */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isReorderModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] p-5 sm:p-6 shadow-2xl relative flex flex-col">
            <button
              onClick={() => setIsReorderModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal header */}
            <div className="flex items-center gap-3 mb-4 shrink-0 pr-8">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl shrink-0">
                <ListOrdered className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">
                  Reorder Categories
                </h3>
                <p className="text-xs text-gray-500">
                  Arrange categories in the exact order you want them displayed on the mobile app.
                </p>
              </div>
            </div>

            {/* Scrollable list */}
            <div className="overflow-y-auto flex-1 min-h-0 space-y-2 pr-1 [scrollbar-width:thin]">
              {reorderList.map((cat, index) => (
                <div
                  key={cat.categoryId || cat._id || index}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                        {cat.categoriesName || cat.name}
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        {cat.totalFeeds || 0} feeds • {cat.subcategories?.length || 0} subcategories
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveReorderToTop(index)}
                      disabled={index === 0}
                      className="px-2 py-1 text-[11px] font-bold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-30 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      title="Move to very top"
                    >
                      Top
                    </button>
                    <button
                      type="button"
                      onClick={() => moveReorderItem(index, -1)}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-30 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveReorderItem(index, 1)}
                      disabled={index === reorderList.length - 1}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-30 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 pt-4 mt-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
              <button
                onClick={() => setIsReorderModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReorderModal}
                disabled={reorderMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                {reorderMutation.isPending ? "Saving..." : "Save New Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: ADD CATEGORY                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] p-5 sm:p-6 shadow-2xl relative flex flex-col">
            <button
              onClick={closeAddModal}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal header */}
            <div className="flex items-center gap-3 mb-4 shrink-0 pr-8">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl shrink-0">
                <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 truncate">Add New Category</h3>
                <p className="text-xs text-gray-500 truncate">Create a category with display order and optional subcategories.</p>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 min-h-0 space-y-4 pr-1 [scrollbar-width:thin]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="e.g. God, News..."
                    className="w-full px-4 py-2.5 sm:py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                {/* Order */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={addOrder}
                    onChange={(e) => setAddOrder(e.target.value)}
                    placeholder="e.g. 1, 2"
                    className="w-full px-3 py-2.5 sm:py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Subcategories */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Subcategories {addSubsTags.length > 0 && <span className="text-blue-600 dark:text-blue-400 font-medium">({addSubsTags.length})</span>}
                  </label>
                  {addSubsTags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAddSubsTags([])}
                      className="text-[11px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <TagChips tags={addSubsTags} onRemove={(tag) => setAddSubsTags((p) => p.filter((t) => t !== tag))} />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={addSubsInput}
                    onChange={(e) => setAddSubsInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAddTag(); } }}
                    placeholder="e.g. Murugan, Vishnu — comma separated"
                    className="flex-1 px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addAddTag}
                    className="px-3.5 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer shrink-0"
                    title="Add Subcategory"
                  >
                    <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Type subcategories separated by commas, press Enter or + to add.</p>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="flex gap-3 pt-4 mt-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
              <button
                onClick={closeAddModal}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdd}
                disabled={addMutation.isPending || !addName.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {addMutation.isPending ? "Saving..." : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: EDIT CATEGORY & ORDER                                          */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {editModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] p-5 sm:p-6 shadow-2xl relative flex flex-col">
            <button
              onClick={() => setEditModal(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 shrink-0 pr-8">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl shrink-0">
                <Folder className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 truncate">Edit Category & Order</h3>
                <p className="text-xs text-gray-500 truncate">Editing: {editModal.categoriesName}</p>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 min-h-0 space-y-4 pr-1 [scrollbar-width:thin]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 sm:py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editOrder}
                    onChange={(e) => setEditOrder(e.target.value)}
                    placeholder="e.g. 1, 2"
                    className="w-full px-3 py-2.5 sm:py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Subcategories {editSubsTags.length > 0 && <span className="text-indigo-600 dark:text-indigo-400 font-medium">({editSubsTags.length})</span>}
                  </label>
                  {editSubsTags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setEditSubsTags([])}
                      className="text-[11px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <TagChips tags={editSubsTags} onRemove={(tag) => setEditSubsTags((p) => p.filter((t) => t !== tag))} />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editSubsInput}
                    onChange={(e) => setEditSubsInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEditTag(); } }}
                    placeholder="Add subcategory, comma separated..."
                    className="flex-1 px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addEditTag}
                    className="px-3.5 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer shrink-0"
                    title="Add Subcategory"
                  >
                    <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Type subcategories separated by commas, press Enter or + to add.</p>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="flex gap-3 pt-4 mt-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
              <button
                onClick={() => setEditModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending || !editName.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: VIEW SUBCATEGORIES                                             */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {viewingCat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md max-h-[85vh] p-5 sm:p-6 shadow-2xl relative flex flex-col">
            <button
              onClick={() => setViewingCat(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 shrink-0 pr-8">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl shrink-0">
                <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100 truncate">{viewingCat.categoriesName}</h3>
                <p className="text-xs text-gray-500 truncate">{viewingCat.subcategories?.length || 0} subcategories</p>
              </div>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 min-h-0 pr-1 [scrollbar-width:thin]">
              {(viewingCat.subcategories || []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No subcategories found</p>
              ) : (
                (viewingCat.subcategories || []).map((sub) => (
                  <div key={sub} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 truncate pr-2">
                      <Tag className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{sub}</span>
                    </span>
                    <button
                      onClick={() => handleDeleteSubcategory(viewingCat, sub)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer shrink-0"
                      title={`Remove ${sub}`}
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 mt-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
              <button
                onClick={() => setViewingCat(null)}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
