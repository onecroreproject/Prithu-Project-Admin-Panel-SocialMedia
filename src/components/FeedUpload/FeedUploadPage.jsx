import React, { useState, useEffect } from 'react';
import { useAdminUpload } from '../../hooks/useAdminUpload';
import { Info, CloudUpload, Play, Pencil, CheckCircle, Calendar, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import TemplateEditor from './template/TemplateEditor';
import CategorySelector from '../common/CategorySelector';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDropdownConfig, updateDropdownConfig, updateCategory } from '../../Services/FeedServices/feedServices';
import toast from 'react-hot-toast';

const FeedUploadPage = () => {
    const queryClient = useQueryClient();
    const {
        files,
        categories,
        handleSelectFiles,
        handleUpdateEditMetadata,
        handleUpdateMetadata,
        upload,
        setFiles,
        isUploading,
        overallProgress,
        uploadError
    } = useAdminUpload();

    const [editingFileId, setEditingFileId] = useState(null);

    const [customInputModes, setCustomInputModes] = useState({
        session: false,
        day: false,
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
    
    // Ensure we always have arrays even if data isn't loaded yet
    const customOptions = config || { sessions: [], days: [], specialDays: [] };
    
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
                const apiField = field === 'session' ? 'sessions' : field === 'day' ? 'days' : 'specialDays';
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
        day: '',
        god: '',
        specialDay: '',
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
        // Simple reload to reset the page
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
        <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen text-gray-800">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column - Form Details */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* 1. Content Details */}
                    <div>
                        <h2 className="text-blue-600 font-bold text-lg mb-4 flex items-center gap-2">
                            1. Content Details
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold mb-2">Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder="Enter title"
                                    value={formState.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                />
                            </div>



                            {/* Category */}
                            <div className="relative z-50">
                                <label className="block text-sm font-semibold mb-2">Category <span className="text-red-500">*</span></label>
                                <CategorySelector
                                    categories={categories}
                                    selectedIds={formState.category || []}
                                    onChange={(ids) => handleChange('category', ids)}
                                    placeholder="Select Categories"
                                    variant="light"
                                />
                            </div>

                            {/* Language */}
                            <div>
                                <label className="block text-sm font-semibold mb-2">Language</label>
                                <div className="flex items-center gap-6 mt-3">
                                    {['Tamil', 'English', 'Both'].map(lang => (
                                        <label key={lang} className="flex items-center gap-2 cursor-pointer text-sm">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formState.language === lang ? 'border-blue-600' : 'border-gray-300'}`}>
                                                {formState.language === lang && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                                            </div>
                                            <input type="radio" className="hidden" checked={formState.language === lang} onChange={() => handleChange('language', lang)} />
                                            {lang}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-semibold mb-2">Tags</label>
                                <input
                                    type="text"
                                    placeholder="Enter tags (comma separated)"
                                    value={formState.tags}
                                    onChange={(e) => handleChange('tags', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2">Description</label>
                                <textarea
                                    placeholder="Enter description (optional)"
                                    value={formState.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm resize-none"
                                />
                                <div className="text-[10px] text-gray-400 mt-1">{formState.description.length} / 200</div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Scheduling */}
                    <div>
                        <h2 className="text-blue-600 font-bold text-lg mb-4 flex items-center gap-2">
                            2. Scheduling
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-5">
                            <div>
                                <label className="text-sm font-semibold mb-2 flex justify-between items-center text-gray-700">
                                    Session
                                    <button type="button" onClick={() => toggleCustomMode('session', formState.session)} className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${customInputModes.session ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>
                                        {customInputModes.session ? '✓ Done' : '+ Add'}
                                    </button>
                                </label>
                                {customInputModes.session ? (
                                    <input 
                                        type="text"
                                        placeholder="Type custom session..."
                                        value={formState.session || ''}
                                        onChange={(e) => handleChange('session', e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-lg border border-blue-200 bg-white focus:border-blue-500 outline-none text-sm"
                                        autoFocus
                                    />
                                ) : (
                                    <select 
                                        value={formState.session || ''} 
                                        onChange={(e) => handleChange('session', e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-blue-500 outline-none text-sm appearance-none text-gray-500"
                                    >
                                        <option value="" disabled>Select Session</option>
                                        {customOptions.sessions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                        {formState.session && !customOptions.sessions.includes(formState.session) && (
                                            <option value={formState.session}>{formState.session}</option>
                                        )}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-semibold mb-2 flex justify-between items-center text-gray-700">
                                    Day
                                    <button type="button" onClick={() => toggleCustomMode('day', formState.day)} className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${customInputModes.day ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>
                                        {customInputModes.day ? '✓ Done' : '+ Add'}
                                    </button>
                                </label>
                                {customInputModes.day ? (
                                    <input 
                                        type="text"
                                        placeholder="Type custom day..."
                                        value={formState.day || ''}
                                        onChange={(e) => handleChange('day', e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-lg border border-blue-200 bg-white focus:border-blue-500 outline-none text-sm"
                                        autoFocus
                                    />
                                ) : (
                                    <select 
                                        value={formState.day || ''} 
                                        onChange={(e) => handleChange('day', e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-blue-500 outline-none text-sm appearance-none text-gray-500"
                                    >
                                        <option value="" disabled>Select Day</option>
                                        {customOptions.days.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                        {formState.day && !customOptions.days.includes(formState.day) && (
                                            <option value={formState.day}>{formState.day}</option>
                                        )}
                                    </select>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 flex justify-between items-center">
                                    Subcategory
                                    <button type="button" onClick={() => toggleCustomMode('god', formState.god)} className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${customInputModes.god ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>
                                        {customInputModes.god ? '✓ Done' : '+ Add'}
                                    </button>
                                </label>
                                {customInputModes.god ? (
                                    <input 
                                        type="text"
                                        placeholder="Type custom subcategory..."
                                        value={formState.god || ''}
                                        onChange={(e) => handleChange('god', e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-lg border border-blue-200 bg-white focus:border-blue-500 outline-none text-sm"
                                        autoFocus
                                    />
                                ) : (
                                    <select
                                        disabled={!formState.category || formState.category.length === 0}
                                        value={formState.god || ''}
                                        onChange={(e) => handleChange('god', e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-blue-500 outline-none text-sm appearance-none text-gray-500 disabled:opacity-50 disabled:bg-gray-50"
                                    >
                                        <option value="">Select Subcategory (Optional)</option>
                                        {(() => {
                                            const primaryCatId = formState.category?.[0];
                                            const selectedCat = categories?.find(c => 
                                                String(c.categoryId || c._id || c.id) === String(primaryCatId) ||
                                                String(c.categoriesName || c.name).toLowerCase() === String(primaryCatId).toLowerCase()
                                            );
                                            const catSubs = selectedCat?.subcategories || [];
                                            const configGods = customOptions?.gods || [];
                                            
                                            // Combine unique list of subcategories
                                            const allOptions = Array.from(new Set([
                                                ...catSubs,
                                                ...configGods,
                                                ...localCustomGods,
                                                ...(formState.god ? [formState.god] : [])
                                            ])).filter(Boolean);

                                            return allOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ));
                                        })()}
                                    </select>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 flex justify-between items-center">
                                    Special Day
                                    <button type="button" onClick={() => toggleCustomMode('specialDay', formState.specialDay)} className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${customInputModes.specialDay ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>
                                        {customInputModes.specialDay ? '✓ Done' : '+ Add'}
                                    </button>
                                </label>
                                {customInputModes.specialDay ? (
                                    <input 
                                        type="text"
                                        placeholder="Type custom special day..."
                                        value={formState.specialDay || ''}
                                        onChange={(e) => handleChange('specialDay', e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-lg border border-blue-200 bg-white focus:border-blue-500 outline-none text-sm"
                                        autoFocus
                                    />
                                ) : (
                                    <select 
                                        value={formState.specialDay || ''} 
                                        onChange={(e) => handleChange('specialDay', e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-blue-500 outline-none text-sm appearance-none text-gray-500"
                                    >
                                        <option value="" disabled>Select Special Day (Optional)</option>
                                        {customOptions.specialDays.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                        {formState.specialDay && !customOptions.specialDays.includes(formState.specialDay) && (
                                            <option value={formState.specialDay}>{formState.specialDay}</option>
                                        )}
                                    </select>
                                )}
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-semibold mb-2">Publish Date</label>
                                <div className="relative" onClick={() => document.getElementById('publishDateInput')?.showPicker()}>
                                    <input
                                        id="publishDateInput"
                                        type="date"
                                        value={formState.publishDate}
                                        onChange={(e) => handleChange('publishDate', e.target.value)}
                                        className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-blue-500 outline-none text-sm text-gray-700 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                                    />
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-semibold mb-2">Expiry Date</label>
                                <div className="relative" onClick={() => document.getElementById('expiryDateInput')?.showPicker()}>
                                    <input
                                        id="expiryDateInput"
                                        type="date"
                                        value={formState.expiryDate}
                                        onChange={(e) => handleChange('expiryDate', e.target.value)}
                                        className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-blue-500 outline-none text-sm text-gray-500 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                                    />
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-semibold mb-2">Start Time</label>
                                <div className="relative" onClick={() => document.getElementById('startTimeInput')?.showPicker()}>
                                    <input
                                        id="startTimeInput"
                                        type="time"
                                        value={formState.startTime}
                                        onChange={(e) => handleChange('startTime', e.target.value)}
                                        className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-blue-500 outline-none text-sm text-gray-500 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                                    />
                                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-semibold mb-2">End Time</label>
                                <div className="relative" onClick={() => document.getElementById('endTimeInput')?.showPicker()}>
                                    <input
                                        id="endTimeInput"
                                        type="time"
                                        value={formState.endTime}
                                        onChange={(e) => handleChange('endTime', e.target.value)}
                                        className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-blue-500 outline-none text-sm text-gray-500 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                                    />
                                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-blue-600 font-medium">If you select 'Anytime' session, Day and Time is optional.</p>
                        </div>
                    </div>

                    {/* 3. Settings */}

                    {/* Form Actions */}
                    <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                        <button onClick={handleCancel} disabled={isUploading} className="px-6 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Cancel
                        </button>
                        <div className="flex items-center gap-3">
                            <button onClick={() => upload(fileForms, 'draft')} disabled={isUploading} className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                Save as Draft
                            </button>
                            <button onClick={() => upload(fileForms)} disabled={isUploading} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-75 disabled:cursor-wait">
                                {isUploading && <CloudUpload className="w-4 h-4 animate-bounce" />}
                                {isUploading ? 'Publishing...' : 'Save & Publish'}
                            </button>
                            <button onClick={handleReset} disabled={isUploading} className="px-6 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar & Error */}
                    {(isUploading || uploadError) && (
                        <div className="mt-4 border-t border-gray-200 pt-4">
                            {uploadError ? (
                                <div className="text-red-500 text-sm font-medium text-center bg-red-50 py-2 rounded-lg border border-red-100">
                                    {uploadError}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-semibold text-gray-700">
                                        <span>Uploading {files.length} file{files.length > 1 ? 's' : ''}...</span>
                                        <span>{Math.round(overallProgress)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out relative"
                                            style={{ width: `${overallProgress}%` }}
                                        >
                                            <div className="absolute top-0 left-0 bottom-0 right-0 overflow-hidden">
                                                <div className="w-full h-full bg-white/20 animate-[shimmer_1s_infinite] translate-x-[-100%]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Right Column - Upload & Preview */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* 4. Upload Content */}
                    <div>
                        <h2 className="text-blue-600 font-bold text-lg mb-4">4. Upload Content</h2>
                        <div 
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload-input').click()}
                            className="border-2 border-dashed border-gray-300 bg-white hover:bg-gray-50 transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px]"
                        >
                            <input 
                                id="file-upload-input"
                                type="file" 
                                className="hidden" 
                                accept="image/*,video/*"
                                multiple
                                onChange={handleFileChange}
                            />
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                                <CloudUpload size={32} />
                            </div>
                            <p className="text-gray-700 text-sm mb-1">
                                <span className="font-bold text-gray-900">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 mb-4">Image (JPG, PNG, WEBP) or Video (MP4)</p>
                            <p className="text-xs text-gray-500">Max File Size: 100 MB</p>
                        </div>
                    </div>

                    {/* Preview */}
                    <div>
                        <h3 className="font-bold text-blue-600 text-md mb-2">Preview</h3>
                        <div className="flex border-b border-gray-200 mb-2">
                            <button 
                                onClick={() => setPreviewType('Image')}
                                className={`flex-1 pb-2 text-sm font-semibold text-center border-b-2 transition-colors ${previewType === 'Image' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Image ({imageFiles.length})
                            </button>
                            <button 
                                onClick={() => setPreviewType('Video')}
                                className={`flex-1 pb-2 text-sm font-semibold text-center border-b-2 transition-colors ${previewType === 'Video' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Video ({videoFiles.length})
                            </button>
                        </div>
                        
                        <div className="max-h-[500px] overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-1 mt-4">
                            {currentFiles.length > 0 ? (
                                currentFiles.map(file => (
                                    <div key={file.id} className={`bg-white rounded-xl border-2 ${activeFileId === file.id ? 'border-blue-600' : 'border-transparent'} overflow-hidden aspect-[9/16] flex items-center justify-center relative shadow-sm group shrink-0 transition-colors`}>
                                        {file.file.type.startsWith('video') ? (
                                            <>
                                                <video src={file.preview} className="w-full h-full object-cover" />
                                                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => previewType === 'Image' ? setActiveImageId(file.id) : setActiveVideoId(file.id)} className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors ${activeFileId === file.id ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50 text-gray-700'}`} title="Select">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingFileId(file.id); }} className="w-9 h-9 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center text-blue-600 shadow-md transition-colors" title="Edit">
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        const video = e.currentTarget.closest('.group').querySelector('video');
                                                        if (video) {
                                                            if (video.paused) {
                                                                video.play();
                                                            } else {
                                                                video.pause();
                                                            }
                                                        }
                                                    }} className="w-9 h-9 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center text-green-600 shadow-md transition-colors" title="Play/Pause">
                                                        <Play size={18} className="ml-0.5" />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <img src={file.preview} className="w-full h-full object-cover" alt="Preview" />
                                                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => previewType === 'Image' ? setActiveImageId(file.id) : setActiveVideoId(file.id)} className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors ${activeFileId === file.id ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50 text-gray-700'}`} title="Select">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingFileId(file.id); }} className="w-9 h-9 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center text-blue-600 shadow-md transition-colors" title="Edit">
                                                        <Pencil size={18} />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden aspect-[4/3] flex items-center justify-center relative shadow-sm">
                                    <p className="text-gray-400 text-sm">No {previewType.toLowerCase()} selected</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* File Information */}
                    <div>
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                <h3 className="font-bold text-blue-600 text-sm">File Information</h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">File Name</span>
                                    <span className="text-gray-900 font-medium truncate max-w-[150px]" title={selectedFile?.file.name || '-'}>
                                        {selectedFile?.file.name || '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">File Size</span>
                                    <span className="text-gray-900 font-medium">{selectedFile ? formatBytes(selectedFile.file.size) : '-'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Dimensions</span>
                                    <span className="text-gray-900 font-medium">{selectedFile?.dimensions ? `${selectedFile.dimensions.width} x ${selectedFile.dimensions.height}` : '-'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Format</span>
                                    <span className="text-gray-900 font-medium uppercase">{selectedFile ? selectedFile.file.name.split('.').pop() : '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Note */}
            <div className="max-w-[1400px] mx-auto mt-6 bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <p className="text-xs text-indigo-600 font-medium leading-relaxed">
                    <span className="font-bold">Note:</span> Content will be displayed based on Priority. Special Day content has highest priority, followed by Session, Day Wise God and then other content.
                </p>
            </div>

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
