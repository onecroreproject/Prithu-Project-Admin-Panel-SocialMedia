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
                    <div className="p-3 bg-purple-600/20 rounded-2xl text-purple-400 border border-purple-500/20">
                        <Music size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Audio Stream</h3>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Custom background music</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(e) => handleUpdate({ enabled: e.target.checked })}
                        className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-800 border border-white/10 rounded-full peer peer-checked:bg-purple-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:shadow-lg"></div>
                </label>
            </div>

            {config.enabled && (
                <div className="space-y-8 p-6 bg-black/40 rounded-[2rem] border border-white/10 shadow-inner">
                    {/* Upload / Selector */}
                    {!config.file ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="h-32 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-purple-500/30 hover:bg-white/5 transition-all cursor-pointer group"
                        >
                            <input type="file" ref={fileInputRef} hidden accept="audio/*" onChange={handleFileChange} />
                            <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                                <Upload className="text-gray-500" size={20} />
                            </div>
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Select Audio Track</span>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <button onClick={togglePlay} className="w-10 h-10 shrink-0 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                                    </button>
                                    <div className="truncate">
                                        <p className="text-[10px] font-black text-white truncate uppercase tracking-wider">{config.name}</p>
                                        <p className="text-[8px] font-bold text-gray-500 uppercase">Track Active</p>
                                    </div>
                                </div>
                                <button onClick={() => handleUpdate({ file: null, name: '' })} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                                    <X size={16} />
                                </button>
                                <audio ref={audioRef} src={config.file ? URL.createObjectURL(config.file) : ''} onEnded={() => setIsPlaying(false)} />
                            </div>

                            <div className="space-y-6 pt-4">
                                {/* Volume */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Volume2 size={12} className="text-gray-400" />
                                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Output Volume</label>
                                        </div>
                                        <span className="text-[9px] font-mono text-purple-400">{Math.round(config.volume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.01"
                                        value={config.volume}
                                        onChange={(e) => handleUpdate({ volume: parseFloat(e.target.value) })}
                                        className="w-full h-1 bg-gray-800 rounded-full appearance-none cursor-pointer accent-purple-500"
                                    />
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-3">
                                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Mute Background</label>
                                        <button
                                            onClick={() => handleUpdate({ muteOriginalAudio: !config.muteOriginalAudio })}
                                            className={clsx(
                                                "p-2 rounded-lg border transition-all",
                                                config.muteOriginalAudio ? "bg-red-500 text-white border-red-400" : "bg-white/5 text-gray-500 border-white/5 hover:text-white"
                                            )}
                                        >
                                            {config.muteOriginalAudio ? <VolumeX size={14} /> : <Volume2 size={14} />}
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
