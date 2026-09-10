import { X } from "lucide-react";

export default function VideoPopup({ videoUrl, onClose }) {
  if (!videoUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative bg-black rounded-lg overflow-hidden w-full max-w-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-red-500 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Video */}
        <video
          src={videoUrl}
          controls
          autoPlay
          className="w-full h-[480px] object-cover rounded-md"
        />
      </div>
    </div>
  );
}
