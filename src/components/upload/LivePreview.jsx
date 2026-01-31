import React from 'react';
import { X, Play } from 'lucide-react';
import CanvasPreview from '../template/CanvasPreview';

const LivePreview = ({ fileData, onClose }) => {
    return (
        <div className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 shrink-0 bg-gray-900/50 backdrop-blur-md">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Play size={20} className="fill-blue-500 text-blue-500" />
                        Live Preview
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex-1 bg-black flex items-center justify-center p-4 relative">
                        {/* Simulation of Filters + CanvasPreview */}
                        <div className="w-full h-full flex items-center justify-center transition-all duration-300">
                            <CanvasPreview
                                previewUrl={fileData.preview}
                                fileType={fileData.file.type}
                                metadata={fileData.metadata}
                                audioConfig={fileData.metadata.audioConfig}
                                editMetadata={fileData.editMetadata}
                                onUpdateOverlay={() => { }} // Read only
                                activeOverlayId={null}
                                onSelectOverlay={() => { }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="p-4 bg-gray-900 border-t border-gray-800 shrink-0">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex gap-4">
                            <span>{fileData.dimensions?.width}x{fileData.dimensions?.height}</span>
                            <span>{fileData.file.type.split('/')[1].toUpperCase()}</span>
                        </div>
                        <div className="flex gap-2">
                            {fileData.uploadMode === 'template' && <span className="px-2 py-0.5 bg-purple-900/30 text-purple-400 rounded-full border border-purple-800/50">Template</span>}
                            {fileData.editMetadata?.filters?.preset !== 'original' && <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded-full border border-blue-800/50">Filtered</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivePreview;
