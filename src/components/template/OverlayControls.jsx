import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

const directions = [
    'top', 'top-right', 'right', 'bottom-right',
    'bottom', 'bottom-left', 'left', 'top-left', 'none'
];

const OverlayControls = ({ overlay, onUpdate }) => {
    if (!overlay) return <div className="text-gray-500 text-center mt-10">Select an element to edit</div>;

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
        <div className="bg-gray-800 p-4 border-l border-gray-700 h-full overflow-y-auto custom-scrollbar">
            <h3 className="text-white font-semibold mb-4 border-b border-gray-700 pb-2">
                Edit {overlay.type.toUpperCase()}
            </h3>

            {/* Position & Size */}
            <div className="space-y-4 mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Layout (Percent)</h4>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">X Position</label>
                        <input
                            type="number" className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            value={overlay.xPercent.toFixed(1)}
                            onChange={(e) => handleChange('xPercent', parseFloat(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Y Position</label>
                        <input
                            type="number" className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            value={overlay.yPercent.toFixed(1)}
                            onChange={(e) => handleChange('yPercent', parseFloat(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Width</label>
                        <input
                            type="number" className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            value={overlay.wPercent || 0}
                            onChange={(e) => handleChange('wPercent', parseFloat(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Height</label>
                        <input
                            type="number" className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            value={overlay.hPercent || 0}
                            onChange={(e) => handleChange('hPercent', parseFloat(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            {/* Content (For text overlays) */}
            {overlay.type === 'username' && (
                <div className="space-y-4 mb-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Text Content</h4>
                    <input
                        type="text"
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                        value={overlay.text || ''}
                        onChange={(e) => handleChange('text', e.target.value)}
                        placeholder="Enter username..."
                    />
                </div>
            )}

            {/* Avatar Specific Settings */}
            {overlay.type === 'avatar' && (
                <div className="space-y-6 mb-6">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Avatar Shape</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {['round', 'square', 'rectangle'].map((shape) => (
                                <button
                                    key={shape}
                                    onClick={() => handleChange('shape', shape)}
                                    className={`px-2 py-2 rounded text-xs font-medium capitalize transition-colors border ${(overlay.shape || 'round') === shape
                                        ? 'bg-blue-600 border-blue-500 text-white'
                                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                                        }`}
                                >
                                    {shape}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SOFT EDGES / FEATHER MODE */}
                    <div className="p-3 bg-gray-900/50 rounded-xl border border-gray-700 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Feather Mode</h4>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={overlay.avatarConfig?.softEdgeConfig?.enabled || false}
                                    onChange={(e) => handleSoftEdgeChange('enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {overlay.avatarConfig?.softEdgeConfig?.enabled && (
                            <div className="space-y-3 pt-2">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-xs text-gray-400">Brush Size</label>
                                        <span className="text-[10px] text-gray-500">{overlay.avatarConfig.softEdgeConfig.brushSize}px</span>
                                    </div>
                                    <input
                                        type="range" min="5" max="100"
                                        value={overlay.avatarConfig.softEdgeConfig.brushSize || 20}
                                        onChange={(e) => handleSoftEdgeChange('brushSize', parseInt(e.target.value))}
                                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-xs text-gray-400">Blur Strength</label>
                                        <span className="text-[10px] text-gray-500">{overlay.avatarConfig.softEdgeConfig.blurStrength}px</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="50"
                                        value={overlay.avatarConfig.softEdgeConfig.blurStrength || 10}
                                        onChange={(e) => handleSoftEdgeChange('blurStrength', parseInt(e.target.value))}
                                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-xs text-gray-400">Transparency</label>
                                        <span className="text-[10px] text-gray-500">{Math.round((overlay.avatarConfig.softEdgeConfig.opacity || 1) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.01"
                                        value={overlay.avatarConfig.softEdgeConfig.opacity || 1}
                                        onChange={(e) => handleSoftEdgeChange('opacity', parseFloat(e.target.value))}
                                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={() => handleSoftEdgeChange('strokes', [])}
                                    className="w-full py-1.5 bg-red-900/20 hover:bg-red-900/30 text-red-400 text-[10px] font-bold rounded uppercase tracking-wider transition-colors border border-red-900/30"
                                >
                                    Reset Brushed Area
                                </button>
                                <p className="text-[9px] text-gray-500 italic text-center">
                                    Tip: Click and drag on the avatar in preview to "brush" away edges.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Image Specific Settings */}
            {overlay.type === 'image' && (
                <div className="space-y-4 mb-6 pt-4 border-t border-gray-700">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Image Content</h4>
                    <div className="space-y-2">
                        {overlay.url && (
                            <div className="relative group rounded-lg overflow-hidden h-32 bg-black/40 border border-gray-700">
                                <img src={overlay.url} className="w-full h-full object-contain" alt="Preview" />
                                <button
                                    onClick={() => handleChange('url', '')}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="overlay-image-upload"
                            onChange={(e) => {
                                const file = e.currentTarget.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => handleChange('url', ev.target.result);
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <label
                            htmlFor="overlay-image-upload"
                            className="w-full flex flex-col items-center justify-center py-4 px-4 border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/50 hover:bg-gray-800/50 transition-colors cursor-pointer group"
                        >
                            <ImageIcon size={20} className="text-gray-500 mb-2 group-hover:text-blue-400 transition-colors" />
                            <span className="text-xs text-blue-400 font-bold group-hover:text-blue-300">
                                {overlay.url ? 'Change Image' : 'Click to upload image'}
                            </span>
                        </label>
                    </div>
                </div>
            )}

            {/* Animation */}
            <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Animation</h4>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={overlay.animation?.enabled}
                            onChange={(e) => handleAnimationChange('enabled', e.target.checked)}
                            className="mr-2"
                        />
                        <span className="text-xs text-white">Enable</span>
                    </label>
                </div>

                {overlay.animation?.enabled && (
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Entry Direction</label>
                            <select
                                value={overlay.animation.direction}
                                onChange={(e) => handleAnimationChange('direction', e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            >
                                {directions.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Speed (0.1 - 5)</label>
                            <input
                                type="range" min="0.1" max="5" step="0.1"
                                value={overlay.animation.speed}
                                onChange={(e) => handleAnimationChange('speed', parseFloat(e.target.value))}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <div className="text-right text-xs text-gray-400">{overlay.animation.speed}x</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Visibility */}
            <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-700">
                    <input
                        type="checkbox"
                        checked={overlay.visible}
                        onChange={(e) => handleChange('visible', e.target.checked)}
                    />
                    <span className="text-sm text-gray-300">Visible</span>
                </label>
            </div>

        </div>
    );
};

export default OverlayControls;
