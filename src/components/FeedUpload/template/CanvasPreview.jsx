import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { clsx } from 'clsx';
import { Play, Pause, RotateCcw, X } from 'lucide-react';
import sampleAvatar from '../../../Assets/sampleimage.png';

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

const OverlayItem = React.memo(({
    overlay,
    activeOverlayId,
    isPlaying,
    animationState,
    mediaAreaRef,
    containerRef,
    brushPos,
    onMouseDown,
    onUpdateOverlay,
    isPainting
}) => {
    const isActive = activeOverlayId === overlay.id;

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

    // Calculate Transform & Transition using useMemo to avoid re-calc on every render
    const { transformStyle, transitionStyle } = useMemo(() => {
        let tStyle = {};
        let trStyle = {};

        if (isPlaying && mediaAreaRef.current) {
            const { width, height } = mediaAreaRef.current.getBoundingClientRect();
            const offset = getInitialOffset(overlay, width, height);

            if (animationState === 'reset') {
                tStyle = { transform: `translate(${offset.x}px, ${offset.y}px)` };
                trStyle = { transition: 'none' };
            } else if (animationState === 'animating') {
                tStyle = { transform: 'translate(0, 0)' };
                trStyle = { transition: `transform ${overlay.animation?.speed || 1}s cubic-bezier(0.2, 1, 0.3, 1)` };
            }
        }
        return { transformStyle: tStyle, transitionStyle: trStyle };
    }, [isPlaying, animationState, overlay, mediaAreaRef]);

    // Mask Generation (Memoized) - This handles the heavy lifting
    const maskStyle = useMemo(() => {
        if (overlay.type !== 'avatar' || !overlay.avatarConfig?.softEdgeConfig?.enabled || !containerRef.current) {
            return {};
        }

        const strokes = overlay.avatarConfig.softEdgeConfig.strokes;
        if (!strokes || strokes.length === 0) return {};

        const rect = containerRef.current.getBoundingClientRect();
        // Use rect size to determine relative sizing for mask canvas
        const containerW = (overlay.wPercent / 100) * rect.width;
        const containerH = (overlay.hPercent / 100) * rect.height;

        // If dimensions are invalid, return empty
        if (containerW <= 0 || containerH <= 0) return {};

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
            const r = (s.r / 100) * containerW;

            const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
            grad.addColorStop(0, `rgba(0,0,0,${s.opacity})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        });

        const url = canvas.toDataURL();
        return {
            maskImage: `url(${url})`,
            WebkitMaskImage: `url(${url})`,
            maskSize: '100% 100%',
            WebkitMaskSize: '100% 100%'
        };
    }, [
        overlay.type,
        overlay.avatarConfig?.softEdgeConfig,
        overlay.wPercent,
        overlay.hPercent,
        // We do NOT depend on containerRef itself (which is stable) but strictly speaking we need its dimensions.
        // However, dimensions change on resize. If resizing happens, the parent re-renders and we get new wPercent/hPercent?
        // No, wPercent/hPercent are strictly controlled by state. But pixel size changes on window resize.
        // This might need a window resize listener or reliance on parent re-renders. 
        // For now, let's assume parent re-renders on significant layout changes or we accept mask might be slightly off during resize until interaction.
    ]);


    if (!overlay.visible) return null;

    return (
        <div
            id={`overlay-${overlay.id}`}
            className={clsx(
                "absolute pointer-events-auto transition-all",
                !isPlaying && "cursor-move",
                !isPlaying && isActive ? "z-50 ring-4 ring-blue-500/50 outline outline-2 outline-blue-500 rounded-sm" : "z-10",
                overlay.type === 'avatar' && overlay.avatarConfig?.softEdgeConfig?.enabled && isActive && "!cursor-none"
            )}
            style={{
                left: `${overlay.xPercent}%`, top: `${overlay.yPercent}%`,
                width: `${overlay.wPercent}%`, height: `${overlay.hPercent}%`,
                ...transformStyle, ...transitionStyle
            }}
            onMouseDown={(e) => onMouseDown(e, overlay, 'move')}
        >
            {isActive && !isPlaying && (
                <>
                    {/* Brush Preview Cursor */}
                    {overlay.type === 'avatar' && overlay.avatarConfig?.softEdgeConfig?.enabled && (
                        <div
                            className="absolute pointer-events-none z-[100] border-2 border-white rounded-full bg-blue-500/10 shadow-[0_0_0_1px_rgba(0,0,0,0.5),0_0_20px_rgba(59,130,246,0.5)] transition-all duration-75"
                            style={{
                                width: `${overlay.avatarConfig.softEdgeConfig.brushSize}%`,
                                height: `${overlay.avatarConfig.softEdgeConfig.brushSize}%`,
                                left: `${brushPos.x}%`,
                                top: `${brushPos.y}%`,
                                transform: 'translate(-50%, -50%)',
                                filter: `blur(${overlay.avatarConfig.softEdgeConfig.brushSize / 4}px)`
                            }}
                        />
                    )}

                    {!overlay.avatarConfig?.softEdgeConfig?.enabled && (
                        <>
                            <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-blue-500 rounded-full cursor-nwse-resize border-2 border-white z-50 shadow-2xl transform hover:scale-125 transition-transform" onMouseDown={(e) => onMouseDown(e, overlay, 'resize')} />
                            <button className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white border-2 border-white z-50 hover:bg-red-600 shadow-2xl transform hover:scale-125 transition-transform" onClick={(e) => { e.stopPropagation(); onUpdateOverlay(overlay.id, { visible: false }); }}>
                                <X size={12} strokeWidth={4} />
                            </button>
                        </>
                    )}
                </>
            )}
            <div className="w-full h-full relative" style={maskStyle}>
                {overlay.type === 'avatar' && (
                    <div className={clsx("w-full h-full overflow-hidden shadow-2xl", (overlay.avatarConfig?.shape === 'square' || overlay.shape === 'square') ? 'rounded-2xl' : 'rounded-full')} style={{ border: overlay.avatarConfig?.softEdgeConfig?.enabled ? 'none' : '2.5px solid white' }}>
                        <img src={sampleAvatar} alt="Avatar" className="w-full h-full object-cover" draggable={false} />
                    </div>
                )}
                {overlay.type === 'logo' && (
                    <div className="w-full h-full flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
                        <span className="text-[10px] text-white font-black uppercase tracking-tighter">LOGO</span>
                    </div>
                )}
                {overlay.type === 'username' && (
                    <div className="w-full h-full flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg px-2">
                        <span className="text-white font-black drop-shadow-2xl truncate text-center uppercase tracking-wider" style={{ fontSize: '12px' }}>{overlay.text || 'User Name'}</span>
                    </div>
                )}
            </div>
        </div>
    );
});

const CanvasPreview = ({
    previewUrl,
    fileType,
    metadata,
    audioConfig,
    editMetadata,
    onUpdateOverlay,
    activeOverlayId,
    onSelectOverlay,
    onUpdateFooterConfig
}) => {
    const containerRef = useRef(null);
    const mediaAreaRef = useRef(null);
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const colorCanvasRef = useRef(null);

    // State
    const [dragging, setDragging] = useState(null);
    const [isPainting, setIsPainting] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [animationState, setAnimationState] = useState('static');
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [dominantColor, setDominantColor] = useState('#1a1a1a');
    const [brushPos, setBrushPos] = useState({ x: 50, y: 50 }); // Local % for cursor tracking

    const isVideo = fileType?.startsWith('video');

    const safeAudioUrl = React.useMemo(() => {
        return audioConfig?.file ? URL.createObjectURL(audioConfig.file) : null;
    }, [audioConfig?.file]);

    const activeOverlay = metadata.overlayElements.find(el => el.id === activeOverlayId);

    const extractDominantColor = React.useCallback(() => {
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
            blur: config.brushSize / 2, // Simple blur based on brush size
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

    const handleMouseDown = useCallback((e, overlay, mode = 'move') => {
        if (isPlaying) return;
        e.preventDefault(); e.stopPropagation();
        onSelectOverlay(overlay.id);

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
            id: overlay.id, mode, startX: e.clientX, startY: e.clientY,
            initialXPercent: overlay.xPercent, initialYPercent: overlay.yPercent,
            initialWPercent: overlay.wPercent, initialHPercent: overlay.hPercent,
            containerWidth: rect.width, containerHeight: rect.height,
        });
    }, [isPlaying, onSelectOverlay]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isPainting && activeOverlay?.type === 'avatar' && activeOverlay?.avatarConfig?.softEdgeConfig?.enabled) {
                const el = document.getElementById(`overlay-${activeOverlay.id}`);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
                    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
                    setBrushPos({ x: xPercent, y: yPercent });
                    handlePaint(e, activeOverlay, xPercent, yPercent);
                    return;
                }
            }

            if (!dragging) return;
            const deltaX = e.clientX - dragging.startX;
            const deltaY = e.clientY - dragging.startY;
            const deltaXPercent = (deltaX / dragging.containerWidth) * 100;
            const deltaYPercent = (deltaY / dragging.containerHeight) * 100;

            if (dragging.mode === 'move') {
                onUpdateOverlay(dragging.id, {
                    xPercent: dragging.initialXPercent + deltaXPercent,
                    yPercent: dragging.initialYPercent + deltaYPercent
                });
            } else if (dragging.mode === 'resize') {
                onUpdateOverlay(dragging.id, {
                    wPercent: Math.max(5, dragging.initialWPercent + deltaXPercent),
                    hPercent: Math.max(5, dragging.initialHPercent + deltaYPercent)
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
            if (audioRef.current) {
                audioRef.current.currentTime = audioConfig?.crop?.start || 0;
                audioRef.current.play();
            }
        }, 300);
    };

    const handlePause = () => {
        setIsPlaying(false);
        setAnimationState('static');
        if (videoRef.current) videoRef.current.pause();
        if (audioRef.current) audioRef.current.pause();
    };

    const handleReset = () => {
        setIsPlaying(false);
        setAnimationState('static');
        setCurrentTime(0);
        if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = audioConfig?.crop?.start || 0; }
    };

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        if (videoRef.current) videoRef.current.currentTime = time;
        if (audioRef.current) {
            const offset = audioConfig?.crop?.start || 0;
            audioRef.current.currentTime = time + offset;
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            setDuration(videoRef.current.duration || 0);
        } else if (audioRef.current) {
            const offset = audioConfig?.crop?.start || 0;
            setCurrentTime(Math.max(0, audioRef.current.currentTime - offset));
            setDuration(audioRef.current.duration - offset);
        }
    };

    return (
        <div className="flex flex-col items-center h-full w-full">
            {/* Media Controller Bar */}
            <div className="w-full bg-gray-900/50 backdrop-blur-md p-3 rounded-2xl flex items-center gap-4 border border-gray-800 mb-6 shadow-xl">
                <button onClick={isPlaying ? handlePause : handlePlay} className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-xl hover:bg-blue-500 text-white transition-all shadow-lg transform active:scale-95">
                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                </button>
                <button onClick={handleReset} className="p-2 text-gray-500 hover:text-white transition-colors" title="Reset">
                    <RotateCcw size={18} />
                </button>
                <div className="flex-1 flex items-center gap-4">
                    <span className="text-[10px] font-mono font-bold text-gray-500 w-10 text-right">{Math.floor(currentTime)}s</span>
                    <input type="range" min="0" max={duration || 10} step="0.1" value={currentTime} onChange={handleSeek} className="flex-1 h-1.5 bg-gray-800 rounded-full appearance-none cursor-pointer accent-blue-500" />
                    <span className="text-[10px] font-mono font-bold text-gray-500 w-10">{Math.floor(duration || 0)}s</span>
                </div>
            </div>

            <div className="flex justify-center items-center bg-gray-950/40 h-full p-1 rounded-[2.5rem] w-full overflow-hidden border border-white/5 shadow-inner backdrop-blur-3xl">
                <div
                    ref={containerRef}
                    className="relative shadow-2xl overflow-hidden bg-black rounded-xl border border-white/5"
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
                                    <div className="w-full h-full bg-center bg-cover scale-110 blur-3xl opacity-50" style={{ backgroundImage: `url(${previewUrl})` }} />
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
                                />
                            )}

                            <canvas ref={colorCanvasRef} style={{ display: 'none' }} />

                            {/* Overlays Layer - Uses Rendered Overlay Items */}
                            <div className="absolute inset-0 z-20 pointer-events-none">
                                {metadata.overlayElements.map((overlay) => (
                                    <OverlayItem
                                        key={overlay.id}
                                        overlay={overlay}
                                        activeOverlayId={activeOverlayId}
                                        isPlaying={isPlaying}
                                        animationState={animationState}
                                        mediaAreaRef={mediaAreaRef}
                                        containerRef={containerRef}
                                        brushPos={brushPos}
                                        onMouseDown={handleMouseDown}
                                        onUpdateOverlay={onUpdateOverlay}
                                        isPainting={isPainting}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Footer Config Rendering */}
                        {metadata.footerConfig?.enabled && (
                            <div className="w-full px-6 py-4 flex flex-col gap-1.5 z-30 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] border-t border-white/5" style={{ backgroundColor: metadata.footerConfig.backgroundColor || '#000000', color: '#ffffff' }}>
                                <div className="flex items-center justify-between">
                                    <span className="font-black text-xs uppercase tracking-widest italic">User Name</span>
                                    <div className="flex gap-2.5">
                                        <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-bold border border-white/10">f</div>
                                        <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-bold border border-white/10">i</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold opacity-60 mt-0.5 tracking-tight">
                                    <span>user@example.com</span>
                                    <span>+1 234 567 8900</span>
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
