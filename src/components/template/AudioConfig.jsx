import React, { useState, useRef } from 'react';
import { Upload, X, Play, Pause } from 'lucide-react';

const AudioConfig = ({ config, onChange }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onChange({
                ...config,
                file: file, // Store the actual file object
                enabled: true,
                name: file.name
            });
        }
    };

    const togglePlay = () => {
        if (!config.file) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            const url = URL.createObjectURL(config.file);
            audioRef.current.src = url;
            audioRef.current.currentTime = config.crop?.start || 0;
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h4 className="text-white font-medium mb-3">Audio Configuration</h4>

            {!config.file ? (
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:bg-gray-700/50 transition-colors">
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="audio-upload"
                    />
                    <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center">
                        <Upload className="text-green-400 mb-2" />
                        <span className="text-sm text-gray-300">Upload Audio File</span>
                    </label>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <button
                                onClick={togglePlay}
                                className="p-2 bg-green-500 rounded-full text-white hover:bg-green-600"
                            >
                                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                            </button>
                            <span className="text-sm text-gray-200 truncate max-w-[150px]">
                                {config.name}
                            </span>
                        </div>
                        <button
                            onClick={() => onChange({ ...config, file: null, enabled: false })}
                            className="text-gray-400 hover:text-red-400"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Configs */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Crop Start (sec)</label>
                            <input
                                type="number"
                                value={config.crop?.start || 0}
                                onChange={(e) => onChange({ ...config, crop: { ...config.crop, start: parseFloat(e.target.value) } })}
                                className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Volume (0-1)</label>
                            <input
                                type="number"
                                min="0" max="1" step="0.1"
                                value={config.volume ?? 1}
                                onChange={(e) => onChange({ ...config, volume: parseFloat(e.target.value) })}
                                className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            />
                        </div>
                    </div>

                    <div className="pt-2 border-t border-gray-700">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={config.muteOriginalAudio || false}
                                onChange={(e) => onChange({ ...config, muteOriginalAudio: e.target.checked })}
                                className="accent-blue-500 w-4 h-4"
                            />
                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                Mute Original Video Audio
                            </span>
                        </label>
                        <p className="text-[10px] text-gray-500 mt-1 ml-6">
                            When enabled, the audio from the original video file will be silenced.
                        </p>
                    </div>
                </div>
            )}

            <audio
                ref={audioRef}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                className="hidden"
            />
        </div>
    );
};

export default AudioConfig;
