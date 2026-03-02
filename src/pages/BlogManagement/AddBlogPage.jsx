import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    FileText,
    Check,
    X,
    Loader2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { createBlog, updateBlog, fetchAllBlogsAdmin } from "../../Services/blogService";
import getMediaUrl from "../../Utils/mediaUrl";
import { CKEditor } from 'ckeditor4-react';

const AddBlogPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        image: "",
        isPublished: true,
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [isEditorReady, setIsEditorReady] = useState(!isEdit);

    // If editing, fetch blog data
    const { data: blogs = [], isLoading: isLoadingBlog } = useQuery({
        queryKey: ["admin-blogs"],
        queryFn: fetchAllBlogsAdmin,
        enabled: isEdit,
    });

    useEffect(() => {
        if (isEdit && blogs.length > 0) {
            const blogToEdit = blogs.find((b) => b._id === id);
            if (blogToEdit) {
                setFormData({
                    title: blogToEdit.title || "",
                    content: blogToEdit.content || "",
                    image: blogToEdit.image || "",
                    isPublished: blogToEdit.isPublished !== undefined ? blogToEdit.isPublished : true,
                });
                if (blogToEdit.image) {
                    setPreviewUrl(getMediaUrl(blogToEdit.image));
                }
                setIsEditorReady(true);
            }
        }
    }, [isEdit, blogs, id]);

    const mutation = useMutation({
        mutationFn: (data) => (isEdit ? updateBlog(id, data) : createBlog(data)),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["admin-blogs"]);
            toast.success(data.message || (isEdit ? "Blog updated!" : "Blog created!"));
            setTimeout(() => navigate("/social/blog/list"), 1500);
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Operation failed. Check title uniqueness.");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content || (!formData.image && !selectedFile)) {
            toast.error("Please fill all required fields and choose an image");
            return;
        }

        const data = new FormData();
        data.append("title", formData.title);
        data.append("content", formData.content);
        data.append("isPublished", formData.isPublished);
        if (selectedFile) {
            data.append("image", selectedFile);
        } else if (formData.image) {
            data.append("image", formData.image);
        }

        mutation.mutate(data);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error("Please select an image file");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleEditorChange = (event) => {
        const data = event.editor.getData();
        setFormData((prev) => ({
            ...prev,
            content: data,
        }));
    };

    if (isEdit && isLoadingBlog) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/social/blog/list")}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">
                            {isEdit ? "Edit Blog" : "Create New Blog"}
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">
                            {isEdit ? "Update your existing story" : "Share a new story with your audience"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    Blog Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter a catchy title..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Content</label>
                                <div className="min-h-[400px] border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                                    {!isEditorReady ? (
                                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                    ) : (
                                        <CKEditor
                                            key={id || "new"}
                                            initData={formData.content}
                                            onChange={handleEditorChange}
                                            config={{
                                                height: 400,
                                                versionCheck: false,
                                            }}
                                            style={{ width: '100%' }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Sidebar / Settings */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-gray-400" />
                                    Featured Image
                                </label>

                                <div className="relative group/upload">
                                    <input
                                        type="file"
                                        id="blog-image"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="blog-image"
                                        className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-gray-50 border-2 border-gray-200 border-dashed rounded-xl appearance-none cursor-pointer hover:border-blue-400 focus:outline-none group"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <ImageIcon className="w-8 h-8 mb-2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                            <p className="text-xs font-bold text-gray-500">
                                                {selectedFile ? selectedFile.name : "Click to choose image"}
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                {previewUrl && (
                                    <div className="mt-4 relative rounded-xl overflow-hidden border border-gray-100 shadow-inner group/preview">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-48 object-cover"
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/400x300?text=Error+Loading+Image";
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setPreviewUrl(formData.image || "");
                                            }}
                                            className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm opacity-0 group-hover/preview:opacity-100 transition-opacity hover:bg-red-50 text-red-500"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Publishing Settings</h3>
                                <label className="flex items-center justify-between cursor-pointer group">
                                    <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                                        Publish Immediately
                                    </span>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            name="isPublished"
                                            checked={formData.isPublished}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 transition-colors"></div>
                                    </div>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-900/10 disabled:opacity-70"
                            >
                                {mutation.isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                {isEdit ? "Update Story" : "Publish Story"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBlogPage;
