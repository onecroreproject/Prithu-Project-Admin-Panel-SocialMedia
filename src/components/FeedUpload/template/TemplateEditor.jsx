import React, { useState, useEffect } from 'react';
import { Save, Plus, Layers, Play, Settings, Music, Palette, CheckCircle, X } from 'lucide-react';
import CanvasPreview from './CanvasPreview';
import OverlayControls from './OverlayControls';
import AudioConfig from './AudioConfig';
import FooterConfig from './FooterConfig';
import { clsx } from 'clsx';

const TemplateEditor = ({ fileData, onClose, onSave, onUpdateEditMetadata }) => {
    const [metadata, setMetadata] = useState(() => {
        const defaultMeta = {
            isTemplate: true,
            overlayElements: [
                {
                    id: 'avatar', type: 'avatar', visible: true, shape: 'round',
                    xPercent: 10, yPercent: 10, wPercent: 15, hPercent: 15,
                    animation: { enabled: true, direction: 'top', speed: 1 },
                    avatarConfig: { shape: 'round', softEdgeConfig: { enabled: false, brushSize: 20, blurStrength: 10, opacity: 1, strokes: [] } }
                },
                {
                    id: 'logo', type: 'logo', visible: true,
                    xPercent: 80, yPercent: 5, wPercent: 10, hPercent: 10,
                    animation: { enabled: false, direction: 'none', speed: 1 }
                },
                {
                    id: 'username', type: 'username', visible: true, text: 'User Name',
                    xPercent: 10, yPercent: 80, wPercent: 30, hPercent: 5,
                    animation: { enabled: true, direction: 'bottom', speed: 1 }
                }
            ],
            audioConfig: { enabled: false, volume: 1 },
            footerConfig: { enabled: true, showElements: { name: true, socialIcons: true }, backgroundColor: 'rgba(0,0,0,0.7)' },
            canvasSettings: { referenceWidth: 1080, referenceHeight: 1920 }
        };
        return fileData.metadata || defaultMeta;
    });

    const [editMetadata, setEditMetadata] = useState(fileData.editMetadata || {
        crop: { ratio: "original", zoomLevel: 1, position: { x: 0, y: 0 } },
        filters: { preset: "original", adjustments: {} }
    });

    const [activeOverlayId, setActiveOverlayId] = useState('avatar');
    const [activeTab, setActiveTab] = useState('layers');

    const handleUpdateOverlay = (id, updates) => {
        setMetadata(prev => ({
            ...prev,
            overlayElements: prev.overlayElements.map(el =>
                el.id === id ? { ...el, ...updates } : el
            )
        }));
    };

    const handleSave = () => {
        onSave(fileData.id, metadata);
        if (onUpdateEditMetadata) {
            onUpdateEditMetadata(fileData.id, editMetadata);
        }
        onClose();
    };

    const activeOverlay = metadata.overlayElements.find(el => el.id === activeOverlayId);

    return (
        <div className="fixed inset-0 z-[120] bg-black/95 flex flex-col backdrop-blur-3xl">
            {/* Header */}
            <div className="h-20 bg-gray-900/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-900/40">
                        <Layers className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-widest">Advanced Editor</h2>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Designing: {fileData.file.name}</p>
                    </div>
                </div>
                <div className="flex gap-6">
                    <button onClick={onClose} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">
                        Discard Changes
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-10 py-3 bg-white text-black hover:bg-gray-200 rounded-[1.25rem] flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl transition-all transform hover:scale-105 active:scale-95"
                    >
                        <Save size={18} />
                        Apply & Close
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Canvas */}
                <div className="flex-1 bg-black/50 p-4 flex items-center justify-center relative inner-shadow-black">
                    <CanvasPreview
                        previewUrl={fileData.preview}
                        fileType={fileData.file.type}
                        metadata={metadata}
                        audioConfig={metadata.audioConfig}
                        editMetadata={editMetadata}
                        onUpdateOverlay={handleUpdateOverlay}
                        activeOverlayId={activeOverlayId}
                        onSelectOverlay={setActiveOverlayId}
                        onUpdateFooterConfig={(updates) => setMetadata(prev => ({
                            ...prev,
                            footerConfig: { ...prev.footerConfig, ...updates }
                        }))}
                    />
                </div>

                {/* Right: Controls Sidebar */}
                <div className="w-[380px] bg-gray-900 border-l border-white/5 flex flex-col overflow-hidden shadow-[-40px_0_100px_rgba(0,0,0,0.5)] z-20">
                    {/* Secondary Tabs */}
                    <div className="flex p-2 bg-black/40 border-b border-white/5 gap-1 shrink-0">
                        {[
                            { id: 'layers', icon: <Layers size={14} />, label: 'Layers' },
                            { id: 'audio', icon: <Music size={14} />, label: 'Audio' },
                            { id: 'footer', icon: <Palette size={14} />, label: 'Footer' },
                            { id: 'settings', icon: <Settings size={14} />, label: 'Post' }
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={clsx(
                                    "flex-1 py-3 flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeTab === t.id ? "bg-white/10 text-white shadow-lg border border-white/10" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                                )}
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                        {activeTab === 'layers' && (
                            <>
                                {/* Layers Selector */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Active Elements</h3>
                                    <div className="grid grid-cols-1 gap-2.5">
                                        {metadata.overlayElements.map(el => (
                                            <div
                                                key={el.id}
                                                onClick={() => setActiveOverlayId(el.id)}
                                                className={clsx(
                                                    "p-4 rounded-2xl cursor-pointer flex items-center justify-between border-2 transition-all",
                                                    activeOverlayId === el.id
                                                        ? 'bg-blue-600/10 border-blue-600/50 shadow-lg shadow-blue-900/20'
                                                        : 'bg-black/30 border-white/5 hover:border-white/10 group'
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={clsx(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                        activeOverlayId === el.id ? "bg-blue-600 text-white scale-110 shadow-lg" : "bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-gray-300"
                                                    )}>
                                                        {el.id === 'avatar' && <Play size={20} />}
                                                        {el.id === 'logo' && <Plus size={20} />}
                                                        {el.id === 'username' && <Layers size={20} />}
                                                    </div>
                                                    <div>
                                                        <span className={clsx("text-xs font-black uppercase tracking-[0.15em] block transition-colors", activeOverlayId === el.id ? "text-white" : "text-gray-400 group-hover:text-gray-300")}>{el.id}</span>
                                                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{el.visible ? 'Visible' : 'Hidden'}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUpdateOverlay(el.id, { visible: !el.visible });
                                                    }}
                                                    className={clsx(
                                                        "p-2.5 rounded-xl transition-all border",
                                                        el.visible ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                                                    )}
                                                >
                                                    {el.visible ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Active Overlay Controls */}
                                <div className="pt-8 border-t border-white/5">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Properties: <span className="text-blue-400">{activeOverlayId}</span></h3>
                                    <OverlayControls overlay={activeOverlay} onUpdate={handleUpdateOverlay} />
                                </div>
                            </>
                        )}

                        {activeTab === 'audio' && (
                            <div className="animate-in fade-in slide-in-from-right-4">
                                <AudioConfig
                                    config={metadata.audioConfig}
                                    onChange={(val) => setMetadata(prev => ({ ...prev, audioConfig: val }))}
                                />
                            </div>
                        )}

                        {activeTab === 'footer' && (
                            <div className="animate-in fade-in slide-in-from-right-4">
                                <FooterConfig
                                    config={metadata.footerConfig}
                                    onChange={(val) => setMetadata(prev => ({ ...prev, footerConfig: val }))}
                                />
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                <div className="bg-black/40 rounded-3xl p-6 border border-white/5 space-y-6">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Quick Post Adjustments</h3>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block">Canvas Aspect Ratio</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {["original", "1:1", "4:5", "16:9", "9:16"].map(r => (
                                                <button
                                                    key={r}
                                                    onClick={() => setEditMetadata(prev => ({ ...prev, crop: { ...prev.crop, ratio: r } }))}
                                                    className={clsx(
                                                        "p-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                                        editMetadata.crop.ratio === r ? "bg-white text-black border-white shadow-xl" : "bg-white/5 text-gray-500 border-white/5 hover:border-white/10"
                                                    )}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block">Color Filters</label>
                                        <select
                                            value={editMetadata.filters.preset}
                                            onChange={(e) => setEditMetadata(prev => ({ ...prev, filters: { ...prev.filters, preset: e.target.value } }))}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-xs font-bold text-white outline-none focus:border-blue-500 transition-colors appearance-none"
                                        >
                                            {["original", "aden", "clarendon", "crema", "gingham", "juno", "lark", "ludwig", "moon", "perpetua", "reyes", "slumber"].map(f => (
                                                <option key={f} value={f} className="bg-gray-950">{f.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default TemplateEditor;
