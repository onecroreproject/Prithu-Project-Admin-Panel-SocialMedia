import React from "react";

const AspectRatioVideo = ({
  videoUrl,
  aspectRatio = "16/9", // Default aspect ratio
  title = "Embedded Video",
}) => {
  // Convert aspectRatio string like "16/9" to Tailwind aspect-[16/9]
  const aspectClass = aspectRatio.includes("/") ? `aspect-[${aspectRatio}]` : `aspect-${aspectRatio}`;

  return (
    <div className={`${aspectClass} overflow-hidden rounded-lg`}>
      <iframe
        src={videoUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      ></iframe>
    </div>
  );
};

export default AspectRatioVideo;
