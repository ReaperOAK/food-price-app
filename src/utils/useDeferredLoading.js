import { useEffect, useState } from 'react';

export function useDeferredLoading(delay = 2000) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Only load after the main content is ready and user has started interacting
    const timeoutId = setTimeout(() => {
      setShouldLoad(true);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [delay]);

  return shouldLoad;
}
