import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FileText, Search, Plus, Trash2, Edit, CheckCircle,
    XCircle, AlertCircle, RefreshCw, BarChart, ExternalLink
} from "lucide-react";
import SEOService from "../../Services/seoService";

const RedirectManager = () => {
    const [redirects, setRedirects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newRedirect, setNewRedirect] = useState({
        sourceUrl: "",
        targetUrl: "",
        statusCode: 301,
        isActive: true
    });

    useEffect(() => {
        fetchRedirects();
    }, []);

    const fetchRedirects = async () => {
        try {
            setLoading(true);
            const response = await SEOService.getRedirects();
            if (response.success) {
                setRedirects(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch redirects", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await SEOService.createRedirect(newRedirect);
            if (response.success) {
                setRedirects([response.data, ...redirects]);
                setShowModal(false);
                setNewRedirect({ sourceUrl: "", targetUrl: "", statusCode: 301, isActive: true });
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create redirect");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this redirect?")) {
            try {
                const response = await SEOService.deleteRedirect(id);
                if (response.success) {
                    setRedirects(redirects.filter(r => r._id !== id));
                }
            } catch (error) {
                alert("Failed to delete redirect");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Redirect Manager</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage source and target URL redirections</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg shadow-blue-500/25"
                >
                    <Plus className="w-5 h-5" />
                    Add Redirect
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Source URL</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Target URL</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {redirects.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No redirects found. Create your first one to start managing URLs.
                                    </td>
                                </tr>
                            ) : (
                                redirects.map((redirect) => (
                                    <tr key={redirect._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            {redirect.isActive ? (
                                                <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                                                    <CheckCircle className="w-4 h-4" /> Active
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-400 font-medium text-sm">
                                                    <XCircle className="w-4 h-4" /> Inactive
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 truncate max-w-[200px] font-mono text-xs dark:text-gray-300">
                                            {redirect.sourceUrl}
                                        </td>
                                        <td className="px-6 py-4 truncate max-w-[200px] font-mono text-xs text-blue-500 dark:text-blue-400">
                                            {redirect.targetUrl}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${redirect.statusCode === 301 ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'}`}>
                                                {redirect.statusCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(redirect._id)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold dark:text-white">New Redirect</h3>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium dark:text-gray-300">Source Path</label>
                                <input
                                    type="text"
                                    required
                                    value={newRedirect.sourceUrl}
                                    onChange={(e) => setNewRedirect({ ...newRedirect, sourceUrl: e.target.value })}
                                    placeholder="/old-page"
                                    className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium dark:text-gray-300">Target URL / Path</label>
                                <input
                                    type="text"
                                    required
                                    value={newRedirect.targetUrl}
                                    onChange={(e) => setNewRedirect({ ...newRedirect, targetUrl: e.target.value })}
                                    placeholder="/new-page or https://..."
                                    className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium dark:text-gray-300">Redirect Type</label>
                                    <select
                                        value={newRedirect.statusCode}
                                        onChange={(e) => setNewRedirect({ ...newRedirect, statusCode: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none"
                                    >
                                        <option value={301}>301 Permanent</option>
                                        <option value={302}>302 Temporary</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium dark:text-gray-300">Status</label>
                                    <select
                                        value={newRedirect.isActive ? "true" : "false"}
                                        onChange={(e) => setNewRedirect({ ...newRedirect, isActive: e.target.value === "true" })}
                                        className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg transition-all font-bold"
                                >
                                    Save Redirect
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RedirectManager;
