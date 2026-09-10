import React, { useRef, useState } from 'react';
import { Music, Upload, Play, Pause, X, Volume2, VolumeX } from 'lucide-react';
import { clsx } from 'clsx';

const AudioConfig = ({ config, onChange }) => {
    const fileInputRef = useRef(null);
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onChange({
                ...config,
                enabled: true,
                file,
                name: file.name
            });
        }
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleUpdate = (updates) => {
        onChange({ ...config, ...updates });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-lg shadow-purple-500/20">
                        <Music size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Audio Stream</h3>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Custom background music</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(e) => handleUpdate({ enabled: e.target.checked })}
                        className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 border border-transparent rounded-full peer peer-checked:bg-purple-600 peer-checked:after:translate-x-7 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md"></div>
                </label>
            </div>

            {config.enabled && (
                <div className="space-y-8 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    {/* Upload / Selector */}
                    {!config.file ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="h-40 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-purple-500/30 hover:bg-white transition-all cursor-pointer group bg-white/50"
                        >
                            <input type="file" ref={fileInputRef} hidden accept="audio/*" onChange={handleFileChange} />
                            <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform border border-gray-100">
                                <Upload className="text-purple-600" size={24} />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Select Audio Track</span>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <button onClick={togglePlay} className="w-12 h-12 shrink-0 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20 active:scale-95 transition-transform">
                                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                    </button>
                                    <div className="truncate">
                                        <p className="text-[10px] font-black text-gray-900 truncate uppercase tracking-widest">{config.name}</p>
                                        <p className="text-[8px] font-black text-purple-600 uppercase tracking-widest mt-1">Track Active</p>
                                    </div>
                                </div>
                                <button onClick={() => handleUpdate({ file: null, name: '' })} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                    <X size={20} />
                                </button>
                                <audio ref={audioRef} src={config.file ? URL.createObjectURL(config.file) : ''} onEnded={() => setIsPlaying(false)} />
                            </div>

                            <div className="space-y-10 group">
                                {/* Volume */}
                                <div className="space-y-5">
                                    <div className="flex justify-between items-center px-1">
                                        <div className="flex items-center gap-3">
                                            <Volume2 size={14} className="text-purple-600" />
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Output Volume</label>
                                        </div>
                                        <span className="text-[9px] font-black text-purple-600">{Math.round(config.volume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.01"
                                        value={config.volume}
                                        onChange={(e) => handleUpdate({ volume: parseFloat(e.target.value) })}
                                        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-500"
                                    />
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100/50">
                                    <div className="flex items-center justify-between w-full">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Mute Original Audio</label>
                                        <button
                                            onClick={() => handleUpdate({ muteOriginalAudio: !config.muteOriginalAudio })}
                                            className={clsx(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2",
                                                config.muteOriginalAudio
                                                    ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/20"
                                                    : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
                                            )}
                                        >
                                            {config.muteOriginalAudio ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AudioConfig;
