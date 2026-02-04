import { Trash2, Edit2, Play, Layout, CheckCircle2, ChevronDown, Check } from 'lucide-react';
import React from 'react';
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
            onUpdateField('categoryId', next[0]); // for backward compat/primary
        } else {
            onUpdateField('categoryId', '');
        }
    };

    const selectedIds = fileData.categoryIds || (fileData.categoryId ? [fileData.categoryId] : []);
    const selectedNames = categories
        .filter(c => selectedIds.includes(c.categoryId))
        .map(c => c.categoriesName);

    return (
        <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden group shadow-xl hover:border-blue-500/30 transition-all flex flex-col h-full">
            {/* Visual Preview */}
            <div className="relative aspect-[4/5] overflow-hidden bg-black shrink-0">
                {isVideo ? (
                    <video
                        src={fileData.preview}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        muted
                    />
                ) : (
                    <img
                        src={fileData.preview}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                )}

                {/* Progress Overlay */}
                {fileData.progress > 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-6 z-20">
                        <div className="w-full space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                <span>Uploading</span>
                                <span>{fileData.progress}%</span>
                            </div>
                            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                    style={{ width: `${fileData.progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2 z-10">
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${fileData.uploadMode === 'template' ? 'bg-blue-600 text-white' : 'bg-gray-800/80 text-gray-300 backdrop-blur-md'}`}>
                        {fileData.uploadMode}
                    </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4 gap-2 z-10">
                    <button
                        onClick={() => onLivePreview(fileData.id)}
                        className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl transition-all hover:scale-110"
                        title="Live Preview"
                    >
                        <Play size={18} fill="currentColor" />
                    </button>
                    <button
                        onClick={() => onEdit(fileData.id)}
                        className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all hover:scale-110 shadow-lg"
                        title="Template Editor"
                    >
                        <Layout size={18} />
                    </button>
                    {!isVideo && (
                        <button
                            onClick={() => onEditPost(fileData.id)}
                            className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all hover:scale-110 shadow-lg"
                            title="Quick Edit"
                        >
                            <Edit2 size={18} />
                        </button>
                    )}
                    <button
                        onClick={() => onRemove(fileData.id)}
                        className="p-2 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all hover:scale-110"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Content Labels */}
            <div className="p-4 space-y-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id={`mode-${fileData.id}`}
                        checked={fileData.uploadMode === 'template'}
                        onChange={(e) => onToggleMode(fileData.id, e.target.checked ? 'template' : 'normal')}
                        className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-offset-0 focus:ring-blue-500"
                    />
                    <label htmlFor={`mode-${fileData.id}`} className="text-xs font-bold text-gray-400 cursor-pointer uppercase tracking-widest">Enable Layers</label>
                </div>

                <div className="space-y-3 flex-1">
                    <div className="relative">
                        <button
                            onClick={() => setIsCatOpen(!isCatOpen)}
                            className="w-full bg-gray-900 text-white border border-gray-800 rounded-xl px-3 py-2 text-xs flex justify-between items-center hover:border-gray-700 transition-all"
                        >
                            <span className="truncate">
                                {selectedNames.length > 0 ? selectedNames.join(", ") : "Select Categories"}
                            </span>
                            <ChevronDown size={14} className={`transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isCatOpen && (
                            <div className="absolute z-30 bottom-full mb-1 w-full bg-gray-950 border border-gray-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto p-1 scrollbar-hide">
                                {categories.map(c => (
                                    <div
                                        key={c.categoryId}
                                        onClick={() => toggleCategory(c.categoryId)}
                                        className="flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                                    >
                                        <span className="text-[10px] text-gray-300">{c.categoriesName}</span>
                                        {selectedIds.includes(c.categoryId) && <Check size={12} className="text-blue-500" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <textarea
                        value={fileData.caption}
                        onChange={(e) => onUpdateField('caption', e.target.value)}
                        placeholder="Write a caption..."
                        className="w-full h-20 bg-gray-900 text-gray-300 border border-gray-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all hover:border-gray-700 placeholder:text-gray-700"
                    />
                </div>

                {/* Schedule Toggle */}
                <div className="pt-2 border-t border-gray-900 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={fileData.isScheduled}
                            onChange={(e) => onUpdateField('isScheduled', e.target.checked)}
                            className="hidden"
                        />
                        <div className={`w-8 h-4 rounded-full transition-colors relative ${fileData.isScheduled ? 'bg-blue-600' : 'bg-gray-800'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-all ${fileData.isScheduled ? 'translate-x-4' : ''}`} />
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest group-hover:text-blue-400">Schedule</span>
                    </label>

                    {fileData.isScheduled && (
                        <input
                            type="datetime-local"
                            value={fileData.scheduleDate}
                            onChange={(e) => onUpdateField('scheduleDate', e.target.value)}
                            className="bg-gray-900 text-gray-400 border-none rounded px-2 py-0.5 text-[10px] outline-none"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MediaCard;
