import { Helmet } from 'react-helmet';
import { memo, useEffect } from 'react';

const DesktopOptimizer = memo(() => {
  useEffect(() => {
    // Desktop-specific performance optimizations
    if (window.innerWidth >= 1024) {
      // Preload critical desktop resources
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = '/static/css/desktop.css';
      link.as = 'style';
      document.head.appendChild(link);

      // Optimize desktop images
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach(img => {
        if (img.getBoundingClientRect().top < window.innerHeight * 2) {
          img.loading = 'eager';
        }
      });

      // Desktop-specific Core Web Vitals optimization
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          // Preload desktop-specific components
          import('../prices/DetailedEggInfo.js');
          import('../prices/PriceTrends.js');
        });
      }
    }
  }, []);

  return (
    <Helmet>
      {/* Desktop-specific meta tags for better ranking */}
      <meta name="desktop-optimized" content="true" />
      <meta name="layout-width" content="1200px" />
      
      {/* Desktop performance hints */}
      <link rel="preload" href="/static/fonts/desktop-font.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="prefetch" href="/api/desktop-data" />
      
      {/* Desktop-specific structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "NECC Egg Rate Today - Desktop App",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Windows, macOS, Linux",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "INR"
          },
          "featureList": [
            "Live NECC egg rates",
            "Real-time price updates", 
            "Market analysis",
            "Price trends",
            "City-wise rates",
            "Desktop optimized interface"
          ]
        })}
      </script>

      {/* Desktop viewport optimizations */}
      <style type="text/css">{`
        @media (min-width: 1024px) {
          body {
            font-size: 16px;
            line-height: 1.6;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
          }
        }
        
        @media (min-width: 1440px) {
          .container {
            max-width: 1400px;
          }
          .text-lg {
            font-size: 1.125rem;
          }
        }
      `}</style>
    </Helmet>
  );
});

DesktopOptimizer.displayName = 'DesktopOptimizer';

export default DesktopOptimizer;
