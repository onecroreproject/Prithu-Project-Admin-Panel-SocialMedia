import { Trash2, Edit2, Play, Layout, CheckCircle2, ChevronDown, Check } from 'lucide-react';
import React from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import CategorySelector from '../common/CategorySelector';

const MediaCard = ({
    fileData,
    categories,
    isUploading,
    viewMode = 'grid',
    onRemove,
    onToggleMode,
    onEdit,
    onEditPost,
    onLivePreview,
    onUpdateField
}) => {
    const isVideo = fileData.file.type.startsWith('video');
    const isList = viewMode === 'list';

    const selectedIds = (fileData.categoryIds && fileData.categoryIds.length > 0)
        ? fileData.categoryIds
        : (fileData.categoryId ? [fileData.categoryId] : []);

    return (
        <div className={clsx(
            "bg-white border border-gray-100 rounded-3xl group shadow-sm transition-all duration-500 flex transform relative z-10 hover:z-20 focus-within:z-50",
            isList ? "flex-row h-48 hover:shadow-xl hover:border-blue-200" : "flex-col h-full hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200 hover:-translate-y-2"
        )}>
            {/* Visual Preview */}
            <div className={clsx(
                "relative overflow-hidden bg-gray-50 shrink-0",
                isList ? "w-64 h-full rounded-l-3xl" : "aspect-4/3 rounded-t-3xl"
            )}>
                {isVideo ? (
                    <video
                        src={fileData.preview}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        muted
                    />
                ) : (
                    <img
                        src={fileData.preview}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt="preview"
                    />
                )}

                {/* Overlays (Progress, Mode, etc.) */}
                <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

                {/* Progress Overlay */}
                {fileData.progress > 0 && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center p-4 z-20">
                        <div className="w-full space-y-2">
                            <div className="flex justify-between text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                <span>Uploading</span>
                                <span>{fileData.progress}%</span>
                            </div>
                            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/40"
                                    style={{ width: `${fileData.progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Mode Badge */}
                <div className="absolute top-3 left-3 z-20">
                    <div className={clsx(
                        "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border border-white/20 transition-all",
                        fileData.uploadMode === 'template'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/90 text-gray-700'
                    )}>
                        {fileData.uploadMode}
                    </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 translate-y-2 group-hover:translate-y-0">
                    <button
                        onClick={() => onLivePreview(fileData.id)}
                        className="w-8 h-8 bg-white/95 hover:bg-white text-gray-900 rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-xl"
                        title="Live Preview"
                    >
                        <Play size={14} fill="currentColor" />
                    </button>
                    <button
                        onClick={() => onEdit(fileData.id)}
                        className="w-8 h-8 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-xl shadow-blue-500/30"
                        title="Template Editor"
                    >
                        <Layout size={14} />
                    </button>
                    {!isVideo && (
                        <button
                            onClick={() => onEditPost(fileData.id)}
                            className="w-8 h-8 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-xl shadow-purple-500/30"
                            title="Quick Edit"
                        >
                            <Edit2 size={14} />
                        </button>
                    )}
                    <button
                        onClick={() => onRemove(fileData.id)}
                        className="w-8 h-8 bg-rose-50 hover:bg-rose-600 text-rose-500 hover:text-white rounded-xl flex items-center justify-center transition-all hover:scale-110 border border-rose-100 shadow-xl"
                        title="Remove"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className={clsx(
                "p-4 flex-1 flex bg-gray-50/40",
                isList ? "flex-row items-center gap-6" : "flex-col gap-3"
            )}>
                <div className={clsx("flex flex-col gap-3", isList ? "flex-[1.5]" : "flex-1")}>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id={`mode-${fileData.id}`}
                            checked={fileData.uploadMode === 'template'}
                            onChange={(e) => onToggleMode(fileData.id, e.target.checked ? 'template' : 'normal')}
                            className="w-4 h-4 rounded-lg border-gray-200 text-blue-600 focus:ring-blue-500/30 transition-all cursor-pointer"
                        />
                        <label htmlFor={`mode-${fileData.id}`} className="text-[9px] font-black text-gray-400 cursor-pointer uppercase tracking-widest hover:text-blue-600 transition-colors">
                            Enable Feed Layers
                        </label>
                    </div>

                    <CategorySelector
                        categories={categories}
                        selectedIds={selectedIds}
                        onChange={(ids) => {
                            onUpdateField('categoryIds', ids);
                            onUpdateField('categoryId', ids[0] || '');
                        }}
                        placeholder="Select Categories"
                        variant="light"
                    />
                </div>

                <div className={clsx("flex flex-col gap-3", isList ? "flex-2" : "flex-1")}>
                    <textarea
                        value={fileData.caption}
                        onChange={(e) => onUpdateField('caption', e.target.value)}
                        placeholder="Content narrative..."
                        className={clsx(
                            "w-full bg-white text-gray-800 border border-gray-100 rounded-2xl px-4 py-3 text-xs font-medium focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-200 outline-none resize-none transition-all placeholder:text-gray-300 custom-scrollbar",
                            isList ? "h-28" : "h-24"
                        )}
                    />
                </div>

                <div className={clsx("flex flex-col gap-3", isList ? "flex-1" : "pt-4 border-t border-gray-100")}>
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={fileData.isScheduled}
                                onChange={(e) => onUpdateField('isScheduled', e.target.checked)}
                                className="hidden"
                            />
                            <div className={clsx(
                                "w-10 h-5 rounded-full transition-all duration-300 relative flex items-center p-1 shadow-inner",
                                fileData.isScheduled ? 'bg-blue-600' : 'bg-gray-200'
                            )}>
                                <div className={clsx(
                                    "w-3 h-3 bg-white rounded-full shadow-lg transition-transform duration-300",
                                    fileData.isScheduled ? 'translate-x-[20px]' : 'translate-x-0'
                                )} />
                            </div>
                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest group-hover:text-gray-900 transition-colors">Schedule</span>
                        </label>
                    </div>

                    <AnimatePresence>
                        {fileData.isScheduled && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <input
                                    type="datetime-local"
                                    value={fileData.scheduleDate}
                                    onChange={(e) => onUpdateField('scheduleDate', e.target.value)}
                                    className="w-full bg-white text-gray-700 border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-100 transition-all"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default MediaCard;
