import { useState, useCallback, useEffect, useRef } from 'react';
import { feedPortalService } from '../services/feedPortalService';
import { io } from 'socket.io-client';

import { getMediaUrl } from '../utils/urlHelper';

const STORAGE_KEY = "feed_upload_state";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Helper for unique ID generation
const generateId = (prefix = "") => {
    const random = Math.random().toString(36).substr(2, 6);
    return prefix ? `${prefix}_${random}` : random;
};

// Helper for deep comparison (simple version using JSON)
const hasDataChanged = (oldData, newData) => {
    return JSON.stringify(oldData) !== JSON.stringify(newData);
};

// Helper to get dominant color
const getDominantColor = (mediaElement) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1;
        canvas.height = 1;

        try {
            ctx.drawImage(mediaElement, 0, 0, 1, 1);
            const data = ctx.getImageData(0, 0, 1, 1).data;
            const r = data[0];
            const g = data[1];
            const b = data[2];
            resolve(`rgba(${r}, ${g}, ${b}, 0.8)`);
        } catch (e) {
            console.warn("Could not extract dominant color", e);
            resolve('rgba(0, 0, 0, 0.7)');
        }
    });
};

export const useAdminUpload = () => {
    const [files, setFiles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [overallProgress, setOverallProgress] = useState(0);
    const [globalSettings, setGlobalSettings] = useState({
        categoryId: '',
        isScheduled: false,
        scheduleDate: '',
        applyCategoryToAll: false,
        applyScheduleToAll: false
    });
    const socketRef = useRef(null);

    // Initial Load
    useEffect(() => {
        fetchCategories();

        // Initialize Socket
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken') || localStorage.getItem('accessToken');
        const sessionId = localStorage.getItem('sessionId') || generateId('session');
        if (!localStorage.getItem('sessionId')) localStorage.setItem('sessionId', sessionId);

        if (token) {
            console.log("🔌 Connecting to Socket at:", SOCKET_URL);
            socketRef.current = io(SOCKET_URL, {
                auth: { token, sessionId },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5
            });

            socketRef.current.on('connect', () => {
                console.log("✅ Socket Connected successfully");
            });

            socketRef.current.on('connect_error', (err) => {
                console.error("❌ Socket Connection Error:", err.message);
            });

            socketRef.current.on('upload_progress', ({ filename, percent }) => {
                console.log(`📊 Upload Progress Received for ${filename}: ${percent}%`);
                setFiles(prev => {
                    const updated = prev.map(f => f.file.name === filename ? { ...f, progress: percent } : f);
                    const totalPercent = updated.reduce((acc, f) => acc + (f.progress || 0), 0) / (updated.length || 1);
                    setOverallProgress(Math.round(totalPercent));
                    return updated;
                });
            });
        }

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    // Persistence Effect
    useEffect(() => {
        if (files.length > 0 && !isUploading) {
            const stateToSave = files.map(f => ({
                id: f.id,
                uploadMode: f.uploadMode,
                categoryId: f.categoryId,
                caption: f.caption,
                scheduleDate: f.scheduleDate,
                isScheduled: f.isScheduled,
                metadata: f.metadata,
                editMetadata: f.editMetadata,
                isEdited: f.isEdited
            }));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        }
    }, [files, isUploading]);

    const fetchCategories = async () => {
        try {
            const data = await feedPortalService.getAllCategories();
            setCategories(data);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };

    const handleSelectFiles = useCallback(async (newFiles) => {
        const processed = await Promise.all(newFiles.map(async (file) => {
            const id = generateId("file");
            const preview = URL.createObjectURL(file);

            let dimensions = { width: null, height: null, ratio: null };
            let dominantColor = 'rgba(0,0,0,0.7)';
            let postType = file.type.startsWith('video') ? 'video' : 'image';

            try {
                if (file.type.startsWith('image')) {
                    const imgResult = await new Promise((resolve) => {
                        const img = new Image();
                        img.crossOrigin = "Anonymous";
                        img.onload = async () => {
                            const ratio = Number((img.width / img.height).toFixed(2));
                            const color = await getDominantColor(img);
                            resolve({ dimensions: { width: img.width, height: img.height, ratio }, dominantColor: color });
                        };
                        img.src = preview;
                    });
                    dimensions = imgResult.dimensions;
                    dominantColor = imgResult.dominantColor;
                } else if (file.type.startsWith('video')) {
                    const videoResult = await new Promise((resolve) => {
                        const video = document.createElement('video');
                        video.crossOrigin = "Anonymous";
                        video.onloadedmetadata = async () => {
                            video.currentTime = 0.1;
                        };
                        video.onseeked = async () => {
                            const color = await getDominantColor(video);
                            resolve({
                                dimensions: {
                                    width: video.videoWidth,
                                    height: video.videoHeight,
                                    ratio: Number((video.videoWidth / video.videoHeight).toFixed(2))
                                },
                                dominantColor: color
                            });
                        };
                        video.src = preview;
                    });
                    dimensions = videoResult.dimensions;
                    dominantColor = videoResult.dominantColor;
                }
            } catch (err) {
                console.error("Error capturing dimensions for file:", file.name, err);
            }

            return {
                id,
                file,
                preview,
                uploadMode: 'normal',
                postType,
                dimensions,
                dominantColor,
                categoryId: globalSettings.applyCategoryToAll ? globalSettings.categoryId : '',
                caption: '',
                scheduleDate: globalSettings.applyScheduleToAll ? globalSettings.scheduleDate : '',
                isScheduled: globalSettings.applyScheduleToAll ? globalSettings.isScheduled : false,
                progress: 0,
                isEdited: false,
                metadata: {
                    isTemplate: false,
                    overlayElements: [
                        {
                            id: generateId('avatar'), type: 'avatar', visible: true,
                            xPercent: 10, yPercent: 10, wPercent: 15, hPercent: 15,
                            animation: { enabled: true, direction: 'top', speed: 1 },
                            avatarConfig: {
                                shape: 'round',
                                softEdgeConfig: {
                                    enabled: false,
                                    brushSize: 20,
                                    blurStrength: 10,
                                    opacity: 1,
                                    strokes: []
                                }
                            }
                        },
                        {
                            id: generateId('logo'), type: 'logo', visible: true,
                            xPercent: 80, yPercent: 5, wPercent: 10, hPercent: 10,
                            animation: { enabled: false, direction: 'none', speed: 1 }
                        },
                        {
                            id: generateId('username'), type: 'username', visible: true,
                            textConfig: { content: "User Name", fontSize: 16, color: "#ffffff", fontWeight: "bold" },
                            xPercent: 10, yPercent: 80, wPercent: 30, hPercent: 5,
                            animation: { enabled: true, direction: 'bottom', speed: 1 }
                        }
                    ],
                    audioConfig: { enabled: false, volume: 1, loop: false },
                    footerConfig: {
                        enabled: true,
                        showElements: { name: true, socialIcons: true },
                        backgroundColor: dominantColor,
                        dominantColor: dominantColor,
                        position: 'bottom'
                    },
                    canvasSettings: {
                        referenceWidth: 1080,
                        referenceHeight: 1920,
                        aspectRatio: dimensions.ratio > 1 ? "16:9" : "9:16"
                    }
                },
                editMetadata: {
                    crop: { ratio: "original", zoomLevel: 1, position: { x: 0, y: 0 } },
                    filters: { preset: "original", adjustments: { brightness: 0, contrast: 0, saturation: 0, fade: 0, temperature: 0, vignette: 0 } }
                }
            };
        }));
        setFiles(prev => [...prev, ...processed]);
    }, [globalSettings]);

    const handleRemoveFile = useCallback((id) => {
        setFiles(prev => {
            const target = prev.find(f => f.id === id);
            if (target) URL.revokeObjectURL(target.preview);
            return prev.filter(f => f.id !== id);
        });
    }, []);

    const handleUpdateFileField = useCallback((id, field, value) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, [field]: value, isEdited: true } : f));
    }, []);

    const updateGlobalSettings = (field, value) => {
        setGlobalSettings(prev => {
            const next = { ...prev, [field]: value };

            // Auto-apply logic
            if (field === 'categoryId' && next.applyCategoryToAll) {
                setFiles(f => f.map(file => ({ ...file, categoryId: value, isEdited: true })));
            }
            if (field === 'applyCategoryToAll' && value) {
                setFiles(f => f.map(file => ({ ...file, categoryId: next.categoryId, isEdited: true })));
            }
            if ((field === 'scheduleDate' || field === 'isScheduled') && next.applyScheduleToAll) {
                setFiles(f => f.map(file => ({ ...file, [field]: value, isEdited: true })));
            }
            if (field === 'applyScheduleToAll' && value) {
                setFiles(f => f.map(file => ({ ...file, scheduleDate: next.scheduleDate, isScheduled: next.isScheduled, isEdited: true })));
            }

            return next;
        });
    };

    const handleToggleMode = useCallback((id, mode) => {
        setFiles(prev => prev.map(f => f.id === id ? {
            ...f,
            uploadMode: mode,
            isEdited: true,
            metadata: { ...f.metadata, isTemplate: mode === 'template' }
        } : f));
    }, []);

    // Automatically convert to Template if data has changed
    const handleUpdateMetadata = useCallback((id, newMetadata) => {
        setFiles(prev => prev.map(f => {
            if (f.id === id) {
                const changed = hasDataChanged(f.metadata, newMetadata);
                if (changed) {
                    return {
                        ...f,
                        metadata: { ...newMetadata, isTemplate: true },
                        isEdited: true,
                        uploadMode: 'template'
                    };
                }
            }
            return f;
        }));
    }, []);

    const handleUpdateEditMetadata = useCallback((id, newEditMetadata) => {
        setFiles(prev => prev.map(f => {
            if (f.id === id) {
                const changed = hasDataChanged(f.editMetadata, newEditMetadata);
                if (changed) {
                    return {
                        ...f,
                        editMetadata: newEditMetadata,
                        isEdited: true,
                        uploadMode: 'template',
                        metadata: { ...f.metadata, isTemplate: true }
                    };
                }
            }
            return f;
        }));
    }, []);

    const upload = async () => {
        if (files.length === 0) return alert("Select files first");

        const missingCategory = files.find(f => !f.categoryId);
        if (missingCategory) return alert(`Please select a category for ${missingCategory.file.name}`);

        setIsUploading(true);
        setUploadError(null);
        setOverallProgress(0);

        try {
            const formData = new FormData();
            const perFileMetadata = {};

            files.forEach(f => {
                const isTemplate = f.uploadMode === 'template';
                let postType = f.postType;
                if (f.metadata?.audioConfig?.enabled) {
                    postType = 'image+audio';
                }

                perFileMetadata[f.file.name] = {
                    categoryId: f.categoryId,
                    caption: f.caption,
                    scheduleTime: f.isScheduled ? f.scheduleDate : null,
                    designData: {
                        ...f.metadata,
                        isTemplate,
                        uploadType: isTemplate ? 'template' : 'normal',
                        postType,
                        editMetadata: f.editMetadata,
                        dimensions: f.dimensions
                    }
                };

                formData.append('files', f.file);
                if (f.uploadMode === 'template' && f.metadata?.audioConfig?.file) {
                    formData.append('audio', f.metadata.audioConfig.file);
                }
            });

            formData.append('perFileMetadata', JSON.stringify(perFileMetadata));

            await feedPortalService.uploadFeed(formData);
            alert("Upload Successful!");
            setFiles([]);
            localStorage.removeItem(STORAGE_KEY);
        } catch (err) {
            console.error(err);
            setUploadError("Upload failed. Check console.");
        } finally {
            setIsUploading(false);
        }
    };

    return {
        files,
        categories,
        isUploading,
        uploadError,
        overallProgress,
        globalSettings,
        updateGlobalSettings,
        handleSelectFiles,
        handleRemoveFile,
        handleUpdateFileField,
        handleToggleMode,
        handleUpdateMetadata,
        handleUpdateEditMetadata,
        fetchCategories,
        upload
    };
};
