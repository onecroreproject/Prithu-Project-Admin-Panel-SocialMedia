import React, { useState, useEffect } from 'react';
import { useAdminUpload } from '../../hooks/useAdminUpload';
import {
    Info, CloudUpload, Play, Pencil, CheckCircle, Calendar, Clock,
    Eye, Sliders, Sparkles, Trash2, Smartphone, Check, Layers,
    Palette, RefreshCw, Send, FilePlus, ChevronDown, CheckCircle2
} from 'lucide-react';
import { clsx } from 'clsx';
import TemplateEditor from './template/TemplateEditor';
import PostEditor from './PostEditor';
import FeedLivePreviewModal from './FeedLivePreviewModal';
import CategorySelector from '../common/CategorySelector';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDropdownConfig, updateDropdownConfig, updateCategory, fetchCategories } from '../../Services/FeedServices/feedServices';
import toast from 'react-hot-toast';

const FeedUploadPage = () => {
    const queryClient = useQueryClient();
    const {
        files,
        categories,
        handleSelectFiles,
        handleRemoveFile,
        handleUpdateEditMetadata,
        handleUpdateMetadata,
        upload,
        setFiles,
        isUploading,
        overallProgress,
        uploadError
    } = useAdminUpload();

    // Modal states
    const [editingFileId, setEditingFileId] = useState(null);       // Template layers editor
    const [colorModalFileId, setColorModalFileId] = useState(null);   // Color & visual adjustments modal
    const [previewModalFileId, setPreviewModalFileId] = useState(null); // Full device live preview modal

    const [customInputModes, setCustomInputModes] = useState({
        session: false,
        god: false,
        specialDay: false
    });

    const [localCustomGods, setLocalCustomGods] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('customUploadGods')) || [];
        } catch (e) {
            return [];
        }
    });

    // Fetch config
    const { data: config } = useQuery({
        queryKey: ["dropdownConfig"],
        queryFn: fetchDropdownConfig,
    });

    // Fetch categories directly with react-query as guaranteed data source
    const { data: queryCategories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
    });
    
    // Ensure we always have arrays even if data isn't loaded yet
    const customOptions = config || { sessions: [], days: [], specialDays: [] };
    const rawActiveCategories = (categories && categories.length > 0) ? categories : queryCategories;
    // Filter out "God Quotes" (any category with "quote") so only legitimate categories appear
    const activeCategories = (rawActiveCategories || []).filter(c => {
        const name = (c.categoriesName || c.categoryName || c.name || '').toLowerCase().trim();
        return !name.includes('quote');
    });
    
    // Update mutation
    const updateMutation = useMutation({
        mutationFn: updateDropdownConfig,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dropdownConfig"] });
        },
        onError: (err) => toast.error(err.message || "Failed to save option")
    });

    const updateCategoryMutation = useMutation({
        mutationFn: updateCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Subcategory permanently added to category!");
        },
        onError: (err) => toast.error(err.message || "Failed to save subcategory")
    });

    const toggleCustomMode = (field, currentValue) => {
        if (customInputModes[field]) {
            // we are turning it off, save the current value
            if (currentValue && field !== 'god') {
                const apiField = field === 'session' ? 'sessions' : 'specialDays';
                const currentList = customOptions[apiField] || [];
                
                if (!currentList.includes(currentValue)) {
                    updateMutation.mutate({
                        [apiField]: [...currentList, currentValue]
                    });
                }
            } else if (currentValue && field === 'god') {
                const currentGodsList = customOptions?.gods || [];
                if (!currentGodsList.includes(currentValue)) {
                    updateMutation.mutate({
                        gods: [...currentGodsList, currentValue]
                    });
                }

                const categoryId = formState.category?.[0];
                if (categoryId) {
                    const selectedCat = categories?.find(c => 
                        String(c.categoryId || c._id || c.id) === String(categoryId) ||
                        String(c.categoriesName || c.name).toLowerCase() === String(categoryId).toLowerCase()
                    );
                    if (selectedCat) {
                        const currentSubs = selectedCat.subcategories || [];
                        if (!currentSubs.includes(currentValue)) {
                            const newSubs = [...currentSubs, currentValue];
                            updateCategoryMutation.mutate({
                                id: selectedCat.categoryId || selectedCat._id || selectedCat.id,
                                name: selectedCat.categoriesName || selectedCat.name,
                                subcategories: newSubs.join(", ")
                            });
                        }
                    }
                }

                setLocalCustomGods(prev => {
                    if (!prev.includes(currentValue)) {
                        const newList = [...prev, currentValue];
                        localStorage.setItem('customUploadGods', JSON.stringify(newList));
                        return newList;
                    }
                    return prev;
                });
            }
        }
        setCustomInputModes(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const defaultFormState = {
        title: '',
        contentType: 'Image',
        category: [],
        language: 'Both',
        tags: '',
        description: '',
        session: '',
        god: '',
        specialDay: '',
        isScheduled: false,
        publishDate: '',
        expiryDate: '',
        startTime: '',
        endTime: '',
        priority: 'Normal',
        featured: false,
        downloadAllowed: true,
        shareAllowed: true,
        active: true
    };

    const [fileForms, setFileForms] = useState({});

    const [previewType, setPreviewType] = useState('Image');
    const [activeImageId, setActiveImageId] = useState(null);
    const [activeVideoId, setActiveVideoId] = useState(null);

    const imageFiles = files.filter(f => !f.file.type.startsWith('video'));
    const videoFiles = files.filter(f => f.file.type.startsWith('video'));

    useEffect(() => {
        if (imageFiles.length > 0 && !imageFiles.find(f => f.id === activeImageId)) {
            setActiveImageId(imageFiles[0].id);
        } else if (imageFiles.length === 0) {
            setActiveImageId(null);
        }
    }, [imageFiles, activeImageId]);

    useEffect(() => {
        if (videoFiles.length > 0 && !videoFiles.find(f => f.id === activeVideoId)) {
            setActiveVideoId(videoFiles[0].id);
        } else if (videoFiles.length === 0) {
            setActiveVideoId(null);
        }
    }, [videoFiles, activeVideoId]);

    const activeFileId = previewType === 'Image' ? activeImageId : activeVideoId;
    const currentFiles = previewType === 'Image' ? imageFiles : videoFiles;
    const selectedFile = currentFiles.find(f => f.id === activeFileId) || (currentFiles.length > 0 ? currentFiles[0] : null);
    
    const formState = (activeFileId && fileForms[activeFileId]) 
        ? fileForms[activeFileId] 
        : (fileForms['default'] || {
            ...defaultFormState,
            contentType: selectedFile?.file?.type?.startsWith('video') ? 'Video' : 'Image'
        });

    const handleChange = (field, value) => {
        const targetId = activeFileId || 'default';
        setFileForms(prev => ({
            ...prev,
            [targetId]: {
                ...(prev[targetId] || {
                    ...defaultFormState,
                    contentType: selectedFile?.file?.type?.startsWith('video') ? 'Video' : 'Image'
                }),
                [field]: value
            }
        }));
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            handleSelectFiles(selectedFiles);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            handleSelectFiles(droppedFiles);
        }
    };

    const handleReset = () => {
        setFileForms({});
        setFiles([]);
    };

    const handleCancel = () => {
        window.location.reload();
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen text-slate-800">
            
            {/* Top Page Header */}
            <div className="max-w-[1440px] mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase tracking-widest border border-blue-100">
                                Publishing Studio
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs font-semibold text-slate-500">
                                {files.length > 0 ? `${files.length} Media Attached` : 'No Media Uploaded'}
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                            Upload & Publish Feeds
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500 mt-1">
                            Configure content metadata, scheduling, color tone presets, and test live on mobile preview.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Live Preview Button in Header */}
                        <button
                            type="button"
                            onClick={() => {
                                if (selectedFile) {
                                    setPreviewModalFileId(selectedFile.id);
                                } else {
                                    toast('Please upload an image or video to preview', { icon: 'ℹ️' });
                                }
                            }}
                            className="px-4 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-xs"
                        >
                            <Smartphone size={16} />
                            <span>Mobile Preview</span>
                        </button>

                        {/* Color Adjustments Button */}
                        {selectedFile && (
                            <button
                                type="button"
                                onClick={() => setColorModalFileId(selectedFile.id)}
                                className="px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-xs"
                            >
                                <Palette size={16} />
                                <span>Color & Filter Modal</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column - Form Details */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* 1. Content Details Card */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        1. Content Details
                                    </h2>
                                    <p className="text-xs text-slate-400">
                                        Essential titles, categories, sessions, and language options
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                Step 1 of 2
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            
                            {/* Title + Session — stacked in left column */}
                            <div className="flex flex-col gap-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-slate-700">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter feed title..."
                                        value={formState.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-900 placeholder-slate-400"
                                    />
                                </div>

                                {/* Session — below Title on the left side */}
                                <div>
                                    <label className="text-sm font-semibold mb-2 flex justify-between items-center text-slate-700">
                                        <span>Session</span>
                                        <button
                                            type="button"
                                            onClick={() => toggleCustomMode('session', formState.session)}
                                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border transition-all ${customInputModes.session ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                                        >
                                            {customInputModes.session ? '✓ Done' : '+ Custom'}
                                        </button>
                                    </label>
                                    {customInputModes.session ? (
                                        <input
                                            type="text"
                                            placeholder="Type custom session..."
                                            value={formState.session || ''}
                                            onChange={(e) => handleChange('session', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-slate-900"
                                            autoFocus
                                        />
                                    ) : (
                                        <div className="relative">
                                            <select
                                                value={formState.session || ''}
                                                onChange={(e) => {
                                                    const selectedVal = e.target.value;
                                                    handleChange('session', selectedVal);
                                                    if (customOptions.sessionsDetailed?.length) {
                                                        const match = customOptions.sessionsDetailed.find(s => s.name === selectedVal);
                                                        if (match && match.startTime && !formState.startTime) {
                                                            const match24 = match.startTime.match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)?$/i);
                                                            if (match24) {
                                                                let h = parseInt(match24[1], 10);
                                                                const m = match24[2] || "00";
                                                                const mod = match24[3]?.toUpperCase();
                                                                if (mod === "PM" && h < 12) h += 12;
                                                                if (mod === "AM" && h === 12) h = 0;
                                                                handleChange('startTime', `${String(h).padStart(2, '0')}:${m}`);
                                                            }
                                                        }
                                                    }
                                                }}
                                                className="w-full px-3.5 py-2.5 pr-8 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-500 outline-none text-sm appearance-none text-slate-700 transition-colors cursor-pointer"
                                            >
                                                <option value="" disabled>— Select Session —</option>
                                                {customOptions.sessionsDetailed && customOptions.sessionsDetailed.length > 0 ? (
                                                    customOptions.sessionsDetailed.map(sess => (
                                                        <option key={sess.name} value={sess.name}>
                                                            {sess.name}{sess.timeRange ? ` (${sess.timeRange})` : ''}
                                                        </option>
                                                    ))
                                                ) : (
                                                    customOptions.sessions.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))
                                                )}
                                                {formState.session && !customOptions.sessions.includes(formState.session) && (
                                                    <option value={formState.session}>{formState.session}</option>
                                                )}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    )}
                                    {formState.session && (
                                        <div className="mt-1.5 flex items-center gap-1.5">
                                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                                                {formState.session}
                                            </span>
                                            <button type="button" onClick={() => handleChange('session', '')} className="text-slate-400 hover:text-red-500 transition-colors text-xs">✕</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Category + Subcategory — single grouped in right column */}
                            <div className="flex flex-col gap-4">
                                {/* Category */}
                                <div className="relative z-50">
                                    {(() => {
                                        // Find "God" and "Special Day" categories using activeCategories
                                        // Specifically match category "God" (#2 with subcategories), NOT "God Quotes" (#1)
                                        const godCat = activeCategories?.find(c => {
                                            const n = (c.categoriesName || c.name || '').trim().toLowerCase();
                                            return n === 'god' || n === 'gods';
                                        }) || activeCategories?.find(c => {
                                            const n = (c.categoriesName || c.name || '').trim().toLowerCase();
                                            return n.includes('god') && !n.includes('quote');
                                        });

                                        const specialDayCat = activeCategories?.find(c => {
                                            const n = (c.categoriesName || c.name || '').trim().toLowerCase();
                                            return n === 'special day' || n === 'special days' || n.includes('special');
                                        });

                                        const currentCatIds = (formState.category || []).map(id => String(id).toLowerCase().trim());
                                        const isGodChecked = Boolean(
                                            (godCat && currentCatIds.includes(String(godCat.categoryId || godCat._id || godCat.id).toLowerCase())) ||
                                            currentCatIds.some(id => id === 'god' || id === 'gods' || (godCat && id === (godCat.categoriesName || godCat.name || '').toLowerCase()))
                                        );

                                        const isSpecialDayChecked = Boolean(
                                            (specialDayCat && currentCatIds.includes(String(specialDayCat.categoryId || specialDayCat._id || specialDayCat.id).toLowerCase())) ||
                                            currentCatIds.some(id => id.includes('special') || (specialDayCat && id === (specialDayCat.categoriesName || specialDayCat.name || '').toLowerCase()))
                                        );

                                        const handleQuickSelect = (type) => {
                                            let newCat = [];
                                            if (type === 'god') {
                                                if (isGodChecked) {
                                                    newCat = [];
                                                } else {
                                                    const targetId = godCat 
                                                        ? (godCat.categoryId || godCat._id || godCat.id) 
                                                        : 'God';
                                                    newCat = [String(targetId)];
                                                }
                                            } else if (type === 'specialDay') {
                                                if (isSpecialDayChecked) {
                                                    newCat = [];
                                                } else {
                                                    const targetId = specialDayCat 
                                                        ? (specialDayCat.categoryId || specialDayCat._id || specialDayCat.id) 
                                                        : 'Special Days';
                                                    newCat = [String(targetId)];
                                                }
                                            }

                                            // 1. Immediately update active category
                                            handleChange('category', newCat);

                                            // 2. Also persist to default and all files so every attached file gets it
                                            setFileForms(prev => {
                                                const next = { ...prev };
                                                next['default'] = {
                                                    ...(next['default'] || defaultFormState),
                                                    category: newCat
                                                };
                                                files.forEach(f => {
                                                    next[f.id] = {
                                                        ...(next[f.id] || defaultFormState),
                                                        category: newCat
                                                    };
                                                });
                                                return next;
                                            });

                                            if (newCat.length > 0) {
                                                toast.success(`Auto-selected ${type === 'god' ? 'GOD' : 'SPECIAL DAY'} category!`, { id: 'quick-select-cat' });
                                            } else {
                                                toast('Category cleared', { id: 'quick-select-cat' });
                                            }
                                        };

                                        return (
                                            <>
                                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                                    <label className="text-sm font-semibold text-slate-700">
                                                        Category <span className="text-red-500">*</span>
                                                    </label>

                                                    {/* Quick Select Buttons */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                                            Quick Select:
                                                        </span>

                                                        {/* GOD Checkbox Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuickSelect('god')}
                                                            className={clsx(
                                                                "flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold cursor-pointer transition-all select-none shadow-2xs",
                                                                isGodChecked
                                                                    ? "bg-purple-600 border-purple-600 text-white shadow-sm shadow-purple-500/25"
                                                                    : "bg-slate-50 border-slate-200 text-slate-700 hover:border-purple-300 hover:bg-purple-50/50"
                                                            )}
                                                            title="Click to auto select GOD category"
                                                        >
                                                            <div className={clsx(
                                                                "w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors",
                                                                isGodChecked ? "bg-white text-purple-600 border-white" : "border-slate-300 bg-white"
                                                            )}>
                                                                {isGodChecked && <Check size={11} className="stroke-[3]" />}
                                                            </div>
                                                            <span>GOD</span>
                                                        </button>

                                                        {/* SPECIAL DAY Checkbox Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuickSelect('specialDay')}
                                                            className={clsx(
                                                                "flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold cursor-pointer transition-all select-none shadow-2xs",
                                                                isSpecialDayChecked
                                                                    ? "bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-500/25"
                                                                    : "bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50"
                                                            )}
                                                            title="Click to auto select SPECIAL DAY category"
                                                        >
                                                            <div className={clsx(
                                                                "w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors",
                                                                isSpecialDayChecked ? "bg-white text-amber-600 border-white" : "border-slate-300 bg-white"
                                                            )}>
                                                                {isSpecialDayChecked && <Check size={11} className="stroke-[3]" />}
                                                            </div>
                                                            <span>SPECIAL DAY</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                <CategorySelector
                                                    categories={activeCategories}
                                                    selectedIds={formState.category || []}
                                                    onChange={(ids) => handleChange('category', ids)}
                                                    placeholder="Select Categories"
                                                    variant="light"
                                                />
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Subcategory — below Category */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                            <span>Subcategory</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => toggleCustomMode('god', formState.god)}
                                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border transition-all ${customInputModes.god ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                                        >
                                            {customInputModes.god ? '✓ Done' : '+ Custom'}
                                        </button>
                                    </div>
                                    {customInputModes.god ? (
                                        <input
                                            type="text"
                                            placeholder="Type custom subcategory..."
                                            value={formState.god || ''}
                                            onChange={(e) => handleChange('god', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-slate-900"
                                            autoFocus
                                        />
                                    ) : (
                                        <div className="relative">
                                            <select
                                                disabled={!formState.category || formState.category.length === 0}
                                                value={formState.god || ''}
                                                onChange={(e) => handleChange('god', e.target.value)}
                                                className="w-full px-3.5 py-2.5 pr-8 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-500 outline-none text-sm appearance-none text-slate-700 disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                            >
                                                <option value="">— Optional Subcategory —</option>
                                                {(() => {
                                                    const primaryCatId = formState.category?.[0];
                                                    const selectedCat = activeCategories?.find(c =>
                                                        String(c.categoryId || c._id || c.id) === String(primaryCatId) ||
                                                        String(c.categoriesName || c.name).toLowerCase() === String(primaryCatId).toLowerCase()
                                                    );
                                                    const catSubs = selectedCat?.subcategories || [];
                                                    const isSpecialDayCat = selectedCat && /special/i.test(selectedCat.categoriesName || selectedCat.name);
                                                    const configGods = customOptions?.gods || [];
                                                    const configSpecialDays = customOptions?.specialDays || [];

                                                    const rawList = [
                                                        ...catSubs,
                                                        ...(isSpecialDayCat ? configSpecialDays : (catSubs.length === 0 ? configGods : [])),
                                                        ...localCustomGods,
                                                        ...(formState.god ? [formState.god] : [])
                                                    ];
                                                    const seen = new Map();
                                                    for (const opt of rawList) {
                                                        if (!opt || typeof opt !== 'string') continue;
                                                        const trimmed = opt.trim();
                                                        if (!trimmed) continue;
                                                        const baseKey = trimmed.replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').toLowerCase().trim();
                                                        if (!seen.has(baseKey)) {
                                                            seen.set(baseKey, trimmed);
                                                        } else {
                                                            const existing = seen.get(baseKey);
                                                            if (trimmed.length > existing.length) seen.set(baseKey, trimmed);
                                                        }
                                                    }
                                                    return Array.from(seen.values()).map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ));
                                                })()}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    )}
                                    {formState.god && (
                                        <div className="mt-1.5 flex items-center gap-1.5">
                                            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                                                {formState.god}
                                            </span>
                                            <button type="button" onClick={() => handleChange('god', '')} className="text-slate-400 hover:text-red-500 transition-colors text-xs">✕</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Language */}
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-slate-700">Language</label>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                    {['Tamil', 'English', 'Both'].map(lang => (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => handleChange('language', lang)}
                                            className={clsx(
                                                "py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5",
                                                formState.language === lang
                                                    ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20"
                                                    : "bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                                            )}
                                        >
                                            {formState.language === lang && <Check size={13} className="stroke-[3]" />}
                                            <span>{lang}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-slate-700">Tags</label>
                                <input
                                    type="text"
                                    placeholder="e.g. morning, dev, trending"
                                    value={formState.tags}
                                    onChange={(e) => handleChange('tags', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-900 placeholder-slate-400"
                                />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-semibold text-slate-700">Description</label>
                                    <span className="text-[11px] font-semibold text-slate-400">
                                        {formState.description.length} / 200
                                    </span>
                                </div>
                                <textarea
                                    placeholder="Enter optional description or caption for this feed..."
                                    value={formState.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    rows={3}
                                    maxLength={200}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-900 resize-none placeholder-slate-400"
                                />
                            </div>

                        </div>
                    </div>

                    {/* 2. Scheduling & Publishing Card */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        2. Scheduling & Publication
                                    </h2>
                                    <p className="text-xs text-slate-400">
                                        Set automated release schedule or publish immediately
                                    </p>
                                </div>
                            </div>

                            <label className="flex items-center gap-3 px-4 py-2 rounded-2xl border border-indigo-200/80 bg-indigo-50/70 hover:bg-indigo-100/70 cursor-pointer transition-colors shadow-2xs self-start sm:self-auto">
                                <input
                                    type="checkbox"
                                    checked={Boolean(formState.isScheduled)}
                                    onChange={(e) => handleChange('isScheduled', e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span className="text-xs font-bold text-indigo-950 select-none">
                                    Enable Scheduling
                                </span>
                            </label>
                        </div>

                        {formState.isScheduled ? (
                            <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="block text-sm font-semibold mb-2 text-slate-700">Publish Date</label>
                                        <div className="relative cursor-pointer" onClick={() => document.getElementById('publishDateInput')?.showPicker()}>
                                            <input
                                                id="publishDateInput"
                                                type="date"
                                                value={formState.publishDate}
                                                onChange={(e) => handleChange('publishDate', e.target.value)}
                                                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-slate-700 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                                            />
                                            <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <label className="block text-sm font-semibold mb-2 text-slate-700">Start Time</label>
                                        <div className="relative cursor-pointer" onClick={() => document.getElementById('startTimeInput')?.showPicker()}>
                                            <input
                                                id="startTimeInput"
                                                type="time"
                                                value={formState.startTime}
                                                onChange={(e) => handleChange('startTime', e.target.value)}
                                                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-slate-700 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                                            />
                                            <Clock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-5 p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 inline-block ring-4 ring-emerald-100"></span>
                                    <span><strong>Immediate Release:</strong> Content goes live instantly once you click Publish.</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleChange('isScheduled', true)}
                                    className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline shrink-0 text-left sm:text-right"
                                >
                                    Switch to scheduled →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Form Action Controls Bar */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={handleCancel}
                                disabled={isUploading}
                                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={isUploading}
                                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Reset
                            </button>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {/* Full Preview Trigger */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (selectedFile) setPreviewModalFileId(selectedFile.id);
                                    else toast('Attach media first to preview', { icon: 'ℹ️' });
                                }}
                                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <Eye size={15} />
                                <span>Preview</span>
                            </button>

                            {/* Save Draft */}
                            <button
                                onClick={() => upload(fileForms, 'draft')}
                                disabled={isUploading}
                                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all shadow-2xs disabled:opacity-50"
                            >
                                Save Draft
                            </button>

                            {/* Save & Publish */}
                            <button
                                onClick={() => upload(fileForms)}
                                disabled={isUploading}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold transition-all shadow-md shadow-blue-500/20 disabled:opacity-75 disabled:cursor-wait"
                            >
                                {isUploading ? (
                                    <>
                                        <CloudUpload className="w-4 h-4 animate-bounce" />
                                        <span>Publishing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-3.5 h-3.5" />
                                        <span>Save & Publish</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar & Error */}
                    {(isUploading || uploadError) && (
                        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                            {uploadError ? (
                                <div className="text-red-600 text-xs font-semibold text-center bg-red-50 py-3 px-4 rounded-xl border border-red-100">
                                    {uploadError}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-700">
                                        <span>Uploading {files.length} file{files.length > 1 ? 's' : ''}...</span>
                                        <span>{Math.round(overallProgress)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300 ease-out relative"
                                            style={{ width: `${overallProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Right Column - Upload & Preview Studio */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* 3. Upload Media Card */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                                <CloudUpload size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Upload Content</h3>
                                <p className="text-[11px] text-slate-400">Add images or videos</p>
                            </div>
                        </div>

                        <div 
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload-input').click()}
                            className="border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30 transition-all rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer group min-h-[190px]"
                        >
                            <input 
                                id="file-upload-input"
                                type="file" 
                                className="hidden" 
                                accept="image/*,video/*"
                                multiple
                                onChange={handleFileChange}
                            />
                            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                                <CloudUpload size={28} />
                            </div>
                            <p className="text-slate-700 text-xs font-semibold mb-1">
                                <span className="text-blue-600 font-bold hover:underline">Click to upload</span> or drag & drop
                            </p>
                            <p className="text-[11px] text-slate-400 mb-2">JPG, PNG, WEBP or MP4 video</p>
                            <span className="text-[10px] bg-slate-200/70 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                                Up to 100 MB
                            </span>
                        </div>
                    </div>

                    {/* 4. Live Preview & Gallery Card */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                                    <Eye size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Preview & Modals</h3>
                                    <p className="text-[11px] text-slate-400">Preview and tone adjustments</p>
                                </div>
                            </div>
                        </div>

                        {/* Format Switcher */}
                        <div className="flex p-1 bg-slate-100 rounded-2xl mb-4">
                            <button 
                                onClick={() => setPreviewType('Image')}
                                className={clsx(
                                    "flex-1 py-1.5 text-xs font-bold rounded-xl transition-all text-center",
                                    previewType === 'Image'
                                        ? "bg-white text-blue-700 shadow-2xs"
                                        : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                Images ({imageFiles.length})
                            </button>
                            <button 
                                onClick={() => setPreviewType('Video')}
                                className={clsx(
                                    "flex-1 py-1.5 text-xs font-bold rounded-xl transition-all text-center",
                                    previewType === 'Video'
                                        ? "bg-white text-blue-700 shadow-2xs"
                                        : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                Videos ({videoFiles.length})
                            </button>
                        </div>
                        
                        {/* Media Grid / Thumbnails */}
                        <div className="max-h-[460px] overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-1">
                            {currentFiles.length > 0 ? (
                                currentFiles.map(file => {
                                    const isCurrentSelected = activeFileId === file.id;
                                    const isVid = file.file.type.startsWith('video');

                                    return (
                                        <div
                                            key={file.id}
                                            className={clsx(
                                                "bg-slate-900 rounded-2xl overflow-hidden aspect-[9/16] flex items-center justify-center relative shadow-sm group shrink-0 transition-all border-2",
                                                isCurrentSelected ? "border-blue-600 ring-4 ring-blue-500/20" : "border-transparent"
                                            )}
                                        >
                                            {isVid ? (
                                                <video src={file.preview} className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={file.preview} className="w-full h-full object-cover" alt="Preview" />
                                            )}

                                            {/* Quick Action Overlay Buttons */}
                                            <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                                                {/* Select button */}
                                                <button
                                                    onClick={() => previewType === 'Image' ? setActiveImageId(file.id) : setActiveVideoId(file.id)}
                                                    className={clsx(
                                                        "w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110",
                                                        isCurrentSelected ? "bg-blue-600 text-white" : "bg-white/90 text-slate-700 hover:bg-white"
                                                    )}
                                                    title="Select this media"
                                                >
                                                    <Check size={14} className="stroke-[3]" />
                                                </button>

                                                {/* Full Preview Modal Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewModalFileId(file.id);
                                                    }}
                                                    className="w-8 h-8 bg-white/90 hover:bg-white text-purple-700 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                                                    title="Open Phone Preview Modal"
                                                >
                                                    <Smartphone size={14} />
                                                </button>

                                                {/* Color & Filter Modal Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setColorModalFileId(file.id);
                                                    }}
                                                    className="w-8 h-8 bg-white/90 hover:bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                                                    title="Open Color & Filter Modal"
                                                >
                                                    <Palette size={14} />
                                                </button>

                                                {/* Template Layers Editor */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingFileId(file.id);
                                                    }}
                                                    className="w-8 h-8 bg-white/90 hover:bg-white text-blue-600 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                                                    title="Template Layers Editor"
                                                >
                                                    <Layers size={14} />
                                                </button>

                                                {/* Delete File */}
                                                {handleRemoveFile && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveFile(file.id);
                                                        }}
                                                        className="w-8 h-8 bg-white/90 hover:bg-red-50 text-red-600 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                                                        title="Remove media"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Bottom Badge overlay */}
                                            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white text-[10px] z-20 pointer-events-none">
                                                <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full font-bold">
                                                    {file.file.name.split('.').pop()?.toUpperCase()}
                                                </span>
                                                {file.editMetadata?.filters?.preset && (
                                                    <span className="bg-purple-600/80 backdrop-blur-md px-2 py-0.5 rounded-full font-bold capitalize">
                                                        {file.editMetadata.filters.preset}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 aspect-[4/3] flex flex-col items-center justify-center text-center p-4">
                                    <p className="text-slate-400 text-xs font-semibold">No {previewType.toLowerCase()}s uploaded yet</p>
                                    <span className="text-[10px] text-slate-400 mt-1">Use upload zone above</span>
                                </div>
                            )}
                        </div>

                        {/* Quick Action Bar under gallery */}
                        {selectedFile && (
                            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPreviewModalFileId(selectedFile.id)}
                                    className="w-full py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                >
                                    <Smartphone size={15} />
                                    <span>Open Live Device Preview</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setColorModalFileId(selectedFile.id)}
                                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                >
                                    <Palette size={15} />
                                    <span>Adjust Color Tone & Filters</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 5. File Information Card */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="bg-slate-50/70 px-5 py-3.5 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                                File Specifications
                            </h3>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-medium">File Name</span>
                                <span className="text-slate-800 font-bold truncate max-w-[170px]" title={selectedFile?.file.name || '-'}>
                                    {selectedFile?.file.name || '—'}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-medium">Size</span>
                                <span className="text-slate-800 font-bold">{selectedFile ? formatBytes(selectedFile.file.size) : '—'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-medium">Resolution</span>
                                <span className="text-slate-800 font-bold">{selectedFile?.dimensions ? `${selectedFile.dimensions.width} x ${selectedFile.dimensions.height}` : '—'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-medium">Format</span>
                                <span className="text-slate-800 font-bold uppercase">{selectedFile ? selectedFile.file.name.split('.').pop() : '—'}</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* Bottom Tip Note */}
            <div className="max-w-[1440px] mx-auto mt-8 bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                    <span className="font-bold">Pro Tip:</span> Tap on any media thumbnail's <Smartphone className="inline w-3.5 h-3.5 text-purple-600" /> icon to launch the live phone simulation preview, or the <Palette className="inline w-3.5 h-3.5 text-indigo-600" /> icon to fine-tune brightness, contrast, and color mood tones.
                </p>
            </div>

            {/* LIVE PREVIEW MODAL */}
            {previewModalFileId && (
                <FeedLivePreviewModal
                    fileData={files.find(f => f.id === previewModalFileId) || selectedFile}
                    formState={formState}
                    categories={categories}
                    onClose={() => setPreviewModalFileId(null)}
                    onOpenColorModal={(id) => {
                        setPreviewModalFileId(null);
                        setColorModalFileId(id);
                    }}
                    onOpenTemplateEditor={(id) => {
                        setPreviewModalFileId(null);
                        setEditingFileId(id);
                    }}
                />
            )}

            {/* COLOR & FILTER MODAL (BETTER COLOR MODAL) */}
            {colorModalFileId && (
                <PostEditor
                    fileData={files.find(f => f.id === colorModalFileId)}
                    onClose={() => setColorModalFileId(null)}
                    onSave={handleUpdateEditMetadata}
                />
            )}

            {/* TEMPLATE LAYERS EDITOR MODAL */}
            {editingFileId && (
                <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
                    <TemplateEditor 
                        fileData={files.find(f => f.id === editingFileId)} 
                        onClose={() => setEditingFileId(null)} 
                        onSave={handleUpdateMetadata}
                        onUpdateEditMetadata={handleUpdateEditMetadata}
                    />
                </div>
            )}

        </div>
    );
};

export default FeedUploadPage;
