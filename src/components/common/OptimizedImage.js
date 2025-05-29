import React, { useState, useEffect, useRef, memo, useCallback } from 'react';

const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  priority = false, 
  sizes,
  onLoad: onLoadProp,
  onError: onErrorProp,
  fallbackSrc = '/logo.webp',
  blur = true,
  quality = 'auto'
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);
  const observer = useRef(null);
  const [dimensions, setDimensions] = useState({ 
    width: width || 0, 
    height: height || 0 
  });

  // Load image dimensions with IntersectionObserver
  const setupImageLoader = useCallback(() => {
    if (!width || !height) {
      const img = new Image();
      img.src = src;
      
      if ('loading' in HTMLImageElement.prototype && !priority) {
        img.loading = 'lazy';
      }
      
      const handleLoad = () => {
        setDimensions({ 
          width: img.naturalWidth, 
          height: img.naturalHeight 
        });
        setImageLoaded(true);
        setLoaded(true);
        onLoadProp?.();
      };

      const handleError = () => {
        setError(true);
        onErrorProp?.();
      };

      img.onload = handleLoad;
      img.onerror = handleError;

      // Clean up
      return () => {
        img.onload = null;
        img.onerror = null;
      };
    } else {
      setDimensions({ width, height });
      setImageLoaded(true);
      return () => {};
    }
  }, [src, width, height, priority, onLoadProp, onErrorProp]);

  useEffect(() => {
    const cleanup = setupImageLoader();
    return cleanup;
  }, [setupImageLoader]);

  // Intersection Observer setup
  useEffect(() => {
    if (!priority && imgRef.current && 'IntersectionObserver' in window) {
      observer.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && imgRef.current) {
              imgRef.current.setAttribute('fetchpriority', 'high');
            }
          });
        },
        { rootMargin: '50px' }
      );

      observer.current.observe(imgRef.current);

      return () => {
        if (observer.current) {
          observer.current.disconnect();
        }
      };
    }
  }, [priority]);

  // Extract Tailwind dimensions and calculate responsive sizes
  const hasTailwindDimensions = /w-\d+|h-\d+/.test(className);
  const aspectRatio = imageLoaded ? (dimensions.height / dimensions.width) * 100 : 56.25;

  const getSizes = useCallback(() => {
    if (sizes) return sizes;
    if (className.includes('w-full')) {
      return '(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 60vw, 1200px';
    }
    if (className.match(/w-(\d+)\/(\d+)/)) {
      const [, num, den] = className.match(/w-(\d+)\/(\d+)/);
      const percentage = (num / den) * 100;
      return `(max-width: 640px) ${percentage}vw, (max-width: 768px) ${percentage * 0.8}vw, ${percentage * 0.6}vw`;
    }
    return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw';
  }, [className, sizes]);

  const optimizedSrcSet = useCallback((src) => {
    const isWebStory = src.includes('/webstories/');
    const basePath = isWebStory ? '/webstories/optimized/' : '/optimized/';
    const sizes = [300, 600, 900];
    
    return sizes
      .map(size => {
        const optimizedSrc = src
          .replace('.webp', `-${size}.webp`)
          .replace(isWebStory ? '/webstories/' : '/', basePath);
        return `${optimizedSrc} ${size}w`;
      })
      .concat(`${src} 1200w`)
      .join(', ');
  }, []);

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
        className={`${error ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'}
                   transition-colors duration-200`}
        aria-hidden="true"
      />
      
      {!error && imageLoaded && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          crossOrigin="anonymous" 
          width={dimensions.width || undefined}
          height={dimensions.height || undefined}
          className={`
            absolute top-0 left-0 w-full h-full object-cover 
            ${className} 
            ${!loaded ? 'opacity-0 blur-sm' : 'opacity-100 blur-0'}
            transition-all duration-500
            motion-reduce:transition-none
            dark:brightness-90
          `}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          sizes={getSizes()}
          srcSet={optimizedSrcSet(src)}
          fetchpriority={priority ? 'high' : /hero|banner/.test(className.toLowerCase()) ? 'high' : 'auto'}
          onLoad={(e) => {
            setLoaded(true);
            if (imgRef.current) {
              imgRef.current.style.transform = 'translateZ(0)';
            }
            onLoadProp?.(e);
          }}
          onError={(e) => {
            setError(true);
            e.target.onerror = null;
            e.target.src = fallbackSrc;
            onErrorProp?.(e);
          }}
          style={{
            contain: 'layout paint style',
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
        />
      )}
      
      {error && (
        <div 
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center
                     bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400
                     transition-colors duration-200"
          role="alert"
          aria-label="Image failed to load"
        >
          <div className="flex flex-col items-center space-y-2">
            <svg 
              className="w-8 h-8" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-sm font-medium">Image not available</span>
          </div>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
