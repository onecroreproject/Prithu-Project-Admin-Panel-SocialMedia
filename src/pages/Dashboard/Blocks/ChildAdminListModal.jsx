import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Mail, ShieldCheck, ShieldAlert, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getChildAdmins } from '../../../Services/childAdminServices/childAdminServices';

export default function ChildAdminListModal({ isOpen, onClose }) {
    const { data: admins, isLoading, isError } = useQuery({
        queryKey: ['childAdmins'],
        queryFn: getChildAdmins,
        enabled: isOpen,
    });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-linear-to-r from-indigo-50/50 to-transparent dark:from-indigo-900/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Team Members</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Manage your child admins</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* List Content */}
                    <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-3">
                                <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-gray-500">Loading teaam members...</p>
                            </div>
                        ) : isError ? (
                            <div className="py-12 text-center text-red-500">
                                <ShieldAlert className="mx-auto mb-2 opacity-50" size={32} />
                                <p className="text-sm font-medium">Failed to load admins</p>
                            </div>
                        ) : admins?.length === 0 ? (
                            <div className="py-12 text-center text-gray-500">
                                <Users className="mx-auto mb-2 opacity-20" size={32} />
                                <p className="text-sm italic">No child admins found</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {admins?.map((admin) => (
                                    <div
                                        key={admin._id}
                                        className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all group"
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm ${admin.isOnline
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                            : 'bg-gray-50 dark:bg-gray-800 text-gray-500'
                                            }`}>
                                            {admin.userName?.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900 dark:text-white truncate">
                                                    {admin.userName}
                                                </span>
                                                {admin.isOnline && (
                                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Online
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                <Mail size={12} className="shrink-0" />
                                                <span className="truncate">{admin.email}</span>
                                            </div>
                                        </div>

                                        <div className={`p-2 rounded-lg transition-colors ${admin.isActive
                                            ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'text-gray-400 bg-gray-50 dark:bg-gray-800'
                                            }`}>
                                            <ShieldCheck size={18} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
