import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch server-side generated meta tags for better SEO
 */
export const useServerSideMetaTags = (selectedCity, selectedState) => {
  const [metaTags, setMetaTags] = useState({
    title: '',
    description: '',
    todayRate: null,
    trayPrice: null,
    loading: true
  });

  useEffect(() => {
    const fetchMetaTags = async () => {
      try {
        setMetaTags(prev => ({ ...prev, loading: true }));
        
        const params = new URLSearchParams();
        if (selectedCity) params.append('city', selectedCity);
        if (selectedState) params.append('state', selectedState);
        
        const response = await fetch(`/php/seo/generate_meta_tags.php?${params.toString()}`);
        
        if (response.ok) {
          const data = await response.json();
          setMetaTags({
            title: data.title || '',
            description: data.description || '',
            todayRate: data.todayRate || null,
            trayPrice: data.trayPrice || null,
            loading: false
          });
        } else {
          throw new Error('Failed to fetch meta tags');
        }
      } catch (error) {
        console.error('Error fetching server-side meta tags:', error);
        // Fallback to empty values, will use client-side generation
        setMetaTags({
          title: '',
          description: '',
          todayRate: null,
          trayPrice: null,
          loading: false
        });
      }
    };

    fetchMetaTags();
  }, [selectedCity, selectedState]);

  return metaTags;
};
