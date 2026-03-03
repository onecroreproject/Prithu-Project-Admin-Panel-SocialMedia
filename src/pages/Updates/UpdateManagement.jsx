import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Edit2, Trash2, Shield, Users, User, Zap,
    X, Upload, Check, AlertCircle, Loader2, Image as ImageIcon
} from 'lucide-react';
import api from '../../Utils/axiosApi';
import { toast } from 'react-toastify';

const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    }).format(new Date(dateString));
};

const UpdateManagement = () => {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUpdate, setEditingUpdate] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetRole: 'all',
        isActive: true
    });
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);

    const fetchUpdates = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/admin/updates/all');
            if (response.data.success) {
                setUpdates(response.data.updates);
            }
        } catch (error) {
            toast.error("Failed to load updates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUpdates();
    }, []);

    const handleOpenModal = (update = null) => {
        if (update) {
            setEditingUpdate(update);
            setFormData({
                title: update.title,
                description: update.description,
                targetRole: update.targetRole,
                isActive: update.isActive
            });
            setMediaPreview(update.media);
        } else {
            setEditingUpdate(null);
            setFormData({
                title: '',
                description: '',
                targetRole: 'all',
                isActive: true
            });
            setMediaPreview(null);
        }
        setMediaFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUpdate(null);
        setMediaFile(null);
        setMediaPreview(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('targetRole', formData.targetRole);
        data.append('isActive', formData.isActive);
        if (mediaFile) {
            data.append('media', mediaFile);
        }

        try {
            let response;
            if (editingUpdate) {
                response = await api.put(`/api/admin/updates/update/${editingUpdate._id}`, data);
            } else {
                response = await api.post('/api/admin/updates/create', data);
            }

            if (response.data.success) {
                toast.success(editingUpdate ? "Update modified" : "Update created");
                fetchUpdates();
                handleCloseModal();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this update?")) {
            try {
                const response = await api.delete(`/api/admin/updates/delete/${id}`);
                if (response.data.success) {
                    toast.success("Update deleted");
                    setUpdates(prev => prev.filter(u => u._id !== id));
                }
            } catch (error) {
                toast.error("Failed to delete update");
            }
        }
    };

    const filteredUpdates = updates.filter(u =>
        u.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleIcon = (role) => {
        switch (role) {
            case 'Admin': return <Shield className="w-4 h-4" />;
            case 'User': return <User className="w-4 h-4" />;
            case 'Child_Admin': return <Users className="w-4 h-4" />;
            default: return <Zap className="w-4 h-4" />;
        }
    };

    return (
        <div className="p-4 md:p-8 min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Zap className="w-8 h-8 text-blue-500 fill-blue-500/20" />
                            Updates Management
                        </h1>
                        <p className="text-gray-500 mt-1">Create and manage "What's New" announcements.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Update
                    </button>
                </header>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search updates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden transition-all text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            Total: <span className="font-bold text-gray-900 dark:text-white">{filteredUpdates.length}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wider text-gray-500 font-bold bg-gray-50 dark:bg-gray-900/50">
                                    <th className="px-6 py-4">Title & Details</th>
                                    <th className="px-6 py-4">Target Role</th>
                                    <th className="px-6 py-4">Created On</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                            Loading updates...
                                        </td>
                                    </tr>
                                ) : filteredUpdates.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                            No updates found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUpdates.map((update) => (
                                        <tr key={update._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-900 overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                                                        {update.media ? (
                                                            <img src={update.media} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <ImageIcon className="w-6 h-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white line-clamp-1">{update.title}</div>
                                                        <div className="text-xs text-gray-500 line-clamp-1">{update.description}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold capitalize">
                                                    {getRoleIcon(update.targetRole)}
                                                    {update.targetRole}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {formatDate(update.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`
                                                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                    ${update.isActive
                                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400'
                                                    }
                                                `}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${update.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                                    {update.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(update)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(update._id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModal}
                            className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {editingUpdate ? 'Edit Update' : 'Create New Update'}
                                </h2>
                                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Title</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter update title..."
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden transition-all text-gray-900 dark:text-white"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Description</label>
                                    <textarea
                                        required
                                        rows="4"
                                        placeholder="Enter details about this update..."
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden transition-all text-gray-900 dark:text-white resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Target Role</label>
                                        <select
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden transition-all text-gray-900 dark:text-white"
                                            value={formData.targetRole}
                                            onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                                        >
                                            <option value="all">Everyone (All)</option>
                                            <option value="User">Users Only</option>
                                            <option value="Admin">Admins Only</option>
                                            <option value="Child_Admin">Child Admins Only</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Status</label>
                                        <div className="flex items-center gap-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, isActive: true })}
                                                className={`flex-1 py-1 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${formData.isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 dark:bg-gray-900 text-gray-500'}`}
                                            >
                                                Active
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, isActive: false })}
                                                className={`flex-1 py-1 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${!formData.isActive ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-gray-100 dark:bg-gray-900 text-gray-500'}`}
                                            >
                                                Inactive
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Media Announcement (Optional)</label>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                                                {mediaPreview ? (
                                                    <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-8 h-8 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <label className="relative inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm mb-1">
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    {mediaFile ? 'Change File' : 'Upload Image'}
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                </label>
                                                <p className="text-[10px] text-gray-500">Max size 5MB. Recommended ratio 16:9 or 1:1.</p>
                                            </div>
                                            {mediaPreview && (
                                                <button
                                                    type="button"
                                                    onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </form>

                            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            {editingUpdate ? 'Save Changes' : 'Create Update'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UpdateManagement;
