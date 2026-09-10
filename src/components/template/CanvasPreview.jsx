import React, { useRef, useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { Play, Pause, RotateCcw, X } from 'lucide-react';
import sampleAvatar from '../../Assets/sampleimage.png';

const FILTER_STYLES = {
    original: '',
    aden: 'hue-rotate(-20deg) contrast(0.9) saturate(0.85) brightness(1.2)',
    clarendon: 'contrast(1.2) saturate(1.35)',
    crema: 'sepia(0.5) contrast(1.2) saturate(0.9) hue-rotate(-20deg)',
    gingham: 'hue-rotate(150deg) sepia(0.2) contrast(0.9)',
    juno: 'saturate(1.2) contrast(1.1) brightness(1.1)',
    lark: 'contrast(0.9)',
    ludwig: 'saturate(1.1) contrast(1.1)',
    moon: 'grayscale(1) contrast(1.1) brightness(1.1)',
    perpetua: 'saturate(1.1)',
    reyes: 'sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)',
    slumber: 'saturate(0.6) brightness(1.05)'
};

const CanvasPreview = ({
    previewUrl,
    fileType,
    metadata,
    audioConfig,
    editMetadata,
    onUpdateOverlay,
    activeOverlayId,
    onSelectOverlay,
    onUpdateFooterConfig,
    readOnly = false
}) => {
    const containerRef = useRef(null);
    const mediaAreaRef = useRef(null);
    const videoRef = useRef(null);
    const avatarVideoRef = useRef(null);
    const usernameVideoRef = useRef(null);
    const footerVideoRef = useRef(null);
    const audioRef = useRef(null);

    // State
    const [dragging, setDragging] = useState(null);
    const [isPainting, setIsPainting] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [animationState, setAnimationState] = useState('static');
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [dominantColor, setDominantColor] = useState('#1a1a1a');
    const [brushPos, setBrushPos] = useState({ x: 50, y: 50 }); // Local % for cursor tracking
    const colorCanvasRef = useRef(null);

    const isVideo = fileType?.startsWith('video');

    const safeAudioUrl = React.useMemo(() => {
        return audioConfig?.file ? URL.createObjectURL(audioConfig.file) : null;
    }, [audioConfig?.file]);

    const activeOverlay = metadata.overlayElements.find(el => el.id === activeOverlayId);

    // --- MASK RENDERING HELPER ---
    const generateMaskUrl = useCallback((strokes, containerW, containerH) => {
        if (!strokes || strokes.length === 0) return null;

        const canvas = document.createElement('canvas');
        canvas.width = containerW;
        canvas.height = containerH;
        const ctx = canvas.getContext('2d');

        // Initial fill opaque white
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, containerW, containerH);

        // Draw "erased" areas (black with blur)
        strokes.forEach(s => {
            const x = (s.x / 100) * containerW;
            const y = (s.y / 100) * containerH;
            const r = (s.r / 100) * containerW; // Scaling r same as W for simplicity

            const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
            grad.addColorStop(0, `rgba(0,0,0,${s.opacity})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        });

        return canvas.toDataURL();
    }, []);

    const extractDominantColor = useCallback(() => {
        const media = isVideo ? videoRef.current : mediaAreaRef.current?.querySelector('img');
        if (!media || !colorCanvasRef.current) return;

        try {
            const canvas = colorCanvasRef.current;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            canvas.width = 10;
            canvas.height = 10;
            ctx.drawImage(media, 0, 0, 10, 10);
            const imageData = ctx.getImageData(0, 0, 10, 10).data;
            let r = 0, g = 0, b = 0;
            for (let i = 0; i < imageData.length; i += 4) {
                r += imageData[i]; g += imageData[i + 1]; b += imageData[i + 2];
            }
            const count = imageData.length / 4;
            r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
            const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
            setDominantColor(hex);
            if (onUpdateFooterConfig) onUpdateFooterConfig({ backgroundColor: hex });
        } catch (e) {
            console.warn("Could not extract dominant color:", e);
        }
    }, [isVideo, onUpdateFooterConfig]);

    useEffect(() => {
        if (!isVideo && previewUrl) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = previewUrl;
            img.onload = extractDominantColor;
        }
    }, [previewUrl, isVideo, extractDominantColor]);

    // --- BRUSH PAINTING HANDLER ---
    const handlePaint = (e, overlay, xPercent, yPercent) => {
        if (!overlay.avatarConfig?.softEdgeConfig?.enabled) return;

        const config = overlay.avatarConfig.softEdgeConfig;
        const newStroke = {
            x: xPercent,
            y: yPercent,
            r: config.brushSize || 20,
            blur: config.blurStrength || 10,
            opacity: config.opacity || 1
        };

        const currentStrokes = config.strokes || [];
        onUpdateOverlay(overlay.id, {
            avatarConfig: {
                ...overlay.avatarConfig,
                softEdgeConfig: {
                    ...config,
                    strokes: [...currentStrokes, newStroke]
                }
            }
        });
    };

    const handleMouseDown = (e, overlay, mode = 'move') => {
        if (isPlaying || readOnly) return;
        e.preventDefault(); e.stopPropagation();
        onSelectOverlay?.(overlay.id);

        if (overlay.type === 'avatar' && overlay.avatarConfig?.softEdgeConfig?.enabled && mode === 'move') {
            setIsPainting(true);
            const rect = e.currentTarget.getBoundingClientRect();
            const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
            const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
            setBrushPos({ x: xPercent, y: yPercent });
            handlePaint(e, overlay, xPercent, yPercent);
            return;
        }

        if (!mediaAreaRef.current) return;
        const rect = mediaAreaRef.current.getBoundingClientRect();
        setDragging({
            id: overlay.id,
            type: overlay.type,
            mode,
            startX: e.clientX,
            startY: e.clientY,
            initialXPercent: overlay.xPercent || 0,
            initialYPercent: overlay.yPercent || 0,
            initialWPercent: overlay.wPercent || 10,
            initialHPercent: overlay.hPercent || 10,
            containerWidth: rect.width,
            containerHeight: rect.height,
            aspectRatio: (overlay.wPercent && overlay.hPercent) ? (overlay.wPercent / overlay.hPercent) : 1
        });
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (activeOverlay?.type === 'avatar' && activeOverlay?.avatarConfig?.softEdgeConfig?.enabled) {
                const el = document.getElementById(`overlay-${activeOverlay.id}`);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
                    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
                    setBrushPos({ x: xPercent, y: yPercent });

                    if (isPainting) {
                        handlePaint(e, activeOverlay, xPercent, yPercent);
                    }
                }
                if (isPainting) return;
            }

            if (!dragging) return;
            const deltaX = e.clientX - dragging.startX;
            const deltaY = e.clientY - dragging.startY;
            const deltaXPercent = (deltaX / dragging.containerWidth) * 100;
            const deltaYPercent = (deltaY / (dragging.containerHeight || 1)) * 100;

            if (dragging.id === 'footer') {
                if (dragging.mode.startsWith('resize')) {
                    const handle = dragging.mode.split('-')[1];
                    let newH = dragging.initialHPercent;
                    let newW = dragging.initialWPercent;
                    let newX = dragging.initialXPercent;

                    if (handle.includes('n')) newH = Math.max(5, Math.min(50, dragging.initialHPercent - deltaYPercent));
                    if (handle.includes('e')) newW = Math.max(10, dragging.initialWPercent + deltaXPercent);
                    if (handle.includes('w')) {
                        const possibleW = Math.max(10, dragging.initialWPercent - deltaXPercent);
                        newX = dragging.initialXPercent + (dragging.initialWPercent - possibleW);
                        newW = possibleW;
                    }

                    if (newX < 0) { newW += newX; newX = 0; }
                    if (newX + newW > 100) newW = 100 - newX;

                    onUpdateFooterConfig?.({ heightPercent: newH, wPercent: newW, xPercent: newX });
                } else if (dragging.mode === 'move') {
                    const newX = Math.max(0, Math.min(100 - dragging.initialWPercent, dragging.initialXPercent + deltaXPercent));
                    onUpdateFooterConfig?.({ xPercent: newX });
                }
                return;
            }

            if (dragging.mode === 'move') {
                const newX = Math.max(0, Math.min(100 - dragging.initialWPercent, dragging.initialXPercent + deltaXPercent));
                const newY = Math.max(0, Math.min(100 - dragging.initialHPercent, dragging.initialYPercent + deltaYPercent));
                onUpdateOverlay(dragging.id, {
                    xPercent: newX,
                    yPercent: newY
                });
            } else if (dragging.mode.startsWith('resize')) {
                const handle = dragging.mode.split('-')[1];
                let newX = dragging.initialXPercent;
                let newY = dragging.initialYPercent;
                let newW = dragging.initialWPercent;
                let newH = dragging.initialHPercent;

                const lockAspectRatio = dragging.type === 'avatar' || dragging.type === 'username';

                if (handle.includes('e')) newW = Math.max(5, dragging.initialWPercent + deltaXPercent);
                if (handle.includes('s')) newH = Math.max(5, dragging.initialHPercent + deltaYPercent);
                if (handle.includes('w')) {
                    const possibleW = Math.max(5, dragging.initialWPercent - deltaXPercent);
                    newX = dragging.initialXPercent + (dragging.initialWPercent - possibleW);
                    newW = possibleW;
                }
                if (handle.includes('n')) {
                    const possibleH = Math.max(5, dragging.initialHPercent - deltaYPercent);
                    newY = dragging.initialYPercent + (dragging.initialHPercent - possibleH);
                    newH = possibleH;
                }

                if (lockAspectRatio) {
                    if (handle.includes('e') || handle.includes('w')) {
                        newH = newW / dragging.aspectRatio;
                    } else {
                        newW = newH * dragging.aspectRatio;
                    }
                }

                // Constraints
                if (newX < 0) { newW += newX; newX = 0; }
                if (newY < 0) { newH += newY; newY = 0; }
                if (newX + newW > 100) newW = 100 - newX;
                if (newY + newH > 100) newH = 100 - newY;

                onUpdateOverlay(dragging.id, {
                    xPercent: newX,
                    yPercent: newY,
                    wPercent: newW,
                    hPercent: newH
                });
            }
        };

        const handleMouseUp = () => {
            setDragging(null);
            setIsPainting(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, isPainting, activeOverlay, onUpdateOverlay]);

    const handlePlay = () => {
        setIsPlaying(true);
        setAnimationState('reset');
        setTimeout(() => {
            setAnimationState('animating');
            if (videoRef.current) videoRef.current.play();
            if (avatarVideoRef.current) avatarVideoRef.current.play();
            if (usernameVideoRef.current) usernameVideoRef.current.play();
            if (footerVideoRef.current) footerVideoRef.current.play();
            if (audioRef.current) {
                audioRef.current.currentTime = audioConfig?.crop?.start || 0;
                audioRef.current.play();
            }
        }, 50);
    };

    const handlePause = () => {
        setIsPlaying(false);
        setAnimationState('static');
        if (videoRef.current) videoRef.current.pause();
        if (avatarVideoRef.current) avatarVideoRef.current.pause();
        if (usernameVideoRef.current) usernameVideoRef.current.pause();
        if (footerVideoRef.current) footerVideoRef.current.pause();
        if (audioRef.current) audioRef.current.pause();
    };

    const handleReset = () => {
        setIsPlaying(false);
        setAnimationState('static');
        setCurrentTime(0);
        if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
        if (avatarVideoRef.current) { avatarVideoRef.current.pause(); avatarVideoRef.current.currentTime = 0; }
        if (usernameVideoRef.current) { usernameVideoRef.current.pause(); usernameVideoRef.current.currentTime = 0; }
        if (footerVideoRef.current) { footerVideoRef.current.pause(); footerVideoRef.current.currentTime = 0; }
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = audioConfig?.crop?.start || 0; }
    };

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        if (videoRef.current) videoRef.current.currentTime = time;
        if (avatarVideoRef.current) avatarVideoRef.current.currentTime = time % (avatarVideoRef.current.duration || 1);
        if (usernameVideoRef.current) usernameVideoRef.current.currentTime = time % (usernameVideoRef.current.duration || 1);
        if (footerVideoRef.current) footerVideoRef.current.currentTime = time % (footerVideoRef.current.duration || 1);
        if (audioRef.current) {
            const offset = audioConfig?.crop?.start || 0;
            audioRef.current.currentTime = time + offset;
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const time = videoRef.current.currentTime;
            setCurrentTime(time);
            setDuration(videoRef.current.duration || 0);

            // Periodically sync mask videos if they drift
            const syncMask = (maskRef) => {
                if (maskRef.current && Math.abs(maskRef.current.currentTime - (time % (maskRef.current.duration || 1))) > 0.2) {
                    maskRef.current.currentTime = time % (maskRef.current.duration || 1);
                }
            };
            syncMask(avatarVideoRef);
            syncMask(usernameVideoRef);
            syncMask(footerVideoRef);
        } else if (audioRef.current) {
            const offset = audioConfig?.crop?.start || 0;
            setCurrentTime(Math.max(0, audioRef.current.currentTime - offset));
            setDuration(audioRef.current.duration - offset);
        }
    };

    const getInitialOffset = (overlay, containerW, containerH) => {
        if (!overlay.animation?.enabled) return { x: 0, y: 0 };
        const { direction } = overlay.animation;
        const x = (overlay.xPercent / 100) * containerW;
        const y = (overlay.yPercent / 100) * containerH;
        const w = (overlay.wPercent / 100) * containerW;
        const h = (overlay.hPercent / 100) * containerH;

        switch (direction) {
            case 'top': return { x: 0, y: -(y + h) };
            case 'bottom': return { x: 0, y: (containerH - y) };
            case 'left': return { x: -(x + w), y: 0 };
            case 'right': return { x: (containerW - x), y: 0 };
            default: return { x: 0, y: 0 };
        }
    };

    return (
        <div className="flex flex-col items-center h-full w-full">
            {/* Media Controller Bar */}
            <div className="w-full bg-gray-900 p-2 rounded-t-xl flex items-center gap-3 border-b border-gray-800 mb-2">
                <button onClick={isPlaying ? handlePause : handlePlay} className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full hover:bg-blue-500 text-white transition-colors shadow-lg">
                    {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                </button>
                <button onClick={handleReset} className="text-gray-400 hover:text-white transition-colors" title="Reset">
                    <RotateCcw size={16} />
                </button>
                <div className="flex-1 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-400 w-8 text-right">{Math.floor(currentTime)}s</span>
                    <input type="range" min="0" max={duration || 10} step="0.1" value={currentTime} onChange={handleSeek} className="flex-1 h-1 bg-gray-800 rounded-full appearance-none cursor-pointer accent-blue-500" />
                    <span className="text-[10px] font-mono text-gray-400 w-8">{Math.floor(duration || 0)}s</span>
                </div>
            </div>

            <div className="flex justify-center items-center bg-black/40 h-full p-2 rounded-xl w-full overflow-hidden">
                <div
                    ref={containerRef}
                    className="relative shadow-2xl overflow-hidden bg-black"
                    style={{
                        aspectRatio: editMetadata?.crop?.ratio === 'original' ? (metadata?.canvasSettings?.aspectRatio?.replace(':', '/') || '9/16') : (editMetadata?.crop?.ratio?.replace(':', '/') || '9/16'),
                        height: '100%',
                        maxHeight: '100%',
                        backgroundColor: dominantColor
                    }}
                >
                    <div className="absolute inset-0 flex flex-col">
                        <div ref={mediaAreaRef} className="flex-1 relative overflow-hidden bg-black">
                            {/* Background Glass/Blur */}
                            <div className="absolute inset-0 z-0 opacity-40">
                                {isVideo ? (
                                    <div className="w-full h-full bg-blue-900/10 backdrop-blur-3xl" />
                                ) : (
                                    <div className="w-full h-full bg-center bg-cover scale-110 blur-3xl" style={{ backgroundImage: `url(${previewUrl})` }} />
                                )}
                            </div>

                            {/* Main Media Rendering */}
                            {isVideo ? (
                                <video
                                    ref={videoRef}
                                    src={previewUrl}
                                    key={previewUrl}
                                    className="absolute inset-0 w-full h-full object-contain z-10"
                                    style={{
                                        filter: FILTER_STYLES[editMetadata?.filters?.preset || 'original'],
                                        transform: `scale(${editMetadata?.crop?.zoomLevel || 1})`
                                    }}
                                    muted={audioConfig?.muteOriginalAudio || false}
                                    playsInline
                                    onTimeUpdate={handleTimeUpdate}
                                    onEnded={() => setIsPlaying(false)}
                                    onLoadedData={extractDominantColor}
                                />
                            ) : (
                                <img
                                    src={previewUrl}
                                    className="absolute inset-0 w-full h-full object-contain z-10"
                                    style={{
                                        filter: FILTER_STYLES[editMetadata?.filters?.preset || 'original'],
                                        transform: `scale(${editMetadata?.crop?.zoomLevel || 1})`
                                    }}
                                    onLoad={extractDominantColor}
                                    alt="Preview"
                                />
                            )}

                            <canvas ref={colorCanvasRef} style={{ display: 'none' }} />

                            {/* Overlays Layer */}
                            <div className="absolute inset-0 z-20 pointer-events-none">
                                {metadata.overlayElements.map((overlay) => {
                                    if (!overlay.visible) return null;
                                    const isActive = activeOverlayId === overlay.id;

                                    let transformStyle = {};
                                    let transitionStyle = {};
                                    if (isPlaying && mediaAreaRef.current) {
                                        const { width, height } = mediaAreaRef.current.getBoundingClientRect();
                                        const offset = getInitialOffset(overlay, width, height);
                                        if (animationState === 'reset') {
                                            transformStyle = { transform: `translate(${offset.x}px, ${offset.y}px)` };
                                            transitionStyle = { transition: 'none' };
                                        } else if (animationState === 'animating') {
                                            transformStyle = { transform: 'translate(0, 0)' };
                                            transitionStyle = { transition: `transform ${overlay.animation?.speed || 1}s cubic-bezier(0.2, 1, 0.3, 1)` };
                                        }
                                    }

                                    // Special handle for avatar mask
                                    let maskStyle = {};
                                    if (overlay.type === 'avatar' && overlay.avatarConfig?.softEdgeConfig?.enabled && containerRef.current) {
                                        const rect = containerRef.current.getBoundingClientRect();
                                        const avatarW = (overlay.wPercent / 100) * rect.width;
                                        const avatarH = (overlay.hPercent / 100) * rect.height;
                                        const maskUrl = generateMaskUrl(overlay.avatarConfig.softEdgeConfig.strokes, avatarW, avatarH);
                                        if (maskUrl) {
                                            maskStyle = {
                                                maskImage: `url(${maskUrl})`,
                                                WebkitMaskImage: `url(${maskUrl})`,
                                                maskSize: '100% 100%',
                                                WebkitMaskSize: '100% 100%'
                                            };
                                        }
                                    }

                                    return (
                                        <div
                                            key={overlay.id}
                                            id={`overlay-${overlay.id}`}
                                            className={clsx(
                                                "absolute pointer-events-auto transition-colors",
                                                (!isPlaying && !readOnly) && "cursor-move",
                                                (!isPlaying && !readOnly && isActive) ? "border-2 border-blue-500 z-50 ring-4 ring-blue-500/20" : "border border-transparent hover:border-white/30 z-10",
                                                (!isPlaying && readOnly && isActive) && "border-2 border-blue-400/50 z-50",
                                                overlay.type === 'avatar' && overlay.avatarConfig?.softEdgeConfig?.enabled && isActive && !readOnly && "!cursor-none"
                                            )}
                                            style={{
                                                left: `${overlay.xPercent}%`, top: `${overlay.yPercent}%`,
                                                width: `${overlay.wPercent}%`, height: `${overlay.hPercent}%`,
                                                ...transformStyle, ...transitionStyle
                                            }}
                                            onMouseDown={(e) => handleMouseDown(e, overlay, 'move')}
                                        >
                                            {isActive && !isPlaying && (
                                                <>
                                                    {/* Brush Preview Cursor */}
                                                    {overlay.type === 'avatar' && overlay.avatarConfig?.softEdgeConfig?.enabled && (
                                                        <div
                                                            className="absolute pointer-events-none z-[100] border-2 border-white rounded-full bg-blue-500/10 shadow-[0_0_0_1px_rgba(0,0,0,0.5),0_0_15px_rgba(59,130,246,0.3)] transition-all duration-75"
                                                            style={{
                                                                width: `${overlay.avatarConfig.softEdgeConfig.brushSize}%`,
                                                                height: `${overlay.avatarConfig.softEdgeConfig.brushSize}%`,
                                                                left: `${brushPos.x}%`,
                                                                top: `${brushPos.y}%`,
                                                                transform: 'translate(-50%, -50%)',
                                                                filter: `blur(${overlay.avatarConfig.softEdgeConfig.blurStrength / 4}px)`
                                                            }}
                                                        />
                                                    )}

                                                    {!overlay.avatarConfig?.softEdgeConfig?.enabled && (
                                                        <>
                                                            {/* Resize Handles */}
                                                            {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(handle => {
                                                                const isCorner = handle.length === 2;
                                                                const handleClasses = clsx(
                                                                    "absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full z-50 shadow-lg transition-transform hover:scale-125",
                                                                    handle === 'nw' && "-top-1.5 -left-1.5 cursor-nw-resize",
                                                                    handle === 'n' && "-top-1.5 left-1/2 -translate-x-1/2 cursor-n-resize",
                                                                    handle === 'ne' && "-top-1.5 -right-1.5 cursor-ne-resize",
                                                                    handle === 'e' && "top-1/2 -right-1.5 -translate-y-1/2 cursor-e-resize",
                                                                    handle === 'se' && "-bottom-1.5 -right-1.5 cursor-se-resize",
                                                                    handle === 's' && "-bottom-1.5 left-1/2 -translate-x-1/2 cursor-s-resize",
                                                                    handle === 'sw' && "-bottom-1.5 -left-1.5 cursor-sw-resize",
                                                                    handle === 'w' && "top-1/2 -left-1.5 -translate-y-1/2 cursor-w-resize"
                                                                );
                                                                return (
                                                                    <div
                                                                        key={handle}
                                                                        className={handleClasses}
                                                                        onMouseDown={(e) => handleMouseDown(e, overlay, `resize-${handle}`)}
                                                                    />
                                                                );
                                                            })}

                                                            {/* Coordinate Tooltip */}
                                                            {dragging?.id === overlay.id && (
                                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap z-[60] font-mono">
                                                                    X: {overlay.xPercent.toFixed(1)}% | Y: {overlay.yPercent.toFixed(1)}%
                                                                    <br />
                                                                    W: {overlay.wPercent.toFixed(1)}% | H: {overlay.hPercent.toFixed(1)}%
                                                                </div>
                                                            )}

                                                            <button className="absolute -top-6 -right-6 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white border-2 border-white z-50 hover:bg-red-600 shadow-lg" onClick={(e) => { e.stopPropagation(); onUpdateOverlay(overlay.id, { visible: false }); }}>
                                                                <X size={12} strokeWidth={3} />
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                            <div className="w-full h-full relative" style={maskStyle}>
                                                {overlay.type === 'avatar' && (
                                                    <div className={clsx("w-full h-full overflow-hidden shadow-xl", (overlay.avatarConfig?.shape === 'square' || overlay.shape === 'square') ? 'rounded-lg' : 'rounded-full')} style={{ border: (overlay.maskVideoUrl || overlay.type === 'avatar') ? 'none' : (overlay.avatarConfig?.softEdgeConfig?.enabled ? 'none' : '2px solid white') }}>
                                                        {overlay.maskVideoUrl ? (
                                                            <video
                                                                ref={avatarVideoRef}
                                                                src={overlay.maskVideoUrl}
                                                                className="w-full h-full object-cover"
                                                                muted
                                                                playsInline
                                                                loop
                                                            />
                                                        ) : (
                                                            <img src={sampleAvatar} className="w-full h-full object-cover" alt="Sample Avatar" />
                                                        )}
                                                    </div>
                                                )}
                                                {overlay.type === 'logo' && (
                                                    <div className="w-full h-full flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 rounded">
                                                        <span className="text-[8px] text-white font-black uppercase">LOGO</span>
                                                    </div>
                                                )}
                                                {overlay.type === 'username' && (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        {overlay.maskVideoUrl ? (
                                                            <video
                                                                ref={usernameVideoRef}
                                                                src={overlay.maskVideoUrl}
                                                                className="w-full h-full object-contain"
                                                                muted
                                                                playsInline
                                                                loop
                                                            />
                                                        ) : (
                                                            <span className="text-white text-[10px] font-bold whitespace-nowrap px-2 py-1 bg-black/20 rounded">
                                                                {overlay.text || 'User Name'}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {overlay.type === 'image' && (
                                                    <div className="w-full h-full overflow-hidden bg-white/5 flex items-center justify-center border border-dashed border-white/20">
                                                        {overlay.url ? (
                                                            <img src={overlay.url} className="w-full h-full object-cover" alt="Overlay" />
                                                        ) : (
                                                            <span className="text-[8px] text-white/40 font-black uppercase text-center px-1">Preview Image Overlay</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer Config */}
                        {metadata.footerConfig?.enabled && (
                            <div className="w-full relative z-30 shrink-0 border-t border-white/10" style={{ height: `${metadata.footerConfig.heightPercent}%` }}>
                                <div
                                    className={clsx(
                                        "relative h-full transition-colors cursor-move",
                                        (!isPlaying && !readOnly && activeOverlayId === 'footer') ? "border-2 border-blue-500 ring-4 ring-blue-500/20" : "border border-transparent hover:border-white/30"
                                    )}
                                    style={{
                                        backgroundColor: metadata.footerConfig.maskVideoUrl ? 'transparent' : (metadata.footerConfig.backgroundColor || '#000000'),
                                        width: `${metadata.footerConfig.wPercent ?? 100}%`,
                                        left: `${metadata.footerConfig.xPercent ?? 0}%`
                                    }}
                                    onMouseDown={(e) => {
                                        if (isPlaying || readOnly) return;
                                        onSelectOverlay?.('footer');
                                        const rect = mediaAreaRef.current.parentElement.getBoundingClientRect();
                                        setDragging({
                                            id: 'footer',
                                            mode: 'move',
                                            startX: e.clientX,
                                            startY: e.clientY,
                                            initialXPercent: metadata.footerConfig.xPercent ?? 0,
                                            initialWPercent: metadata.footerConfig.wPercent ?? 100,
                                            initialHPercent: metadata.footerConfig.heightPercent || 15,
                                            containerWidth: rect.width,
                                            containerHeight: rect.height,
                                        });
                                    }}
                                >
                                    {metadata.footerConfig.maskVideoUrl ? (
                                        <video
                                            ref={footerVideoRef}
                                            src={metadata.footerConfig.maskVideoUrl}
                                            className="w-full h-full object-cover"
                                            muted
                                            playsInline
                                            loop
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col justify-center px-4 gap-1">
                                            {metadata.footerConfig.showElements?.name && <div className="h-2 w-24 bg-white/30 rounded" />}
                                            <div className="flex gap-2">
                                                {metadata.footerConfig.showElements?.socialIcons && (
                                                    <>
                                                        <div className="w-4 h-4 rounded-full bg-white/20" />
                                                        <div className="w-4 h-4 rounded-full bg-white/20" />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {!isPlaying && activeOverlayId === 'footer' && !readOnly && (
                                        <>
                                            {/* Footer Resize Handles */}
                                            {['n', 'e', 'w'].map(handle => (
                                                <div
                                                    key={handle}
                                                    className={clsx(
                                                        "absolute bg-blue-500 border-2 border-white rounded-full z-50 shadow-lg",
                                                        handle === 'n' && "-top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 cursor-ns-resize",
                                                        handle === 'e' && "top-1/2 -right-1.5 -translate-y-1/2 w-3 h-8 cursor-ew-resize",
                                                        handle === 'w' && "top-1/2 -left-1.5 -translate-y-1/2 w-3 h-8 cursor-ew-resize"
                                                    )}
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                        const rect = mediaAreaRef.current.parentElement.getBoundingClientRect();
                                                        setDragging({
                                                            id: 'footer',
                                                            mode: `resize-${handle}`,
                                                            startX: e.clientX,
                                                            startY: e.clientY,
                                                            initialXPercent: metadata.footerConfig.xPercent ?? 0,
                                                            initialWPercent: metadata.footerConfig.wPercent ?? 100,
                                                            initialHPercent: metadata.footerConfig.heightPercent || 15,
                                                            containerWidth: rect.width,
                                                            containerHeight: rect.height
                                                        });
                                                    }}
                                                />
                                            ))}
                                            <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded shadow-xl font-mono flex flex-col items-end">
                                                <span>W: {(metadata.footerConfig.wPercent ?? 100).toFixed(1)}%</span>
                                                <span>H: {metadata.footerConfig.heightPercent.toFixed(1)}%</span>
                                                <span>X: {(metadata.footerConfig.xPercent ?? 0).toFixed(1)}%</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {safeAudioUrl && (
                        <audio ref={audioRef} src={safeAudioUrl} onTimeUpdate={!isVideo ? handleTimeUpdate : undefined} onEnded={() => setIsPlaying(false)} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CanvasPreview;
