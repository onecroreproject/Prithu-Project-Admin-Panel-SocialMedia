import React, { useEffect, useState } from 'react';
import { useAdminUpload } from '../hooks/useAdminUpload';
import FileSelect from '../components/upload/FileSelect';
import MediaCard from '../components/upload/MediaCard';
import TemplateEditor from '../components/template/TemplateEditor';
import PostEditor from '../components/upload/PostEditor';
import LivePreview from '../components/upload/LivePreview';
import { Loader2, Upload, Calendar, Folder } from 'lucide-react';

const UploadFeedsPage = () => {
    const {
        files,
        categories,
        isUploading,
        overallProgress,
        globalSettings,
        updateGlobalSettings,
        handleSelectFiles,
        handleRemoveFile,
        handleToggleMode,
        handleUpdateMetadata,
        handleUpdateEditMetadata,
        handleUpdateFileField,
        fetchCategories,
        upload
    } = useAdminUpload();

    const [editingFileId, setEditingFileId] = useState(null);
    const [editingPostId, setEditingPostId] = useState(null);
    const [previewFileId, setPreviewFileId] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialLoad(false), 100);
        return () => clearTimeout(timer);
    }, []);

    const editingFile = files.find(f => f.id === editingFileId);
    const editingPost = files.find(f => f.id === editingPostId);
    const previewFile = files.find(f => f.id === previewFileId);

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-transparent text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight animate-in fade-in slide-in-from-top-4 duration-500 delay-150">
                        Feed Upload
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 animate-in fade-in slide-in-from-top-4 duration-500 delay-200">
                        Manage and publish content to your social circles.
                    </p>
                    {isUploading && (
                        <div className="mt-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500 ease-out animate-pulse-slow"
                                    style={{ width: `${overallProgress}%` }}
                                />
                            </div>
                            <span className="text-sm font-bold text-blue-400 animate-pulse">
                                {overallProgress}%
                            </span>
                        </div>
                    )}
                </div>

                <button
                    onClick={upload}
                    disabled={isUploading || files.length === 0}
                    className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 delay-300"
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {isUploading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            <span className="animate-pulse">Publishing...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="transition-transform group-hover:translate-y-[-2px]" size={18} />
                            <span>Publish {files.length > 0 ? `${files.length} Feeds` : 'Feeds'}</span>
                        </>
                    )}
                </button>
            </div>

            {/* Global Settings Section */}
            {files.length > 0 && (
                <div className="mb-8 p-6 bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-2xl flex flex-wrap gap-8 items-end animate-in fade-in slide-in-from-top-4 duration-500 animate-slide-in-up">
                    <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="applyCategoryToAll"
                                checked={globalSettings.applyCategoryToAll}
                                onChange={(e) => updateGlobalSettings('applyCategoryToAll', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-0 focus:ring-offset-0 transition-all duration-200 hover:scale-110 cursor-pointer"
                            />
                            <label htmlFor="applyCategoryToAll" className="text-sm font-medium text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
                                Apply Category to All
                            </label>
                        </div>
                        <div className="relative group">
                            <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-hover:text-gray-400 transition-colors" size={16} />
                            <select
                                disabled={!globalSettings.applyCategoryToAll}
                                value={globalSettings.categoryId}
                                onChange={(e) => updateGlobalSettings('categoryId', e.target.value)}
                                className="w-56 pl-10 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-30 transition-all hover:border-gray-600 focus:border-blue-500"
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => (
                                    <option key={c.categoryId} value={c.categoryId}>{c.categoriesName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="applyScheduleToAll"
                                checked={globalSettings.applyScheduleToAll}
                                onChange={(e) => updateGlobalSettings('applyScheduleToAll', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-0 focus:ring-offset-0 transition-all duration-200 hover:scale-110 cursor-pointer"
                            />
                            <label htmlFor="applyScheduleToAll" className="text-sm font-medium text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
                                Apply Schedule to All
                            </label>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    disabled={!globalSettings.applyScheduleToAll}
                                    checked={globalSettings.isScheduled}
                                    onChange={(e) => updateGlobalSettings('isScheduled', e.target.checked)}
                                    className="hidden"
                                />
                                <div className={`w-11 h-6 rounded-full transition-all duration-300 relative border ${globalSettings.isScheduled ? 'bg-blue-600 border-blue-500' : 'bg-gray-800 border-gray-700'} group-hover:border-blue-400`}>
                                    <div className={`absolute top-1 left-1 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all duration-300 ${globalSettings.isScheduled ? 'translate-x-5' : ''} group-hover:scale-110`} />
                                </div>
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Schedule</span>
                            </label>

                            {globalSettings.isScheduled && (
                                <div className="relative group">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-hover:text-gray-400 transition-colors" size={16} />
                                    <input
                                        type="datetime-local"
                                        disabled={!globalSettings.applyScheduleToAll}
                                        value={globalSettings.scheduleDate}
                                        onChange={(e) => updateGlobalSettings('scheduleDate', e.target.value)}
                                        className="pl-10 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-30 transition-all hover:border-gray-600 focus:border-blue-500 text-white"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* File Selector */}
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                <FileSelect 
                    onSelect={handleSelectFiles} 
                    className={files.length > 0 ? "py-12" : "py-24"}
                    isActive={files.length === 0}
                />
            </div>

            {/* Grid */}
            {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {files.map((fileData, index) => (
                        <div
                            key={fileData.id}
                            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                            style={{
                                animationDelay: `${index * 100}ms`,
                                animationFillMode: 'backwards'
                            }}
                        >
                            <MediaCard
                                fileData={fileData}
                                categories={categories}
                                isUploading={isUploading}
                                onRemove={handleRemoveFile}
                                onToggleMode={handleToggleMode}
                                onEdit={setEditingFileId}
                                onEditPost={setEditingPostId}
                                onLivePreview={setPreviewFileId}
                                onUpdateField={(field, value) => handleUpdateFileField(fileData.id, field, value)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {files.length === 0 && !isUploading && (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 animate-pulse-slow">
                        <Loader2 className="animate-spin-slow text-gray-600" size={32} />
                    </div>
                    <p className="text-gray-500 font-medium animate-pulse-slow">
                        No files selected
                    </p>
                    <p className="text-gray-600 text-sm mt-2 animate-in fade-in duration-1000 delay-500">
                        Drag and drop files or click to browse
                    </p>
                </div>
            )}

            {/* Modals with overlay animations */}
            {editingFile && (
                <div className="animate-in fade-in duration-300">
                    <TemplateEditor
                        fileData={editingFile}
                        onClose={() => setEditingFileId(null)}
                        onSave={handleUpdateMetadata}
                        onUpdateEditMetadata={handleUpdateEditMetadata}
                    />
                </div>
            )}

            {editingPost && (
                <div className="animate-in fade-in duration-300">
                    <PostEditor
                        fileData={editingPost}
                        onClose={() => setEditingPostId(null)}
                        onSave={handleUpdateEditMetadata}
                    />
                </div>
            )}

            {previewFile && (
                <div className="animate-in fade-in duration-300">
                    <LivePreview
                        fileData={previewFile}
                        onClose={() => setPreviewFileId(null)}
                    />
                </div>
            )}

            <style jsx>{`
                @keyframes slide-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes pulse-slow {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }
                
                @keyframes spin-slow {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
                
                .animate-slide-in-up {
                    animation: slide-in-up 0.5s ease-out;
                }
                
                .animate-pulse-slow {
                    animation: pulse-slow 2s ease-in-out infinite;
                }
                
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
                
                /* Smooth scroll behavior */
                html {
                    scroll-behavior: smooth;
                }
                
                /* Button press effect */
                .button-press:active {
                    transform: scale(0.98);
                }
                
                /* Card hover effect */
                .card-hover {
                    transition: all 0.3s ease;
                }
                
                .card-hover:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
                }
            `}</style>
        </div>
    );
};

export default UploadFeedsPage;