import { useDeferredLoading } from './useDeferredLoading';

export function useAnalytics() {
  const shouldLoadAnalytics = useDeferredLoading(3000);

  useEffect(() => {
    if (!shouldLoadAnalytics) return;

    // Load GTM script dynamically
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-PK6FMNGL4N';
    
    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', 'G-PK6FMNGL4N', {
        send_page_view: false // Disable automatic page views
      });
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [shouldLoadAnalytics]);

  return null;
}
