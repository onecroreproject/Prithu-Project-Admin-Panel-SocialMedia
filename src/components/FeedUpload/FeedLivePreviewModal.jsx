import React, { useState, useEffect, useMemo } from 'react';
import { 
    X, 
    Play, 
    Pause, 
    Volume2, 
    VolumeX, 
    Sliders, 
    Layout, 
    Sparkles, 
    Calendar, 
    Clock, 
    Tag, 
    Globe, 
    CheckCircle2, 
    Maximize2, 
    Smartphone, 
    Download,
    Phone,
    Mail,
    Share2,
    Eye,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';
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

const FeedLivePreviewModal = ({
    fileData,
    formState = {},
    categories = [],
    onClose,
    onOpenColorModal,
    onOpenTemplateEditor
}) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [showBrandOverlay, setShowBrandOverlay] = useState(true);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [loadError, setLoadError] = useState(false);

    // Compute media source with robust fallbacks
    const resolvedMediaSrc = fileData?.preview || fileData?.url || fileData?.contentUrl || '';
    const [mediaSrc, setMediaSrc] = useState(resolvedMediaSrc);

    useEffect(() => {
        setLoadError(false);
        const src = fileData?.preview || fileData?.url || fileData?.contentUrl;
        if (src) {
            setMediaSrc(src);
        } else if (fileData?.file instanceof Blob || fileData?.file instanceof File) {
            setMediaSrc(URL.createObjectURL(fileData.file));
        }
    }, [fileData]);

    const isVideo = Boolean(
        fileData?.file?.type?.startsWith('video') || 
        fileData?.postType === 'video' ||
        fileData?.type === 'video'
    );

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!fileData) return null;

    // Filters and zoom
    const editMeta = fileData.editMetadata || {};
    const preset = editMeta.filters?.preset || 'original';
    const adjustments = editMeta.filters?.adjustments || {};
    
    const computeFilterString = () => {
        const parts = [];
        if (FILTER_STYLES[preset]) parts.push(FILTER_STYLES[preset]);

        // Interpret adjustments:
        // In useAdminUpload or default values, brightness/contrast 0 or undefined means default neutral 100%
        let b = Number(adjustments.brightness);
        if (isNaN(b) || b <= 0 || b === 100) b = 100;

        let c = Number(adjustments.contrast);
        if (isNaN(c) || c <= 0 || c === 100) c = 100;

        let s = adjustments.saturate !== undefined ? Number(adjustments.saturate) : Number(adjustments.saturation);
        if (isNaN(s) || (s <= 0 && adjustments.brightness === 0 && adjustments.contrast === 0) || s === 100) s = 100;

        if (b !== 100) parts.push(`brightness(${b}%)`);
        if (c !== 100) parts.push(`contrast(${c}%)`);
        if (s !== 100) parts.push(`saturate(${s}%)`);
        if (adjustments.sepia && Number(adjustments.sepia) > 0) parts.push(`sepia(${adjustments.sepia}%)`);
        if (adjustments.hueRotate && Number(adjustments.hueRotate) !== 0) parts.push(`hue-rotate(${adjustments.hueRotate}deg)`);

        return parts.join(' ');
    };

    const filterCss = computeFilterString();
    const zoomLevel = Math.max(0.2, Number(editMeta.crop?.zoomLevel) || 1);

    // Resolved category tags
    const categoryIds = formState.category || [];
    const resolvedCatNames = categories
        ?.filter(c => categoryIds.includes(c.categoryId || c._id || c.id) || categoryIds.includes(c.categoriesName || c.name))
        ?.map(c => c.categoriesName || c.name) || [];

    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const retryLoadMedia = () => {
        setLoadError(false);
        if (fileData?.file instanceof Blob || fileData?.file instanceof File) {
            const fresh = URL.createObjectURL(fileData.file);
            setMediaSrc(fresh);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-300">
            {/* Backdrop click */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative z-10 w-full max-w-5xl max-h-[95vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-lg hover:scale-105 cursor-pointer"
                    title="Close (Esc)"
                >
                    <X size={18} />
                </button>

                {/* Left Area: Phone Mockup Frame */}
                <div className="flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
                    {/* Ambient Glow */}
                    <div className="absolute w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

                    {/* Smartphone Chassis Container */}
                    <div className="relative w-full max-w-[320px] aspect-[9/19] bg-black rounded-[44px] border-[6px] border-slate-700 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden">
                        
                        {/* ===================================================
                            1. BASE MEDIA CANVAS (Absolute Inset-0 to fill 100%)
                        =================================================== */}
                        <div className="absolute inset-0 w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
                            
                            {/* Loading state indicator */}
                            {!imageLoaded && !loadError && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 gap-2">
                                    <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Loading Preview...
                                    </span>
                                </div>
                            )}

                            {/* Load Error Fallback */}
                            {loadError && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 p-4 text-center gap-2">
                                    <AlertCircle className="w-8 h-8 text-rose-500" />
                                    <p className="text-xs font-bold text-white">Preview unavailable</p>
                                    <p className="text-[10px] text-slate-400">Could not render image</p>
                                    <button
                                        onClick={retryLoadMedia}
                                        className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                                    >
                                        <RefreshCw size={12} /> Retry
                                    </button>
                                </div>
                            )}

                            {/* Media Element */}
                            {isVideo ? (
                                <video
                                    id="preview-modal-video"
                                    src={mediaSrc || resolvedMediaSrc}
                                    className="w-full h-full object-cover"
                                    style={{
                                        filter: filterCss || undefined,
                                        transform: zoomLevel !== 1 ? `scale(${zoomLevel})` : undefined
                                    }}
                                    autoPlay
                                    loop
                                    muted={isMuted}
                                    playsInline
                                    onLoadedData={() => setImageLoaded(true)}
                                    onError={() => setLoadError(true)}
                                />
                            ) : (
                                <img
                                    src={mediaSrc || resolvedMediaSrc}
                                    alt="Live Post Preview"
                                    className="w-full h-full object-cover"
                                    style={{
                                        filter: filterCss || undefined,
                                        transform: zoomLevel !== 1 ? `scale(${zoomLevel})` : undefined
                                    }}
                                    onLoad={() => setImageLoaded(true)}
                                    onError={(e) => {
                                        console.error("FeedLivePreview image load failed:", e);
                                        // Attempt fresh ObjectURL fallback
                                        if (fileData?.preview && mediaSrc !== fileData.preview) {
                                            setMediaSrc(fileData.preview);
                                        } else if (fileData?.file instanceof Blob || fileData?.file instanceof File) {
                                            const fresh = URL.createObjectURL(fileData.file);
                                            setMediaSrc(fresh);
                                        } else {
                                            setLoadError(true);
                                        }
                                    }}
                                />
                            )}
                        </div>

                        {/* ===================================================
                            2. USER BRANDING OVERLAYS (SIMULATED PRITHU POST)
                        =================================================== */}
                        {showBrandOverlay && (
                            <>
                                {/* User Profile Header Overlay */}
                                <div className="absolute top-12 left-3 z-30 flex items-center gap-2 pointer-events-none bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10 shadow-lg">
                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/80 shrink-0">
                                        <img src={sampleAvatar} alt="User Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="leading-none pr-1">
                                        <p className="text-[10px] font-black text-white drop-shadow">Rajesh Kumar</p>
                                        <p className="text-[8px] font-bold text-amber-300 drop-shadow">Premium Member</p>
                                    </div>
                                </div>

                                {/* Visiting Card / Business Footer Overlay at Bottom */}
                                <div className="absolute bottom-16 inset-x-3 z-30 pointer-events-none">
                                    <div className="bg-slate-900/85 backdrop-blur-md rounded-xl p-2 border border-white/15 text-white shadow-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xs text-white">
                                                P
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black leading-tight text-white">Prithu Creations</p>
                                                <p className="text-[8px] text-slate-300 font-medium flex items-center gap-1">
                                                    <Phone size={8} /> +91 98765 43210
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[8px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-bold">
                                                Verified Business
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ===================================================
                            3. PHONE HARDWARE UI (Dynamic Island & Status Bar)
                        =================================================== */}
                        {/* Dynamic Island */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-40 flex items-center justify-end px-2 gap-1.5 border border-slate-800/80 pointer-events-none">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-900/40" />
                        </div>

                        {/* Top Mobile Status Bar */}
                        <div className="absolute top-1 inset-x-0 h-6 px-6 flex items-center justify-between text-[10px] font-semibold text-white/80 z-30 pointer-events-none">
                            <span>9:41</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px]">5G</span>
                                <div className="w-4 h-2 border border-white/80 rounded-xs p-0.5 flex items-center">
                                    <div className="w-full h-full bg-white rounded-xs" />
                                </div>
                            </div>
                        </div>

                        {/* Category & Subcategory Tags */}
                        <div className="absolute top-12 right-3 flex flex-col items-end gap-1.5 z-30 pointer-events-none">
                            {resolvedCatNames.length > 0 ? (
                                resolvedCatNames.map((c, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-full bg-blue-600/90 text-white text-[9px] font-bold backdrop-blur-md shadow-sm">
                                        {c}
                                    </span>
                                ))
                            ) : (
                                <span className="px-2 py-0.5 rounded-full bg-blue-600/80 text-white text-[9px] font-semibold backdrop-blur-md">
                                    Category
                                </span>
                            )}

                            {(formState.subCategory || formState.god) && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-600/90 text-white text-[9px] font-bold backdrop-blur-md shadow-sm">
                                    ✦ {formState.subCategory || formState.god}
                                </span>
                            )}

                            {formState.session && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[9px] font-bold backdrop-blur-md shadow-sm">
                                    {formState.session}
                                </span>
                            )}
                        </div>

                        {/* Video Controls Play/Pause button */}
                        {isVideo && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                                <button
                                    onClick={() => {
                                        const v = document.getElementById('preview-modal-video');
                                        if (v) {
                                            if (v.paused) { v.play(); setIsPlaying(true); }
                                            else { v.pause(); setIsPlaying(false); }
                                        }
                                    }}
                                    className="pointer-events-auto p-4 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all hover:scale-110 shadow-xl border border-white/10 cursor-pointer"
                                >
                                    {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
                                </button>
                            </div>
                        )}

                        {/* Bottom Gradient Shadow for text readability */}
                        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none z-20" />

                        {/* Bottom Content Metadata Overlay */}
                        <div className="absolute bottom-5 inset-x-3 z-30 text-white pointer-events-none space-y-1">
                            {/* Title */}
                            <h3 className="font-black text-sm leading-snug line-clamp-1 text-white drop-shadow-md">
                                {formState.title || fileData?.file?.name?.replace(/\.[^/.]+$/, '') || "Untitled Post"}
                            </h3>

                            {/* Description */}
                            {formState.description && (
                                <p className="text-[10px] text-white/80 line-clamp-1 leading-relaxed drop-shadow-sm">
                                    {formState.description}
                                </p>
                            )}

                            {/* Status and language badge */}
                            <div className="pt-0.5 flex items-center justify-between text-[8px] text-white/70 font-semibold">
                                <span className="flex items-center gap-1">
                                    <span className={clsx("w-1.5 h-1.5 rounded-full", formState.isScheduled ? "bg-amber-400" : "bg-emerald-400")} />
                                    {formState.isScheduled ? "Scheduled Post" : "Publish Immediately"}
                                </span>
                                <span className="uppercase text-[8px] bg-white/15 px-1.5 py-0.5 rounded font-bold">
                                    {formState.language || 'Both'}
                                </span>
                            </div>
                        </div>

                        {/* Home Bar Indicator */}
                        <div className="absolute bottom-1 inset-x-0 h-3 flex items-center justify-center pointer-events-none z-30">
                            <div className="w-20 h-1 bg-white/50 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Right Area: Metadata, Toggles & Quick Actions */}
                <div className="w-full md:w-[380px] bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto">
                    
                    <div className="space-y-5">
                        {/* Header info */}
                        <div>
                            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                                <Smartphone size={15} />
                                <span>Feed Live Preview</span>
                            </div>
                            <h2 className="text-lg font-bold text-white truncate" title={formState.title || fileData?.file?.name}>
                                {formState.title || 'Untitled Feed'}
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Real-time simulation of post on user device
                            </p>
                        </div>

                        {/* Brand Overlay Toggle */}
                        <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold text-white block">User Frame & Visiting Card</span>
                                <span className="text-[10px] text-slate-400">Simulate user's dynamic business branding</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowBrandOverlay(!showBrandOverlay)}
                                className={clsx(
                                    "w-11 h-6 rounded-full transition-colors relative cursor-pointer",
                                    showBrandOverlay ? "bg-blue-600" : "bg-slate-700"
                                )}
                            >
                                <div className={clsx(
                                    "w-4 h-4 rounded-full bg-white transition-transform absolute top-1",
                                    showBrandOverlay ? "left-6" : "left-1"
                                )} />
                            </button>
                        </div>

                        {/* File Specs Cards */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Media Type</span>
                                <span className="text-sm font-black text-white">{isVideo ? 'Video' : 'Image'}</span>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">File Size</span>
                                <span className="text-sm font-black text-white">{formatBytes(fileData?.file?.size)}</span>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Dimensions</span>
                                <span className="text-sm font-black text-white">
                                    {fileData?.dimensions?.width ? `${fileData.dimensions.width}x${fileData.dimensions.height}` : 'Native 9:16'}
                                </span>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Applied Filter</span>
                                <span className="text-sm font-black text-purple-400 capitalize">{preset}</span>
                            </div>
                        </div>

                        {/* Publication Info Table */}
                        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800 space-y-2.5 text-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-700 pb-2">
                                Publication Info
                            </span>

                            <div className="flex justify-between">
                                <span className="text-slate-400">Category</span>
                                <span className="font-bold text-white text-right">
                                    {resolvedCatNames.length > 0 ? resolvedCatNames.join(', ') : 'None selected'}
                                </span>
                            </div>

                            {(formState.subCategory || formState.god) && (
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Subcategory</span>
                                    <span className="font-bold text-purple-400">✦ {formState.subCategory || formState.god}</span>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <span className="text-slate-400">Session</span>
                                <span className="font-bold text-amber-400">{formState.session || 'None'}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-400">Language</span>
                                <span className="font-bold text-white">{formState.language || 'Both'}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-400">Scheduling</span>
                                <span className="font-bold text-emerald-400">
                                    {formState.isScheduled ? (formState.publishDate || 'Scheduled') : 'Immediate'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2.5 pt-4">
                        <button
                            type="button"
                            onClick={() => onOpenColorModal && onOpenColorModal(fileData.id)}
                            className="w-full py-2.5 px-4 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                            <Sliders size={14} />
                            <span>Adjust Colors & Filters</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => onOpenTemplateEditor && onOpenTemplateEditor(fileData.id)}
                            className="w-full py-2.5 px-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                            <Layout size={14} />
                            <span>Open Template Layers Editor</span>
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
                        >
                            Done & Close
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default FeedLivePreviewModal;
