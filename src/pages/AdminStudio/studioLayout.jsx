import React, { useState, useEffect, useRef } from 'react';
import axios from '../../Utils/axiosApi';
import TemplateDesignEditor from './TemplateDesignEditor';
import FeedPreview from './FeedPreview';

const AdminFeedUpload = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    uploadType: 'normal',
    caption: '',
    category: '',
    audience: 'public',
    language: 'en',
    hashtags: '',
    isScheduled: false,
    scheduleDate: '',
    status: 'published'
  });

  // Files state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [designMetadata, setDesignMetadata] = useState(null);

  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const token = localStorage.getItem('token');

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/admin/get/feed/category', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response.data.categories);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      file,
      id: `${Date.now()}-${Math.random()}`,
      uploadMode: formData.uploadType === 'template' ? 'template' : 'normal',
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image') ? 'image' :
        file.type.startsWith('video') ? 'video' : 'unknown',
      name: file.name,
      size: file.size
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  // Handle audio selection
  const handleAudioSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedAudio({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      });
    }
  };

  // Remove file
  const removeFile = (id) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Update file upload mode
  const updateFileUploadMode = (id, mode) => {
    setSelectedFiles(prev =>
      prev.map(file =>
        file.id === id ? { ...file, uploadMode: mode } : file
      )
    );
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Next step
  const nextStep = () => {
    if (step === 1 && selectedFiles.length === 0) {
      alert('Please select at least one file');
      return;
    }
    if (step === 1 && !formData.category) {
      alert('Please select a category');
      return;
    }
    setStep(step + 1);
  };

  // Previous step
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Handle template design save
  const handleDesignSave = (designData) => {
    setDesignMetadata(designData);
    nextStep(); // Go to preview step
  };

  // Upload feed
  const uploadFeed = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();

      // Add form data
      formDataToSend.append('uploadType', formData.uploadType);
      formDataToSend.append('caption', formData.caption);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('audience', formData.audience);
      formDataToSend.append('language', formData.language);
      formDataToSend.append('status', formData.status);

      if (formData.hashtags) {
        formDataToSend.append('hashtags', formData.hashtags);
      }
      if (formData.isScheduled && formData.scheduleDate) {
        formDataToSend.append('isScheduled', 'true');
        formDataToSend.append('scheduleDate', formData.scheduleDate);
      }

      // Add files
      selectedFiles.forEach((fileObj, index) => {
        formDataToSend.append('files', fileObj.file);
      });

      // Add audio file if exists
      if (selectedAudio) {
        formDataToSend.append('audio', selectedAudio.file);
      }

      // Add design metadata if template
      if (formData.uploadType === 'template' && designMetadata) {
        formDataToSend.append('designMetadata', JSON.stringify(designMetadata));
      }

      // Upload with progress
      const response = await axios.post('/api/admin/feed-upload', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        alert('Feed uploaded successfully!');
        resetForm();
      } else {
        alert('Upload failed: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      uploadType: 'normal',
      caption: '',
      category: '',
      audience: 'public',
      language: 'en',
      hashtags: '',
      isScheduled: false,
      scheduleDate: '',
      status: 'published'
    });
    setSelectedFiles([]);
    setSelectedAudio(null);
    setDesignMetadata(null);
    setStep(1);
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            formData={formData}
            handleFormChange={handleFormChange}
            categories={categories}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            removeFile={removeFile}
            updateFileUploadMode={updateFileUploadMode}
            selectedAudio={selectedAudio}
            handleAudioSelect={handleAudioSelect}
            fileInputRef={fileInputRef}
            audioInputRef={audioInputRef}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 2:
        if (formData.uploadType === 'template') {
          return (
            <TemplateDesignEditor
              files={selectedFiles}
              audioFile={selectedAudio}
              onSave={handleDesignSave}
              onCancel={prevStep}
            />
          );
        } else {
          return (
            <Step2Normal
              formData={formData}
              handleFormChange={handleFormChange}
              onNext={nextStep}
              onBack={prevStep}
            />
          );
        }
      case 3:
        return (
          <FeedPreview
            files={selectedFiles}
            audioFile={selectedAudio}
            formData={formData}
            designMetadata={designMetadata}
            onUpload={uploadFeed}
            onBack={prevStep}
            loading={loading}
            uploadProgress={uploadProgress}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload New Feed</h1>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  step >= stepNum 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepNum}
                </div>
                <span className="text-sm font-medium">
                  {stepNum === 1 ? 'Select Files' : 
                   stepNum === 2 ? (formData.uploadType === 'template' ? 'Design Template' : 'Details') : 
                   'Preview & Upload'}
                </span>
                {stepNum < 3 && (
                  <div className={`h-1 w-full mt-5 ${
                    step > stepNum ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

// Step 1 Component
const Step1 = ({
  formData,
  handleFormChange,
  categories,
  selectedFiles,
  handleFileSelect,
  removeFile,
  updateFileUploadMode,
  selectedAudio,
  handleAudioSelect,
  fileInputRef,
  audioInputRef,
  onNext,
  onBack
}) => {
  return (
    <div className="space-y-8">
      {/* Upload Type Selector */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Upload Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`relative cursor-pointer border-2 rounded-xl p-6 transition-all ${
            formData.uploadType === 'normal' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="uploadType"
              value="normal"
              checked={formData.uploadType === 'normal'}
              onChange={handleFormChange}
              className="sr-only"
            />
            <div className="flex flex-col items-center text-center">
              <span className="text-4xl mb-3">📄</span>
              <span className="text-lg font-medium mb-1">Normal Feed</span>
              <span className="text-gray-600 text-sm">Simple posts without templates</span>
            </div>
          </label>
          
          <label className={`relative cursor-pointer border-2 rounded-xl p-6 transition-all ${
            formData.uploadType === 'template' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="uploadType"
              value="template"
              checked={formData.uploadType === 'template'}
              onChange={handleFormChange}
              className="sr-only"
            />
            <div className="flex flex-col items-center text-center">
              <span className="text-4xl mb-3">🎨</span>
              <span className="text-lg font-medium mb-1">Template Feed</span>
              <span className="text-gray-600 text-sm">With overlays, animations & audio</span>
            </div>
          </label>
        </div>
      </div>

      {/* File Upload Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Select Files (Max 20)</h3>
        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="text-5xl mb-4 text-gray-400">📁</div>
          <p className="text-lg font-medium mb-2">Click to select images/videos</p>
          <p className="text-gray-500 text-sm">Supports: JPG, PNG, GIF, MP4, MOV</p>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Selected Files ({selectedFiles.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedFiles.map(file => (
                <div key={file.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative aspect-square">
                    {file.type === 'image' ? (
                      <img 
                        src={file.preview} 
                        alt={file.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video 
                        src={file.preview} 
                        className="w-full h-full object-cover"
                        muted
                      />
                    )}
                    <button
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      onClick={() => removeFile(file.id)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-gray-500 text-xs">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {formData.uploadType === 'template' && (
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => updateFileUploadMode(file.id, 'normal')}
                          className={`flex-1 py-1 text-xs rounded ${
                            file.uploadMode === 'normal' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100'
                          }`}
                        >
                          Normal
                        </button>
                        <button
                          onClick={() => updateFileUploadMode(file.id, 'template')}
                          className={`flex-1 py-1 text-xs rounded ${
                            file.uploadMode === 'template' 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-gray-100'
                          }`}
                        >
                          Template
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {formData.uploadType === 'template' && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Optional Audio (for image templates)</h4>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => audioInputRef.current?.click()}
            >
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioSelect}
                className="hidden"
              />
              <div className="text-4xl mb-3 text-gray-400">🎵</div>
              <p className="font-medium mb-1">Click to select audio file</p>
              <p className="text-gray-500 text-sm">Supports: MP3, WAV, M4A</p>
            </div>

            {selectedAudio && (
              <div className="mt-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🎵</div>
                    <div>
                      <p className="font-medium">{selectedAudio.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedAudio.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAudio(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <audio 
                  src={selectedAudio.preview} 
                  controls 
                  className="w-full mt-3"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Basic Details Form */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Basic Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoriesName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Caption</label>
              <textarea
                name="caption"
                value={formData.caption}
                onChange={handleFormChange}
                placeholder="Write a caption..."
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hashtags (comma separated)</label>
              <input
                type="text"
                name="hashtags"
                value={formData.hashtags}
                onChange={handleFormChange}
                placeholder="#fun, #creative, #design"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Audience</label>
              <select
                name="audience"
                value={formData.audience}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="followers">Followers Only</option>
                <option value="specific">Specific Users</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isScheduled"
                checked={formData.isScheduled}
                onChange={handleFormChange}
                className="w-4 h-4 mr-2"
              />
              <label>Schedule for later</label>
            </div>

            {formData.isScheduled && (
              <div>
                <label className="block text-sm font-medium mb-2">Schedule Date & Time</label>
                <input
                  type="datetime-local"
                  name="scheduleDate"
                  value={formData.scheduleDate}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="published">Publish Now</option>
                <option value="draft">Save as Draft</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Next: {formData.uploadType === 'template' ? 'Design Template' : 'Review Details'} →
        </button>
      </div>
    </div>
  );
};

// Step 2 for Normal Uploads
const Step2Normal = ({ formData, handleFormChange, onNext, onBack }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Review Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Upload Type</h3>
            <p className="font-medium">{formData.uploadType === 'template' ? 'Template Feed' : 'Normal Feed'}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
            <p className="font-medium">{formData.category}</p>
          </div>

          {formData.isScheduled && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Scheduled For</h3>
              <p className="font-medium">{new Date(formData.scheduleDate).toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Caption</h3>
            <p className="font-medium">{formData.caption || 'No caption provided'}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Audience</h3>
            <p className="font-medium capitalize">{formData.audience}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
            <p className="font-medium capitalize">{formData.status}</p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Next: Preview & Upload →
        </button>
      </div>
    </div>
  );
};

export default AdminFeedUpload;