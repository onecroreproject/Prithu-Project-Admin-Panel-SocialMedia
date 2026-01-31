import React from 'react';
import { Play, Pause, X } from 'lucide-react';

const LivePreview = ({ fileData, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-gray-900 hover:bg-gray-800 rounded-full text-white transition-colors border border-gray-800"
            >
                <X size={24} />
            </button>

            <div className="max-w-full max-h-full aspect-[9/16] bg-black shadow-2xl relative overflow-hidden rounded-2xl">
                {fileData.file.type.startsWith('video') ? (
                    <video
                        src={fileData.preview}
                        className="w-full h-full object-contain"
                        autoPlay
                        loop
                        controls
                    />
                ) : (
                    <img
                        src={fileData.preview}
                        className="w-full h-full object-contain"
                    />
                )}
            </div>
        </div>
    );
};

export default LivePreview;
