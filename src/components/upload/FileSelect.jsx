import React, { useRef, useState, useEffect } from 'react';
import { Upload, FileVideo, FileImage, Loader2, Cloud, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const FileSelect = ({ onSelect, className, isActive = true }) => {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [bounceAnimation, setBounceAnimation] = useState(false);

    useEffect(() => {
        if (isActive) {
            const interval = setInterval(() => {
                setBounceAnimation(true);
                setTimeout(() => setBounceAnimation(false), 1000);
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [isActive]);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        setIsLoading(true);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            // Simulate processing delay for animation
            setTimeout(() => {
                onSelect(Array.from(e.dataTransfer.files));
                setIsLoading(false);
            }, 500);
        }
    };

    const handleChange = (e) => {
        setIsLoading(true);
        if (e.target.files && e.target.files.length > 0) {
            setTimeout(() => {
                onSelect(Array.from(e.target.files));
                setIsLoading(false);
            }, 500);
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragging(false);
        }
    };

    return (
        <div
            onClick={() => {
                if (!isLoading) {
                    inputRef.current?.click();
                }
            }}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragOver={(e) => {
                e.preventDefault();
                if (!isDragging) setIsDragging(true);
            }}
            onDragLeave={handleDragLeave}
            className={twMerge(
                clsx(
                    "relative border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center overflow-hidden group",
                    isDragging
                        ? "border-blue-500 bg-blue-500/10 scale-[1.02] shadow-2xl shadow-blue-500/20"
                        : "border-gray-600 hover:border-blue-400 hover:bg-gray-800/30",
                    className
                )
            )}
        >
            {/* Background gradient animation */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
            </div>

            {/* Shimmer effect on drag */}
            {isDragging && (
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-shimmer" />
                </div>
            )}

            {/* Floating particles */}
            {isActive && !isDragging && !isLoading && (
                <>
                    <div className="absolute top-6 left-10 animate-float" style={{ animationDelay: '0s' }}>
                        <Sparkles className="w-4 h-4 text-blue-400/30" />
                    </div>
                    <div className="absolute bottom-8 right-12 animate-float" style={{ animationDelay: '1s' }}>
                        <Sparkles className="w-3 h-3 text-purple-400/30" />
                    </div>
                    <div className="absolute top-12 right-16 animate-float" style={{ animationDelay: '2s' }}>
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400/30" />
                    </div>
                </>
            )}

            <input
                type="file"
                multiple
                accept="image/*,video/*"
                ref={inputRef}
                onChange={handleChange}
                className="hidden"
            />

            <div className={clsx(
                "relative bg-gradient-to-br from-gray-700/50 to-gray-800/30 p-3 rounded-2xl mb-4 transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-blue-500/20",
                bounceAnimation && "animate-bounce-slow",
                isDragging && "scale-110 rotate-6",
                isLoading && "animate-pulse"
            )}>
                {isLoading ? (
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                ) : (
                    <Upload className={clsx(
                        "w-8 h-8 transition-all duration-300",
                        isDragging
                            ? "text-blue-400 scale-110 animate-bounce"
                            : "text-blue-400 group-hover:text-blue-300"
                    )} />
                )}

                {/* Ring effect */}
                <div className={clsx(
                    "absolute inset-0 rounded-2xl border-2 transition-all duration-700",
                    isDragging
                        ? "border-blue-400/30 animate-ping"
                        : "border-transparent group-hover:border-blue-400/20"
                )} />
            </div>

            <h3 className={clsx(
                "text-lg font-bold mb-2 transition-all duration-300 relative",
                isDragging
                    ? "text-blue-300 scale-105"
                    : "text-white group-hover:text-gray-200"
            )}>
                {isLoading ? 'Processing...' : 'Upload Media'}
                {!isLoading && (
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}
            </h3>

            <p className={clsx(
                "text-gray-400 text-sm max-w-md transition-all duration-300",
                isDragging && "text-blue-300/80",
                isLoading && "animate-pulse"
            )}>
                {isLoading
                    ? 'Preparing your files...'
                    : isDragging
                        ? 'Drop files to upload!'
                        : 'Drag & drop images or videos here, or click to browse. Supports multiple files.'
                }
            </p>

            <div className={clsx(
                "flex gap-6 mt-4 transition-all duration-300",
                isDragging && "scale-105",
                isLoading && "opacity-50"
            )}>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg group/format">
                    <FileImage className="w-4 h-4 text-green-400 transition-transform group-hover/format:scale-110" />
                    <span className="text-xs font-medium text-gray-300 group-hover/format:text-green-300 transition-colors">
                        JPG, PNG, WEBP
                    </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg group/format">
                    <FileVideo className="w-4 h-4 text-purple-400 transition-transform group-hover/format:scale-110" />
                    <span className="text-xs font-medium text-gray-300 group-hover/format:text-purple-300 transition-colors">
                        MP4, WEBM
                    </span>
                </div>
            </div>

            {/* Upload stats indicator */}
            {!isLoading && (
                <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                    <Cloud className="w-3.5 h-3.5 animate-float" style={{ animationDelay: '0.5s' }} />
                    <span>Ready to upload</span>
                </div>
            )}

            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-10px) rotate(5deg);
                    }
                }
                
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                
                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-15px);
                    }
                }
                
                @keyframes pulse-glow {
                    0%, 100% {
                        box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
                    }
                    50% {
                        box-shadow: 0 0 40px rgba(59, 130, 246, 0.5);
                    }
                }
                
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                
                .animate-bounce-slow {
                    animation: bounce-slow 2s ease-in-out infinite;
                }
                
                .animate-pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                }
                
                /* Smooth transitions */
                * {
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>
        </div>
    );
};

export default FileSelect;