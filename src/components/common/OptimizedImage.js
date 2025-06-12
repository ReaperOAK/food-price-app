import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { generateSrcSet, getResponsiveSizes } from '../../utils/imageUtils';

// Safe string conversion helper
const safeToLowerCase = (value) => {
  if (!value) return '';
  return String(value).toLowerCase();
};

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
  quality = 'auto',
  debug = false // Add debug prop for troubleshooting
}) => {  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [isStable, setIsStable] = useState(false); // Prevent flickering
  const [hasEverLoaded, setHasEverLoaded] = useState(false); // Track if image ever loaded successfully
  const imgRef = useRef(null);
  const observer = useRef(null);
  const [dimensions, setDimensions] = useState({ 
    width: width || 0, 
    height: height || 0 
  });
  // Update currentSrc when src prop changes
  useEffect(() => {
    if (debug) console.log('OptimizedImage: src changed to:', src);
    setCurrentSrc(src);
    setError(false);
    setLoaded(false);
    setLoadAttempts(0);
    setIsStable(false);
    
    // Add stability timer to prevent rapid re-renders
    const stabilityTimer = setTimeout(() => {
      setIsStable(true);
    }, 100);
    
    return () => clearTimeout(stabilityTimer);
  }, [src, debug]);  // Load image dimensions and handle loading
  const setupImageLoader = useCallback(() => {
    if (!currentSrc || !isStable) {
      if (debug) console.log('OptimizedImage: No currentSrc provided or not stable yet');
      return () => {};
    }

    // Reset states when src changes
    setLoaded(false);
    setError(false);
    setImageLoaded(false);

    if (width && height) {
      if (debug) console.log('OptimizedImage: Using provided dimensions:', { width, height });
      setDimensions({ width, height });
      setImageLoaded(true);
      return () => {};
    }

    if (debug) console.log('OptimizedImage: Loading image to get dimensions:', currentSrc);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
      const handleLoad = () => {
      if (debug) console.log('OptimizedImage: Image loaded successfully:', currentSrc, { width: img.naturalWidth, height: img.naturalHeight });
      setDimensions({ 
        width: img.naturalWidth, 
        height: img.naturalHeight 
      });
      setImageLoaded(true);
      setLoaded(true);
      setHasEverLoaded(true); // Mark as successfully loaded
      onLoadProp?.();
    };

    const handleError = () => {
      if (debug) console.warn('OptimizedImage: Failed to load image:', currentSrc, 'Attempt:', loadAttempts + 1);
      // Don't mark as error if image has loaded before (prevents flickering)
      if (!hasEverLoaded) {
        setLoadAttempts(prev => prev + 1);
        setError(true);
      }
      onErrorProp?.();
    };img.onload = handleLoad;
    img.onerror = handleError;
    
    // Set the src last to trigger loading
    img.src = currentSrc;

    // Clean up
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [currentSrc, width, height, onLoadProp, onErrorProp, debug, loadAttempts, isStable, hasEverLoaded]);
  useEffect(() => {
    const cleanup = setupImageLoader();
    return cleanup;
  }, [setupImageLoader, isStable]);

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
  const aspectRatio = imageLoaded ? (dimensions.height / dimensions.width) * 100 : 56.25;  const getSizes = useCallback(() => {
    return getResponsiveSizes(className, sizes);
  }, [className, sizes]);

  const getSrcSet = useCallback(() => {
    return generateSrcSet(currentSrc);
  }, [currentSrc]);

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
      />        {!error && imageLoaded && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          crossOrigin="anonymous" 
          width={dimensions.width || undefined}
          height={dimensions.height || undefined}          className={`
            absolute top-0 left-0 w-full h-full object-cover 
            ${className} 
            ${!loaded && !hasEverLoaded ? 'opacity-0 blur-sm' : 'opacity-100 blur-0'}
            transition-all duration-500
            motion-reduce:transition-none
            dark:brightness-90
          `}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          sizes={getSizes()}
          {...(getSrcSet() && { srcSet: getSrcSet() })}
          fetchpriority={priority ? 'high' : /hero|banner/.test(safeToLowerCase(className)) ? 'high' : 'auto'}
          onLoad={(e) => {
            setLoaded(true);
            setHasEverLoaded(true);
            if (imgRef.current) {
              imgRef.current.style.transform = 'translateZ(0)';
            }
            onLoadProp?.(e);
          }}          onError={(e) => {
            if (debug) console.warn('OptimizedImage: Main img element failed to load:', currentSrc);
            
            // Only try fallback if image has never loaded successfully
            if (!hasEverLoaded) {
              // Try fallback if this isn't already the fallback and we haven't tried too many times
              if (currentSrc !== fallbackSrc && fallbackSrc && loadAttempts < 2) {
                if (debug) console.log('OptimizedImage: Trying fallback image:', fallbackSrc);
                setCurrentSrc(fallbackSrc);
                setLoadAttempts(prev => prev + 1);
                e.target.srcset = ''; // Clear srcset to avoid conflicts
                return;
              }
              
              // If fallback also fails, show error state
              if (debug) console.error('OptimizedImage: All fallbacks failed for:', src);
              setError(true);
              setLoaded(false);
            }
            onErrorProp?.(e);
          }}
          style={{
            contain: 'layout paint style',
            willChange: loaded ? 'auto' : 'transform',
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
