import React, { useState, useEffect } from "react";
import { getAllTemplates, deleteTemplate } from "../Services/adminTemplateService";
import TemplateUpload from "../components/template/TemplateUpload";
import CanvasPreview from "../components/template/CanvasPreview";
import { useAdminAuth } from "../context/adminAuthContext";
import { toast } from "react-hot-toast";
import { Plus, Trash2, Eye, X } from "lucide-react";

export default function TemplateManagement() {
    const { admin } = useAdminAuth();
    const token = admin?.token;
    const [templates, setTemplates] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [previewTemplate, setPreviewTemplate] = useState(null);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await getAllTemplates(token);
            setTemplates(response.data || []);
        } catch (err) {
            toast.error("Failed to fetch templates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchTemplates();
    }, [token]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        try {
            await deleteTemplate(id, token);
            toast.success("Template deleted");
            fetchTemplates();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Template Management</h1>
                    <p className="text-gray-500 mt-1">Manage Crafto-style masks and background templates</p>
                </div>
                <button
                    onClick={() => setShowUpload(!showUpload)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={20} />
                    {showUpload ? "Back to List" : "Create New Template"}
                </button>
            </div>

            {showUpload ? (
                <TemplateUpload token={token} onComplete={() => { setShowUpload(false); fetchTemplates(); }} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <p>Loading templates...</p>
                    ) : templates.length === 0 ? (
                        <p className="text-gray-500">No templates found.</p>
                    ) : (
                        templates.map((tpl) => (
                            <div key={tpl._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
                                <div className="aspect-video bg-gray-100 relative">
                                    {tpl.previewImage?.url ? (
                                        <img src={tpl.previewImage.url} alt={tpl.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Preview</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <button
                                            onClick={() => setPreviewTemplate(tpl)}
                                            className="p-2 bg-white rounded-full text-blue-600 hover:scale-110 transition"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tpl._id)}
                                            className="p-2 bg-white rounded-full text-red-600 hover:scale-110 transition"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900">{tpl.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">Aspect Ratio: {tpl.templateJson?.aspectRatio || "9:16"}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Preview Modal */}
            {previewTemplate && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
                    <div className="bg-gray-900 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden relative border border-gray-800 shadow-2xl">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-white">{previewTemplate.name}</h3>
                                <p className="text-sm text-gray-400">Template Preview</p>
                            </div>
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden p-6 bg-gray-950 flex items-center justify-center">
                            <div className="w-full h-full max-w-md">
                                <TemplatePreviewDisplay template={previewTemplate} />
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-end">
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Internal Helper Component for Preview Rendering
function TemplatePreviewDisplay({ template }) {
    const { templateJson, backgroundVideo, previewImage } = template;

    // Map simplified templateJson to CanvasPreview metadata format
    const metadata = React.useMemo(() => {
        const referenceWidth = 1080;
        const referenceHeight = 1920;

        const overlayElements = [
            // Avatar
            {
                id: 'avatar',
                type: 'avatar',
                visible: true,
                xPercent: ((templateJson?.avatar?.x - (templateJson?.avatar?.size / 2)) / referenceWidth) * 100 || 10,
                yPercent: ((templateJson?.avatar?.y - (templateJson?.avatar?.size / 2)) / referenceHeight) * 100 || 10,
                wPercent: (templateJson?.avatar?.size / referenceWidth) * 100 || 15,
                hPercent: (templateJson?.avatar?.size / referenceHeight) * 100 || 15, // Approx square
                animation: { enabled: true, direction: 'top', speed: 1 },
                avatarConfig: { shape: 'round', softEdgeConfig: { enabled: false, strokes: [] } }
            },
            // Username
            {
                id: 'username',
                type: 'username',
                visible: true,
                text: 'User Name',
                // Assuming username.x is center
                xPercent: ((templateJson?.username?.x - 150) / referenceWidth) * 100 || 10, // 300px width approx
                yPercent: (templateJson?.username?.y / referenceHeight) * 100 || 80,
                wPercent: 30,
                hPercent: 5,
                animation: { enabled: true, direction: 'bottom', speed: 1 }
            }
        ];

        return {
            overlayElements,
            footerConfig: {
                enabled: true,
                backgroundColor: '#000000', // Default
                yPercent: (templateJson?.footer?.y / referenceHeight) * 100 || 85,
                heightPercent: (templateJson?.footer?.height / referenceHeight) * 100 || 15
            },
            canvasSettings: { referenceWidth, referenceHeight, aspectRatio: "9:16" }
        };
    }, [templateJson]);

    return (
        <CanvasPreview
            previewUrl={backgroundVideo?.url || previewImage?.url}
            fileType={backgroundVideo?.url ? 'video' : 'image'}
            metadata={metadata}
            editMetadata={{
                crop: { ratio: "9:16", zoomLevel: 1 },
                filters: { preset: "original" }
            }}
            onUpdateOverlay={() => { }} // Read-only
            onSelectOverlay={() => { }} // Read-only
            activeOverlayId={null}
            readOnly={true}
        />
    );
}
