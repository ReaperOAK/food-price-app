import React, { useState, useEffect } from 'react';

const OptimizedImage = ({ src, alt, className = '', width, height }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: width || 0, height: height || 0 });

  // Early load image dimensions if not provided
  useEffect(() => {
    if (!width || !height) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
        setImageLoaded(true);
        setLoaded(true);
      };
      img.onerror = () => {
        setError(true);
      };
    } else {
      setDimensions({ width, height });
      setImageLoaded(true);
    }
  }, [src, width, height]);

  // Extract Tailwind dimensions and calculate aspect ratio
  const hasTailwindDimensions = /w-\d+|h-\d+/.test(className);
  const aspectRatio = imageLoaded ? (dimensions.height / dimensions.width) * 100 : 56.25;

  return (
    <div 
      className={`relative overflow-hidden ${hasTailwindDimensions ? '' : 'w-full'}`}
      style={{ 
        width: width ? `${width}px` : '100%',
        aspectRatio: dimensions.width && dimensions.height ? `${dimensions.width}/${dimensions.height}` : '16/9'
      }}
    >
      <div
        style={{ paddingTop: `${aspectRatio}%` }}
        className={`${error ? 'bg-gray-200' : 'bg-gray-100'}`}
        aria-hidden="true"
      />
      {!error && imageLoaded && (
        <img
          src={src}
          alt={alt}
          width={dimensions.width}
          height={dimensions.height}
          className={`absolute top-0 left-0 w-full h-full object-cover ${className} ${
            !loaded ? 'opacity-0' : 'opacity-100'
          } transition-opacity duration-300`}
          loading="lazy"
          decoding="async"
          fetchpriority={/hero|logo|banner/.test(className.toLowerCase()) ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            setError(true);
            e.target.onerror = null;
            e.target.src = '/tee.webp';
          }}
        />
      )}
      {error && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-gray-500">
          <span>Image not available</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
