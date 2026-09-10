import React, { useState, useEffect, useMemo } from "react";
import { uploadTemplate, getCategories } from "../../Services/adminTemplateService";
import { toast } from "react-hot-toast";
import CanvasPreview from "./CanvasPreview";

export default function TemplateUpload({ token, onComplete }) {
    const [name, setName] = useState("");
    const [files, setFiles] = useState({
        backgroundVideo: null,
        avatarMaskVideo: null,
        usernameMaskVideo: null,
        footerMaskVideo: null,
        previewImage: null
    });
    const [previewUrls, setPreviewUrls] = useState({});
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduleDate, setScheduleDate] = useState("");

    const [templateJson, setTemplateJson] = useState({
        duration: 8,
        aspectRatio: "9:16",
        avatar: { x: 540, y: 960, size: 200 },
        username: { x: 540, y: 1100, w: 400, h: 100 },
        footer: { y: 1700, height: 220 },
        textSlots: {
            username: { x: 540, y: 1100 },
            phone: { x: 540, y: 1750 },
            socialIcons: { x: 540, y: 1850 }
        }
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories(token);
                setCategories(data.categories || []);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, [token]);

    useEffect(() => {
        return () => {
            Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        const file = selectedFiles[0];
        setFiles(prev => ({ ...prev, [name]: file }));

        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrls(prev => {
                if (prev[name]) URL.revokeObjectURL(prev[name]);
                return { ...prev, [name]: url };
            });
        }
    };

    const handleJsonChange = (path, value) => {
        const keys = path.split('.');
        const newJson = JSON.parse(JSON.stringify(templateJson));
        let current = newJson;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = Number(value);
        setTemplateJson(newJson);
    };

    const canvasMetadata = useMemo(() => ({
        overlayElements: [
            {
                id: 'avatar',
                type: 'avatar',
                xPercent: ((templateJson.avatar.x - templateJson.avatar.size / 2) / 1080) * 100,
                yPercent: ((templateJson.avatar.y - templateJson.avatar.size / 2) / 1920) * 100,
                wPercent: (templateJson.avatar.size / 1080) * 100,
                hPercent: (templateJson.avatar.size / 1080) * 100,
                visible: !!previewUrls.avatarMaskVideo,
                avatarConfig: { shape: 'circle' },
                maskVideoUrl: previewUrls.avatarMaskVideo
            },
            {
                id: 'username',
                type: 'username',
                xPercent: ((templateJson.username.x - templateJson.username.w / 2) / 1080) * 100,
                yPercent: ((templateJson.username.y - templateJson.username.h / 2) / 1920) * 100,
                wPercent: (templateJson.username.w / 1080) * 100,
                hPercent: (templateJson.username.h / 1920) * 100,
                visible: !!previewUrls.usernameMaskVideo,
                text: 'Username Preview',
                maskVideoUrl: previewUrls.usernameMaskVideo
            }
        ],
        footerConfig: {
            enabled: !!previewUrls.footerMaskVideo,
            yPercent: (templateJson.footer.y / 1920) * 100,
            heightPercent: (templateJson.footer.height / 1920) * 100,
            backgroundColor: '#1a1a1a',
            maskVideoUrl: previewUrls.footerMaskVideo
        },
        canvasSettings: {
            aspectRatio: templateJson.aspectRatio || "9:16",
            referenceWidth: 1080,
            referenceHeight: 1920
        }
    }), [templateJson, previewUrls]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", name);
        formData.append("templateJson", JSON.stringify(templateJson));
        Object.keys(files).forEach(key => {
            if (files[key]) formData.append(key, files[key]);
        });
        formData.append("categoryId", selectedCategory);
        formData.append("isScheduled", isScheduled);
        if (isScheduled && scheduleDate) {
            formData.append("scheduleDate", scheduleDate);
        }

        try {
            toast.loading("Uploading template...", { id: "upload" });
            await uploadTemplate(formData, token);
            toast.success("Template uploaded successfully!", { id: "upload" });
            if (onComplete) onComplete();
        } catch (err) {
            toast.error("Upload failed: " + err.message, { id: "upload" });
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Create New Template</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Template Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.categoryId} value={cat.categoryId}>{cat.categoriesName}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isScheduled}
                                    onChange={(e) => setIsScheduled(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Schedule for later</span>
                            </label>
                        </div>

                        {isScheduled && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Schedule Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                    required={isScheduled}
                                />
                            </div>
                        )}

                        {/* File Uploads */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.keys(files).map(field => (
                                <div key={field} className="p-3 border rounded-lg bg-gray-50">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        {field.replace(/Video|Image|Mask/g, ' $&')}
                                    </label>
                                    <input
                                        type="file"
                                        name={field}
                                        onChange={handleFileChange}
                                        className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        required={field === "backgroundVideo"}
                                    />
                                    {files[field] && (
                                        <p className="mt-1 text-[10px] text-green-600 truncate">{files[field].name}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold border-b pb-2">Coordinates (1080x1920 base)</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {['aspectRatio', 'avatar.x', 'avatar.y', 'avatar.size', 'username.x', 'username.y', 'username.w', 'username.h', 'footer.y', 'footer.height'].map(path => (
                                <div key={path}>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase">{path.replace('.', ' ')}</label>
                                    {path === 'aspectRatio' ? (
                                        <select
                                            value={templateJson.aspectRatio}
                                            onChange={(e) => setTemplateJson(prev => ({ ...prev, aspectRatio: e.target.value }))}
                                            className="w-full border p-1 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="9:16">9:16 (Portrait)</option>
                                            <option value="16:9">16:9 (Landscape)</option>
                                            <option value="1:1">1:1 (Square)</option>
                                        </select>
                                    ) : (
                                        <input
                                            type="number"
                                            value={path.split('.').reduce((obj, key) => obj[key], templateJson)}
                                            onChange={(e) => handleJsonChange(path, e.target.value)}
                                            className="w-full border p-1 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 transition shadow-lg active:transform active:scale-95"
                        >
                            Upload Template
                        </button>
                    </div>
                </form>

                {/* Preview Section */}
                <div className="bg-gray-100 rounded-xl p-4 flex flex-col items-center justify-center min-h-[600px] sticky top-6">
                    <div className="w-full h-full flex flex-col items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Live Preview</span>
                        {previewUrls.backgroundVideo ? (
                            <div className="w-full max-w-[300px] aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl ring-8 ring-white/50">
                                <CanvasPreview
                                    previewUrl={previewUrls.backgroundVideo}
                                    fileType="video"
                                    metadata={canvasMetadata}
                                    readOnly={true}
                                />
                            </div>
                        ) : (
                            <div className="w-full max-w-[300px] aspect-[9/16] bg-gray-200 rounded-2xl flex items-center justify-center border-4 border-dashed border-gray-300">
                                <div className="text-center p-6">
                                    <p className="text-gray-400 text-sm font-medium">Select a background video to see preview</p>
                                </div>
                            </div>
                        )}
                        <div className="mt-6 w-full max-w-[300px]">
                            <p className="text-[10px] text-gray-400 text-center italic">
                                * Preview uses 1080x1920 mapping. Adjust coordinates to see real-time updates.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
