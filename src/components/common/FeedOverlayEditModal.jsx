import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { fetchFeedDesign, updateFeedDesignMetadata } from "../../Services/FeedServices/feedServices";
import TemplateEditor from "../FeedUpload/template/TemplateEditor";

export default function FeedOverlayEditModal({ feed, onClose }) {
    const queryClient = useQueryClient();
    const [designData, setDesignData] = useState(null);

    // Fetch feed design
    const { data: fetchedDesign, isLoading, isError, error } = useQuery({
        queryKey: ["feedDesign", feed._id],
        queryFn: () => fetchFeedDesign(feed._id),
        enabled: !!feed._id,
    });

    useEffect(() => {
        if (fetchedDesign) {
            setDesignData(fetchedDesign.designMetadata || {});
        }
    }, [fetchedDesign]);

    // Mutation: Update feed design
    const updateMutation = useMutation({
        mutationFn: (newMetadata) => updateFeedDesignMetadata(feed._id, newMetadata),
        onSuccess: () => {
            toast.success("Feed overlays updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["feeds"] });
            onClose();
        },
        onError: (err) => toast.error(err.message || "Failed to update overlays"),
    });

    const handleSave = (feedId, designMetadata) => {
        updateMutation.mutate({ designMetadata });
    };

    const handleUpdateEditMetadata = (feedId, editMetadata) => {
        updateMutation.mutate({ editMetadata });
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Loading feed design...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl max-w-md w-full">
                    <h3 className="text-xl font-bold text-red-600 mb-4">Error Loading Design</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error.message}</p>
                    <button
                        onClick={onClose}
                        className="w-full py-2 bg-gray-200 dark:bg-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    // Map feed media to files format expected by TemplateEditor
    const fileData = {
        id: feed._id,
        preview: feed.contentUrl,
        file: {
            name: feed.type === "video" ? "Feed Video" : "Feed Image",
            type: feed.type === "video" ? "video" : "image"
        },
        metadata: fetchedDesign?.designMetadata,
        editMetadata: fetchedDesign?.editMetadata
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-8">
            <div className="bg-white dark:bg-gray-900 w-full max-w-7xl h-full max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative border border-gray-200 dark:border-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Feed Overlays</h2>
                        <p className="text-sm text-gray-500">Configure template elements and animations</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Editor Container */}
                <div className="flex-1 overflow-hidden">
                    <TemplateEditor
                        fileData={fileData}
                        onClose={onClose}
                        onSave={handleSave}
                        onUpdateEditMetadata={handleUpdateEditMetadata}
                    />
                </div>

                {updateMutation.isPending && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-[110]">
                        <div className="bg-white dark:bg-gray-900 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 border border-gray-200 dark:border-gray-800">
                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                            <span className="font-medium">Saving changes...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
