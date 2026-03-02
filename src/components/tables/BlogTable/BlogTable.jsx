import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Search,
    Filter,
    MoreVertical,
    Trash2,
    Check,
    X,
    Edit,
    Eye,
    Calendar,
    Clock,
    ChevronLeft,
    ChevronRight,
    FileText
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { fetchAllBlogsAdmin, deleteBlog, toggleBlogStatus } from "../../../Services/blogService";

// Simple Pagination helper
function usePagination(items = [], itemsPerPage = 10) {
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const currentItems = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return items.slice(start, end);
    }, [items, page, itemsPerPage]);

    const nextPage = () => page < totalPages && setPage(page + 1);
    const prevPage = () => page > 1 && setPage(page - 1);
    const resetPage = () => setPage(1);

    return { page, totalPages, currentItems, nextPage, prevPage, resetPage, setPage };
}

export default function BlogTable() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const { data: blogs = [], isLoading, isError } = useQuery({
        queryKey: ["admin-blogs"],
        queryFn: fetchAllBlogsAdmin,
    });

    const filteredBlogs = useMemo(() => {
        return blogs.filter(blog =>
            blog.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [blogs, searchQuery]);

    const {
        page,
        totalPages,
        currentItems,
        nextPage,
        prevPage,
        resetPage,
    } = usePagination(filteredBlogs, itemsPerPage);

    useEffect(() => {
        resetPage();
    }, [searchQuery, itemsPerPage, resetPage]);

    const toggleStatusMutation = useMutation({
        mutationFn: toggleBlogStatus,
        onSuccess: (data) => {
            queryClient.invalidateQueries(["admin-blogs"]);
            toast.success(data.message);
        },
        onError: (err) => toast.error(err?.response?.data?.message || "Action failed"),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteBlog,
        onSuccess: (data) => {
            queryClient.invalidateQueries(["admin-blogs"]);
            toast.success(data.message);
        },
        onError: (err) => toast.error(err?.response?.data?.message || "Failed to delete blog"),
    });

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this blog?")) {
            deleteMutation.mutate(id);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric"
        });
    };

    if (isLoading) return <div className="py-10 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />Loading Blogs...</div>;
    if (isError) return <div className="py-10 text-center text-red-500 font-medium">Failed to load blogs.</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Toaster position="top-right" />

            {/* Header Actions */}
            <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search blogs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800"
                    />
                </div>
                <button
                    onClick={() => navigate("/social/blog/add")}
                    className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                    <FileText className="w-4 h-4" />
                    Add New Blog
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Blog</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {currentItems.map((blog) => (
                            <tr key={blog._id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <img src={blog.image} alt="" className="w-12 h-12 rounded-lg object-cover shadow-sm bg-gray-100" />
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{blog.title}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">/{blog.slug}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleStatusMutation.mutate(blog._id)}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${blog.isPublished
                                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {blog.isPublished ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                        {blog.isPublished ? "Published" : "Draft"}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-medium text-gray-700">{formatDate(blog.createdAt)}</span>
                                        <span className="text-[10px] text-gray-400">Created At</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => navigate(`/social/blog/edit/${blog._id}`)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Edit Blog"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(blog._id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete Blog"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {currentItems.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-gray-500 text-sm">
                                    No blogs found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-50 flex items-center justify-between">
                    <p className="text-sm text-gray-500 font-medium">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                        <button
                            onClick={prevPage}
                            disabled={page === 1}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={nextPage}
                            disabled={page === totalPages}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
