import React from 'react';
import { Eye, Edit2, X } from 'lucide-react';

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
    const isVideo = fileData.file.type.startsWith('video');

    return (
        <div className={`bg-gray-900 border rounded-2xl p-4 flex flex-col gap-4 group transition-all hover:shadow-2xl hover:shadow-blue-500/10 ${fileData.isEdited ? 'border-yellow-500/50 ring-1 ring-yellow-500/20' : 'border-gray-800 hover:border-blue-500/50'}`}>
            {/* Preview Section */}
            <div className="relative aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-inner group/preview">
                {isVideo ? (
                    <video
                        src={fileData.preview}
                        className="w-full h-full object-cover"
                        onMouseEnter={e => e.target.play()}
                        onMouseLeave={e => {
                            e.target.pause();
                            e.target.currentTime = 0.1;
                        }}
                    />
                ) : (
                    <img src={fileData.preview} className="w-full h-full object-cover" alt="Preview" />
                )}

                {/* Edited Badge */}
                {fileData.isEdited && !isUploading && (
                    <div className="absolute top-2 left-2 z-20">
                        <span className="px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-black rounded shadow-lg">MODIFIED</span>
                    </div>
                )}

                {/* Upload Progress Overlay */}
                {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4 backdrop-blur-sm z-30">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="32" cy="32" r="28"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="transparent"
                                    className="text-gray-800"
                                />
                                <circle
                                    cx="32" cy="32" r="28"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="transparent"
                                    strokeDasharray={175.9}
                                    strokeDashoffset={175.9 - (175.9 * (fileData.progress || 0)) / 100}
                                    className="text-blue-500 transition-all duration-300"
                                />
                            </svg>
                            <span className="absolute text-xs font-bold text-white">{(fileData.progress || 0)}%</span>
                        </div>
                        <p className="mt-2 text-[10px] text-gray-400 font-medium truncate w-full text-center px-2">Uploading {fileData.file.name}</p>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity" />

                {/* Actions Shortcut */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 opacity-0 group-hover/preview:opacity-100 translate-y-2 group-hover/preview:translate-y-0 transition-all duration-300 z-20">
                    <button
                        onClick={() => onLivePreview(fileData.id)}
                        className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white transition-colors border border-white/10"
                        title="Live Preview"
                    >
                        <Eye size={18} />
                    </button>
                    <button
                        onClick={() => onEdit(fileData.id)}
                        className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white shadow-lg transition-all"
                        title="Edit Template"
                    >
                        <Edit2 size={18} />
                    </button>
                </div>

                <div className="absolute top-2 right-2 z-20">
                    <button
                        onClick={() => onRemove(fileData.id)}
                        className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg text-white backdrop-blur-sm transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="absolute top-2 left-2 group-hover:hidden">
                    {!fileData.isEdited && (
                        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${fileData.uploadMode === 'template' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                            {fileData.uploadMode}
                        </div>
                    )}
                </div>
            </div>

            {/* Controls Section */}
            <div className="space-y-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => onToggleMode(fileData.id, 'normal')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${fileData.uploadMode === 'normal' ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                    >
                        Normal
                    </button>
                    <button
                        onClick={() => onToggleMode(fileData.id, 'template')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${fileData.uploadMode === 'template' ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                    >
                        Template
                    </button>
                </div>

                <div className="space-y-2">
                    <select
                        value={fileData.categoryId}
                        onChange={(e) => onUpdateField('categoryId', e.target.value)}
                        className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    >
                        <option value="">Select Category</option>
                        {categories.map(c => (
                            <option key={c.categoryId} value={c.categoryId}>{c.categoriesName}</option>
                        ))}
                    </select>

                    <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg border border-gray-800">
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={fileData.isScheduled}
                                    onChange={(e) => onUpdateField('isScheduled', e.target.checked)}
                                    className="hidden"
                                />
                                <div className={`w-8 h-4 rounded-full transition-colors relative ${fileData.isScheduled ? 'bg-blue-600' : 'bg-gray-700'}`}>
                                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-all ${fileData.isScheduled ? 'translate-x-4' : ''}`} />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Schedule</span>
                            </label>
                        </div>
                        {fileData.isScheduled && (
                            <input
                                type="datetime-local"
                                value={fileData.scheduleDate}
                                onChange={(e) => onUpdateField('scheduleDate', e.target.value)}
                                className="bg-transparent text-white text-[10px] outline-none max-w-[120px]"
                            />
                        )}
                    </div>
                </div>

                <input
                    type="text"
                    placeholder="Add caption..."
                    value={fileData.caption}
                    onChange={(e) => onUpdateField('caption', e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
            </div>
        </div>
    );
};

export default MediaCard;
