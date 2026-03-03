import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Trash, Calendar, Play, X, Edit, Clock } from "lucide-react";
import toast from "react-hot-toast";

import { fetchFeeds, deleteFeed, removeFeedCategory, fetchCategories, updateFeedSchedule } from "../../Services/FeedServices/feedServices";
import useFeedFilter from "../../hooks/filter";
import usePagination from "../../hooks/pagePagination";
import FeedPreviewModal from "../../components/common/FeedPreviewModal";
import FeedOverlayEditModal from "../../components/common/FeedOverlayEditModal";
import ScheduleEditModal from "../../components/common/ScheduleEditModal";

export default function ScheduledFeedTable() {
    const queryClient = useQueryClient();
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [schedulingFeed, setSchedulingFeed] = useState(null);
    const [editingFeed, setEditingFeed] = useState(null);

    // Fetch feeds
    const { data: feeds = [], isLoading: feedsLoading, isError: feedsError, error: feedsErr } = useQuery({
        queryKey: ["feeds"],
        queryFn: fetchFeeds,
    });

    // Fetch categories
    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
    });

    // Mutation: Delete feed
    const deleteMutation = useMutation({
        mutationFn: ({ feedId }) => deleteFeed({ feedId }),
        onSuccess: () => {
            toast.success("Feed deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["feeds"] });
        },
        onError: (err) => toast.error(err.message || "Delete failed"),
    });

    // Filter ONLY scheduled feeds
    const scheduledFeeds = feeds.filter(f => f.status === "scheduled");

    // Pagination
    const { page, totalPages, currentItems, nextPage, prevPage, resetPage } =
        usePagination(scheduledFeeds, 10);

    // Delete Handler
    const handleDelete = (feedId) => {
        if (confirm("Are you sure you want to delete this scheduled feed?")) {
            deleteMutation.mutate({ feedId });
        }
    };

    if (feedsLoading) return <div className="flex justify-center p-10"><Clock className="animate-spin mr-2" /> Loading scheduled feeds...</div>;
    if (feedsError) return <p className="text-red-500">Error: {feedsErr.message}</p>;

    return (
        <div className="max-w-7xl mx-auto mt-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white/90">Scheduled Feeds</h2>
                <div className="text-sm text-gray-500">
                    Total Scheduled: {scheduledFeeds.length}
                </div>
            </div>

            {currentItems.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/10 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 font-medium">No scheduled feeds found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">#</th>
                                <th className="p-4 font-semibold">Content</th>
                                <th className="p-4 font-semibold">Scheduled For</th>
                                <th className="p-4 font-semibold">Type</th>
                                <th className="p-4 font-semibold">Creator</th>
                                <th className="p-4 font-semibold">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentItems.map((feed, idx) => (
                                <tr key={feed._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 text-gray-500">{(page - 1) * 10 + idx + 1}</td>

                                    {/* FEED MEDIA */}
                                    <td className="p-4">
                                        {feed.type === "video" ? (
                                            <div className="relative w-16 h-16 cursor-pointer group">
                                                <video
                                                    src={feed.contentUrl}
                                                    className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                                    muted
                                                    onClick={() => setSelectedFeed(feed)}
                                                />
                                                <div
                                                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => setSelectedFeed(feed)}
                                                >
                                                    <Play className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                        ) : feed.contentUrl ? (
                                            <img
                                                className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-105 transition-transform"
                                                src={feed.contentUrl}
                                                alt="feed"
                                                onClick={() => setSelectedFeed(feed)}
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">No media</span>
                                        )}
                                    </td>

                                    {/* SCHEDULED TIME */}
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                {new Date(feed.scheduleDate).toLocaleDateString()}
                                            </span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(feed.scheduleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${feed.type === 'video' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                            {feed.type}
                                        </span>
                                    </td>

                                    <td className="p-4 text-sm font-medium">{feed.creator?.userName || "Admin"}</td>

                                    {/* ACTION BUTTONS */}
                                    <td className="p-4">
                                        <div className="flex gap-3">
                                            <button
                                                className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
                                                title="View"
                                                onClick={() => setSelectedFeed(feed)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>

                                            <button
                                                className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"
                                                title="Edit Overlays"
                                                onClick={() => setEditingFeed(feed)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>

                                            <button
                                                className="p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors"
                                                title="Edit Schedule"
                                                onClick={() => setSchedulingFeed(feed)}
                                            >
                                                <Calendar className="h-4 w-4" />
                                            </button>

                                            <button
                                                className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                                                title="Delete"
                                                onClick={() => handleDelete(feed._id)}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* PAGINATION */}
            {scheduledFeeds.length > 10 && (
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={prevPage}
                        disabled={page === 1}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${page === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        Previous
                    </button>

                    <span className="text-sm text-gray-500 font-medium">
                        Page <span className="text-gray-900 dark:text-white">{page}</span> of {totalPages || 1}
                    </span>

                    <button
                        onClick={nextPage}
                        disabled={page === totalPages || totalPages === 0}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${page === totalPages || totalPages === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* MODALS */}
            {selectedFeed && (
                <FeedPreviewModal
                    feed={selectedFeed}
                    onClose={() => setSelectedFeed(null)}
                />
            )}

            {editingFeed && (
                <FeedOverlayEditModal
                    feed={editingFeed}
                    onClose={() => setEditingFeed(null)}
                />
            )}

            {schedulingFeed && (
                <ScheduleEditModal
                    feed={schedulingFeed}
                    onClose={() => setSchedulingFeed(null)}
                    onSuccess={() => {
                        setSchedulingFeed(null);
                        queryClient.invalidateQueries({ queryKey: ["feeds"] });
                    }}
                />
            )}
        </div>
    );
}
