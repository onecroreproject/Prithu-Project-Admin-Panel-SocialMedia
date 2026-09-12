import React, { useState, useEffect, useRef } from 'react';
import { useAdminUpload } from '../../hooks/useAdminUpload';
import {
    Info, CloudUpload, Play, Pencil, CheckCircle, Calendar, Clock,
    Eye, Sliders, Sparkles, Trash2, Smartphone, Check, Layers,
    Palette, RefreshCw, Send, FilePlus, ChevronDown, CheckCircle2,
    ChevronLeft, ChevronRight, Maximize2
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
        handleBatchUpdateFiles,
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

    const rowScrollRef = useRef(null);
    const scrollRow = (direction) => {
        if (rowScrollRef.current) {
            const offset = direction === 'left' ? -260 : 260;
            rowScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

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
        aspectRatio: '9:16',
        category: [],
        subCategory: '',
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
        setFileForms(prev => {
            const current = prev[targetId] || {
                ...defaultFormState,
                contentType: selectedFile?.file?.type?.startsWith('video') ? 'Video' : 'Image'
            };
            const updates = { [field]: value };
            if (field === 'god') {
                updates.subCategory = value;
            } else if (field === 'subCategory') {
                updates.god = value;
            }
            return {
                ...prev,
                [targetId]: {
                    ...current,
                    ...updates
                }
            };
        });
    };

    // Multi-selected file IDs for batch actions (e.g. changing post sizes)
    const [selectedFileIds, setSelectedFileIds] = useState([]);
    // Per-file individual post sizes { [fileId]: '4:5' | '1:1' | '9:16' | '16:9' | 'auto' }
    const [filePostSizes, setFilePostSizes] = useState({});

    // Clean up selected IDs if files are removed
    useEffect(() => {
        const existingIds = new Set(files.map(f => f.id));
        setSelectedFileIds(prev => prev.filter(id => existingIds.has(id)));
    }, [files]);

    const toggleSelectFile = (fileId, e) => {
        if (e) e.stopPropagation();
        setSelectedFileIds(prev => 
            prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
        );
    };

    const isAllCurrentSelected = currentFiles.length > 0 && currentFiles.every(f => selectedFileIds.includes(f.id));

    const toggleSelectAll = () => {
        if (isAllCurrentSelected) {
            const currentIds = new Set(currentFiles.map(f => f.id));
            setSelectedFileIds(prev => prev.filter(id => !currentIds.has(id)));
        } else {
            const currentIds = currentFiles.map(f => f.id);
            setSelectedFileIds(prev => Array.from(new Set([...prev, ...currentIds])));
        }
    };

    // Post Size / Aspect Ratio: "4:5", "1:1", "9:16", "16:9", "auto"
    const [postSize, setPostSize] = useState(() => {
        return localStorage.getItem("upload_post_size") || "9:16";
    });

    const handlePostSizeChange = (size) => {
        setPostSize(size);
        localStorage.setItem("upload_post_size", size);

        // Determine targets:
        // If items are multi-selected in current format, apply to them.
        // Otherwise, apply to active file or all files in current tab.
        const currentSelected = currentFiles.filter(f => selectedFileIds.includes(f.id));
        const targets = currentSelected.length > 0 
            ? currentSelected 
            : (selectedFile ? [selectedFile] : currentFiles);

        if (targets.length === 0) return;

        const targetIds = targets.map(t => t.id);

        // 1. Update individual file post sizes map
        setFilePostSizes(prev => {
            const next = { ...prev };
            targetIds.forEach(id => {
                next[id] = size;
            });
            return next;
        });

        // 2. Update fileForms metadata
        setFileForms(prev => {
            const next = { ...prev };
            targetIds.forEach(id => {
                next[id] = {
                    ...(next[id] || defaultFormState),
                    aspectRatio: size
                };
            });
            return next;
        });

        // 3. Batch update the files state in useAdminUpload
        if (handleBatchUpdateFiles) {
            handleBatchUpdateFiles(targetIds, { aspectRatio: size });
        }

        const sizeLabel = {
            '4:5': '4:5 Portrait',
            '1:1': '1:1 Square',
            '9:16': '9:16 Reel',
            '16:9': '16:9 Landscape',
            'auto': 'Auto'
        }[size] || size;

        toast.success(`Set ${sizeLabel} for ${targets.length} ${targets.length > 1 ? 'items' : 'item'}`, {
            icon: '📐'
        });
    };

    const getCardSizeClasses = (size, file) => {
        if (size === "1:1") return "aspect-square w-40 sm:w-48 md:w-56";
        if (size === "4:5") return "aspect-[4/5] w-40 sm:w-52 md:w-60";
        if (size === "9:16") return "aspect-[9/16] w-36 sm:w-44 md:w-52";
        if (size === "16:9") return "aspect-[16/9] w-52 sm:w-64 md:w-72";
        // auto
        const isVid = file?.file?.type?.startsWith('video');
        return isVid ? "aspect-[9/16] w-36 sm:w-44 md:w-52" : "aspect-[4/5] w-40 sm:w-52 md:w-60";
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
                            Configure content metadata, color tone presets, and test live on mobile preview.
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
                                        Content Details
                                    </h2>
                                    <p className="text-xs text-slate-400">
                                        Essential title, categories, language, and tag options
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            
                            {/* Title + Language — stacked in left column */}
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
                            </div>

                            {/* Category + Subcategory — single grouped in right column */}
                            <div className="flex flex-col gap-4">
                                {/* Category */}
                                <div className="relative z-50">
                                    {(() => {
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

                                        const toggleCategoryById = (targetCat) => {
                                            if (!targetCat) return;
                                            const targetId = targetCat.categoryId || targetCat._id || targetCat.id;
                                            const currentList = formState.category || [];
                                            const isPresent = currentList.some(id => 
                                                String(id).toLowerCase() === String(targetId).toLowerCase() ||
                                                String(id).toLowerCase() === String(targetCat.categoriesName || targetCat.name).toLowerCase()
                                            );

                                            if (isPresent) {
                                                handleChange('category', currentList.filter(id => 
                                                    String(id).toLowerCase() !== String(targetId).toLowerCase() &&
                                                    String(id).toLowerCase() !== String(targetCat.categoriesName || targetCat.name).toLowerCase()
                                                ));
                                            } else {
                                                handleChange('category', [...currentList, targetId]);
                                            }
                                        };

                                        return (
                                            <>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-sm font-semibold text-slate-700">Category</label>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleCategoryById(godCat)}
                                                            className={clsx(
                                                                "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider border transition-all flex items-center gap-1 cursor-pointer",
                                                                isGodChecked
                                                                    ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                                                                    : "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600"
                                                            )}
                                                        >
                                                            <div className={clsx(
                                                                "w-2.5 h-2.5 rounded-xs flex items-center justify-center transition-colors",
                                                                isGodChecked ? "text-white" : "border border-slate-300"
                                                            )}>
                                                                {isGodChecked && <Check size={11} className="stroke-[3]" />}
                                                            </div>
                                                            <span>GOD</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => toggleCategoryById(specialDayCat)}
                                                            className={clsx(
                                                                "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider border transition-all flex items-center gap-1 cursor-pointer",
                                                                isSpecialDayChecked
                                                                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                                                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                                                            )}
                                                        >
                                                            <div className={clsx(
                                                                "w-2.5 h-2.5 rounded-xs flex items-center justify-center transition-colors",
                                                                isSpecialDayChecked ? "text-white" : "border border-slate-300"
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

                                {/* Subcategory */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                            <span>Subcategory</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => toggleCustomMode('god', formState.subCategory || formState.god)}
                                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border transition-all ${customInputModes.god ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                                        >
                                            {customInputModes.god ? '✓ Done' : '+ Custom'}
                                        </button>
                                    </div>
                                    {customInputModes.god ? (
                                        <input
                                            type="text"
                                            placeholder="Type custom subcategory..."
                                            value={formState.subCategory || formState.god || ''}
                                            onChange={(e) => handleChange('subCategory', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-slate-900"
                                            autoFocus
                                        />
                                    ) : (
                                        <div className="relative">
                                            <select
                                                disabled={!formState.category || formState.category.length === 0}
                                                value={formState.subCategory || formState.god || ''}
                                                onChange={(e) => handleChange('subCategory', e.target.value)}
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

                                                    const currentSubVal = formState.subCategory || formState.god;
                                                    const rawList = [
                                                        ...catSubs,
                                                        ...(isSpecialDayCat ? configSpecialDays : (catSubs.length === 0 ? configGods : [])),
                                                        ...localCustomGods,
                                                        ...(currentSubVal ? [currentSubVal] : [])
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
                                    {(formState.subCategory || formState.god) && (
                                        <div className="mt-1.5 flex items-center gap-1.5">
                                            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                                                ✦ {formState.subCategory || formState.god}
                                            </span>
                                            <button type="button" onClick={() => handleChange('subCategory', '')} className="text-slate-400 hover:text-red-500 transition-colors text-xs cursor-pointer">✕</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="md:col-span-2">
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

                    {/* 2. Preview & Modals Row with Scroll View */}
                    <div className="bg-white p-5 sm:p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
                        {/* Header: Title, Media Counts & Format Switcher + Select All */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
                                    <Eye size={20} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-base sm:text-lg font-bold text-slate-900">Preview & Modals</h2>
                                        <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-extrabold uppercase tracking-wide border border-purple-100 shrink-0">
                                            {currentFiles.length} {previewType}{currentFiles.length !== 1 ? 's' : ''}
                                        </span>
                                        {selectedFileIds.length > 0 && (
                                            <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wide shadow-xs animate-in fade-in shrink-0">
                                                {currentFiles.filter(f => selectedFileIds.includes(f.id)).length} Selected
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Multi-select media to batch change post sizes • Preview device frame, adjust tones & layers
                                    </p>
                                </div>
                            </div>

                            {/* Top Actions: Format switcher and Select All */}
                            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                                {/* Format Switcher (Images vs Videos) */}
                                <div className="flex p-1 bg-slate-100 rounded-xl">
                                    <button 
                                        type="button"
                                        onClick={() => setPreviewType('Image')}
                                        className={clsx(
                                            "px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                                            previewType === 'Image'
                                                ? "bg-white text-blue-700 shadow-2xs"
                                                : "text-slate-500 hover:text-slate-800"
                                        )}
                                    >
                                        Images ({imageFiles.length})
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setPreviewType('Video')}
                                        className={clsx(
                                            "px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                                            previewType === 'Video'
                                                ? "bg-white text-blue-700 shadow-2xs"
                                                : "text-slate-500 hover:text-slate-800"
                                        )}
                                    >
                                        Videos ({videoFiles.length})
                                    </button>
                                </div>

                                {/* Multi-Select Toggle All Button */}
                                {currentFiles.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={toggleSelectAll}
                                        className={clsx(
                                            "px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0",
                                            isAllCurrentSelected
                                                ? "bg-blue-600 text-white border-blue-600 shadow-blue-500/20"
                                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                        )}
                                        title={isAllCurrentSelected ? "Deselect all items" : "Select all items"}
                                    >
                                        <CheckCircle2 size={14} className={isAllCurrentSelected ? "text-white" : "text-blue-600"} />
                                        <span>{isAllCurrentSelected ? "Deselect All" : "Select All"}</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Dedicated Sizing & Navigation Tool Ribbon */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-slate-50/90 rounded-2xl border border-slate-200/70 mb-5">
                            {/* Post Size Aspect Ratio Switcher */}
                            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5 min-w-0">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1 shrink-0">
                                    <Maximize2 size={12} className="text-purple-600" /> Size:
                                </span>
                                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/70 shadow-2xs shrink-0">
                                    {[
                                        { id: "4:5", short: "4:5", full: "Portrait" },
                                        { id: "1:1", short: "1:1", full: "Square" },
                                        { id: "9:16", short: "9:16", full: "Reel" },
                                        { id: "16:9", short: "16:9", full: "Landscape" },
                                        { id: "auto", short: "Auto", full: "" }
                                    ].map((sz) => {
                                        const currentSelected = currentFiles.filter(f => selectedFileIds.includes(f.id));
                                        const targets = currentSelected.length > 0 ? currentSelected : (selectedFile ? [selectedFile] : currentFiles);
                                        const isAllTargetsThisSize = targets.length > 0 && targets.every(t => (filePostSizes[t.id] || t.aspectRatio || postSize) === sz.id);

                                        return (
                                            <button
                                                key={sz.id}
                                                type="button"
                                                onClick={() => handlePostSizeChange(sz.id)}
                                                className={clsx(
                                                    "px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                                                    isAllTargetsThisSize || postSize === sz.id
                                                        ? "bg-purple-600 text-white shadow-xs"
                                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                                )}
                                                title={`Apply ${sz.short} ${sz.full} to ${targets.length} item${targets.length > 1 ? 's' : ''}`}
                                            >
                                                <span>{sz.short}</span>
                                                {sz.full && <span className="hidden md:inline font-normal opacity-90"> {sz.full}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Scroll Nav Buttons */}
                            {currentFiles.length > 2 && (
                                <div className="flex items-center gap-1.5 justify-end shrink-0 pl-2 self-end sm:self-auto">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider hidden sm:inline mr-0.5">
                                        Scroll:
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => scrollRow('left')}
                                        className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
                                        title="Scroll Left"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => scrollRow('right')}
                                        className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
                                        title="Scroll Right"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Media Row with Horizontal Scroll View */}
                        <div 
                            ref={rowScrollRef}
                            className="flex flex-row items-center gap-4 overflow-x-auto custom-scrollbar pb-3 pt-1 scroll-smooth"
                        >
                            {currentFiles.length > 0 ? (
                                currentFiles.map(file => {
                                    const isCurrentSelected = activeFileId === file.id;
                                    const isVid = file.file.type.startsWith('video');
                                    const filePostSize = filePostSizes[file.id] || file.aspectRatio || (file.metadata?.canvasSettings?.aspectRatio) || postSize || '9:16';
                                    const cardSizeClass = getCardSizeClasses(filePostSize, file);
                                    const isMultiSelected = selectedFileIds.includes(file.id);

                                    return (
                                        <div
                                            key={file.id}
                                            onClick={() => previewType === 'Image' ? setActiveImageId(file.id) : setActiveVideoId(file.id)}
                                            className={clsx(
                                                "bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center relative shadow-sm group shrink-0 transition-all duration-300 border-2 cursor-pointer",
                                                cardSizeClass,
                                                isMultiSelected 
                                                    ? "border-blue-500 ring-4 ring-blue-500/35 shadow-md scale-[1.01]" 
                                                    : isCurrentSelected 
                                                    ? "border-blue-500/80 ring-2 ring-blue-500/20" 
                                                    : "border-transparent hover:border-slate-300"
                                            )}
                                        >
                                            {/* Top left aspect ratio badge */}
                                            <div className="absolute top-3 left-3 z-10 pointer-events-none">
                                                <span className="bg-black/70 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm border border-white/10">
                                                    {filePostSize === 'auto' ? (isVid ? '9:16' : '4:5') : filePostSize}
                                                </span>
                                            </div>
                                            {isVid ? (
                                                <video src={file.preview} className="w-full h-full object-cover pointer-events-none" />
                                            ) : (
                                                <img src={file.preview} className="w-full h-full object-cover pointer-events-none" alt="Preview" />
                                            )}

                                            {/* Quick Action Overlay Buttons */}
                                            <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                                                {/* Multi-Select Toggle Button */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => toggleSelectFile(file.id, e)}
                                                    className={clsx(
                                                        "w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 cursor-pointer",
                                                        isMultiSelected
                                                            ? "bg-blue-600 text-white ring-2 ring-white/70 shadow-blue-500/50 scale-105"
                                                            : "bg-white/90 text-slate-400 hover:text-slate-800 hover:bg-white"
                                                    )}
                                                    title={isMultiSelected ? "Deselect this item" : "Multi-select this item for batch size change"}
                                                >
                                                    <Check size={14} className={clsx("stroke-[3]", isMultiSelected ? "text-white" : "text-slate-400")} />
                                                </button>

                                                {/* Full Preview Modal Button */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewModalFileId(file.id);
                                                    }}
                                                    className="w-8 h-8 bg-white/90 hover:bg-white text-purple-700 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 cursor-pointer"
                                                    title="Open Phone Preview Modal"
                                                >
                                                    <Smartphone size={14} />
                                                </button>

                                                {/* Color & Filter Modal Button */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setColorModalFileId(file.id);
                                                    }}
                                                    className="w-8 h-8 bg-white/90 hover:bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 cursor-pointer"
                                                    title="Open Color & Filter Modal"
                                                >
                                                    <Palette size={14} />
                                                </button>

                                                {/* Template Layers Editor */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingFileId(file.id);
                                                    }}
                                                    className="w-8 h-8 bg-white/90 hover:bg-white text-blue-600 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 cursor-pointer"
                                                    title="Template Layers Editor"
                                                >
                                                    <Layers size={14} />
                                                </button>

                                                {/* Delete File */}
                                                {handleRemoveFile && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveFile(file.id);
                                                        }}
                                                        className="w-8 h-8 bg-white/90 hover:bg-red-50 text-red-600 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 cursor-pointer"
                                                        title="Remove media"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Bottom Badge overlay */}
                                            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white text-[10px] z-20 pointer-events-none">
                                                <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                    {file.file.name.split('.').pop() || (isVid ? 'MP4' : 'IMG')}
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
                                <div 
                                    onClick={() => document.getElementById('file-upload-input').click()}
                                    className="w-full bg-slate-50/80 hover:bg-blue-50/30 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[180px]"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-xs">
                                        <CloudUpload size={24} />
                                    </div>
                                    <p className="text-slate-700 text-xs font-bold mb-1">
                                        No {previewType.toLowerCase()}s uploaded yet
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                        Click here or use the upload area on the right to add content
                                    </p>
                                </div>
                            )}
                        </div>
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

                    {/* 4. Active Media Focus Card */}
                    {selectedFile && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shadow-2xs">
                                        <Check size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">Active Selection</h3>
                                        <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{selectedFile.file.name}</p>
                                    </div>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider border border-blue-100">
                                    {selectedFile.file.type.startsWith('video') ? 'Video' : 'Image'}
                                </span>
                            </div>

                            {/* Focused Media Frame */}
                            {(() => {
                                const activeSelectedSize = filePostSizes[selectedFile.id] || selectedFile.aspectRatio || postSize || '9:16';
                                const activeAspectClass = activeSelectedSize === '1:1' ? 'aspect-square' : activeSelectedSize === '4:5' ? 'aspect-[4/5]' : activeSelectedSize === '16:9' ? 'aspect-[16/9]' : 'aspect-[9/16]';

                                return (
                                    <div className={clsx("rounded-2xl overflow-hidden bg-slate-950 relative shadow-md mb-4 flex items-center justify-center group transition-all duration-300", activeAspectClass)}>
                                        {selectedFile.file.type.startsWith('video') ? (
                                            <video src={selectedFile.preview} className="w-full h-full object-cover" controls />
                                        ) : (
                                            <img src={selectedFile.preview} className="w-full h-full object-cover" alt="Active preview" />
                                        )}
                                        <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none flex items-center gap-1.5">
                                            <span className="bg-black/70 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                {selectedFile.file.name.split('.').pop() || 'MEDIA'}
                                            </span>
                                            <span className="bg-purple-600/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                {activeSelectedSize}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Quick Action Buttons */}
                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPreviewModalFileId(selectedFile.id)}
                                    className="w-full py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                                >
                                    <Smartphone size={15} />
                                    <span>Open Live Device Preview</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setColorModalFileId(selectedFile.id)}
                                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                                >
                                    <Palette size={15} />
                                    <span>Adjust Color Tone & Filters</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingFileId(selectedFile.id)}
                                    className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                                >
                                    <Layers size={15} />
                                    <span>Edit Template Layers</span>
                                </button>
                            </div>
                        </div>
                    )}

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
