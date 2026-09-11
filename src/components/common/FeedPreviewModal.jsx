import React from 'react';
import { X } from 'lucide-react';
import CanvasPreview from '../FeedUpload/template/CanvasPreview';

const DEFAULT_METADATA = {
    isTemplate: true,
    overlayElements: [
        {
            id: 'avatar', type: 'avatar', visible: true, shape: 'round',
            xPercent: 10, yPercent: 10, wPercent: 15, hPercent: 15,
            animation: { enabled: true, direction: 'top', speed: 1 },
            avatarConfig: { shape: 'round', softEdgeConfig: { enabled: false, brushSize: 20, blurStrength: 10, opacity: 1, strokes: [] } }
        },
        {
            id: 'logo', type: 'logo', visible: true,
            xPercent: 80, yPercent: 5, wPercent: 10, hPercent: 10,
            animation: { enabled: false, direction: 'none', speed: 1 }
        },
        {
            id: 'username', type: 'username', visible: true, text: 'User Name',
            xPercent: 10, yPercent: 80, wPercent: 30, hPercent: 5,
            animation: { enabled: true, direction: 'bottom', speed: 1 }
        },
        {
            id: 'calendar', type: 'calendar', visible: true,
            xPercent: 70, yPercent: 20, wPercent: 20, hPercent: 15,
            animation: { enabled: true, direction: 'right', speed: 1 },
            calendarConfig: {
                style: 'simple_icon',
                format: 'DD.MM.YYYY',
                headerColor: '#E54B35',
                bodyColor: '#F9F9F9',
                badgeStyle: 'silver_pill',
                badgeShape: 'pill',
                showIcon: true,
                textColor: '#0F172A',
                iconColor: '#2563EB'
            }
        }
    ],
    audioConfig: { enabled: false, volume: 1 },
    footerConfig: { enabled: true, showElements: { name: true, socialIcons: true }, backgroundColor: 'rgba(0,0,0,0.7)' },
    canvasSettings: { referenceWidth: 1080, referenceHeight: 1920 }
};

const FeedPreviewModal = ({ feed, onClose }) => {
    if (!feed) return null;

    const metadata = feed.designMetadata || DEFAULT_METADATA;

    // Map overlay elements and bind dynamic properties like user name and date
    const updatedMetadata = {
        ...metadata,
        overlayElements: (metadata.overlayElements || DEFAULT_METADATA.overlayElements).map(el => {
            if (el.type === 'username') {
                return { ...el, text: feed.creator?.userName || el.text || 'User Name' };
            }
            if (el.type === 'calendar') {
                const postDate = feed.scheduleDate ? new Date(feed.scheduleDate) : (feed.createdAt ? new Date(feed.createdAt) : new Date());
                const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                return {
                    ...el,
                    day: String(postDate.getDate()).padStart(2, '0'),
                    month: months[postDate.getMonth()],
                    year: postDate.getFullYear(),
                    dayLabel: days[postDate.getDay()]
                };
            }
            return el;
        })
    };

    const editMetadata = feed.editMetadata || {
        crop: { ratio: "original", zoomLevel: 1, position: { x: 0, y: 0 } },
        filters: { preset: "original", adjustments: {} }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative bg-gray-900 rounded-3xl overflow-hidden w-full max-w-xl h-[85vh] flex flex-col shadow-2xl border border-white/5">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all z-50 border border-white/10"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="flex-1 p-4 overflow-hidden">
                    <CanvasPreview
                        previewUrl={feed.contentUrl}
                        fileType={feed.type}
                        metadata={updatedMetadata}
                        audioConfig={updatedMetadata.audioConfig}
                        editMetadata={editMetadata}
                        onUpdateOverlay={() => { }} // Read-only
                        activeOverlayId={null}
                        onSelectOverlay={() => { }} // Read-only
                        onUpdateFooterConfig={() => { }} // Read-only
                    />
                </div>
            </div>
        </div>
    );
};

export default FeedPreviewModal;
