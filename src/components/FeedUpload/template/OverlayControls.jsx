import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { clsx } from 'clsx';
import { X, Plus, Move, Maximize2, Type, Image as ImageIcon, Layers, CheckCircle, Play, Calendar } from 'lucide-react';

const directions = [
    'top', 'top-right', 'right', 'bottom-right',
    'bottom', 'bottom-left', 'left', 'top-left', 'none'
];

const OverlayControls = React.memo(({ overlay, onUpdate }) => {
    // Local state for debounced numeric inputs
    const [localX, setLocalX] = useState(overlay?.xPercent || 0);
    const [localY, setLocalY] = useState(overlay?.yPercent || 0);
    const [localW, setLocalW] = useState(overlay?.wPercent || 0);
    const [localH, setLocalH] = useState(overlay?.hPercent || 0);

    // Sync local state with incoming props (when dragging on canvas)
    useEffect(() => {
        setLocalX(overlay?.xPercent || 0);
        setLocalY(overlay?.yPercent || 0);
        setLocalW(overlay?.wPercent || 0);
        setLocalH(overlay?.hPercent || 0);
    }, [overlay?.xPercent, overlay?.yPercent, overlay?.wPercent, overlay?.hPercent]);

    // Debounced update function
    const debouncedUpdate = useCallback(
        debounce((id, updates) => {
            onUpdate(id, updates);
        }, 300),
        [onUpdate]
    );

    if (!overlay) return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <Layers className="text-gray-300 mb-4" size={32} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select an element to refine its properties</p>
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
            <div className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                    {overlay.type === 'avatar' && <ImageIcon size={20} />}
                    {overlay.type === 'logo' && <Plus size={20} />}
                    {overlay.type === 'username' && <Type size={20} />}
                    {overlay.type === 'calendar' && <Calendar size={20} />}
                </div>
                <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none">Core Metadata</h3>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5">{overlay.type} configuration</p>
                </div>
            </div>

            {/* Position & Size */}
            <div className="space-y-8">
                <div className="flex items-center gap-3">
                    <Move className="text-blue-600" size={14} />
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Spatial Positioning</h4>
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Horizontal %</label>
                        <input
                            type="number" className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 text-xs font-black outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-sm"
                            value={localX}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setLocalX(val);
                                debouncedUpdate(overlay.id, { xPercent: val });
                            }}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Vertical %</label>
                        <input
                            type="number" className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 text-xs font-black outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-sm"
                            value={localY}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setLocalY(val);
                                debouncedUpdate(overlay.id, { yPercent: val });
                            }}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Width %</label>
                        <input
                            type="number" className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 text-xs font-black outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-sm"
                            value={localW}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setLocalW(val);
                                debouncedUpdate(overlay.id, { wPercent: val });
                            }}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Height %</label>
                        <input
                            type="number" className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 text-xs font-black outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-sm"
                            value={localH}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setLocalH(val);
                                debouncedUpdate(overlay.id, { hPercent: val });
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Content (For text overlays) */}
            {overlay.type === 'username' && (
                <div className="space-y-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <Type className="text-blue-600" size={14} />
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Text Settings</h4>
                    </div>
                    <input
                        type="text"
                        className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-5 text-gray-900 text-xs font-black outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 shadow-sm"
                        value={overlay.text || ''}
                        onChange={(e) => handleChange('text', e.target.value)}
                        placeholder="ENTER LABEL..."
                    />
                </div>
            )}

            {/* Shape / Geometry Settings */}
            {(overlay.type === 'avatar' || overlay.type === 'calendar') && (
                <div className="space-y-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <Maximize2 className="text-blue-600" size={14} />
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Frame Geometry</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {['round', 'square', 'rectangle'].map((shape) => (
                            <button
                                key={shape}
                                onClick={() => handleChange('shape', shape)}
                                className={clsx(
                                    "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                    (overlay.shape || (overlay.type === 'calendar' ? 'rectangle' : 'round')) === shape
                                        ? "bg-gray-900 text-white border-gray-900 shadow-xl scale-105"
                                        : "bg-white border-gray-100 text-gray-400 hover:text-gray-900 hover:border-gray-300 shadow-sm"
                                )}
                            >
                                {shape}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Avatar Specific Settings (Soft Edges) */}
            {overlay.type === 'avatar' && (
                <div className="space-y-10 pt-4 border-t border-gray-100">

                    {/* SOFT EDGES / FEATHER MODE */}
                    <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-8 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-blue-100 rounded-xl">
                                    <div className="w-3.5 h-3.5 bg-blue-600 rounded-full blur-[1px]" />
                                </div>
                                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Feather Brush</h4>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={overlay.avatarConfig?.softEdgeConfig?.enabled || false}
                                    onChange={(e) => handleSoftEdgeChange('enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-gray-200 border border-transparent rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-7 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md"></div>
                            </label>
                        </div>

                        {overlay.avatarConfig?.softEdgeConfig?.enabled && (
                            <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
                                <div className="space-y-5">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Brush Scale</label>
                                        <span className="text-[9px] font-black text-blue-600">{overlay.avatarConfig.softEdgeConfig.brushSize}%</span>
                                    </div>
                                    <input
                                        type="range" min="5" max="100"
                                        value={overlay.avatarConfig.softEdgeConfig.brushSize || 20}
                                        onChange={(e) => handleSoftEdgeChange('brushSize', parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                                <div className="space-y-5">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Master Opacity</label>
                                        <span className="text-[9px] font-black text-blue-600">{Math.round((overlay.avatarConfig.softEdgeConfig.opacity || 1) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.01"
                                        value={overlay.avatarConfig.softEdgeConfig.opacity || 1}
                                        onChange={(e) => handleSoftEdgeChange('opacity', parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                                <button
                                    onClick={() => handleSoftEdgeChange('strokes', [])}
                                    className="w-full py-5 bg-white hover:bg-red-600 text-red-500 hover:text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all border border-red-100 hover:border-red-600 shadow-sm"
                                >
                                    Clear Canvas Marks
                                </button>
                                <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest text-center leading-relaxed">
                                    Interaction: Drag over preview to mask edges.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Calendar Specific Settings */}
            {overlay.type === 'calendar' && (
                <div className="space-y-6 pt-4 border-t border-gray-100">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block ml-1">Header Color</label>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                        <div
                            className="w-12 h-12 rounded-xl border border-gray-100 shadow-inner shrink-0"
                            style={{ backgroundColor: overlay.calendarConfig?.headerColor || '#E54B35' }}
                        />
                        <input
                            type="color"
                            value={overlay.calendarConfig?.headerColor || '#E54B35'}
                            onChange={(e) => handleChange('calendarConfig', { ...overlay.calendarConfig, headerColor: e.target.value })}
                            className="flex-1 bg-transparent h-10 cursor-pointer outline-none border-none p-0"
                        />
                    </div>
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block ml-1">Body Color</label>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                        <div
                            className="w-12 h-12 rounded-xl border border-gray-100 shadow-inner shrink-0"
                            style={{ backgroundColor: overlay.calendarConfig?.bodyColor || '#F9F9F9' }}
                        />
                        <input
                            type="color"
                            value={overlay.calendarConfig?.bodyColor || '#F9F9F9'}
                            onChange={(e) => handleChange('calendarConfig', { ...overlay.calendarConfig, bodyColor: e.target.value })}
                            className="flex-1 bg-transparent h-10 cursor-pointer outline-none border-none p-0"
                        />
                    </div>
                </div>
            )}

            {/* Animation */}
            <div className="space-y-8 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Play className="text-blue-600" size={14} />
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Motion Profile</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={overlay.animation?.enabled}
                            onChange={(e) => handleAnimationChange('enabled', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 border border-transparent rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-7 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md"></div>
                    </label>
                </div>

                {overlay.animation?.enabled && (
                    <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-8 animate-in slide-in-from-top-4 duration-500 shadow-sm">
                        <div className="space-y-4">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Entry Vector</label>
                            <div className="relative">
                                <select
                                    value={overlay.animation.direction}
                                    onChange={(e) => handleAnimationChange('direction', e.target.value)}
                                    className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 text-xs font-black outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                                >
                                    {directions.map(d => (
                                        <option key={d} value={d} className="bg-white">{d.toUpperCase()}</option>
                                    ))}
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <Move size={14} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Duration Profile</label>
                                <span className="text-[9px] font-black text-blue-600">{overlay.animation.speed}s</span>
                            </div>
                            <input
                                type="range" min="0.1" max="5" step="0.1"
                                value={overlay.animation.speed}
                                onChange={(e) => handleAnimationChange('speed', parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Visibility */}
            <div className="pt-8 border-t border-gray-100">
                <button
                    onClick={() => handleChange('visible', !overlay.visible)}
                    className={clsx(
                        "w-full py-5 rounded-3xl flex items-center justify-center gap-4 transition-all border-2",
                        overlay.visible
                            ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20 active:scale-95"
                            : "bg-white border-gray-100 text-gray-400 grayscale hover:border-gray-300"
                    )}
                >
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{overlay.visible ? 'ELEMENT ACTIVE' : 'ELEMENT DISABLED'}</span>
                </button>
            </div>

        </div>
    );
});

export default OverlayControls;
