import React, { useState, useEffect, useRef } from 'react';

const OptimizedImage = ({ src, alt, className = '', width, height, priority = false, sizes }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ 
    width: width || 0, 
    height: height || 0 
  });

  // Early load image dimensions if not provided
  useEffect(() => {
    if (!width || !height) {
      const img = new Image();
      img.src = src;
      
      // Use native browser lazy loading hint unless priority
      if ('loading' in HTMLImageElement.prototype && !priority) {
        img.loading = 'lazy';
      }
      
      img.onload = () => {
        setDimensions({ 
          width: img.naturalWidth, 
          height: img.naturalHeight 
        });
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
  }, [src, width, height, priority]);

  // Extract Tailwind dimensions
  const hasTailwindDimensions = /w-\d+|h-\d+/.test(className);
  const aspectRatio = imageLoaded ? (dimensions.height / dimensions.width) * 100 : 56.25;
  
  // Calculate sizes attribute based on provided sizes or responsive classes
  const getSizes = () => {
    if (sizes) return sizes;
    if (className.includes('w-full')) {
      return '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px';
    }
    if (className.match(/w-(\d+)\/(\d+)/)) {
      const [, num, den] = className.match(/w-(\d+)\/(\d+)/);
      const percentage = (num / den) * 100;
      return `(max-width: 768px) ${percentage}vw, (max-width: 1200px) ${percentage * 0.8}vw, ${percentage * 0.6}vw`;
    }
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  };

  return (
    <div 
      className={`relative overflow-hidden ${hasTailwindDimensions ? '' : 'w-full'}`}
      style={{ 
        width: width ? `${width}px` : '100%',
        aspectRatio: dimensions.width && dimensions.height ? 
          `${dimensions.width}/${dimensions.height}` : '16/9',
        contain: 'layout paint style'
      }}
    >
      <div
        style={{ 
          paddingTop: `${aspectRatio}%`,
          contain: 'strict'
        }}
        className={`${error ? 'bg-gray-200' : 'bg-gray-100'}`}
        aria-hidden="true"
      />      {!error && imageLoaded && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          crossorigin="anonymous" 
          width={dimensions.width || undefined}
          height={dimensions.height || undefined}
          className={`absolute top-0 left-0 w-full h-full object-cover ${className} ${
            !loaded ? 'opacity-0' : 'opacity-100'
          } transition-opacity duration-300 will-change-transform`}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          sizes={getSizes()}
          srcSet={`${src.includes('/webstories/') 
            ? src.replace('.webp', '-300.webp').replace('/webstories/', '/webstories/optimized/') 
            : src.replace('.webp', '-300.webp').replace('/', '/optimized/')} 300w,
                   ${src.includes('/webstories/') 
            ? src.replace('.webp', '-600.webp').replace('/webstories/', '/webstories/optimized/')
            : src.replace('.webp', '-600.webp').replace('/', '/optimized/')} 600w,
                   ${!src.includes('/webstories/') 
            ? src.replace('.webp', '-900.webp').replace('/', '/optimized/') 
            : src} 900w,
                   ${src} 1200w`}
          fetchpriority={priority ? 'high' : /hero|banner/.test(className.toLowerCase()) ? 'high' : 'auto'}
          onLoad={() => {
            setLoaded(true);
            // Force layout recalculation
            if (imgRef.current) {
              imgRef.current.style.transform = 'translateZ(0)';
            }
          }}
          onError={(e) => {
            setError(true);
            e.target.onerror = null;
            e.target.src = '/logo.webp';
          }}
          style={{
            contain: 'layout paint style',
            willChange: 'transform',
            transform: 'translateZ(0)'
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
