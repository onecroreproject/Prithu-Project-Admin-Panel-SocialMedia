import React, { useState } from 'react';
import { useAdminUpload } from '../../hooks/useAdminUpload';
import FileSelect from './FileSelect';
import MediaCard from './MediaCard';
import TemplateEditor from './template/TemplateEditor';
import PostEditor from './PostEditor';
import LivePreview from './LivePreview';
import { Settings, Send, Calendar, Tag, ChevronDown, LayoutGrid, Check } from 'lucide-react';
import { clsx } from 'clsx';

const FeedUploadPage = () => {
    const {
        files,
        categories,
        isUploading,
        overallProgress,
        globalSettings,
        updateGlobalSettings,
        handleSelectFiles,
        handleRemoveFile,
        handleUpdateFileField,
        handleToggleMode,
        handleUpdateMetadata,
        handleUpdateEditMetadata,
        upload
    } = useAdminUpload();
    const [globalCatOpen, setGlobalCatOpen] = useState(false);

    const [activeEditorId, setActiveEditorId] = useState(null);
    const [activePostEditorId, setActivePostEditorId] = useState(null);
    const [livePreviewId, setLivePreviewId] = useState(null);
    const [showGlobalSettings, setShowGlobalSettings] = useState(false);

    const activeEditorFile = files.find(f => f.id === activeEditorId);
    const activePostEditorFile = files.find(f => f.id === activePostEditorId);
    const livePreviewFile = files.find(f => f.id === livePreviewId);

    return (
        <div className="min-h-screen bg-transparent p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-800">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/40">
                            <Send size={20} className="text-white" />
                        </div>
                        Multi-Stream Upload
                    </h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest ml-14">Orchestrate your social content with precision</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowGlobalSettings(!showGlobalSettings)}
                        className={clsx(
                            "px-6 py-3 rounded-2xl flex items-center gap-3 font-black text-[10px] tracking-widest uppercase transition-all border-2",
                            showGlobalSettings ? "bg-blue-600 border-blue-500 text-white shadow-xl" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white"
                        )}
                    >
                        <Settings size={16} />
                        Global Settings
                        <ChevronDown size={14} className={clsx("transition-transform", showGlobalSettings && "rotate-180")} />
                    </button>
                    <button
                        onClick={upload}
                        disabled={isUploading || files.length === 0}
                        className="px-10 py-3 bg-white text-black hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl flex items-center gap-3 font-black text-[10px] tracking-[0.2em] uppercase shadow-2xl transition-all transform hover:scale-105 active:scale-95"
                    >
                        {isUploading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                <span>Processing...</span>
                            </div>
                        ) : (
                            <>
                                <Send size={16} />
                                Publish {files.length > 0 && `(${files.length})`}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Overall Progress */}
            {isUploading && (
                <div className="bg-gray-900/50 backdrop-blur-md border border-blue-500/20 rounded-3xl p-8 space-y-4 shadow-2xl">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                                <LayoutGrid size={24} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-black uppercase text-sm tracking-widest">Global Synchronization</h3>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Assets are being pushed to production servers</p>
                            </div>
                        </div>
                        <span className="text-2xl font-black text-blue-400 font-mono">{overallProgress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden p-0.5">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Global Settings Panel */}
            {showGlobalSettings && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="bg-gray-950/50 backdrop-blur-md border border-gray-800 rounded-3xl p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <Tag className="text-blue-500" size={16} />
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Auto-Categorize</h4>
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setGlobalCatOpen(!globalCatOpen)}
                                className="w-full bg-gray-900 text-white border border-gray-800 rounded-2xl px-5 py-3 text-xs flex justify-between items-center focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <span className="truncate">
                                    {(globalSettings.categoryIds && globalSettings.categoryIds.length > 0)
                                        ? categories.filter(c => globalSettings.categoryIds.includes(c.categoryId)).map(c => c.categoriesName).join(", ")
                                        : "Select Categories"}
                                </span>
                                <ChevronDown size={14} className={`transition-transform ${globalCatOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {globalCatOpen && (
                                <div className="absolute z-50 mt-2 w-full bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2 scrollbar-hide">
                                    {categories.map(c => (
                                        <div
                                            key={c.categoryId}
                                            onClick={() => {
                                                const current = globalSettings.categoryIds || [];
                                                const next = current.includes(c.categoryId)
                                                    ? current.filter(id => id !== c.categoryId)
                                                    : [...current, c.categoryId];
                                                updateGlobalSettings('categoryIds', next);
                                                updateGlobalSettings('categoryId', next[0] || '');
                                            }}
                                            className="flex items-center justify-between px-4 py-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
                                        >
                                            <span className="text-xs text-gray-300">{c.categoriesName}</span>
                                            {(globalSettings.categoryIds || []).includes(c.categoryId) && <Check size={14} className="text-blue-500" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={globalSettings.applyCategoryToAll}
                                onChange={(e) => updateGlobalSettings('applyCategoryToAll', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-offset-0 focus:ring-blue-500 transition-all"
                            />
                            <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300 uppercase tracking-widest">Apply to current batch</span>
                        </label>
                    </div>

                    <div className="bg-gray-950/50 backdrop-blur-md border border-gray-800 rounded-3xl p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <Calendar className="text-purple-500" size={16} />
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Master Scheduler</h4>
                        </div>
                        <input
                            type="datetime-local"
                            value={globalSettings.scheduleDate}
                            onChange={(e) => updateGlobalSettings('scheduleDate', e.target.value)}
                            className="w-full bg-gray-900 text-white border border-gray-800 rounded-2xl px-5 py-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={globalSettings.applyScheduleToAll}
                                onChange={(e) => updateGlobalSettings('applyScheduleToAll', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-offset-0 focus:ring-blue-500 transition-all"
                            />
                            <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300 uppercase tracking-widest">Force global schedule</span>
                        </label>
                    </div>
                </div>
            )}

            {/* Central File Uploader */}
            <div className="bg-gray-900/30 backdrop-blur-sm border-2 border-dashed border-gray-800 rounded-[2.5rem] p-12 hover:border-blue-500/30 transition-all">
                <FileSelect onSelect={handleSelectFiles} />
            </div>

            {/* Batch Grid */}
            {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {files.map(f => (
                        <MediaCard
                            key={f.id}
                            fileData={f}
                            categories={categories}
                            isUploading={isUploading}
                            onRemove={handleRemoveFile}
                            onToggleMode={handleToggleMode}
                            onEdit={setActiveEditorId}
                            onEditPost={setActivePostEditorId}
                            onLivePreview={setLivePreviewId}
                            onUpdateField={(field, value) => handleUpdateFileField(f.id, field, value)}
                        />
                    ))}
                </div>
            )}

            {/* Editor Modals */}
            {activeEditorFile && (
                <TemplateEditor
                    fileData={activeEditorFile}
                    onClose={() => setActiveEditorId(null)}
                    onSave={handleUpdateMetadata}
                    onUpdateEditMetadata={handleUpdateEditMetadata}
                />
            )}

            {activePostEditorFile && (
                <PostEditor
                    fileData={activePostEditorFile}
                    onClose={() => setActivePostEditorId(null)}
                    onSave={handleUpdateEditMetadata}
                />
            )}

            {livePreviewFile && (
                <LivePreview
                    fileData={livePreviewFile}
                    onClose={() => setLivePreviewId(null)}
                />
            )}
        </div>
    );
};

export default FeedUploadPage;
