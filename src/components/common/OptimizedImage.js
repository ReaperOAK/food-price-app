import React, { useState, useEffect } from 'react';

const OptimizedImage = ({ src, alt, className, width, height }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setLoaded(true);
    };
  }, [src]);

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${!loaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = '/tee.webp'; // Fallback image
      }}
    />
  );
};

export default OptimizedImage;
