import React, { useState, useEffect } from "react";
import { useAdminAuth } from "../../context/adminAuthContext";
import { getPromotionTemplates, getTemplateContent, savePromotionTemplate, deletePromotionTemplate } from "../../Services/adminEmailService";
import { toast } from "react-hot-toast";
import { FileText, Plus, Trash2, Edit3, Eye, Save, X, Code, Layout, ArrowLeft, Search, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TemplateEditor() {
    const { admin } = useAdminAuth();
    const token = admin?.token;
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [editingTemplate, setEditingTemplate] = useState(null); // { name, content }
    const [viewMode, setViewMode] = useState("edit"); // "edit" or "preview"
    const [saving, setSaving] = useState(false);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await getPromotionTemplates(token);
            setTemplates(response.data || []);
        } catch (error) {
            toast.error("Failed to fetch templates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchTemplates();
    }, [token]);

    const handleEdit = async (tpl) => {
        try {
            // Encode the path to handle subdirectories like "promotion/Promotion1.html"
            const encodedPath = encodeURIComponent(tpl.path);
            const response = await getTemplateContent(encodedPath, token);
            setEditingTemplate({ name: tpl.path, content: response.data });
        } catch (error) {
            toast.error("Failed to load template content");
        }
    };

    const handleSave = async () => {
        if (!editingTemplate.name) return toast.error("Template name is required");

        try {
            setSaving(true);
            const fileName = editingTemplate.name.endsWith(".html") ? editingTemplate.name : `${editingTemplate.name}.html`;
            await savePromotionTemplate({
                fileName: fileName,
                content: editingTemplate.content
            }, token);
            toast.success("Template saved successfully");
            fetchTemplates();
            setEditingTemplate(null);
        } catch (error) {
            toast.error("Failed to save template");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (tpl) => {
        if (!window.confirm(`Are you sure you want to delete ${tpl.path}?`)) return;
        try {
            const encodedPath = encodeURIComponent(tpl.path);
            await deletePromotionTemplate(encodedPath, token);
            toast.success("Template deleted");
            fetchTemplates();
        } catch (error) {
            toast.error("Failed to delete template");
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.path.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (editingTemplate) {
        return (
            <div className="flex flex-col h-screen bg-gray-50 -m-6">
                {/* Editor Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setEditingTemplate(null)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <input
                                type="text"
                                value={editingTemplate.name}
                                onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                                className="text-xl font-bold text-gray-900 bg-transparent border-none focus:ring-0 p-0"
                                placeholder="template-name.html"
                            />
                            <p className="text-xs text-gray-500">Editing Promotional Template</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode("edit")}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${viewMode === 'edit' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                            >
                                <Code size={16} /> Code
                            </button>
                            <button
                                onClick={() => setViewMode("preview")}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${viewMode === 'preview' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                            >
                                <Layout size={16} /> Preview
                            </button>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                            Save Template
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {viewMode === "edit" ? (
                            <motion.div
                                key="edit"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full"
                            >
                                <textarea
                                    autoFocus
                                    className="w-full h-full p-8 font-mono text-sm border-none focus:ring-0 bg-white resize-none"
                                    value={editingTemplate.content}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                                    placeholder="Paste your HTML here..."
                                    spellCheck={false}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full bg-gray-200 p-8 flex justify-center overflow-auto"
                            >
                                <div className="bg-white shadow-2xl w-full max-w-[600px] min-h-full rounded-lg overflow-hidden">
                                    <iframe
                                        srcDoc={editingTemplate.content.replace(/{username}/g, "Admin").replace(/{totalUsers}/g, "10,000+").replace(/{totalFeeds}/g, "5,000+").replace(/{totalDownloads}/g, "2,500+").replace(/{totalShares}/g, "1,200+")}
                                        title="Preview"
                                        className="w-full h-full min-h-[800px] border-none"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
                    <p className="text-gray-500 mt-1">Manage all promotional email assets in one place</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                    </div>
                    <button
                        onClick={() => setEditingTemplate({ name: `Promotion${templates.length + 1}.html`, content: "<!-- New Template -->" })}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shrink-0"
                    >
                        <Plus size={20} /> Add New
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Template Name / Path</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Size</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <RefreshCw className="animate-spin w-4 h-4" /> Loading templates...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTemplates.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="w-12 h-12 text-gray-200 mb-4" />
                                            <p className="text-gray-400">No templates found mirroring your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTemplates.map((tpl) => (
                                    <tr key={tpl.path} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{tpl.name}</p>
                                                    <p className="text-xs text-gray-400 font-mono">{tpl.path}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${tpl.path.includes('/') ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                                                {tpl.path.includes('/') ? tpl.path.split('/')[0] : 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">{(tpl.size / 1024).toFixed(1)} KB</div>
                                            <div className="text-[10px] text-gray-400">{new Date(tpl.lastModified).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(tpl)}
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    title="Edit Template"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tpl)}
                                                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


function RefreshCw(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
        </svg>
    )
}
