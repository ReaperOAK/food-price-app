import React, { memo, useState } from 'react';
import OptimizedImage from '../../common/OptimizedImage';

const Logo = memo(() => {
  const [hasError, setHasError] = useState(false);

  return (    <div 
      className={`
        relative flex items-center justify-center
        transition-transform duration-200 hover:scale-102 will-change-transform
        w-[100px] sm:w-[120px] md:w-[150px] lg:w-[180px] xl:w-[192px] 
        h-[32px] sm:h-[40px] md:h-[48px] lg:h-[60px] xl:h-[64px]
        flex-shrink-0 min-w-0
        ${hasError ? 'opacity-90' : 'opacity-100'}
      `}
      aria-label="Food Price App"
    >
      {!hasError ? (        <OptimizedImage
          src="/logo.webp"
          alt="Today Egg Rates - Eggs in India Price Tracker"
          className="w-full h-full object-contain transform-gpu"
          width={192}
          height={64}
          loading="eager"
          priority={true}
          sizes="(max-width: 640px) 100px, (max-width: 768px) 120px, (max-width: 1024px) 150px, (max-width: 1280px) 180px, 192px"
          fetchpriority="high"
          decoding="async"
          onError={(e) => {
            console.error('Logo image failed to load:', e);
            e.target.onerror = null;
            setHasError(true);
          }}
          style={{
            aspectRatio: '192/64',
            objectFit: 'contain',
            contentVisibility: 'auto',
          }}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <img
            src="/Favicon.ico"
            alt="Today Egg Rates - Eggs in India Price Tracker"
            className="w-8 h-8 object-contain"
            width={32}
            height={32}
            loading="eager"
            onError={(e) => {
              console.error('Fallback logo failed to load:', e);
              e.target.style.display = 'none';
            }}
          />
          <span className="ml-2 font-semibold text-gray-800 dark:text-gray-200">
            Food Price App
          </span>
        </div>
      )}
    </div>
  );
});

Logo.displayName = 'Logo';

export default Logo;
