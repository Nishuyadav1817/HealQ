import React from "react";
import { useState } from 'react';

/**
 * ImageWithFallback Component
 *
 * Handles three scenarios:
 * 1. Image exists → display it
 * 2. Image missing/null → display default placeholder
 * 3. Image broken/failed to load → fallback to default
 *
 * Eliminates broken image icons and provides consistent UX.
 * Reusable across doctor avatars, hospital images, city images.
 */
const ImageWithFallback = ({
  src,
  alt = 'Image',
  fallback = 'default', // 'doctor', 'hospital', 'city', or 'default'
  className = '',
  style = {},
  width,
  height,
}) => {
  const [hasError, setHasError] = useState(!src);

  // Fallback images (using emoji as placeholder for now)
  // In production, these would be proper SVG/PNG assets
  const fallbackImages = {
    doctor: (
      <div className={`bg-blue-100 flex items-center justify-center ${className}`} style={{ width, height, ...style }}>
        <span className="text-4xl">👨‍⚕️</span>
      </div>
    ),
    hospital: (
      <div className={`bg-green-100 flex items-center justify-center ${className}`} style={{ width, height, ...style }}>
        <span className="text-4xl">🏥</span>
      </div>
    ),
    city: (
      <div className={`bg-purple-100 flex items-center justify-center ${className}`} style={{ width, height, ...style }}>
        <span className="text-4xl">🏙️</span>
      </div>
    ),
    default: (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`} style={{ width, height, ...style }}>
        <span className="text-2xl">🖼️</span>
      </div>
    ),
  };

  if (hasError || !src) {
    return fallbackImages[fallback] || fallbackImages.default;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ width, height, ...style }}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};

export default ImageWithFallback;
