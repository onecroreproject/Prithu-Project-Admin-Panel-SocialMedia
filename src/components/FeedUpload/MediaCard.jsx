import { Trash2, Edit2, Play, Layout, CheckCircle2, ChevronDown, Check } from 'lucide-react';
import React from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const MediaCard = ({
    fileData,
    categories,
    isUploading,
    onRemove,
    onToggleMode,
    onEdit,
    onEditPost,
    onLivePreview,
    onUpdateField
}) => {
    const [isCatOpen, setIsCatOpen] = React.useState(false);
    const isVideo = fileData.file.type.startsWith('video');

    const toggleCategory = (catId) => {
        const current = fileData.categoryIds || (fileData.categoryId ? [fileData.categoryId] : []);
        const exists = current.includes(catId);
        let next;
        if (exists) {
            next = current.filter(id => id !== catId);
        } else {
            next = [...current, catId];
        }
        onUpdateField('categoryIds', next);
        if (next.length > 0) {
            onUpdateField('categoryId', next[0]);
        } else {
            onUpdateField('categoryId', '');
        }
    };

    const selectedIds = fileData.categoryIds || (fileData.categoryId ? [fileData.categoryId] : []);
    const selectedNames = categories
        .filter(c => selectedIds.includes(c.categoryId))
        .map(c => c.categoriesName);

    return (
        <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden group shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-500 flex flex-col h-full transform hover:-translate-y-2">
            {/* Visual Preview */}
            <div className="relative aspect-4/3 overflow-hidden bg-gray-50 shrink-0">
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
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center p-6 z-20">
                        <div className="w-full space-y-2">
                            <div className="flex justify-between text-[11px] font-black text-blue-600 uppercase tracking-widest">
                                <span>Uploading</span>
                                <span>{fileData.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
                        "px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border border-white/20 transition-all",
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
                        className="w-10 h-10 bg-white/95 hover:bg-white text-gray-900 rounded-2xl flex items-center justify-center transition-all hover:scale-110 shadow-xl"
                        title="Live Preview"
                    >
                        <Play size={18} fill="currentColor" />
                    </button>
                    <button
                        onClick={() => onEdit(fileData.id)}
                        className="w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center transition-all hover:scale-110 shadow-xl shadow-blue-500/30"
                        title="Template Editor"
                    >
                        <Layout size={18} />
                    </button>
                    {!isVideo && (
                        <button
                            onClick={() => onEditPost(fileData.id)}
                            className="w-10 h-10 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl flex items-center justify-center transition-all hover:scale-110 shadow-xl shadow-purple-500/30"
                            title="Quick Edit"
                        >
                            <Edit2 size={18} />
                        </button>
                    )}
                    <button
                        onClick={() => onRemove(fileData.id)}
                        className="w-10 h-10 bg-rose-50 hover:bg-rose-600 text-rose-500 hover:text-white rounded-2xl flex items-center justify-center transition-all hover:scale-110 border border-rose-100 shadow-xl"
                        title="Remove"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 space-y-4 flex-1 flex flex-col bg-white">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="checkbox"
                            id={`mode-${fileData.id}`}
                            checked={fileData.uploadMode === 'template'}
                            onChange={(e) => onToggleMode(fileData.id, e.target.checked ? 'template' : 'normal')}
                            className="w-4 h-4 rounded-lg border-gray-200 text-blue-600 focus:ring-blue-500/30 transition-all cursor-pointer shadow-sm"
                        />
                    </div>
                    <label htmlFor={`mode-${fileData.id}`} className="text-[10px] font-black text-gray-400 cursor-pointer uppercase tracking-[0.2em] hover:text-blue-600 transition-colors">
                        Enable Feed Layers
                    </label>
                </div>

                <div className="space-y-3 flex-1">
                    <div className="relative">
                        <button
                            onClick={() => setIsCatOpen(!isCatOpen)}
                            className="w-full bg-gray-50 text-gray-800 border border-gray-100 rounded-2xl px-4 py-3 text-xs font-bold flex justify-between items-center hover:bg-white hover:border-blue-100 transition-all shadow-sm outline-none focus:ring-4 focus:ring-blue-500/5"
                        >
                            <span className="truncate pr-4 uppercase tracking-wider">
                                {selectedNames.length > 0 ? selectedNames.join(", ") : "Select Categories"}
                            </span>
                            <ChevronDown size={14} className={clsx("transition-transform shrink-0", isCatOpen && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                            {isCatOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="absolute z-50 bottom-full mb-2 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl p-2 ring-1 ring-black/5 overflow-hidden"
                                >
                                    <div className="max-h-52 overflow-y-auto custom-scrollbar p-1">
                                        {categories.map(c => (
                                            <div
                                                key={c.categoryId}
                                                onClick={() => toggleCategory(c.categoryId)}
                                                className="flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 hover:text-blue-700 rounded-xl cursor-pointer transition-all group"
                                            >
                                                <span className="text-[11px] font-black uppercase tracking-widest">{c.categoriesName}</span>
                                                {selectedIds.includes(c.categoryId) && (
                                                    <div className="w-4 h-4 bg-blue-600 rounded-lg flex items-center justify-center text-white scale-110 shadow-lg shadow-blue-500/30">
                                                        <Check size={10} strokeWidth={4} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <textarea
                        value={fileData.caption}
                        onChange={(e) => onUpdateField('caption', e.target.value)}
                        placeholder="Content narrative..."
                        className="w-full h-24 bg-gray-50 text-gray-800 border border-gray-100 rounded-2xl px-4 py-3 text-xs font-medium focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-200 outline-none resize-none transition-all placeholder:text-gray-300 leading-relaxed custom-scrollbar"
                    />
                </div>

                {/* Scheduling Section */}
                <div className="pt-5 border-t border-gray-50 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-4 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={fileData.isScheduled}
                                onChange={(e) => onUpdateField('isScheduled', e.target.checked)}
                                className="hidden"
                            />
                            <div className={clsx(
                                "w-11 h-6 rounded-full transition-all duration-300 relative flex items-center p-1 shadow-inner",
                                fileData.isScheduled ? 'bg-blue-600' : 'bg-gray-200'
                            )}>
                                <div className={clsx(
                                    "w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-300",
                                    fileData.isScheduled ? 'translate-x-[20px]' : 'translate-x-0'
                                )} />
                            </div>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] group-hover:text-gray-900 transition-colors">Schedule Post</span>
                        </label>
                    </div>

                    {fileData.isScheduled && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="overflow-hidden"
                        >
                            <input
                                type="datetime-local"
                                value={fileData.scheduleDate}
                                onChange={(e) => onUpdateField('scheduleDate', e.target.value)}
                                className="w-full bg-gray-50 text-gray-700 border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-100 transition-all"
                            />
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MediaCard;
