import React, { useState, useEffect } from 'react';
import { X, Save, Crop, Sliders, Check } from 'lucide-react';

const CROP_RATIOS = ["original", "1:1", "4:5", "16:9", "9:16"];
const FILTER_PRESETS = [
    "original", "aden", "clarendon", "crema", "gingham", "juno",
    "lark", "ludwig", "moon", "perpetua", "reyes", "slumber"
];

const FILTER_STYLES = {
    original: '',
    aden: 'hue-rotate(-20deg) contrast(0.9) saturate(0.85) brightness(1.2)',
    clarendon: 'contrast(1.2) saturate(1.35)',
    crema: 'sepia(0.5) contrast(1.2) saturate(0.9) hue-rotate(-20deg)',
    gingham: 'hue-rotate(150deg) sepia(0.2) contrast(0.9)',
    juno: 'saturate(1.2) contrast(1.1) brightness(1.1)',
    lark: 'contrast(0.9)',
    ludwig: 'saturate(1.1) contrast(1.1)',
    moon: 'grayscale(1) contrast(1.1) brightness(1.1)',
    perpetua: 'saturate(1.1)',
    reyes: 'sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)',
    slumber: 'saturate(0.6) brightness(1.05)'
};

const PostEditor = ({ fileData, onClose, onSave }) => {
    const [editMetadata, setEditMetadata] = useState(fileData.editMetadata || {
        crop: { ratio: "original", zoomLevel: 1, position: { x: 0, y: 0 } },
        filters: { preset: "original", adjustments: {} }
    });

    const [activeTab, setActiveTab] = useState('crop');

    const handleSave = () => {
        onSave(fileData.id, editMetadata);
        onClose();
    };

    // Intercept browser back button so it closes the modal, not navigates away
    useEffect(() => {
        window.history.pushState({ editorOpen: true }, '');
        const handlePopState = () => { onClose(); };
        window.addEventListener('popstate', handlePopState);
        return () => { window.removeEventListener('popstate', handlePopState); };
    }, [onClose]);

    const updateCrop = (updates) => {
        setEditMetadata(prev => ({
            ...prev,
            crop: { ...prev.crop, ...updates }
        }));
    };

    const updateFilter = (preset) => {
        setEditMetadata(prev => ({
            ...prev,
            filters: { ...prev.filters, preset }
        }));
    };

    const getAspectRatioStyle = () => {
        if (editMetadata.crop.ratio === 'original' && fileData.dimensions?.ratio) {
            return { aspectRatio: `${fileData.dimensions.ratio}` };
        }
        if (editMetadata.crop.ratio !== 'original') {
            return { aspectRatio: editMetadata.crop.ratio.replace(':', '/') };
        }
        return { aspectRatio: '3/4' }; // Fallback
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[110] animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="h-20 border-b border-gray-100 flex items-center justify-between px-10 shrink-0 bg-white/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20">
                            <Sliders size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Post Editor</h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{fileData.file.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-all border border-transparent hover:border-gray-100">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-gray-50/50">
                    {/* Preview Area */}
                    <div className="flex-1 flex items-center justify-center p-10 relative overflow-hidden">
                        <div
                            className="relative shadow-2xl transition-all duration-500 overflow-hidden bg-black flex items-center justify-center max-w-full max-h-full rounded-2xl border-4 border-white/20"
                            style={{
                                ...getAspectRatioStyle(),
                                height: '100%',
                            }}
                        >
                            {fileData.file.type.startsWith('video') ? (
                                <video
                                    src={fileData.preview}
                                    className="w-full h-full object-cover"
                                    style={{
                                        filter: FILTER_STYLES[editMetadata.filters.preset],
                                        transform: `scale(${editMetadata.crop.zoomLevel})`
                                    }}
                                    controls={false} muted autoPlay loop
                                />
                            ) : (
                                <img
                                    src={fileData.preview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    style={{
                                        filter: FILTER_STYLES[editMetadata.filters.preset],
                                        transform: `scale(${editMetadata.crop.zoomLevel})`
                                    }}
                                />
                            )}

                            {/* Overlay info */}
                            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] text-gray-900 border border-white/20 uppercase tracking-[0.2em] font-black shadow-xl">
                                {editMetadata.crop.ratio} • {editMetadata.filters.preset}
                            </div>
                        </div>
                    </div>

                    {/* Controls Sidebar */}
                    <div className="w-full md:w-[360px] border-t md:border-t-0 md:border-l border-gray-100 flex flex-col bg-white z-10 shadow-[-20px_0_60px_rgba(0,0,0,0.02)]">
                        {/* Tab Switcher */}
                        <div className="flex p-3 bg-gray-50/30 border-b border-gray-100 gap-2">
                            <button
                                onClick={() => setActiveTab('crop')}
                                className={clsx(
                                    "flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl flex items-center justify-center gap-2 border",
                                    activeTab === 'crop'
                                        ? "text-white bg-gray-900 border-gray-900 shadow-xl"
                                        : "text-gray-500 border-transparent hover:bg-white hover:border-gray-200"
                                )}
                            >
                                <Crop size={16} />
                                Aspect
                            </button>
                            <button
                                onClick={() => setActiveTab('filter')}
                                className={clsx(
                                    "flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl flex items-center justify-center gap-2 border",
                                    activeTab === 'filter'
                                        ? "text-white bg-purple-600 border-purple-500 shadow-xl shadow-purple-500/20"
                                        : "text-gray-500 border-transparent hover:bg-white hover:border-gray-200"
                                )}
                            >
                                <Sliders size={16} />
                                Filters
                            </button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                            {activeTab === 'crop' ? (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Aspect Ratio</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {CROP_RATIOS.map(ratio => (
                                                <button
                                                    key={ratio}
                                                    onClick={() => updateCrop({ ratio })}
                                                    className={clsx(
                                                        "py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                                        editMetadata.crop.ratio === ratio
                                                            ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/20 scale-105'
                                                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:text-gray-900'
                                                    )}
                                                >
                                                    {ratio}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Zoom Level</label>
                                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">{editMetadata.crop.zoomLevel}x</span>
                                        </div>
                                        <div className="relative flex items-center h-4">
                                            <input
                                                type="range"
                                                min="0.1"
                                                max="5"
                                                step="0.1"
                                                value={editMetadata.crop.zoomLevel}
                                                onChange={(e) => updateCrop({ zoomLevel: parseFloat(e.target.value) })}
                                                className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Filter Presets</h3>
                                    <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {FILTER_PRESETS.map(preset => (
                                            <button
                                                key={preset}
                                                onClick={() => updateFilter(preset)}
                                                className={clsx(
                                                    "py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-between group",
                                                    editMetadata.filters.preset === preset
                                                        ? 'bg-purple-600 border-purple-500 text-white shadow-xl shadow-purple-500/20 translate-x-1'
                                                        : 'bg-white border-gray-100 text-gray-500 hover:border-purple-300 hover:bg-purple-50/10'
                                                )}
                                            >
                                                <span>{preset}</span>
                                                {editMetadata.filters.preset === preset ? (
                                                    <Check size={16} className="text-white" />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full border-2 border-gray-200 group-hover:border-purple-300" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="h-24 border-t border-gray-100 bg-white flex items-center justify-end px-10 gap-6 shrink-0 z-20 shadow-[0_-20px_60px_rgba(0,0,0,0.02)]">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all font-black uppercase text-[10px] tracking-widest"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-12 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95"
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostEditor;
