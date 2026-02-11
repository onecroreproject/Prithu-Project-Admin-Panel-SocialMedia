import React, { useState, useEffect, useRef } from 'react';

const FeedPreview = ({ files, formData, designMetadata, onUpload, onBack, loading, uploadProgress }) => {
  const [previewMode, setPreviewMode] = useState('desktop');
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const videoRef = useRef(null);
  const audioRefs = useRef({});

  const currentFile = files[currentFileIndex];

  // Get audio config for current file
  const getAudioConfig = () => {
    if (!designMetadata?.audioConfigs) return null;
    return designMetadata.audioConfigs[currentFile.id];
  };

  const audioConfig = getAudioConfig();

  // Handle play/pause for videos
  useEffect(() => {
    if (currentFile?.type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentFile, isPlaying]);

  // Handle audio for image templates
  useEffect(() => {
    const audioElement = audioRefs.current[currentFile.id];
    if (audioConfig?.enabled && audioElement) {
      if (isPlaying) {
        audioElement.currentTime = audioConfig.crop?.start || 0;
        audioElement.play().catch(console.error);
      } else {
        audioElement.pause();
      }
    }
  }, [currentFile, audioConfig, isPlaying]);

  // Handle animation when playing starts
  useEffect(() => {
    if (isPlaying && designMetadata?.isTemplate) {
      setIsAnimating(true);

      // Get animation duration based on speed
      const avatarOverlay = designMetadata.overlayElements?.find(el =>
        el.type === 'avatar' && el.animation?.enabled
      );

      if (avatarOverlay) {
        const baseDuration = 1000; // 1 second base
        const duration = baseDuration / avatarOverlay.animation.speed;

        setTimeout(() => {
          setIsAnimating(false);
        }, duration);
      }
    } else {
      setIsAnimating(false);
    }
  }, [isPlaying, designMetadata]);

  // Auto-stop audio when it ends
  useEffect(() => {
    const audioElement = audioRefs.current[currentFile.id];
    const handleAudioEnd = () => {
      setIsPlaying(false);
      setIsAnimating(false);
    };

    if (audioElement) {
      audioElement.addEventListener('ended', handleAudioEnd);
      return () => audioElement.removeEventListener('ended', handleAudioEnd);
    }
  }, [currentFile.id]);

  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Format bytes to readable size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get animation start position
  const getAnimationStartPosition = (element, direction) => {
    const startPos = { x: element.xPercent, y: element.yPercent };
    const elementWidth = element.wPercent;
    const elementHeight = element.hPercent;

    switch (direction) {
      case 'top':
        return { ...startPos, y: -elementHeight };
      case 'top-right':
        return { ...startPos, x: 100 + elementWidth / 2, y: -elementHeight };
      case 'right':
        return { ...startPos, x: 100 + elementWidth / 2 };
      case 'bottom-right':
        return { ...startPos, x: 100 + elementWidth / 2, y: 100 + elementHeight / 2 };
      case 'bottom':
        return { ...startPos, y: 100 + elementHeight / 2 };
      case 'bottom-left':
        return { ...startPos, x: -elementWidth / 2, y: 100 + elementHeight / 2 };
      case 'left':
        return { ...startPos, x: -elementWidth / 2 };
      case 'top-left':
        return { ...startPos, x: -elementWidth / 2, y: -elementHeight };
      default:
        return startPos;
    }
  };

  // Render overlay preview with animation
  const renderOverlayPreview = () => {
    if (!designMetadata?.overlayElements) return null;

    return designMetadata.overlayElements
      .filter(el => el.visible)
      .map(el => {
        const isAvatar = el.type === 'avatar';
        const isAnimatingNow = isAnimating && isAvatar && el.animation?.enabled;

        const startPos = isAnimatingNow
          ? getAnimationStartPosition(el, el.animation.direction)
          : { x: el.xPercent, y: el.yPercent };

        // Calculate animation duration based on speed
        const baseDuration = 1000; // 1 second base
        const duration = baseDuration / (el.animation?.speed || 1);
        const transitionStyle = isAnimatingNow
          ? `left ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), top ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
          : 'none';

        return (
          <div
            key={el.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${startPos.x}%`,
              top: `${startPos.y}%`,
              width: `${el.wPercent}%`,
              height: `${el.hPercent}%`,
              zIndex: el.zIndex,
              transition: transitionStyle
            }}
          >
            {el.type === 'avatar' && (
              <div className="w-full h-full flex items-center justify-center">
                <div
                  className={`${el.avatarConfig?.shape === 'circle' ? 'rounded-full' :
                      el.avatarConfig?.shape === 'rounded' ? 'rounded-lg' : 'rounded-none'
                    }`}
                  style={{
                    width: '80%',
                    height: '80%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    border: `${el.avatarConfig?.borderWidth || 2}px solid ${el.avatarConfig?.borderColor || '#ffffff'}`,
                    boxShadow: el.avatarConfig?.shadow ? '0 4px 12px rgba(0,0,0,0.5)' : 'none'
                  }}
                />
              </div>
            )}
            {el.type === 'text' && el.textConfig && (
              <div
                className="w-full h-full flex items-center justify-center p-1"
                style={{
                  color: el.textConfig.color,
                  fontSize: `${el.textConfig.fontSize}px`,
                  fontFamily: el.textConfig.fontFamily,
                  backgroundColor: el.textConfig.backgroundColor,
                  padding: `${el.textConfig.padding}px`,
                  textAlign: el.textConfig.align
                }}
              >
                {el.textConfig.content}
              </div>
            )}
          </div>
        );
      });
  };

  // Render footer preview
  const renderFooterPreview = () => {
    if (!designMetadata?.footerConfig?.enabled) return null;

    return (
      <div
        className="absolute left-0 right-0 flex items-center justify-center"
        style={{
          backgroundColor: designMetadata.footerConfig.backgroundColor,
          color: designMetadata.footerConfig.textColor,
          height: `${designMetadata.footerConfig.heightPercent}%`,
          [designMetadata.footerConfig.position]: '0'
        }}
      >
        <div className="flex flex-col items-center space-y-2 p-4">
          {designMetadata.footerConfig.showElements.name && (
            <div className="flex items-center space-x-2">
              <span>👤</span>
              <span>Viewer Name</span>
            </div>
          )}
          {designMetadata.footerConfig.showElements.email && (
            <div className="flex items-center space-x-2">
              <span>📧</span>
              <span>viewer@example.com</span>
            </div>
          )}
          {designMetadata.footerConfig.showElements.phone && (
            <div className="flex items-center space-x-2">
              <span>📱</span>
              <span>+1 234 567 8900</span>
            </div>
          )}
          {designMetadata.footerConfig.showElements.socialIcons && (
            <div className="flex space-x-4 mt-2">
              <span className="text-xl">📷</span>
              <span className="text-xl">👤</span>
              <span className="text-xl">🐦</span>
              <span className="text-xl">💼</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold mb-4">Preview & Upload</h2>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded-lg ${previewMode === 'desktop' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setPreviewMode('desktop')}
            >
              Desktop
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${previewMode === 'mobile' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setPreviewMode('mobile')}
            >
              Mobile
            </button>
          </div>

          {files.length > 1 && (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setCurrentFileIndex(prev => Math.max(0, prev - 1));
                  setIsPlaying(false);
                  setIsAnimating(false);
                }}
                disabled={currentFileIndex === 0}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                ← Previous
              </button>
              <span className="text-sm font-medium">
                File {currentFileIndex + 1} of {files.length}
              </span>
              <button
                onClick={() => {
                  setCurrentFileIndex(prev => Math.min(files.length - 1, prev + 1));
                  setIsPlaying(false);
                  setIsAnimating(false);
                }}
                disabled={currentFileIndex === files.length - 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview Container */}
        <div className="lg:col-span-2">
          <div className="flex justify-center">
            <div
              className={`relative bg-black rounded-lg overflow-hidden ${previewMode === 'mobile'
                  ? 'w-[375px] border-8 border-gray-800 rounded-[40px]'
                  : 'w-full max-w-[800px] border'
                }`}
              style={{
                aspectRatio: (designMetadata?.canvasSettings?.aspectRatio === 'original' || !designMetadata?.canvasSettings?.aspectRatio)
                  ? 'auto'
                  : designMetadata.canvasSettings.aspectRatio.replace(':', '/')
              }}
            >
              {/* Media Preview */}
              <div className="absolute inset-0">
                {currentFile?.type === 'image' ? (
                  <img
                    src={currentFile.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={currentFile?.preview}
                    className="w-full h-full object-cover"
                    muted
                    onClick={togglePlay}
                  />
                )}

                {/* Audio elements for each file */}
                {designMetadata?.audioConfigs && Object.keys(designMetadata.audioConfigs).map(fileId => {
                  const config = designMetadata.audioConfigs[fileId];
                  if (!config.enabled || !config.audioPreview) return null;

                  return (
                    <audio
                      key={fileId}
                      ref={el => audioRefs.current[fileId] = el}
                      src={config.audioPreview}
                      className="hidden"
                      onEnded={() => {
                        if (fileId === currentFile.id) {
                          setIsPlaying(false);
                          setIsAnimating(false);
                        }
                      }}
                    />
                  );
                })}

                {/* Overlays with animation */}
                {designMetadata?.isTemplate && renderOverlayPreview()}

                {/* Footer */}
                {designMetadata?.isTemplate && renderFooterPreview()}
              </div>

              {/* Play controls */}
              {(currentFile?.type === 'video' || audioConfig?.enabled) && (
                <button
                  className="absolute bottom-4 right-4 w-12 h-12 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <span className="text-2xl">⏸️</span>
                  ) : (
                    <span className="text-2xl ml-1">▶️</span>
                  )}
                </button>
              )}

              {/* Mobile notch */}
              {previewMode === 'mobile' && (
                <>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl"></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-gray-800 rounded-t-2xl"></div>
                </>
              )}

              {/* Animation status indicator */}
              {isAnimating && (
                <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm animate-pulse">
                  Animation Playing ({designMetadata?.overlayElements?.find(el => el.type === 'avatar')?.animation?.speed || 1}x)
                </div>
              )}
            </div>
          </div>

          {/* File info */}
          {currentFile && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{currentFile.name}</h4>
                  <p className="text-sm text-gray-500">
                    {currentFile.type.toUpperCase()} • {formatFileSize(currentFile.size)}
                  </p>
                  {audioConfig?.enabled && (
                    <p className="text-sm text-green-600 mt-1">🎵 Has Audio Track</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm px-2 py-1 bg-gray-200 rounded">
                    {currentFile.uploadMode === 'template' ? '🎨 Template' : '📄 Normal'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Details Panel */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Upload Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">
                  {formData.uploadType === 'template' ? 'Template Feed' : 'Normal Feed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Files:</span>
                <span className="font-medium">{files.length} {files.length === 1 ? 'file' : 'files'}</span>
              </div>
              {designMetadata?.audioConfigs && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Audio Files:</span>
                  <span className="font-medium">
                    {Object.values(designMetadata.audioConfigs).filter(c => c.enabled).length}
                  </span>
                </div>
              )}
              {designMetadata?.isTemplate && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overlays:</span>
                    <span className="font-medium">{designMetadata.overlayElements?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Footer:</span>
                    <span className="font-medium">
                      {designMetadata.footerConfig?.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Animations:</span>
                    <span className="font-medium">
                      {designMetadata.overlayElements?.filter(el => el.animation?.enabled).length || 0}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">File Details</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((file, index) => {
                const hasAudio = designMetadata?.audioConfigs?.[file.id]?.enabled;
                return (
                  <div
                    key={file.id}
                    className={`p-3 rounded cursor-pointer transition-colors ${index === currentFileIndex
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'hover:bg-gray-100'
                      }`}
                    onClick={() => {
                      setCurrentFileIndex(index);
                      setIsPlaying(false);
                      setIsAnimating(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded">
                          {file.type === 'image' ? '🖼️' : '🎬'}
                        </div>
                        <div>
                          <div className="font-medium text-sm truncate max-w-[150px]">{file.name}</div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                            {hasAudio && <span className="ml-2 text-green-600">🎵</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm">
                        {file.uploadMode === 'template' ? '🎨' : '📄'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Settings</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{formData.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Audience:</span>
                <span className="font-medium capitalize">{formData.audience}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Language:</span>
                <span className="font-medium">{formData.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium capitalize">{formData.status}</span>
              </div>
              {formData.isScheduled && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Scheduled:</span>
                  <span className="font-medium">
                    {new Date(formData.scheduleDate).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {loading && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Upload Progress</h3>
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-center text-sm">Uploading... {uploadProgress}%</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border-t flex justify-between">
        <button
          onClick={onBack}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Back
        </button>
        <button
          onClick={onUpload}
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading...</span>
            </div>
          ) : (
            'Upload Feed'
          )}
        </button>
      </div>
    </div>
  );
};

export default FeedPreview;