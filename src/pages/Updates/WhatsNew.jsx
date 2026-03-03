import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Calendar, User, Eye, CheckCircle2, Image as ImageIcon, ExternalLink, RefreshCw } from 'lucide-react';
import api from '../../Utils/axiosApi';
import { useUpdates } from '../../context/UpdateContext';

const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    }).format(new Date(dateString));
};

const WhatsNew = () => {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const { markAsRead, fetchUnreadCount } = useUpdates();

    const fetchUpdates = async () => {
        setLoading(true);
        try {
            const response = await api.get('/web/api/user/updates/all');
            if (response.data.success) {
                setUpdates(response.data.updates);
            }
        } catch (error) {
            console.error("Failed to fetch updates:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUpdates();
    }, []);

    const handleMarkAsRead = async (update) => {
        if (!update.isRead) {
            await markAsRead(update._id);
            setUpdates(prev => prev.map(u =>
                u._id === update._id ? { ...u, isRead: true } : u
            ));
            fetchUnreadCount();
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-500 rounded-lg text-white shadow-lg shadow-blue-500/20">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">What's New</h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">Stay updated with the latest changes and features.</p>
                    </div>
                    <button
                        onClick={fetchUpdates}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
                        <p className="text-gray-500 animate-pulse">Fetching latest updates...</p>
                    </div>
                ) : updates.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Zap className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No updates yet</h3>
                        <p className="text-gray-500">We'll notify you when something new arrives!</p>
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                    >
                        {updates.map((update) => (
                            <motion.div
                                key={update._id}
                                variants={itemVariants}
                                onViewportEnter={() => handleMarkAsRead(update)}
                                className={`
                                    group bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300
                                    ${update.isRead
                                        ? 'border-gray-200 dark:border-gray-700 opacity-80'
                                        : 'border-blue-500/50 dark:border-blue-500/30 shadow-lg shadow-blue-500/5'
                                    }
                                    hover:shadow-xl dark:hover:bg-gray-800/80
                                `}
                            >
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {update.media && (
                                            <div className="w-full md:w-48 h-48 md:h-auto rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shrink-0">
                                                <img
                                                    src={update.media}
                                                    alt={update.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                                                    {update.title}
                                                </h2>
                                                {!update.isRead && (
                                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                                        New
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                                                {update.description}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(update.createdAt)}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <User className="w-4 h-4" />
                                                    {update.targetRole === 'all' ? 'Everyone' : update.targetRole}
                                                </div>
                                                {update.isRead && (
                                                    <div className="flex items-center gap-1.5 text-emerald-500">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Read
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default WhatsNew;
