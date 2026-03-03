
import React, { useEffect } from 'react';
import { Play, Pause, X } from 'lucide-react';

const LivePreview = ({ fileData, onClose }) => {
    // Intercept browser back button so it closes the preview, not navigates away
    useEffect(() => {
        window.history.pushState({ editorOpen: true }, '');
        const handlePopState = () => { onClose(); };
        window.addEventListener('popstate', handlePopState);
        return () => { window.removeEventListener('popstate', handlePopState); };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100] bg-white/10 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 animate-in fade-in zoom-in duration-300">
            <button
                onClick={onClose}
                className="absolute top-8 right-8 p-3 bg-white/80 hover:bg-white text-gray-900 rounded-2xl transition-all shadow-2xl border border-white/20 hover:scale-110 active:scale-95 group z-[110]"
            >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <div className="max-w-full max-h-full aspect-[9/16] bg-black shadow-[0_0_100px_rgba(0,0,0,0.4)] relative overflow-hidden rounded-3xl border-4 border-white/10">
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
