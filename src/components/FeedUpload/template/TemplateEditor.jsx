import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Save, Plus, Layers, Play, Settings, Music, Palette, CheckCircle, X, ChevronDown, Calendar, Download } from 'lucide-react';
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
                },
                {
                    id: 'calendar', type: 'calendar', visible: true,
                    xPercent: 70, yPercent: 20, wPercent: 20, hPercent: 15,
                    animation: { enabled: true, direction: 'right', speed: 1 }
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

    const handleUpdateOverlay = useCallback((id, updates) => {
        setMetadata(prev => ({
            ...prev,
            overlayElements: prev.overlayElements.map(el =>
                el.id === id ? { ...el, ...updates } : el
            )
        }));
    }, []);

    const handleSave = useCallback(() => {
        onSave(fileData.id, metadata);
        if (onUpdateEditMetadata) {
            onUpdateEditMetadata(fileData.id, editMetadata);
        }
        onClose();
    }, [fileData.id, metadata, editMetadata, onSave, onUpdateEditMetadata, onClose]);

    // Intercept browser back button: push a history entry on mount,
    // then catch popstate to close the overlay instead of navigating away.
    useEffect(() => {
        // Push a dummy entry so the back button has somewhere to "go"
        window.history.pushState({ editorOpen: true }, '');

        const handlePopState = (e) => {
            // If the state does NOT have editorOpen, it means we went back past our entry
            // Call onClose to dismiss the overlay and stay on the upload page
            onClose();
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [onClose]);

    const handleDownload = useCallback(async () => {
        const node = document.getElementById('download-canvas-container');
        if (!node) return;
        try {
            const { toPng } = await import('html-to-image');
            const dataUrl = await toPng(node, { quality: 1, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `post-frame-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Error downloading image', err);
        }
    }, []);

    const activeOverlay = metadata.overlayElements.find(el => el.id === activeOverlayId);

    return (
        <div className="fixed inset-0 bg-gray-50 z-[120] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 shrink-0 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20">
                        <Layers className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Advanced Editor</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Designing: {fileData.file.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <button onClick={onClose} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all">
                        Discard Changes
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-8 py-4 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-2xl flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] transition-all transform hover:scale-105 active:scale-95"
                    >
                        <Download size={18} />
                        Download Image
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-12 py-4 bg-gray-900 text-white hover:bg-black rounded-2xl flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl transition-all transform hover:scale-105 active:scale-95"
                    >
                        <Save size={18} />
                        Apply & Close
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Canvas */}
                <div className="flex-1 bg-gray-50/50 p-8 flex items-center justify-center relative inner-shadow-white overflow-hidden">
                    <div className="relative h-full shadow-[0_0_100px_rgba(0,0,0,0.2)] rounded-2xl border-4 border-white overflow-hidden">
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
                </div>

                {/* Right: Controls Sidebar */}
                <div className="w-[400px] bg-white border-l border-gray-100 flex flex-col overflow-hidden shadow-[-20px_0_60px_rgba(0,0,0,0.02)] z-20">
                    {/* Secondary Tabs */}
                    <div className="flex p-3 bg-gray-50/30 border-b border-gray-100 gap-2 shrink-0">
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
                                    "flex-1 py-3.5 flex items-center justify-center gap-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                    activeTab === t.id
                                        ? "bg-gray-900 text-white border-gray-900 shadow-xl"
                                        : "text-gray-400 border-transparent hover:text-gray-900 hover:bg-white hover:border-gray-200"
                                )}
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
                        {activeTab === 'layers' && (
                            <>
                                {/* Layers Selector */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Active Elements</h3>
                                        {!metadata.overlayElements.find(el => el.id === 'calendar') && (
                                            <button 
                                                onClick={() => {
                                                    setMetadata(prev => ({
                                                        ...prev,
                                                        overlayElements: [
                                                            ...prev.overlayElements,
                                                            {
                                                                id: 'calendar', type: 'calendar', visible: true,
                                                                xPercent: 70, yPercent: 20, wPercent: 20, hPercent: 15,
                                                                animation: { enabled: true, direction: 'right', speed: 1 }
                                                            }
                                                        ]
                                                    }));
                                                    setActiveOverlayId('calendar');
                                                }}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center gap-1"
                                            >
                                                <Plus size={10} /> Calendar
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {metadata.overlayElements.map(el => (
                                            <div
                                                key={el.id}
                                                onClick={() => setActiveOverlayId(el.id)}
                                                className={clsx(
                                                    "p-5 rounded-2xl cursor-pointer flex items-center justify-between border-2 transition-all",
                                                    activeOverlayId === el.id
                                                        ? 'bg-blue-50/50 border-blue-500/50 shadow-lg shadow-blue-500/5'
                                                        : 'bg-white border-gray-100 hover:border-gray-300 group'
                                                )}
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className={clsx(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                                                        activeOverlayId === el.id ? "bg-blue-600 text-white scale-110 shadow-xl shadow-blue-500/20" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600"
                                                    )}>
                                                        {el.id === 'avatar' && <Play size={20} />}
                                                        {el.id === 'logo' && <Plus size={20} />}
                                                        {el.id === 'username' && <Layers size={20} />}
                                                        {el.id === 'calendar' && <Calendar size={20} />}
                                                    </div>
                                                    <div>
                                                        <span className={clsx("text-xs font-black uppercase tracking-[0.15em] block transition-colors", activeOverlayId === el.id ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700")}>{el.id}</span>
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{el.visible ? 'Visible' : 'Hidden'}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUpdateOverlay(el.id, { visible: !el.visible });
                                                    }}
                                                    className={clsx(
                                                        "p-3 rounded-2xl transition-all border",
                                                        el.visible ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                                                    )}
                                                >
                                                    {el.visible ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Active Overlay Controls */}
                                <div className="pt-10 border-t border-gray-100">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">Properties: <span className="text-blue-600">{activeOverlayId}</span></h3>
                                    <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 shadow-sm">
                                        <OverlayControls overlay={activeOverlay} onUpdate={handleUpdateOverlay} />
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'audio' && (
                            <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Audio Master</h3>
                                <AudioConfig
                                    config={metadata.audioConfig}
                                    onChange={(val) => setMetadata(prev => ({ ...prev, audioConfig: val }))}
                                />
                            </div>
                        )}

                        {activeTab === 'footer' && (
                            <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Footer Appearance</h3>
                                <FooterConfig
                                    config={metadata.footerConfig}
                                    onChange={(val) => setMetadata(prev => ({ ...prev, footerConfig: val }))}
                                />
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                                <div className="bg-white rounded-3xl p-8 border border-gray-100 space-y-8 shadow-sm">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Canvas Adjustments</h3>

                                    <div className="space-y-5">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Aspect Ratio</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {["original", "1:1", "4:5", "16:9", "9:16"].map(r => (
                                                <button
                                                    key={r}
                                                    onClick={() => setEditMetadata(prev => ({ ...prev, crop: { ...prev.crop, ratio: r } }))}
                                                    className={clsx(
                                                        "p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                                        editMetadata.crop.ratio === r
                                                            ? "bg-gray-900 border-gray-900 text-white shadow-xl scale-105"
                                                            : "bg-white text-gray-400 border-gray-100 hover:border-gray-300 hover:text-gray-900 shadow-sm"
                                                    )}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-5 pt-4">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Image Zoom</label>
                                            <span className="text-[10px] font-black text-blue-600">{(editMetadata.crop.zoomLevel || 1).toFixed(2)}x</span>
                                        </div>
                                        <input
                                            type="range" min="1" max="3" step="0.05"
                                            value={editMetadata.crop.zoomLevel || 1}
                                            onChange={(e) => setEditMetadata(prev => ({ ...prev, crop: { ...prev.crop, zoomLevel: parseFloat(e.target.value) } }))}
                                            className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                    <div className="space-y-5 pt-4">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pan X</label>
                                            <span className="text-[10px] font-black text-blue-600">{editMetadata.crop.position?.x || 0}%</span>
                                        </div>
                                        <input
                                            type="range" min="-100" max="100" step="1"
                                            value={editMetadata.crop.position?.x || 0}
                                            onChange={(e) => setEditMetadata(prev => ({ ...prev, crop: { ...prev.crop, position: { ...prev.crop.position, x: parseFloat(e.target.value) } } }))}
                                            className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                    <div className="space-y-5 pt-4">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pan Y</label>
                                            <span className="text-[10px] font-black text-blue-600">{editMetadata.crop.position?.y || 0}%</span>
                                        </div>
                                        <input
                                            type="range" min="-100" max="100" step="1"
                                            value={editMetadata.crop.position?.y || 0}
                                            onChange={(e) => setEditMetadata(prev => ({ ...prev, crop: { ...prev.crop, position: { ...prev.crop.position, y: parseFloat(e.target.value) } } }))}
                                            className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                    <div className="space-y-5 pt-4">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Global Filter</label>
                                        <div className="relative">
                                            <select
                                                value={editMetadata.filters.preset}
                                                onChange={(e) => setEditMetadata(prev => ({ ...prev, filters: { ...prev.filters, preset: e.target.value } }))}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-xs font-black text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                                            >
                                                {["original", "aden", "clarendon", "crema", "gingham", "juno", "lark", "ludwig", "moon", "perpetua", "reyes", "slumber"].map(f => (
                                                    <option key={f} value={f} className="bg-white">{f.toUpperCase()}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <ChevronDown size={16} />
                                            </div>
                                        </div>
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
