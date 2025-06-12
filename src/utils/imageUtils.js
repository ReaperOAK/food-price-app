// Image loading utilities

/**
 * Check if an image URL is accessible
 */
export const checkImageExists = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Get the best available image source with fallbacks
 */
export const getBestImageSrc = async (originalSrc, fallbackSrc = '/logo.webp') => {
  // First try the original source
  if (await checkImageExists(originalSrc)) {
    return originalSrc;
  }
  
  // Then try the fallback
  if (fallbackSrc && await checkImageExists(fallbackSrc)) {
    return fallbackSrc;
  }
  
  // Return a data URL as last resort
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMEMxNS41ODE3IDEwIDEyIDEzLjU4MTcgMTIgMThDMTIgMjIuNDE4MyAxNS41ODE3IDI2IDIwIDI2QzI0LjQxODMgMjYgMjggMjIuNDE4MyAyOCAxOEMyOCAxMy41ODE3IDI0LjQxODMgMTAgMjAgMTBaTTIwIDI0QzE2LjY4NjMgMjQgMTQgMjEuMzEzNyAxNCAyMkMxNCAyMC42ODYzIDE2LjY4NjMgMTggMjAgMThDMjMuMzEzNyAxOCAyNiAyMC42ODYzIDI2IDI0QzI2IDI3LjMxMzcgMjMuMzEzNyAzMCAyMCAzMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
};

/**
 * Generate responsive srcSet for optimized images
 */
export const generateSrcSet = (originalSrc, sizes = [300, 600, 900]) => {
  const isWebStory = originalSrc.includes('/ampstory/');
  
  if (isWebStory) {
    return '';
  }
  
  try {
    const fileName = originalSrc.split('/').pop();
    const baseName = fileName.replace('.webp', '');
    
    const srcSetParts = sizes.map(size => {
      return `/optimized/${baseName}-${size}.webp ${size}w`;
    });
    
    // Add 1200w version for logos
    if (originalSrc.includes('logo')) {
      srcSetParts.push(`/optimized/${baseName}-1200.webp 1200w`);
    }
    
    return srcSetParts.join(', ');
  } catch (error) {
    console.warn('Error generating srcSet for:', originalSrc, error);
    return '';
  }
};

/**
 * Preload critical images
 */
export const preloadImage = (src, priority = false) => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    if (priority) {
      link.fetchpriority = 'high';
    }
    
    link.onload = () => resolve(src);
    link.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    
    document.head.appendChild(link);
  });
};

/**
 * Get responsive sizes string based on className
 */
export const getResponsiveSizes = (className, customSizes) => {
  if (customSizes) return customSizes;
  
  if (className.includes('w-full')) {
    return '(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 60vw, 1200px';
  }
  
  const fractionMatch = className.match(/w-(\d+)\/(\d+)/);
  if (fractionMatch) {
    const [, num, den] = fractionMatch;
    const percentage = (num / den) * 100;
    return `(max-width: 640px) ${percentage}vw, (max-width: 768px) ${percentage * 0.8}vw, ${percentage * 0.6}vw`;
  }
  
  return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw';
};
