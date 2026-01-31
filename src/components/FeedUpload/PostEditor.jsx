import React, { useState } from 'react';
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
        <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="h-16 border-b border-gray-800 flex items-center justify-between px-8 shrink-0 bg-gray-900/50 backdrop-blur-md">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Sliders size={20} className="text-blue-400" />
                        </div>
                        Post Editor
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-all">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-black/40">
                    {/* Preview Area */}
                    <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
                        <div
                            className="relative shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-all duration-300 overflow-hidden bg-gray-950 flex items-center justify-center max-w-full max-h-full rounded-xl"
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
                            <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] text-white/90 border border-white/10 uppercase tracking-[0.2em] font-black shadow-2xl">
                                {editMetadata.crop.ratio} • {editMetadata.filters.preset}
                            </div>
                        </div>
                    </div>

                    {/* Controls Sidebar */}
                    <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-800 flex flex-col bg-gray-900 shadow-2xl z-10">
                        {/* Tab Switcher */}
                        <div className="flex p-2 bg-gray-900/50 border-b border-gray-800">
                            <button
                                onClick={() => setActiveTab('crop')}
                                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2 ${activeTab === 'crop' ? 'text-white bg-blue-600 shadow-lg shadow-blue-900/40' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
                            >
                                <Crop size={16} />
                                Crop
                            </button>
                            <button
                                onClick={() => setActiveTab('filter')}
                                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2 ${activeTab === 'filter' ? 'text-white bg-purple-600 shadow-lg shadow-purple-900/40' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
                            >
                                <Sliders size={16} />
                                Filters
                            </button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto">
                            {activeTab === 'crop' ? (
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Aspect Ratio</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {CROP_RATIOS.map(ratio => (
                                            <button
                                                key={ratio}
                                                onClick={() => updateCrop({ ratio })}
                                                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border ${editMetadata.crop.ratio === ratio ? 'bg-blue-600 border-blue-500 text-white shadow-xl scale-105' : 'bg-gray-800/50 border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'}`}
                                            >
                                                {ratio}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="space-y-4 pt-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Zoom Level</label>
                                            <span className="text-[10px] font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">{editMetadata.crop.zoomLevel}x</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="5"
                                            step="0.1"
                                            value={editMetadata.crop.zoomLevel}
                                            onChange={(e) => updateCrop({ zoomLevel: parseFloat(e.target.value) })}
                                            className="w-full h-1.5 bg-gray-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Filter Presets</h3>
                                    <div className="grid grid-cols-1 gap-2.5 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {FILTER_PRESETS.map(preset => (
                                            <button
                                                key={preset}
                                                onClick={() => updateFilter(preset)}
                                                className={`py-4 px-5 rounded-2xl text-xs font-bold transition-all border flex items-center justify-between group ${editMetadata.filters.preset === preset ? 'bg-purple-600 border-purple-500 text-white shadow-xl translate-x-1' : 'bg-gray-800/50 border-gray-700 text-gray-500 hover:border-purple-500/50 hover:bg-gray-800'}`}
                                            >
                                                <span className="capitalize tracking-wide">{preset}</span>
                                                {editMetadata.filters.preset === preset ? (
                                                    <Check size={16} className="text-white" />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full border-2 border-gray-700 group-hover:border-purple-500/50" />
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
                <div className="h-24 border-t border-gray-800 bg-gray-900 flex items-center justify-end px-10 gap-6 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-2xl text-gray-500 hover:text-white hover:bg-gray-800 transition-all font-black uppercase text-[10px] tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-blue-900/40 flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95"
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
