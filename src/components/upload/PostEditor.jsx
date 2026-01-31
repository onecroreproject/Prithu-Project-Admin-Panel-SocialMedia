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
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 md:p-8">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sliders size={20} className="text-blue-400" />
                        Edit Post
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Preview Area */}
                    <div className="flex-1 bg-black flex items-center justify-center p-8 relative overflow-hidden">
                        <div
                            className="relative shadow-2xl transition-all duration-300 overflow-hidden bg-gray-900 flex items-center justify-center max-w-full max-h-full"
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
                            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] text-white/90 border border-white/10 uppercase tracking-widest font-bold">
                                {editMetadata.crop.ratio} • {editMetadata.filters.preset}
                            </div>
                        </div>
                    </div>

                    {/* Controls Sidebar */}
                    <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-800 flex flex-col bg-gray-900 overflow-y-auto">
                        {/* Tab Switcher */}
                        <div className="flex border-b border-gray-800">
                            <button
                                onClick={() => setActiveTab('crop')}
                                className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'crop' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Crop size={18} />
                                Crop
                            </button>
                            <button
                                onClick={() => setActiveTab('filter')}
                                className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'filter' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Sliders size={18} />
                                Filters
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {activeTab === 'crop' ? (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Aspect Ratio</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {CROP_RATIOS.map(ratio => (
                                            <button
                                                key={ratio}
                                                onClick={() => updateCrop({ ratio })}
                                                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${editMetadata.crop.ratio === ratio ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}
                                            >
                                                {ratio}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="pt-4">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Zoom Level</label>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="5"
                                            step="0.1"
                                            value={editMetadata.crop.zoomLevel}
                                            onChange={(e) => updateCrop({ zoomLevel: parseFloat(e.target.value) })}
                                            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-600 font-mono mt-1">
                                            <span>0.1x</span>
                                            <span>{editMetadata.crop.zoomLevel}x</span>
                                            <span>5.0x</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Presets</h3>
                                    <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {FILTER_PRESETS.map(preset => (
                                            <button
                                                key={preset}
                                                onClick={() => updateFilter(preset)}
                                                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border flex items-center justify-between ${editMetadata.filters.preset === preset ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}
                                            >
                                                <span className="capitalize">{preset}</span>
                                                {editMetadata.filters.preset === preset && <Check size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="h-20 border-t border-gray-800 bg-gray-900/50 flex items-center justify-end px-8 gap-4 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all font-medium"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all"
                    >
                        <Save size={18} />
                        Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostEditor;
