import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateFeedSchedule } from '../../Services/FeedServices/feedServices';

const ScheduleEditModal = ({ feed, onClose, onSuccess }) => {
    const [scheduleDate, setScheduleDate] = useState(
        feed.scheduleDate ? new Date(feed.scheduleDate).toISOString().slice(0, 16) : ''
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!scheduleDate) {
            toast.error("Please select a valid date and time");
            return;
        }

        // Ensure date is in the future
        if (new Date(scheduleDate) <= new Date()) {
            toast.error("Schedule time must be in the future");
            return;
        }

        try {
            setIsSubmitting(true);
            await updateFeedSchedule(feed._id, { scheduleTime: scheduleDate });
            toast.success("Feed schedule updated successfully!");
            onSuccess();
        } catch (error) {
            console.error("Update schedule error:", error);
            toast.error(error.message || "Failed to update schedule");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <Calendar size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Schedule</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
                            <img
                                src={feed.contentUrl}
                                alt="Preview"
                                className="w-16 h-16 object-cover rounded-lg border border-white dark:border-gray-800 shadow-sm"
                            />
                            <div>
                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 line-clamp-1">
                                    {feed.caption || "No caption"}
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 uppercase font-bold tracking-wider">
                                    {feed.type} Post
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Clock size={16} /> New Publication Time
                            </label>
                            <div className="relative group">
                                <input
                                    type="datetime-local"
                                    required
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all group-hover:border-gray-300 dark:group-hover:border-gray-600"
                                />
                            </div>
                            <p className="text-[11px] text-gray-500 mt-2">
                                * The feed will be visible to all users at the selected time.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-500 flex items-center justify-center gap-2 disabled:opacity-50 transition-all transform active:scale-[0.98]"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            <span>{isSubmitting ? "Updating..." : "Save Schedule"}</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ScheduleEditModal;
