import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    FileText,
    Check,
    X,
    Loader2,
    Crop as CropIcon
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import MyCropper from "react-easy-crop";
import { createBlog, updateBlog, fetchAllBlogsAdmin } from "../../Services/blogService";
import getMediaUrl from "../../Utils/mediaUrl";
import { CKEditor } from 'ckeditor4-react';
import { getCroppedImg } from "../../Utils/cropImage";

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

    // Cropper State
    const [imageToCrop, setImageToCrop] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);

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
            // Generate a unique filename based on title + random string to send to backend
            const cleanTitle = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30);
            const randomSuffix = Math.random().toString(36).substring(2, 6);
            const fileName = `${cleanTitle}_${randomSuffix}.jpg`;
            data.append("image", selectedFile, fileName);
        } else if (formData.image && typeof formData.image === 'string') {
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

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setImageToCrop(reader.result);
                setShowCropper(true);
            };
        }
    };

    const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropSave = async () => {
        try {
            const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            setSelectedFile(croppedImageBlob);
            setPreviewUrl(URL.createObjectURL(croppedImageBlob));
            setShowCropper(false);
            setImageToCrop(null);
            toast.success("Image cropped successfully!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to crop image");
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

            {/* Cropper Modal */}
            {showCropper && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh] shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-4 sm:p-5 border-b dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 sticky top-0 z-10">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <CropIcon className="w-5 h-5 text-blue-600" />
                                Crop Feature Image
                            </h2>
                            <button onClick={() => setShowCropper(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="relative w-full aspect-video bg-gray-950 max-h-[60vh] sm:max-h-[70vh]">
                            <MyCropper
                                image={imageToCrop}
                                crop={crop}
                                zoom={zoom}
                                aspect={16 / 9}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                objectFit="contain"
                            />
                        </div>

                        <div className="p-4 sm:p-8 bg-gray-50 dark:bg-gray-900/50 space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <span>Adjust Zoom</span>
                                    <span className="text-blue-600 dark:text-blue-400 font-mono">{Math.round(zoom * 100)}%</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-gray-400">-</span>
                                    <input
                                        type="range"
                                        value={zoom}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        onChange={(e) => setZoom(e.target.value)}
                                        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <span className="text-xs font-bold text-gray-400">+</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCropper(false)}
                                    className="flex-1 py-3.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-2xl font-bold hover:bg-white dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCropSave}
                                    className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 group"
                                >
                                    <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    Save Cropped Image
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                                {selectedFile ? "Change cropped image" : "Click to choose image"}
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
                                                setPreviewUrl(formData.image ? getMediaUrl(formData.image) : "");
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
