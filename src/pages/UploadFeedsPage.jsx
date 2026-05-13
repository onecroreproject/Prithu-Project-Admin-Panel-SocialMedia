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
        if (files.length > 0 && currentStep === 1) {
            // Auto advance to step 2 when files are added
            // setCurrentStep(2); 
        }
        if (isUploading) {
            setCurrentStep(4);
        }
    }, [files.length, isUploading]);

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
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-transparent text-white">
            {/* Step Progress Bar */}
            <div className="mb-12 relative">
                <div className="flex justify-between items-center relative z-10">
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;
                        
                        return (
                            <div key={step.id} className="flex flex-col items-center gap-3 group">
                                <div 
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${
                                        isActive ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-900/40 scale-110' : 
                                        isCompleted ? 'bg-emerald-600 border-emerald-400' : 
                                        'bg-gray-900 border-gray-800 text-gray-500'
                                    }`}
                                >
                                    {isCompleted ? <Check size={24} /> : <Icon size={24} />}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-gray-500'}`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
                
                {/* Connector Lines */}
                <div className="absolute top-7 left-0 w-full h-0.5 bg-gray-800 -z-0">
                    <div 
                        className="h-full bg-linear-to-r from-blue-600 to-emerald-500 transition-all duration-1000 ease-in-out"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    />
                </div>
            </div>

            <div className="min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* STEP 1: FILE SELECTION */}
                {currentStep === 1 && (
                    <div className="space-y-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">Select Your Media</h2>
                            <p className="text-gray-400">Upload one or multiple videos to get started</p>
                        </div>
                        <FileSelect
                            onSelect={(newFiles) => {
                                handleSelectFiles(newFiles);
                                setCurrentStep(2);
                            }}
                            className={files.length > 0 ? "py-12" : "py-24"}
                            isActive={true}
                        />
                        {files.length > 0 && (
                            <div className="flex justify-center">
                                <button 
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition-all"
                                >
                                    Continue with {files.length} files <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: GLOBAL CONFIG */}
                {currentStep === 2 && (
                    <div className="space-y-8 max-w-3xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">Global Configuration</h2>
                            <p className="text-gray-400">Apply settings to all uploaded items at once</p>
                        </div>
                        
                        <div className="p-8 bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-lg font-medium text-gray-200">Common Category</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="applyCategoryToAll"
                                            checked={globalSettings.applyCategoryToAll}
                                            onChange={(e) => updateGlobalSettings('applyCategoryToAll', e.target.checked)}
                                            className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-blue-600"
                                        />
                                        <span className="text-sm text-gray-400">Apply to all</span>
                                    </div>
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

                            <div className="h-px bg-gray-800" />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-lg font-medium text-gray-200">Batch Scheduling</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="applyScheduleToAll"
                                            checked={globalSettings.applyScheduleToAll}
                                            onChange={(e) => updateGlobalSettings('applyScheduleToAll', e.target.checked)}
                                            className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-blue-600"
                                        />
                                        <span className="text-sm text-gray-400">Apply to all</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                        <input
                                            type="checkbox"
                                            disabled={!globalSettings.applyScheduleToAll}
                                            checked={globalSettings.isScheduled}
                                            onChange={(e) => updateGlobalSettings('isScheduled', e.target.checked)}
                                            className="hidden"
                                        />
                                        <div className={`w-12 h-7 rounded-full transition-all duration-300 relative border ${globalSettings.isScheduled ? 'bg-blue-600 border-blue-500' : 'bg-gray-800 border-gray-700'}`}>
                                            <div className={`absolute top-1 left-1 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all duration-300 ${globalSettings.isScheduled ? 'translate-x-5' : ''}`} />
                                        </div>
                                        <span className="text-gray-300">Enable Schedule</span>
                                    </label>

                                    {globalSettings.isScheduled && (
                                        <div className="relative animate-in slide-in-from-top-2 duration-300">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input
                                                type="datetime-local"
                                                disabled={!globalSettings.applyScheduleToAll}
                                                value={globalSettings.scheduleDate}
                                                onChange={(e) => updateGlobalSettings('scheduleDate', e.target.value)}
                                                className="w-full pl-12 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <button onClick={handleBack} className="px-6 py-3 text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                <ChevronLeft size={18} /> Back
                            </button>
                            <button onClick={handleNext} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2">
                                Review Details <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: REFINE DETAILS */}
                {currentStep === 3 && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">Individual Refinement</h2>
                                <p className="text-gray-400">Edit captions, hashtags and specific settings for each video</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={handleBack} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition-all">
                                    Back
                                </button>
                                <button onClick={handleNext} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold shadow-lg shadow-emerald-900/20">
                                    Ready to Publish
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {files.map((fileData, index) => (
                                <MediaCard
                                    key={fileData.id}
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
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 4: PUBLISHING */}
                {currentStep === 4 && (
                    <div className="max-w-2xl mx-auto py-12 text-center space-y-8">
                        <div className="w-24 h-24 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <Upload className="text-blue-500" size={48} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Final Review</h2>
                            <p className="text-gray-400">You are about to publish {files.length} feeds to your social circles.</p>
                        </div>

                        {isUploading ? (
                            <div className="space-y-6 p-8 bg-gray-900/60 rounded-3xl border border-gray-800">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-blue-400 font-bold text-xl">{overallProgress}%</span>
                                    <span className="text-sm text-gray-500">Uploading {files.length} items...</span>
                                </div>
                                <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden p-1 border border-gray-700">
                                    <div 
                                        className="h-full bg-linear-to-r from-blue-600 via-cyan-400 to-emerald-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                                        style={{ width: `${overallProgress}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-400 animate-pulse">Please do not close this tab while the upload is in progress.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <button 
                                    onClick={upload}
                                    className="w-full py-5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl font-bold text-xl shadow-xl shadow-blue-900/40 transform transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    <Upload size={24} /> Publish Everything Now
                                </button>
                                <button onClick={handleBack} className="text-gray-500 hover:text-white transition-colors">
                                    Wait, let me change something
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {editingFile && (
                <TemplateEditor
                    fileData={editingFile}
                    onClose={() => setEditingFileId(null)}
                    onSave={handleUpdateMetadata}
                    onUpdateEditMetadata={handleUpdateEditMetadata}
                />
            )}
            {editingPost && (
                <PostEditor
                    fileData={editingPost}
                    onClose={() => setEditingPostId(null)}
                    onSave={handleUpdateEditMetadata}
                />
            )}
            {previewFile && (
                <LivePreview
                    fileData={previewFile}
                    onClose={() => setPreviewFileId(null)}
                />
            )}

            <style jsx>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default UploadFeedsPage;