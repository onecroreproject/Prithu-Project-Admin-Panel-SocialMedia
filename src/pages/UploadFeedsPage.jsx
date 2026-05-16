import React, { useEffect, useState } from 'react';
import { useAdminUpload } from '../hooks/useAdminUpload';
import FileSelect from '../components/upload/FileSelect';
import MediaCard from '../components/upload/MediaCard';
import TemplateEditor from '../components/template/TemplateEditor';
import PostEditor from '../components/upload/PostEditor';
import LivePreview from '../components/upload/LivePreview';
import CategorySelector from '../components/common/CategorySelector';
import { Loader2, Upload, Calendar, ChevronRight, ChevronLeft, Check, Film, Settings, Edit3, Send } from 'lucide-react';

const STEPS = [
    { id: 1, title: 'Upload Media', icon: Film },
    { id: 2, title: 'Configure Defaults', icon: Settings },
    { id: 3, title: 'Refine Details', icon: Edit3 },
    { id: 4, title: 'Publish', icon: Send },
];

const UploadFeedsPage = () => {
    const {
        files,
        categories,
        isUploading,
        overallProgress,
        globalSettings,
        updateGlobalSettings,
        handleSelectFiles,
        handleRemoveFile,
        handleToggleMode,
        handleUpdateMetadata,
        handleUpdateEditMetadata,
        handleUpdateFileField,
        upload
    } = useAdminUpload();

    const [currentStep, setCurrentStep] = useState(1);
    const [editingFileId, setEditingFileId] = useState(null);
    const [editingPostId, setEditingPostId] = useState(null);
    const [previewFileId, setPreviewFileId] = useState(null);

    useEffect(() => {
        if (isUploading) {
            setCurrentStep(4);
        }
    }, [isUploading]);

    const editingFile = files.find(f => f.id === editingFileId);
    const editingPost = files.find(f => f.id === editingPostId);
    const previewFile = files.find(f => f.id === previewFileId);

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen text-white">
            {/* Premium Step Tracker */}
            <div className="mb-16 mt-4 sticky top-4 z-50">
                <div className="bg-gray-900/60 backdrop-blur-2xl border border-gray-800/50 rounded-3xl p-6 shadow-2xl shadow-black/40">
                    <div className="flex justify-between items-center relative max-w-4xl mx-auto">
                        {STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;
                            
                            return (
                                <div key={step.id} className="flex flex-col items-center gap-3 relative z-10 flex-1">
                                    <div 
                                        className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-700 border-2 relative group cursor-pointer ${
                                            isActive ? 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-110' : 
                                            isCompleted ? 'bg-emerald-600 border-emerald-400' : 
                                            'bg-gray-800 border-gray-700/50 text-gray-500 hover:border-gray-600'
                                        }`}
                                        onClick={() => !isUploading && isCompleted && setCurrentStep(step.id)}
                                    >
                                        {isCompleted ? <Check size={24} className="animate-in zoom-in duration-300" /> : <Icon size={24} />}
                                        
                                        {isActive && (
                                            <div className="absolute -inset-1 rounded-2xl bg-blue-500/20 animate-pulse" />
                                        )}
                                    </div>
                                    <div className="hidden md:flex flex-col items-center">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-gray-600'}`}>
                                            Step 0{step.id}
                                        </span>
                                        <span className={`text-xs font-bold transition-colors duration-500 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                            {step.title}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Animated Progress Background */}
                        <div className="absolute top-6 md:top-8 left-[12.5%] right-[12.5%] h-1 bg-gray-800 rounded-full -z-0">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 transition-all duration-1000 ease-in-out rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* STEP 1: FILE SELECTION */}
                {currentStep === 1 && (
                    <div className="max-w-4xl mx-auto py-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-black mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                Select Your Media
                            </h2>
                            <p className="text-gray-400 text-lg">Upload high-quality videos to start your creative process</p>
                        </div>
                        
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                            <FileSelect
                                onSelect={(newFiles) => {
                                    handleSelectFiles(newFiles);
                                    setCurrentStep(2);
                                }}
                                className={`relative bg-gray-900/40 border-2 border-dashed border-gray-800 group-hover:border-blue-500/50 transition-all rounded-3xl ${files.length > 0 ? "py-16" : "py-32"}`}
                                isActive={true}
                            />
                        </div>

                        {files.length > 0 && (
                            <div className="flex justify-center mt-12">
                                <button 
                                    onClick={handleNext}
                                    className="group flex items-center gap-3 px-10 py-4 bg-white text-black hover:bg-blue-50 rounded-2xl font-black transition-all shadow-xl shadow-white/5"
                                >
                                    Continue with {files.length} {files.length === 1 ? 'file' : 'files'}
                                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: GLOBAL CONFIG */}
                {currentStep === 2 && (
                    <div className="max-w-3xl mx-auto py-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-black mb-3">Global Configuration</h2>
                            <p className="text-gray-400 text-lg">Set the foundation for your entire batch</p>
                        </div>
                        
                        <div className="p-8 md:p-12 bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] space-y-12 shadow-2xl">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-xl font-bold text-gray-100 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                        Primary Categories
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer py-2 px-4 bg-gray-800/50 rounded-full border border-gray-700/50 hover:bg-gray-800 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={globalSettings.applyCategoryToAll}
                                            onChange={(e) => updateGlobalSettings('applyCategoryToAll', e.target.checked)}
                                            className="w-4 h-4 rounded-sm border-gray-700 bg-gray-900 text-blue-600 focus:ring-0 focus:ring-offset-0"
                                        />
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Apply to all</span>
                                    </label>
                                </div>
                                <CategorySelector
                                    className="w-full"
                                    categories={categories}
                                    selectedIds={globalSettings.categoryIds || (globalSettings.categoryId ? [globalSettings.categoryId] : [])}
                                    onChange={(ids) => {
                                        updateGlobalSettings('categoryIds', ids);
                                        if (ids.length > 0) updateGlobalSettings('categoryId', ids[0]);
                                        else updateGlobalSettings('categoryId', '');
                                    }}
                                    placeholder="Select Categories for this batch"
                                />
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-xl font-bold text-gray-100 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                                        Batch Scheduling
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer py-2 px-4 bg-gray-800/50 rounded-full border border-gray-700/50 hover:bg-gray-800 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={globalSettings.applyScheduleToAll}
                                            onChange={(e) => updateGlobalSettings('applyScheduleToAll', e.target.checked)}
                                            className="w-4 h-4 rounded-sm border-gray-700 bg-gray-900 text-blue-600 focus:ring-0 focus:ring-offset-0"
                                        />
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Apply to all</span>
                                    </label>
                                </div>
                                
                                <div className="flex flex-col gap-6">
                                    <button 
                                        onClick={() => globalSettings.applyScheduleToAll && updateGlobalSettings('isScheduled', !globalSettings.isScheduled)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                                            !globalSettings.applyScheduleToAll ? 'opacity-50 cursor-not-allowed grayscale' : 
                                            globalSettings.isScheduled ? 'bg-blue-600/10 border-blue-500/50' : 'bg-gray-800/20 border-gray-800 hover:border-gray-700'
                                        }`}
                                    >
                                        <div className={`w-12 h-6 rounded-full relative transition-colors ${globalSettings.isScheduled ? 'bg-blue-600' : 'bg-gray-700'}`}>
                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${globalSettings.isScheduled ? 'translate-x-6' : ''}`} />
                                        </div>
                                        <span className={`font-bold ${globalSettings.isScheduled ? 'text-white' : 'text-gray-400'}`}>
                                            {globalSettings.isScheduled ? 'Scheduling Enabled' : 'Click to Enable Schedule'}
                                        </span>
                                    </button>

                                    {globalSettings.isScheduled && (
                                        <div className="relative animate-in slide-in-from-top-4 duration-500">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 p-2 bg-gray-800 rounded-lg text-blue-400">
                                                <Calendar size={18} />
                                            </div>
                                            <input
                                                type="datetime-local"
                                                disabled={!globalSettings.applyScheduleToAll}
                                                value={globalSettings.scheduleDate}
                                                onChange={(e) => updateGlobalSettings('scheduleDate', e.target.value)}
                                                className="w-full pl-16 bg-gray-800/30 border-2 border-gray-800/50 rounded-2xl px-6 py-4 text-white outline-none focus:border-blue-500 transition-all font-medium"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-12">
                            <button onClick={handleBack} className="px-8 py-4 text-gray-500 hover:text-white transition-colors font-bold flex items-center gap-2">
                                <ChevronLeft size={20} /> Go Back
                            </button>
                            <button onClick={handleNext} className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl font-black shadow-xl shadow-blue-900/20 flex items-center gap-3 transform hover:scale-[1.02] active:scale-[0.98] transition-all">
                                Review & Refine <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: REFINE DETAILS */}
                {currentStep === 3 && (
                    <div className="space-y-12 pb-20">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-4xl font-black mb-2">Individual Refinement</h2>
                                <p className="text-gray-400 text-lg">Perfect each post before it goes live</p>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button onClick={handleBack} className="flex-1 md:flex-none px-8 py-4 bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-2xl font-bold transition-all">
                                    Back
                                </button>
                                <button onClick={handleNext} className="flex-1 md:flex-none px-10 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black shadow-xl shadow-emerald-900/20 transform hover:scale-[1.02] transition-all">
                                    Ready to Publish
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {files.map((fileData, index) => (
                                <div key={fileData.id} className="animate-in fade-in zoom-in-95 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                    <MediaCard
                                        fileData={fileData}
                                        categories={categories}
                                        isUploading={isUploading}
                                        onRemove={handleRemoveFile}
                                        onToggleMode={handleToggleMode}
                                        onEdit={setEditingFileId}
                                        onEditPost={setEditingPostId}
                                        onLivePreview={setPreviewFileId}
                                        onUpdateField={(field, value) => handleUpdateFileField(fileData.id, field, value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 4: PUBLISHING */}
                {currentStep === 4 && (
                    <div className="max-w-2xl mx-auto py-20 text-center space-y-12">
                        <div className="relative inline-block">
                            <div className="absolute -inset-4 bg-blue-500/20 blur-2xl rounded-full animate-pulse"></div>
                            <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] flex items-center justify-center mx-auto relative z-10 shadow-2xl">
                                <Upload className="text-white" size={56} />
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-5xl font-black mb-4 tracking-tight">Final Review</h2>
                            <p className="text-gray-400 text-xl leading-relaxed">
                                You are about to publish <span className="text-white font-bold">{files.length}</span> optimized feeds to your digital platform.
                            </p>
                        </div>

                        {isUploading ? (
                            <div className="space-y-8 p-10 bg-gray-900/40 backdrop-blur-xl rounded-[3rem] border border-gray-800 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
                                    <div 
                                        className="h-full bg-blue-500 transition-all duration-300"
                                        style={{ width: `${overallProgress}%` }}
                                    />
                                </div>
                                
                                <div className="flex justify-between items-end">
                                    <div className="text-left">
                                        <span className="text-6xl font-black text-white tabular-nums">{overallProgress}%</span>
                                        <p className="text-blue-400 font-bold uppercase tracking-widest text-xs mt-2">Uploading Progress</p>
                                    </div>
                                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-2" />
                                </div>
                                
                                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-700/50">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-600 via-indigo-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                                        style={{ width: `${overallProgress}%` }}
                                    />
                                </div>
                                <p className="text-gray-500 font-medium">Please do not refresh or close this window...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                <button 
                                    onClick={upload}
                                    className="w-full py-6 bg-white text-black hover:bg-blue-50 rounded-[2rem] font-black text-2xl shadow-2xl shadow-white/10 transform transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-4"
                                >
                                    <Upload size={28} /> Publish Everything Now
                                </button>
                                <button onClick={handleBack} className="text-gray-500 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs">
                                    Wait, I need to make changes
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Premium Modals */}
            {editingFile && (
                <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
                    <TemplateEditor
                        fileData={editingFile}
                        onClose={() => setEditingFileId(null)}
                        onSave={handleUpdateMetadata}
                        onUpdateEditMetadata={handleUpdateEditMetadata}
                    />
                </div>
            )}
            {editingPost && (
                <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
                    <PostEditor
                        fileData={editingPost}
                        onClose={() => setEditingPostId(null)}
                        onSave={handleUpdateEditMetadata}
                    />
                </div>
            )}
            {previewFile && (
                <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
                    <LivePreview
                        fileData={previewFile}
                        onClose={() => setPreviewFileId(null)}
                    />
                </div>
            )}
        </div>
    );
};

export default UploadFeedsPage;