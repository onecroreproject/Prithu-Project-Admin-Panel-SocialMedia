import React, { useState } from 'react';
import { X, Save, Plus } from 'lucide-react';
import CanvasPreview from './CanvasPreview';
import OverlayControls from './OverlayControls';
import AudioConfig from './AudioConfig';
import FooterConfig from './FooterConfig';

const TemplateEditor = ({ fileData, onClose, onSave, onUpdateEditMetadata }) => {
    // Deep clone metadata to avoid mutating parent state directly until save
    // If metadata is missing, initialize defaults
    const [metadata, setMetadata] = useState(() => {
        const defaultMeta = {
            isTemplate: true,
            overlayElements: [
                {
                    id: 'avatar', type: 'avatar', visible: true, shape: 'round',
                    xPercent: 10, yPercent: 10, wPercent: 15, hPercent: 15, // Default positions
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
                    id: 'preview_image', type: 'image', visible: true, url: '', // User will upload an image
                    xPercent: 70, yPercent: 10, wPercent: 20, hPercent: 20,
                    animation: { enabled: false, direction: 'none', speed: 1 }
                }
            ],
            audioConfig: { enabled: false, volume: 1 },
            footerConfig: {
                enabled: true,
                showElements: { name: true, socialIcons: true },
                backgroundColor: 'rgba(0,0,0,0.7)',
                heightPercent: 15,
                wPercent: 100,
                xPercent: 0
            },
            canvasSettings: { referenceWidth: 1080, referenceHeight: 1920, aspectRatio: "9:16" }
        };
        return fileData.metadata || defaultMeta;
    });

    const [editMetadata, setEditMetadata] = useState(fileData.editMetadata || {
        crop: { ratio: "original", zoomLevel: 1, position: { x: 0, y: 0 } },
        filters: { preset: "original", adjustments: {} }
    });

    const [activeOverlayId, setActiveOverlayId] = useState('avatar');

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

    // Find active overlay object
    const activeOverlay = metadata.overlayElements.find(el => el.id === activeOverlayId);

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
            {/* Header */}
            <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
                <h2 className="text-xl font-bold text-white">Template Editor</h2>
                <div className="flex gap-4">
                    <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 font-medium"
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Canvas */}
                <div className="flex-1 bg-gray-950 p-8 flex items-center justify-center relative">
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
                <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {/* Section: Layers */}
                        <div className="p-4 border-b border-gray-800">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Layers</h3>
                            <div className="space-y-2">
                                {metadata.overlayElements.map(el => (
                                    <div
                                        key={el.id}
                                        onClick={() => setActiveOverlayId(el.id)}
                                        className={`p-3 rounded-lg cursor-pointer flex items-center justify-between border ${activeOverlayId === el.id ? 'bg-blue-900/30 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {el.visible ? <span className="w-2 h-2 rounded-full bg-green-500" /> : <span className="w-2 h-2 rounded-full bg-gray-600" />}
                                            <span className="capitalize font-medium">{el.id}</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUpdateOverlay(el.id, { visible: !el.visible });
                                            }}
                                            className="p-1 hover:bg-black/20 rounded transition-colors group"
                                            title={el.visible ? 'Remove' : 'Add'}
                                        >
                                            {el.visible ? (
                                                <X size={14} className="text-gray-500 group-hover:text-red-400" />
                                            ) : (
                                                <Plus size={14} className="text-gray-500 group-hover:text-green-500" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section: Active Overlay Controls */}
                        <div className="border-b border-gray-800">
                            <OverlayControls overlay={activeOverlay} onUpdate={handleUpdateOverlay} />
                        </div>

                        {/* Section: Audio */}
                        <div className="p-4 border-b border-gray-800">
                            <AudioConfig
                                config={metadata.audioConfig}
                                onChange={(val) => setMetadata(prev => ({ ...prev, audioConfig: val }))}
                            />
                        </div>

                        {/* Section: Footer */}
                        <div className="p-4 border-b border-gray-800">
                            <FooterConfig
                                config={metadata.footerConfig}
                                onChange={(val) => setMetadata(prev => ({ ...prev, footerConfig: val }))}
                            />
                        </div>

                        {/* Section: Post Settings */}
                        <div className="p-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Post Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1.5">Aspect Ratio</label>
                                    <select
                                        value={editMetadata.crop.ratio}
                                        onChange={(e) => setEditMetadata(prev => ({ ...prev, crop: { ...prev.crop, ratio: e.target.value } }))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        {["original", "1:1", "4:5", "16:9", "9:16"].map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400 block mb-1.5">Filter Preset</label>
                                    <select
                                        value={editMetadata.filters.preset}
                                        onChange={(e) => setEditMetadata(prev => ({ ...prev, filters: { ...prev.filters, preset: e.target.value } }))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        {["original", "aden", "clarendon", "crema", "gingham", "juno", "lark", "ludwig", "moon", "perpetua", "reyes", "slumber"].map(f => (
                                            <option key={f} value={f} className="capitalize">{f}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateEditor;
