import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Edit2, Trash2, Zap,
    X, Upload, Check, Loader2, Image as ImageIcon, ArrowLeft
} from 'lucide-react';
import { CKEditor } from 'ckeditor4-react';
import api from '../../Utils/axiosApi';
import { toast } from 'react-toastify';

const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    }).format(new Date(dateString));
};

// ─── Form View ────────────────────────────────────────────────────────────────
const UpdateForm = ({ editingUpdate, onClose, onSaved }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: editingUpdate?.title || '',
        description: editingUpdate?.description || '',
        version: editingUpdate?.version || '',
    });
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(editingUpdate?.media || null);
    // Delay editor init in edit mode until existing data is ready
    const [isEditorReady, setIsEditorReady] = useState(!editingUpdate);

    useEffect(() => {
        if (editingUpdate) setIsEditorReady(true);
    }, [editingUpdate]);

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
        data.append('version', formData.version);
        data.append('targetRole', 'all');   // always target all users
        data.append('isActive', true);       // always active
        if (mediaFile) data.append('media', mediaFile);

        try {
            let response;
            if (editingUpdate) {
                response = await api.put(`/api/admin/updates/update/${editingUpdate._id}`, data);
            } else {
                response = await api.post('/api/admin/updates/create', data);
            }

            if (response.data.success) {
                toast.success(editingUpdate ? 'Update saved!' : 'Update created!');
                onSaved();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="p-4 md:p-8 min-h-screen bg-gray-50/50 dark:bg-gray-900/50"
        >
            <div className="max-w-2xl mx-auto">
                {/* Back header */}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {editingUpdate ? 'Edit Update' : 'Create New Update'}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {editingUpdate
                                ? 'Modify the announcement details below.'
                                : 'Fill in the details to publish a new What\'s New announcement.'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                        {/* Title & Version Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Title *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter update title..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Version</label>
                                <input
                                    type="text"
                                    placeholder="e.g. v1.2.0"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white"
                                    value={formData.version}
                                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Description — CKEditor 4 */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Description *</label>
                            <div className="min-h-[260px] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900">
                                {!isEditorReady ? (
                                    <div className="flex items-center justify-center h-[260px]">
                                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                    </div>
                                ) : (
                                    <CKEditor
                                        key={editingUpdate?._id || 'new'}
                                        initData={formData.description}
                                        onChange={(e) =>
                                            setFormData(prev => ({ ...prev, description: e.editor.getData() }))
                                        }
                                        config={{
                                            height: 260,
                                            versionCheck: false,
                                        }}
                                        style={{ width: '100%' }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Media */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Image (Optional)</label>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                                    {mediaPreview ? (
                                        <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="relative inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm">
                                        <Upload className="w-4 h-4 mr-2" />
                                        {mediaFile ? 'Change Image' : 'Upload Image'}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                    <p className="text-[10px] text-gray-400">Max 5 MB · Recommended 16:9 or 1:1</p>
                                    {mediaPreview && (
                                        <button
                                            type="button"
                                            onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                                            className="text-xs text-red-500 hover:underline text-left"
                                        >
                                            Remove image
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
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
                                    {editingUpdate ? 'Save Changes' : 'Publish Update'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

// ─── List View ────────────────────────────────────────────────────────────────
const UpdateManagement = () => {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('list'); // 'list' | 'form'
    const [editingUpdate, setEditingUpdate] = useState(null);

    const fetchUpdates = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/admin/updates/all');
            if (response.data.success) setUpdates(response.data.updates);
        } catch {
            toast.error('Failed to load updates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUpdates(); }, []);

    const openCreate = () => { setEditingUpdate(null); setView('form'); };
    const openEdit = (update) => { setEditingUpdate(update); setView('form'); };
    const closeForm = () => { setEditingUpdate(null); setView('list'); };

    const handleSaved = () => {
        closeForm();
        fetchUpdates();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this update?')) return;
        try {
            const response = await api.delete(`/api/admin/updates/delete/${id}`);
            if (response.data.success) {
                toast.success('Update deleted');
                setUpdates(prev => prev.filter(u => u._id !== id));
            }
        } catch {
            toast.error('Failed to delete update');
        }
    };

    const filteredUpdates = updates.filter(u =>
        u.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ── Render form as a page ──────────────────────────────────────────────
    if (view === 'form') {
        return (
            <AnimatePresence mode="wait">
                <UpdateForm
                    key="form"
                    editingUpdate={editingUpdate}
                    onClose={closeForm}
                    onSaved={handleSaved}
                />
            </AnimatePresence>
        );
    }

    // ── Render list ────────────────────────────────────────────────────────
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="list"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="p-4 md:p-8 min-h-screen bg-gray-50/50 dark:bg-gray-900/50"
            >
                <div className="max-w-7xl mx-auto">
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Zap className="w-8 h-8 text-blue-500 fill-blue-500/20" />
                                Updates Management
                            </h1>
                            <p className="text-gray-500 mt-1">Create and manage "What's New" announcements for users.</p>
                        </div>
                        <button
                            onClick={openCreate}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            Create New Update
                        </button>
                    </header>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Search bar */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search updates..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                Total: <span className="font-bold text-gray-900 dark:text-white">{filteredUpdates.length}</span>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="text-left text-xs uppercase tracking-wider text-gray-500 font-bold bg-gray-50 dark:bg-gray-900/50">
                                        <th className="px-6 py-4">Title &amp; Details</th>
                                        <th className="px-6 py-4">Read Stats</th>
                                        <th className="px-6 py-4">Created On</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                                Loading updates...
                                            </td>
                                        </tr>
                                    ) : filteredUpdates.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">
                                                {searchTerm ? 'No updates matching your search.' : 'No updates yet. Create your first one!'}
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
                                                            <div className="flex items-center gap-2">
                                                                <div className="font-bold text-gray-900 dark:text-white line-clamp-1">{update.title}</div>
                                                                {update.version && (
                                                                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-md">
                                                                        {update.version}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div
                                                                className="text-xs text-gray-500 line-clamp-1 truncate max-w-[300px]"
                                                                dangerouslySetInnerHTML={{ __html: update.description }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1 min-w-[120px]">
                                                        <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase">
                                                            <span>{update.readCount || 0} / {update.totalUsers || 0}</span>
                                                            <span>{Math.round(((update.readCount || 0) / (update.totalUsers || 1)) * 100)}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                                                style={{ width: `${Math.min(100, ((update.readCount || 0) / (update.totalUsers || 1)) * 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                    {formatDate(update.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => openEdit(update)}
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
            </motion.div>
        </AnimatePresence>
    );
};

export default UpdateManagement;
