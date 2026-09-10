import React, { useState, useEffect } from 'react';
import { X, Save, Crop, Sliders, Check, Palette, RotateCcw, Sparkles, Sun, Contrast, Droplets, Flame, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

const CROP_RATIOS = ["original", "1:1", "4:5", "16:9", "9:16"];

const FILTER_PRESETS = [
    { id: "original", label: "Original", tone: "Natural" },
    { id: "clarendon", label: "Clarendon", tone: "High Contrast" },
    { id: "juno", label: "Juno", tone: "Warm Vivid" },
    { id: "ludwig", label: "Ludwig", tone: "Rich Depth" },
    { id: "lark", label: "Lark", tone: "Bright Cool" },
    { id: "crema", label: "Crema", tone: "Vintage Cream" },
    { id: "gingham", label: "Gingham", tone: "Retro Matte" },
    { id: "aden", label: "Aden", tone: "Soft Pastel" },
    { id: "reyes", label: "Reyes", tone: "Warm Desert" },
    { id: "slumber", label: "Slumber", tone: "Moody Muted" },
    { id: "perpetua", label: "Perpetua", tone: "Earthy Green" },
    { id: "moon", label: "Moon", tone: "Monochrome" }
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

const DEFAULT_ADJUSTMENTS = {
    brightness: 100, // %
    contrast: 100,   // %
    saturate: 100,   // %
    sepia: 0,        // %
    hueRotate: 0,    // deg
    temperature: 0   // -50 to 50
};

const QUICK_TONE_PRESETS = [
    { name: "Normal", adjustments: { ...DEFAULT_ADJUSTMENTS } },
    { name: "Vivid Glow", adjustments: { brightness: 108, contrast: 115, saturate: 135, sepia: 0, hueRotate: 0, temperature: 10 } },
    { name: "Golden Hour", adjustments: { brightness: 105, contrast: 108, saturate: 120, sepia: 18, hueRotate: -10, temperature: 25 } },
    { name: "Cool Minimal", adjustments: { brightness: 102, contrast: 105, saturate: 85, sepia: 0, hueRotate: 15, temperature: -20 } },
    { name: "Dramatic Noir", adjustments: { brightness: 95, contrast: 135, saturate: 0, sepia: 0, hueRotate: 0, temperature: 0 } },
    { name: "Warm Vintage", adjustments: { brightness: 106, contrast: 95, saturate: 90, sepia: 30, hueRotate: -15, temperature: 30 } }
];

const sanitizeAdjustments = (adj = {}) => {
    return {
        brightness: (adj.brightness && adj.brightness >= 20) ? adj.brightness : 100,
        contrast: (adj.contrast && adj.contrast >= 20) ? adj.contrast : 100,
        saturate: (adj.saturate && adj.saturate >= 20) ? adj.saturate : (adj.saturation && adj.saturation >= 20 ? adj.saturation : 100),
        sepia: adj.sepia || 0,
        hueRotate: adj.hueRotate || 0,
        temperature: adj.temperature || 0
    };
};

const PostEditor = ({ fileData, onClose, onSave }) => {
    const [editMetadata, setEditMetadata] = useState(() => {
        const initial = fileData?.editMetadata || {};
        return {
            crop: initial.crop || { ratio: "original", zoomLevel: 1, position: { x: 0, y: 0 } },
            filters: {
                preset: initial.filters?.preset || "original",
                adjustments: sanitizeAdjustments(initial.filters?.adjustments)
            }
        };
    });

    const [activeTab, setActiveTab] = useState('color'); // 'color' | 'filter' | 'crop'

    const handleSave = () => {
        onSave(fileData.id, editMetadata);
        onClose();
    };

    // Intercept browser back button so it closes modal safely
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

    const updateFilterPreset = (preset) => {
        setEditMetadata(prev => ({
            ...prev,
            filters: {
                ...prev.filters,
                preset
            }
        }));
    };

    const updateAdjustment = (field, val) => {
        setEditMetadata(prev => ({
            ...prev,
            filters: {
                ...prev.filters,
                adjustments: {
                    ...prev.filters.adjustments,
                    [field]: val
                }
            }
        }));
    };

    const applyQuickTone = (toneAdjustments) => {
        setEditMetadata(prev => ({
            ...prev,
            filters: {
                ...prev.filters,
                adjustments: { ...toneAdjustments }
            }
        }));
    };

    const resetAdjustments = () => {
        setEditMetadata(prev => ({
            ...prev,
            filters: {
                preset: 'original',
                adjustments: { ...DEFAULT_ADJUSTMENTS }
            }
        }));
    };

    const getAspectRatioStyle = () => {
        if (editMetadata.crop.ratio === 'original' && fileData?.dimensions?.ratio) {
            return { aspectRatio: `${fileData.dimensions.ratio}` };
        }
        if (editMetadata.crop.ratio !== 'original') {
            return { aspectRatio: editMetadata.crop.ratio.replace(':', '/') };
        }
        return { aspectRatio: '9/16' };
    };

    // Compute active CSS filter by merging preset and sliders
    const computeFilterString = () => {
        const parts = [];
        const preset = editMetadata.filters.preset;
        if (FILTER_STYLES[preset]) {
            parts.push(FILTER_STYLES[preset]);
        }
        const adj = sanitizeAdjustments(editMetadata.filters.adjustments);
        if (adj.brightness !== 100) parts.push(`brightness(${adj.brightness}%)`);
        if (adj.contrast !== 100) parts.push(`contrast(${adj.contrast}%)`);
        if (adj.saturate !== 100) parts.push(`saturate(${adj.saturate}%)`);
        if (adj.sepia !== 0) parts.push(`sepia(${adj.sepia}%)`);
        if (adj.hueRotate !== 0) parts.push(`hue-rotate(${adj.hueRotate}deg)`);
        return parts.join(' ');
    };

    const isVideo = fileData?.file?.type?.startsWith('video');
    const adjustments = editMetadata.filters.adjustments || DEFAULT_ADJUSTMENTS;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 md:p-6 z-[120] animate-in fade-in duration-300">
            
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="h-18 border-b border-slate-100 flex items-center justify-between px-6 md:px-8 shrink-0 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl shadow-md shadow-purple-500/20 text-white">
                            <Palette size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                Color & Visual Editor
                                <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Enhanced</span>
                            </h2>
                            <p className="text-xs text-slate-400 truncate max-w-xs md:max-w-md">{fileData?.file?.name}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={resetAdjustments}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            title="Reset all filters and adjustments"
                        >
                            <RotateCcw size={13} />
                            <span>Reset</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body: Preview + Controls */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-950">
                    
                    {/* Left Preview Screen */}
                    <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                        <div
                            className="relative shadow-2xl transition-all duration-300 overflow-hidden bg-black flex items-center justify-center max-w-full max-h-[580px] rounded-2xl border-4 border-slate-800"
                            style={{
                                ...getAspectRatioStyle(),
                                height: '100%'
                            }}
                        >
                            {isVideo ? (
                                <video
                                    src={fileData.preview}
                                    className="w-full h-full object-cover"
                                    style={{
                                        filter: computeFilterString(),
                                        transform: `scale(${editMetadata.crop.zoomLevel})`
                                    }}
                                    controls
                                    muted
                                    autoPlay
                                    loop
                                />
                            ) : (
                                <img
                                    src={fileData.preview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    style={{
                                        filter: computeFilterString(),
                                        transform: `scale(${editMetadata.crop.zoomLevel})`
                                    }}
                                />
                            )}

                            {/* Applied preset badge */}
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white border border-white/10 font-bold tracking-wider uppercase">
                                {editMetadata.filters.preset} • {editMetadata.crop.ratio}
                            </div>
                        </div>
                    </div>

                    {/* Right Controls Sidebar */}
                    <div className="w-full md:w-[380px] bg-white border-t md:border-t-0 md:border-l border-slate-100 flex flex-col shrink-0">
                        
                        {/* Tab Switcher */}
                        <div className="flex p-2 bg-slate-50 border-b border-slate-100 gap-1.5 shrink-0">
                            <button
                                onClick={() => setActiveTab('color')}
                                className={clsx(
                                    "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border",
                                    activeTab === 'color'
                                        ? "bg-white text-purple-700 border-purple-200 shadow-sm"
                                        : "text-slate-500 border-transparent hover:text-slate-800"
                                )}
                            >
                                <Palette size={14} />
                                <span>Color Tone</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('filter')}
                                className={clsx(
                                    "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border",
                                    activeTab === 'filter'
                                        ? "bg-white text-blue-700 border-blue-200 shadow-sm"
                                        : "text-slate-500 border-transparent hover:text-slate-800"
                                )}
                            >
                                <Sparkles size={14} />
                                <span>Filters</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('crop')}
                                className={clsx(
                                    "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border",
                                    activeTab === 'crop'
                                        ? "bg-white text-slate-900 border-slate-300 shadow-sm"
                                        : "text-slate-500 border-transparent hover:text-slate-800"
                                )}
                            >
                                <Crop size={14} />
                                <span>Aspect</span>
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            
                            {/* TAB 1: COLOR TONE ADJUSTMENTS */}
                            {activeTab === 'color' && (
                                <div className="space-y-6">
                                    {/* Quick Tones */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                                            Quick Color Moods
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {QUICK_TONE_PRESETS.map((qt, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => applyQuickTone(qt.adjustments)}
                                                    className="py-2 px-2.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-[11px] font-semibold text-slate-700 hover:text-purple-700 transition-all text-center truncate"
                                                >
                                                    {qt.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sliders */}
                                    <div className="space-y-4 pt-2 border-t border-slate-100">
                                        
                                        {/* Brightness */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                                    <Sun size={13} className="text-amber-500" /> Brightness
                                                </span>
                                                <span className="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                                                    {adjustments.brightness}%
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="50"
                                                max="160"
                                                value={adjustments.brightness}
                                                onChange={(e) => updateAdjustment('brightness', parseInt(e.target.value, 10))}
                                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                            />
                                        </div>

                                        {/* Contrast */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                                    <Contrast size={13} className="text-blue-500" /> Contrast
                                                </span>
                                                <span className="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                                                    {adjustments.contrast}%
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="50"
                                                max="160"
                                                value={adjustments.contrast}
                                                onChange={(e) => updateAdjustment('contrast', parseInt(e.target.value, 10))}
                                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                            />
                                        </div>

                                        {/* Saturation */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                                    <Droplets size={13} className="text-pink-500" /> Saturation
                                                </span>
                                                <span className="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                                                    {adjustments.saturate}%
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="200"
                                                value={adjustments.saturate}
                                                onChange={(e) => updateAdjustment('saturate', parseInt(e.target.value, 10))}
                                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                            />
                                        </div>

                                        {/* Warmth / Sepia */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                                    <Flame size={13} className="text-orange-500" /> Warm Sepia
                                                </span>
                                                <span className="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                                                    {adjustments.sepia}%
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={adjustments.sepia}
                                                onChange={(e) => updateAdjustment('sepia', parseInt(e.target.value, 10))}
                                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                            />
                                        </div>

                                        {/* Hue Shift */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                                    <RefreshCw size={13} className="text-teal-500" /> Hue Shift
                                                </span>
                                                <span className="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                                                    {adjustments.hueRotate}°
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="-180"
                                                max="180"
                                                value={adjustments.hueRotate}
                                                onChange={(e) => updateAdjustment('hueRotate', parseInt(e.target.value, 10))}
                                                className="w-full h-1.5 bg-gradient-to-r from-red-400 via-green-400 to-blue-400 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                            />
                                        </div>

                                    </div>
                                </div>
                            )}

                            {/* TAB 2: FILTER PRESETS */}
                            {activeTab === 'filter' && (
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                        Creative Photo Filters
                                    </label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {FILTER_PRESETS.map(p => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => updateFilterPreset(p.id)}
                                                className={clsx(
                                                    "py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all",
                                                    editMetadata.filters.preset === p.id
                                                        ? "bg-purple-50 border-purple-400 text-purple-900 shadow-sm"
                                                        : "bg-white border-slate-200 text-slate-700 hover:border-purple-200 hover:bg-purple-50/20"
                                                )}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className={clsx(
                                                        "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center",
                                                        editMetadata.filters.preset === p.id ? "border-purple-600 bg-purple-600" : "border-slate-300"
                                                    )}>
                                                        {editMetadata.filters.preset === p.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                    </div>
                                                    <span>{p.label}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium">{p.tone}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: ASPECT RATIO & ZOOM */}
                            {activeTab === 'crop' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                                            Frame Ratio
                                        </label>
                                        <div className="grid grid-cols-2 gap-2.5">
                                            {CROP_RATIOS.map(ratio => (
                                                <button
                                                    key={ratio}
                                                    type="button"
                                                    onClick={() => updateCrop({ ratio })}
                                                    className={clsx(
                                                        "py-3 px-3 rounded-xl text-xs font-bold transition-all border text-center uppercase",
                                                        editMetadata.crop.ratio === ratio
                                                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                                                    )}
                                                >
                                                    {ratio}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-3 border-t border-slate-100">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-slate-700">Zoom Scaling</span>
                                            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[10px]">
                                                {editMetadata.crop.zoomLevel}x
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="3"
                                            step="0.05"
                                            value={editMetadata.crop.zoomLevel}
                                            onChange={(e) => updateCrop({ zoomLevel: parseFloat(e.target.value) })}
                                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Bottom Actions */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 shrink-0">
                            <button
                                onClick={onClose}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all hover:scale-105"
                            >
                                <Save size={15} />
                                <span>Save Changes</span>
                            </button>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default PostEditor;
