import React from 'react';
import { clsx } from 'clsx';
import { X, Plus, Move, Maximize2, Type, Image as ImageIcon, Layers, CheckCircle, Play } from 'lucide-react';

const directions = [
    'top', 'top-right', 'right', 'bottom-right',
    'bottom', 'bottom-left', 'left', 'top-left', 'none'
];

const OverlayControls = ({ overlay, onUpdate }) => {
    if (!overlay) return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-black/20 rounded-3xl border border-dashed border-white/10">
            <Layers className="text-gray-700 mb-4" size={32} />
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Select an element to refine its properties</p>
        </div>
    );

    const handleChange = (key, value) => {
        onUpdate(overlay.id, { [key]: value });
    };

    const handleAnimationChange = (key, value) => {
        onUpdate(overlay.id, {
            animation: {
                ...overlay.animation,
                [key]: value
            }
        });
    };

    const handleAvatarConfigChange = (key, value) => {
        onUpdate(overlay.id, {
            avatarConfig: {
                ...overlay.avatarConfig,
                [key]: value
            }
        });
    };

    const handleSoftEdgeChange = (key, value) => {
        const currentSoftEdge = overlay.avatarConfig?.softEdgeConfig || {
            enabled: false,
            brushSize: 20,
            blurStrength: 10,
            opacity: 1,
            strokes: []
        };
        handleAvatarConfigChange('softEdgeConfig', {
            ...currentSoftEdge,
            [key]: value
        });
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Type Header */}
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/5">
                <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-400 border border-blue-500/20">
                    {overlay.type === 'avatar' && <ImageIcon size={20} />}
                    {overlay.type === 'logo' && <Plus size={20} />}
                    {overlay.type === 'username' && <Type size={20} />}
                </div>
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Core Metadata</h3>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{overlay.type} configuration</p>
                </div>
            </div>

            {/* Position & Size */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Move className="text-blue-500" size={14} />
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Spatial Positioning</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em]">Horizontal %</label>
                        <input
                            type="number" className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-blue-500/50 transition-all"
                            value={overlay.xPercent.toFixed(1)}
                            onChange={(e) => handleChange('xPercent', parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em]">Vertical %</label>
                        <input
                            type="number" className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-blue-500/50 transition-all"
                            value={overlay.yPercent.toFixed(1)}
                            onChange={(e) => handleChange('yPercent', parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em]">Width %</label>
                        <input
                            type="number" className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-blue-500/50 transition-all"
                            value={overlay.wPercent || 0}
                            onChange={(e) => handleChange('wPercent', parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em]">Height %</label>
                        <input
                            type="number" className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-blue-500/50 transition-all"
                            value={overlay.hPercent || 0}
                            onChange={(e) => handleChange('hPercent', parseFloat(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            {/* Content (For text overlays) */}
            {overlay.type === 'username' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Type className="text-blue-500" size={14} />
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Text Settings</h4>
                    </div>
                    <input
                        type="text"
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white text-xs font-bold outline-none focus:border-blue-500/50 shadow-inner"
                        value={overlay.text || ''}
                        onChange={(e) => handleChange('text', e.target.value)}
                        placeholder="ENTER LABEL..."
                    />
                </div>
            )}

            {/* Avatar Specific Settings */}
            {overlay.type === 'avatar' && (
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Maximize2 className="text-blue-500" size={14} />
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Frame Geometry</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {['round', 'square', 'rectangle'].map((shape) => (
                                <button
                                    key={shape}
                                    onClick={() => handleChange('shape', shape)}
                                    className={clsx(
                                        "py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                        (overlay.shape || 'round') === shape
                                            ? "bg-white text-black border-white shadow-xl"
                                            : "bg-white/5 border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/10"
                                    )}
                                >
                                    {shape}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SOFT EDGES / FEATHER MODE */}
                    <div className="p-6 bg-black/40 rounded-[2rem] border border-white/10 space-y-6 shadow-inner">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-xl">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full blur-[2px]" />
                                </div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Feather Brush</h4>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={overlay.avatarConfig?.softEdgeConfig?.enabled || false}
                                    onChange={(e) => handleSoftEdgeChange('enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-12 h-6 bg-gray-800 border border-white/10 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:shadow-lg"></div>
                            </label>
                        </div>

                        {overlay.avatarConfig?.softEdgeConfig?.enabled && (
                            <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Brush Scale</label>
                                        <span className="text-[9px] font-mono text-blue-400">{overlay.avatarConfig.softEdgeConfig.brushSize}%</span>
                                    </div>
                                    <input
                                        type="range" min="5" max="100"
                                        value={overlay.avatarConfig.softEdgeConfig.brushSize || 20}
                                        onChange={(e) => handleSoftEdgeChange('brushSize', parseInt(e.target.value))}
                                        className="w-full h-1 bg-gray-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Master Opacity</label>
                                        <span className="text-[9px] font-mono text-blue-400">{Math.round((overlay.avatarConfig.softEdgeConfig.opacity || 1) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.01"
                                        value={overlay.avatarConfig.softEdgeConfig.opacity || 1}
                                        onChange={(e) => handleSoftEdgeChange('opacity', parseFloat(e.target.value))}
                                        className="w-full h-1 bg-gray-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={() => handleSoftEdgeChange('strokes', [])}
                                    className="w-full py-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all border border-red-500/20"
                                >
                                    Clear Canvas Marks
                                </button>
                                <p className="text-[8px] text-gray-600 italic text-center leading-relaxed">
                                    INTERACTION: DRAG OVER THE PREVIEW AVATAR TO MASK EDGES IN REAL-TIME.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Animation */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Play className="text-blue-500" size={14} />
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Motion Profile</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={overlay.animation?.enabled}
                            onChange={(e) => handleAnimationChange('enabled', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-800 border border-white/10 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:shadow-lg"></div>
                    </label>
                </div>

                {overlay.animation?.enabled && (
                    <div className="p-6 bg-black/40 rounded-[2rem] border border-white/10 space-y-6 animate-in slide-in-from-top-4 duration-300 shadow-inner">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Entry Vector</label>
                            <select
                                value={overlay.animation.direction}
                                onChange={(e) => handleAnimationChange('direction', e.target.value)}
                                className="w-full bg-black/60 border border-white/5 rounded-2xl px-5 py-4 text-white text-xs font-bold outline-none focus:border-blue-500/50 appearance-none"
                            >
                                {directions.map(d => (
                                    <option key={d} value={d} className="bg-gray-900">{d.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Duration Profile</label>
                                <span className="text-[9px] font-mono text-blue-400">{overlay.animation.speed}s</span>
                            </div>
                            <input
                                type="range" min="0.1" max="5" step="0.1"
                                value={overlay.animation.speed}
                                onChange={(e) => handleAnimationChange('speed', parseFloat(e.target.value))}
                                className="w-full h-1 bg-gray-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Visibility */}
            <div className="pt-4">
                <button
                    onClick={() => handleChange('visible', !overlay.visible)}
                    className={clsx(
                        "w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all border-2",
                        overlay.visible
                            ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/40"
                            : "bg-gray-800 border-gray-700 text-gray-500 grayscale"
                    )}
                >
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{overlay.visible ? 'ELEMENT ACTIVE' : 'ELEMENT DISABLED'}</span>
                </button>
            </div>

        </div>
    );
};

export default OverlayControls;
