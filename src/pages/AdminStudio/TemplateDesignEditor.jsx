import React, { useState, useEffect, useRef, useCallback } from 'react';

const TemplateDesignEditor = ({ files, audioFile, onSave, onCancel }) => {
  const [step, setStep] = useState('setup'); // 'setup' or 'design'
  const [activeTab, setActiveTab] = useState('overlays');
  const [overlayElements, setOverlayElements] = useState([]);
  const [selectedOverlay, setSelectedOverlay] = useState(null);
  const [canvasSettings, setCanvasSettings] = useState({
    referenceWidth: 1080,
    referenceHeight: 1920,
    aspectRatio: '9:16',
    zoom: 1,
    backgroundColor: 'transparent'
  });

  // Calculate canvas dimensions based on aspect ratio
  const getCanvasDimensions = (ratio) => {
    switch (ratio) {
      case '1:1': return { width: 1080, height: 1080 };
      case '4:5': return { width: 1080, height: 1350 };
      case '16:9': return { width: 1920, height: 1080 };
      case '9:16':
      default: return { width: 1080, height: 1920 };
    }
  };

  const handleAspectRatioSelect = (ratio) => {
    const dims = getCanvasDimensions(ratio);
    setCanvasSettings(prev => ({
      ...prev,
      aspectRatio: ratio,
      referenceWidth: dims.width,
      referenceHeight: dims.height
    }));

    // Auto-add default Avatar and Logo
    const defaultOverlays = [
      {
        id: `overlay-avatar-${Date.now()}`,
        type: 'avatar',
        xPercent: 50,
        yPercent: 30, // Positioned slightly above center
        wPercent: 15,
        hPercent: 15,
        animation: {
          enabled: true,
          direction: 'top',
          speed: 1,
          delay: 0,
          finalStopPosition: { xPercent: 50, yPercent: 30 }
        },
        visible: true,
        zIndex: 20,
        avatarConfig: {
          shape: 'circle',
          borderColor: '#ffffff',
          borderWidth: 2,
          shadow: true
        }
      },
      {
        id: `overlay-logo-${Date.now()}`,
        type: 'logo',
        xPercent: 50,
        yPercent: 70, // Positioned slightly below center
        wPercent: 20,
        hPercent: 20,
        animation: {
          enabled: false,
          direction: 'top',
          speed: 1,
          delay: 0,
          finalStopPosition: { xPercent: 50, yPercent: 70 }
        },
        visible: true,
        zIndex: 21
      }
    ];

    setOverlayElements(defaultOverlays);
    setStep('design');
  };

  const [audioConfigs, setAudioConfigs] = useState({}); // Audio config per file
  const [footerConfig, setFooterConfig] = useState({
    enabled: true,
    position: 'bottom',
    heightPercent: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    textColor: '#ffffff',
    showElements: {
      name: true,
      email: false,
      phone: false,
      socialIcons: true
    }
  });

  const [theme, setTheme] = useState({
    primaryColor: '#1e5a78',
    secondaryColor: '#0f3a4d',
    accentColor: '#ff6b6b',
    textColor: '#ffffff'
  });

  const canvasRef = useRef(null);
  const [previewFile, setPreviewFile] = useState(files[0]?.id || '');
  const [isAnimating, setIsAnimating] = useState(false);
  const [draggingOverlay, setDraggingOverlay] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Animation direction icons mapping
  const directionIcons = {
    'top': '↑',
    'top-right': '↗',
    'right': '→',
    'bottom-right': '↘',
    'bottom': '↓',
    'bottom-left': '↙',
    'left': '←',
    'top-left': '↖',
    'none': '○'
  };

  const directionLabels = {
    'top': 'Top',
    'top-right': 'Top Right',
    'right': 'Right',
    'bottom-right': 'Bottom Right',
    'bottom': 'Bottom',
    'bottom-left': 'Bottom Left',
    'left': 'Left',
    'top-left': 'Top Left',
    'none': 'No Animation'
  };

  // Get current file object
  const currentFile = files.find(f => f.id === previewFile) || files[0];

  // Initialize audio configs for each file
  useEffect(() => {
    const initialAudioConfigs = {};
    files.forEach(file => {
      // If audioConfigs already has this file, preserve it
      if (!audioConfigs[file.id]) {
        initialAudioConfigs[file.id] = {
          enabled: !!audioFile,
          audioFile: audioFile?.file || null,
          audioPreview: audioFile?.preview || null,
          crop: { start: 0, end: null, duration: null },
          volume: 1,
          loop: false
        };
      }
    });
    if (Object.keys(initialAudioConfigs).length > 0) {
      setAudioConfigs(prev => ({ ...prev, ...initialAudioConfigs }));
    }
  }, [files, audioFile]);

  // Add overlay element
  const addOverlay = (type) => {
    // Limit to one avatar and one logo
    if ((type === 'avatar' || type === 'logo') && overlayElements.some(el => el.type === type)) {
      alert(`You can only add one ${type} to the template.`);
      return;
    }

    const newId = `overlay-${Date.now()}`;
    const newOverlay = {
      id: newId,
      type,
      xPercent: 50,
      yPercent: 50,
      wPercent: type === 'avatar' ? 15 : type === 'logo' ? 20 : 30,
      hPercent: type === 'avatar' ? 15 : type === 'logo' ? 20 : 15,
      animation: {
        enabled: type === 'avatar',
        direction: 'top',
        speed: 1,
        delay: 0,
        finalStopPosition: {
          xPercent: 50,
          yPercent: 50
        }
      },
      visible: true,
      zIndex: overlayElements.length > 0
        ? Math.max(...overlayElements.map(el => el.zIndex)) + 1
        : 10,
      ...(type === 'avatar' && {
        avatarConfig: {
          shape: 'circle',
          borderColor: '#ffffff',
          borderWidth: 2,
          shadow: true
        }
      }),
      ...(type === 'text' && {
        textConfig: {
          content: 'Sample Text',
          fontFamily: 'Arial',
          fontSize: 16,
          color: '#ffffff',
          backgroundColor: 'transparent',
          padding: 5,
          align: 'center'
        }
      })
    };

    setOverlayElements(prev => [...prev, newOverlay]);
    setSelectedOverlay(newId);
  };

  // Update overlay
  const updateOverlay = (id, updates) => {
    setOverlayElements(prev =>
      prev.map(overlay =>
        overlay.id === id ? { ...overlay, ...updates } : overlay
      )
    );
  };

  // Remove overlay
  const removeOverlay = (id) => {
    setOverlayElements(prev => prev.filter(overlay => overlay.id !== id));
    if (selectedOverlay === id) {
      setSelectedOverlay(null);
    }
  };

  // Handle drag start
  const handleDragStart = (e, overlayId) => {
    e.preventDefault();
    e.stopPropagation();

    const overlay = overlayElements.find(el => el.id === overlayId);
    if (!overlay) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setDraggingOverlay(overlayId);
    setDragOffset({
      x: x - overlay.xPercent,
      y: y - overlay.yPercent
    });

    setSelectedOverlay(overlayId);
  };

  // Handle drag
  const handleDrag = useCallback((e) => {
    if (!draggingOverlay || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newX = Math.max(0, Math.min(100, x - dragOffset.x));
    const newY = Math.max(0, Math.min(100, y - dragOffset.y));

    setOverlayElements(prev => prev.map(overlay => {
      if (overlay.id === draggingOverlay) {
        return {
          ...overlay,
          xPercent: newX,
          yPercent: newY,
          animation: {
            ...overlay.animation,
            finalStopPosition: {
              xPercent: newX,
              yPercent: newY
            }
          }
        };
      }
      return overlay;
    }));
  }, [draggingOverlay, dragOffset]);

  // Handle drag end
  const handleDragEnd = () => {
    setDraggingOverlay(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Add drag event listeners
  useEffect(() => {
    const handleMouseMove = (e) => handleDrag(e);
    const handleMouseUp = () => handleDragEnd();

    if (draggingOverlay) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingOverlay, handleDrag]);

  // Preview animation with speed variation
  const previewAnimation = () => {
    if (!selectedOverlay) return;

    const element = overlayElements.find(el => el.id === selectedOverlay);
    if (!element.animation.enabled) return;

    setIsAnimating(true);

    // Calculate animation duration based on speed
    const baseDuration = 1000; // 1 second base
    const duration = baseDuration / element.animation.speed;

    // Reset animation after duration
    setTimeout(() => {
      setIsAnimating(false);
    }, duration);
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

  // Handle audio file selection for a specific media file
  const handleAudioSelect = (fileId, audioFile) => {
    setAudioConfigs(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        enabled: true,
        audioFile,
        audioPreview: URL.createObjectURL(audioFile)
      }
    }));
  };

  // Remove audio for a specific media file
  const handleRemoveAudio = (fileId) => {
    setAudioConfigs(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        enabled: false,
        audioFile: null,
        audioPreview: null
      }
    }));
  };

  // Audio cropper component for each file
  const AudioCropper = ({ fileId }) => {
    const audioConfig = audioConfigs[fileId];
    const [audioDuration, setAudioDuration] = useState(0);
    const audioRef = useRef(null);

    useEffect(() => {
      if (audioConfig?.audioPreview && audioRef.current) {
        audioRef.current.onloadedmetadata = () => {
          const duration = audioRef.current.duration;
          setAudioDuration(duration);
          if (!audioConfig.crop.end) {
            setAudioConfigs(prev => ({
              ...prev,
              [fileId]: {
                ...prev[fileId],
                crop: {
                  ...prev[fileId].crop,
                  end: duration,
                  duration: duration
                }
              }
            }));
          }
        };
      }
    }, [audioConfig?.audioPreview, fileId]);

    if (!audioConfig?.enabled || !audioConfig.audioPreview) return null;

    return (
      <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Audio Crop for {files.find(f => f.id === fileId)?.name}</h4>
          <button
            onClick={() => handleRemoveAudio(fileId)}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Remove Audio
          </button>
        </div>

        <audio ref={audioRef} src={audioConfig.audioPreview} className="w-full" controls />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Crop Range</span>
            <span>
              {audioConfig.crop.start.toFixed(1)}s - {audioConfig.crop.end?.toFixed(1) || audioDuration.toFixed(1)}s
            </span>
          </div>

          <div className="relative h-8 bg-gray-200 rounded">
            <input
              type="range"
              min="0"
              max={audioDuration}
              step="0.1"
              value={audioConfig.crop.start}
              onChange={(e) => setAudioConfigs(prev => ({
                ...prev,
                [fileId]: {
                  ...prev[fileId],
                  crop: {
                    ...prev[fileId].crop,
                    start: parseFloat(e.target.value)
                  }
                }
              }))}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-l"
              style={{ width: `${(audioConfig.crop.start / audioDuration) * 100}%` }}
            />
            <div className="absolute top-0 h-full bg-gray-400"
              style={{
                left: `${(audioConfig.crop.start / audioDuration) * 100}%`,
                width: `${((audioConfig.crop.end || audioDuration) - audioConfig.crop.start) / audioDuration * 100}%`
              }}
            />
            <div className="absolute top-0 h-full bg-gray-200 rounded-r"
              style={{
                left: `${((audioConfig.crop.end || audioDuration) / audioDuration) * 100}%`,
                width: `${(audioDuration - (audioConfig.crop.end || audioDuration)) / audioDuration * 100}%`
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start (s)</label>
              <input
                type="number"
                min="0"
                max={audioDuration}
                step="0.1"
                value={audioConfig.crop.start}
                onChange={(e) => setAudioConfigs(prev => ({
                  ...prev,
                  [fileId]: {
                    ...prev[fileId],
                    crop: {
                      ...prev[fileId].crop,
                      start: parseFloat(e.target.value)
                    }
                  }
                }))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End (s)</label>
              <input
                type="number"
                min={audioConfig.crop.start}
                max={audioDuration}
                step="0.1"
                value={audioConfig.crop.end || audioDuration}
                onChange={(e) => setAudioConfigs(prev => ({
                  ...prev,
                  [fileId]: {
                    ...prev[fileId],
                    crop: {
                      ...prev[fileId].crop,
                      end: parseFloat(e.target.value),
                      duration: parseFloat(e.target.value) - prev[fileId].crop.start
                    }
                  }
                }))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Save design
  const handleSave = () => {
    const designMetadata = {
      isTemplate: true,
      templateName: `Template-${Date.now()}`,
      overlayElements,
      canvasSettings,
      audioConfigs: Object.keys(audioConfigs).reduce((acc, fileId) => {
        if (audioConfigs[fileId].enabled && audioConfigs[fileId].audioFile) {
          acc[fileId] = audioConfigs[fileId];
        }
        return acc;
      }, {}),
      footerConfig,
      theme,
      playbackSettings: {
        autoPlay: true,
        loop: false,
        muteByDefault: true,
        restartOnView: true,
        pauseOnHidden: true
      }
    };

    onSave(designMetadata);
  };

  // Render canvas with drag and animation preview
  const renderCanvas = () => {
    const selectedElement = overlayElements.find(el => el.id === selectedOverlay);

    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Design Canvas</h3>
          <div className="flex items-center space-x-4">
            <select
              value={previewFile}
              onChange={(e) => setPreviewFile(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              {files.map((file) => (
                <option key={file.id} value={file.id}>
                  {file.name} ({file.type})
                </option>
              ))}
            </select>
            {selectedElement?.animation?.enabled && (
              <button
                onClick={previewAnimation}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center space-x-2"
              >
                <span>🎬</span>
                <span>Preview Animation</span>
              </button>
            )}
          </div>
        </div>

        <div
          ref={canvasRef}
          className="flex-1 relative bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300"
          style={{
            background: canvasSettings.backgroundColor,
            aspectRatio: canvasSettings.aspectRatio.replace(':', '/'),
            cursor: draggingOverlay ? 'grabbing' : 'default'
          }}
        >
          {currentFile && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              {currentFile.type === 'image' ? (
                <img
                  src={currentFile.preview}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={currentFile.preview}
                  className="max-w-full max-h-full object-contain"
                  muted
                  controls={false}
                />
              )}
            </div>
          )}

          {overlayElements.map(overlay => {
            const isSelected = selectedOverlay === overlay.id;
            const startPos = isAnimating && isSelected && overlay.animation.enabled
              ? getAnimationStartPosition(overlay, overlay.animation.direction)
              : { x: overlay.xPercent, y: overlay.yPercent };

            // Calculate animation duration based on speed
            const baseDuration = 1000; // 1 second base
            const duration = baseDuration / overlay.animation.speed;
            const transitionStyle = isAnimating && isSelected && overlay.animation.enabled
              ? `left ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), top ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
              : 'none';

            return (
              <div
                key={overlay.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${isSelected ? 'ring-2 ring-red-500' : 'ring-1 ring-gray-400'
                  } ${overlay.type === 'avatar' || overlay.type === 'logo' ? 'cursor-move' : ''}`}
                style={{
                  left: `${startPos.x}%`,
                  top: `${startPos.y}%`,
                  width: `${overlay.wPercent}%`,
                  height: `${overlay.hPercent}%`,
                  zIndex: overlay.zIndex,
                  transition: transitionStyle
                }}
                onMouseDown={(e) => {
                  if (overlay.type === 'avatar' || overlay.type === 'logo') {
                    handleDragStart(e, overlay.id);
                    setSelectedOverlay(overlay.id); // Also select on drag start
                  } else {
                    e.stopPropagation();
                    setSelectedOverlay(overlay.id);
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOverlay(overlay.id);
                }}
              >
                {renderOverlayPreview(overlay)}

                {/* Remove Button (Visible when selected) */}
                {isSelected && (
                  <button
                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow hover:bg-red-600 z-50 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOverlay(overlay.id);
                    }}
                    title="Remove"
                  >
                    ×
                  </button>
                )}

                {/* Animation direction indicator */}
                {overlay.animation.enabled && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center space-x-1 text-xs font-semibold bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                      <span className="text-lg">{directionIcons[overlay.animation.direction]}</span>
                      <span>{directionLabels[overlay.animation.direction]}</span>
                    </div>
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black border-opacity-50 mx-auto"></div>
                  </div>
                )}

                {/* Speed indicator */}
                {overlay.animation.enabled && overlay.animation.speed !== 1 && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs bg-yellow-500 text-white px-2 py-1 rounded">
                    {overlay.animation.speed}x
                  </div>
                )}
              </div>
            );
          })}

          {/* Animation path visualization */}
          {selectedElement?.animation?.enabled && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d={`M ${getAnimationStartPosition(selectedElement, selectedElement.animation.direction).x}% ${getAnimationStartPosition(selectedElement, selectedElement.animation.direction).y
                  }% L ${selectedElement.xPercent}% ${selectedElement.yPercent}%`}
                stroke="#ff6b6b"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
              />
              <circle
                cx={`${getAnimationStartPosition(selectedElement, selectedElement.animation.direction).x}%`}
                cy={`${getAnimationStartPosition(selectedElement, selectedElement.animation.direction).y}%`}
                r="4"
                fill="#ff6b6b"
              />
              <circle
                cx={`${selectedElement.xPercent}%`}
                cy={`${selectedElement.yPercent}%`}
                r="6"
                fill="#4CAF50"
              />
            </svg>
          )}
        </div>

        {selectedElement && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold mb-3">Edit Overlay: {selectedElement.type}</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Position (X, Y %)</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm w-8">X:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedElement.xPercent}
                      onChange={(e) => updateOverlay(selectedElement.id, {
                        xPercent: parseInt(e.target.value),
                        animation: {
                          ...selectedElement.animation,
                          finalStopPosition: {
                            ...selectedElement.animation.finalStopPosition,
                            xPercent: parseInt(e.target.value)
                          }
                        }
                      })}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedElement.xPercent.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm w-8">Y:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedElement.yPercent}
                      onChange={(e) => updateOverlay(selectedElement.id, {
                        yPercent: parseInt(e.target.value),
                        animation: {
                          ...selectedElement.animation,
                          finalStopPosition: {
                            ...selectedElement.animation.finalStopPosition,
                            yPercent: parseInt(e.target.value)
                          }
                        }
                      })}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedElement.yPercent.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Size (W, H %)</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm w-8">W:</span>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={selectedElement.wPercent}
                      onChange={(e) => updateOverlay(selectedElement.id, {
                        wPercent: parseInt(e.target.value)
                      })}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedElement.wPercent.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm w-8">H:</span>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={selectedElement.hPercent}
                      onChange={(e) => updateOverlay(selectedElement.id, {
                        hPercent: parseInt(e.target.value)
                      })}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{selectedElement.hPercent.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedElement.type === 'avatar' && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Animation Settings</label>
                <div className="flex items-center space-x-4 mb-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedElement.animation.enabled}
                      onChange={(e) => updateOverlay(selectedElement.id, {
                        animation: {
                          ...selectedElement.animation,
                          enabled: e.target.checked
                        }
                      })}
                      className="mr-2"
                    />
                    Enable Animation
                  </label>
                </div>

                {selectedElement.animation.enabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Animation Direction</label>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(directionIcons).map(([dir, icon]) => (
                          <button
                            key={dir}
                            type="button"
                            onClick={() => updateOverlay(selectedElement.id, {
                              animation: {
                                ...selectedElement.animation,
                                direction: dir
                              }
                            })}
                            className={`p-3 rounded-lg flex flex-col items-center justify-center ${selectedElement.animation.direction === dir
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                          >
                            <span className="text-2xl">{icon}</span>
                            <span className="text-xs mt-1">{directionLabels[dir]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Speed: {selectedElement.animation.speed}x
                        <span className="ml-2 text-gray-500 text-xs">
                          ({selectedElement.animation.speed === 1 ? 'Normal' :
                            selectedElement.animation.speed < 1 ? 'Slower' : 'Faster'})
                        </span>
                      </label>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm">0.1x</span>
                        <input
                          type="range"
                          min="0.1"
                          max="5"
                          step="0.1"
                          value={selectedElement.animation.speed}
                          onChange={(e) => updateOverlay(selectedElement.id, {
                            animation: {
                              ...selectedElement.animation,
                              speed: parseFloat(e.target.value)
                            }
                          })}
                          className="flex-1"
                        />
                        <span className="text-sm">5x</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Drag the slider to see speed variation in preview
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render overlay preview
  const renderOverlayPreview = (overlay) => {
    switch (overlay.type) {
      case 'avatar':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div
              className={`${overlay.avatarConfig?.shape === 'circle' ? 'rounded-full' :
                overlay.avatarConfig?.shape === 'rounded' ? 'rounded-lg' : 'rounded-none'
                }`}
              style={{
                width: '80%',
                height: '80%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: `${overlay.avatarConfig?.borderWidth || 2}px solid ${overlay.avatarConfig?.borderColor || '#ffffff'}`,
                boxShadow: overlay.avatarConfig?.shadow ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
              }}
            />
            <span className="text-xs mt-1 text-gray-700">Avatar</span>
          </div>
        );
      case 'logo':
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-300 bg-opacity-50 rounded border-2 border-dashed border-gray-400">
            <span className="text-sm font-semibold">Logo</span>
          </div>
        );
      case 'text':
        return (
          <div
            className="w-full h-full flex items-center justify-center p-1"
            style={{
              backgroundColor: overlay.textConfig?.backgroundColor || 'transparent',
              color: overlay.textConfig?.color || '#ffffff'
            }}
          >
            <span style={{ fontSize: `${overlay.textConfig?.fontSize || 16}px` }}>
              {overlay.textConfig?.content || 'Text'}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  if (step === 'setup') {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden p-8 flex flex-col items-center justify-center min-h-[600px]">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Select Template Format</h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-4xl">
          {[
            { ratio: '9:16', label: 'Vertical Story', icon: '📱' },
            { ratio: '1:1', label: 'Square Post', icon: '🟦' },
            { ratio: '4:5', label: 'Portrait Post', icon: '🖼️' },
            { ratio: '16:9', label: 'Landscape Video', icon: '🎞️' }
          ].map((item) => (
            <button
              key={item.ratio}
              onClick={() => handleAspectRatioSelect(item.ratio)}
              className="flex flex-col items-center p-8 border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all transform hover:-translate-y-1 shadow-sm hover:shadow-md"
            >
              <span className="text-4xl mb-4">{item.icon}</span>
              <span className="text-xl font-bold text-gray-800">{item.ratio}</span>
              <span className="text-sm text-gray-500 mt-1">{item.label}</span>
              <div
                className="mt-4 bg-gray-200 border border-gray-300"
                style={{
                  width: '60px',
                  aspectRatio: item.ratio.replace(':', '/'),
                }}
              />
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="mt-12 text-gray-500 hover:text-gray-700 underline"
        >
          Cancel Upload
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <h2 className="text-2xl font-bold mb-4">Template Design Editor</h2>
        <div className="flex flex-wrap gap-2">
          {['overlays', 'audio', 'footer', 'theme'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${activeTab === tab
                ? 'bg-white text-purple-600'
                : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[600px]">
        <div className="lg:w-1/4 border-r p-4 overflow-y-auto">
          {activeTab === 'overlays' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Template Elements</h3>
                <div className="space-y-4 mb-6">
                  {/* Avatar Toggle */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">👤</span>
                      <span className="font-medium">Avatar</span>
                    </div>
                    <label className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        checked={overlayElements.some(el => el.type === 'avatar')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            addOverlay('avatar');
                          } else {
                            const avatar = overlayElements.find(el => el.type === 'avatar');
                            if (avatar) removeOverlay(avatar.id);
                          }
                        }}
                        className="opacity-0 w-0 h-0"
                      />
                      <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${overlayElements.some(el => el.type === 'avatar') ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                        <span className={`absolute h-4 w-4 left-1 bottom-1 bg-white rounded-full transition-transform ${overlayElements.some(el => el.type === 'avatar') ? 'translate-x-6' : ''
                          }`} />
                      </span>
                    </label>
                  </div>

                  {/* Logo Toggle */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🏢</span>
                      <span className="font-medium">Logo</span>
                    </div>
                    <label className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        checked={overlayElements.some(el => el.type === 'logo')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            addOverlay('logo');
                          } else {
                            const logo = overlayElements.find(el => el.type === 'logo');
                            if (logo) removeOverlay(logo.id);
                          }
                        }}
                        className="opacity-0 w-0 h-0"
                      />
                      <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${overlayElements.some(el => el.type === 'logo') ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                        <span className={`absolute h-4 w-4 left-1 bottom-1 bg-white rounded-full transition-transform ${overlayElements.some(el => el.type === 'logo') ? 'translate-x-6' : ''
                          }`} />
                      </span>
                    </label>
                  </div>

                  {/* Add Text Button - Kept as is, but styled to match if needed, or kept separate */}
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-500 mb-2">Additional Elements</p>
                    <button
                      onClick={() => addOverlay('text')}
                      className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                    >
                      <span className="text-xl">📝</span>
                      <span>Add Text Box</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Overlays ({overlayElements.length})</h3>
                <div className="space-y-2">
                  {overlayElements.map(overlay => (
                    <div
                      key={overlay.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedOverlay === overlay.id
                        ? 'bg-purple-100 border-l-4 border-purple-600'
                        : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      onClick={() => setSelectedOverlay(overlay.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded">
                          {overlay.type === 'avatar' && '👤'}
                          {overlay.type === 'logo' && '🏢'}
                          {overlay.type === 'text' && '📝'}
                        </div>
                        <div>
                          <div className="font-medium capitalize">{overlay.type}</div>
                          <div className="text-xs text-gray-500">
                            {overlay.xPercent.toFixed(0)}%, {overlay.yPercent.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="relative inline-block w-10 h-5">
                          <input
                            type="checkbox"
                            checked={overlay.visible}
                            onChange={(e) => updateOverlay(overlay.id, {
                              visible: e.target.checked
                            })}
                            className="opacity-0 w-0 h-0"
                          />
                          <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${overlay.visible ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                            <span className={`absolute h-3 w-3 left-1 bottom-1 bg-white rounded-full transition-transform ${overlay.visible ? 'translate-x-5' : ''
                              }`} />
                          </span>
                        </label>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeOverlay(overlay.id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Audio Configuration</h3>

              <div className="space-y-4">
                {files.map(file => {
                  const audioConfig = audioConfigs[file.id] || {};
                  const audioInputId = `audio-${file.id}`;

                  return (
                    <div key={file.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded">
                            {file.type === 'image' ? '🖼️' : '🎬'}
                          </div>
                          <div>
                            <div className="font-medium text-sm truncate">{file.name}</div>
                            <div className="text-xs text-gray-500">{file.type}</div>
                          </div>
                        </div>

                        {!audioConfig.enabled && (
                          <label htmlFor={audioInputId} className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer">
                            Add Audio
                          </label>
                        )}
                      </div>

                      <input
                        id={audioInputId}
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const audioFile = e.target.files[0];
                          if (audioFile) {
                            handleAudioSelect(file.id, audioFile);
                          }
                        }}
                        className="hidden"
                      />

                      {audioConfig.enabled && <AudioCropper fileId={file.id} />}
                    </div>
                  );
                })}
              </div>

              <div className="text-sm text-gray-500">
                <p>💡 Each media file can have its own audio track.</p>
                <p>Audio will play when the corresponding media is in viewport.</p>
              </div>
            </div>
          )}

          {activeTab === 'footer' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Footer Configuration</h3>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={footerConfig.enabled}
                    onChange={(e) => setFooterConfig(prev => ({
                      ...prev,
                      enabled: e.target.checked
                    }))}
                    className="mr-2"
                  />
                  <span className="font-medium">Enable Footer</span>
                </label>
                <span className="text-sm text-gray-500">
                  {footerConfig.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              {footerConfig.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Position</label>
                    <select
                      value={footerConfig.position}
                      onChange={(e) => setFooterConfig(prev => ({
                        ...prev,
                        position: e.target.value
                      }))}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="bottom">Bottom</option>
                      <option value="top">Top</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Height: {footerConfig.heightPercent}%
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      value={footerConfig.heightPercent}
                      onChange={(e) => setFooterConfig(prev => ({
                        ...prev,
                        heightPercent: parseInt(e.target.value)
                      }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Background Color</label>
                    <input
                      type="color"
                      value={footerConfig.backgroundColor}
                      onChange={(e) => setFooterConfig(prev => ({
                        ...prev,
                        backgroundColor: e.target.value
                      }))}
                      className="w-full h-10 cursor-pointer"
                    />
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Show Elements</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(footerConfig.showElements).map(([key, value]) => (
                        <label key={key} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setFooterConfig(prev => ({
                              ...prev,
                              showElements: {
                                ...prev.showElements,
                                [key]: e.target.checked
                              }
                            }))}
                            className="mr-2"
                          />
                          <span className="capitalize">{key}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Theme Colors</h3>

              {Object.entries(theme).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">
                    {key.replace('Color', ' Color')}
                  </label>
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => setTheme(prev => ({
                      ...prev,
                      [key]: e.target.value
                    }))}
                    className="w-full h-10 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:w-3/4 p-4 overflow-auto">
          {renderCanvas()}
        </div>
      </div>

      <div className="p-4 border-t flex justify-between">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Save Design & Continue →
        </button>
      </div>
    </div>
  );
};

export default TemplateDesignEditor;