import React, { memo } from 'react';
import OptimizedImage from '../../common/OptimizedImage';

const Logo = memo(() => (
  <div 
    className="logo-container relative w-48 h-16"
    style={{ maxWidth: '192px' }}
  >
    <OptimizedImage
      src="/logo.webp"
      alt="Food Price App Logo"
      className="w-full h-full object-contain"
      width={192}
      height={64}
      loading="eager"
      priority={true}
      sizes="(max-width: 768px) 150px, 192px"
    />
  </div>
));

Logo.displayName = 'Logo';

export default Logo;
