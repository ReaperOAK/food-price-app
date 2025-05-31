import React, { useMemo, memo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const formatSegmentName = (segment, index) => {
  if (!segment) return '';
  
  try {
    if (typeof segment === 'string' && segment.includes('-egg-rate')) {
      // Safely handle case where segment might be undefined/null
      return segment.replace('-egg-rate', '').charAt(0).toUpperCase() + 
             segment.slice(1).replace('-egg-rate', '') + ' Egg Rate';
    }
    
    const specialCases = {
      'blog': (idx) => idx === 0 ? 'Blog' : 'Blog',
      'state': (idx) => idx === 0 ? 'States' : 'State',
      'webstories': () => 'Web Stories'
    };

    if (specialCases[segment]) {
      return specialCases[segment](index);
    }

    // Ensure segment is a string before operations
    return String(segment)
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch (error) {
    console.error('Error formatting segment:', error);
    return ''; // Return empty string as fallback
  }
};

const BreadcrumbSeparator = memo(() => (
  <span 
    className="mx-2 text-gray-600 select-none" 
    aria-hidden="true"
    role="presentation"
  >
    /
  </span>
));

BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbItem = memo(({ item, isLast, showSeparator }) => {
  const navigate = useNavigate();
  const navigationLock = useRef(false);
  
  const handleClick = (e, path) => {
    if (navigationLock.current || !path) {
      e.preventDefault();
      return;
    }
    
    navigationLock.current = true;
    e.preventDefault();

    const updateStateAndNavigate = async () => {
      try {
        if (path === '/') {
          // Handle home navigation
          await Promise.resolve()
            .then(() => {
              item.onStateChange?.('');
              item.onCityChange?.('');
              return new Promise(resolve => setTimeout(resolve, 0));
            })
            .then(() => {
              navigate('/');
            });
        } else {
          // Handle other paths
          const pathSegments = path.split('/').filter(Boolean);
          const lastSegment = pathSegments[pathSegments.length - 1];
          
          // Handle egg rate pages
          if (lastSegment?.includes('-egg-rate')) {
            const cityName = lastSegment.replace('-egg-rate', '');
            if (cityName) {
              await Promise.resolve()
                .then(() => {
                  item.onCityChange?.(cityName);
                  item.onStateChange?.('');
                  return new Promise(resolve => setTimeout(resolve, 0));
                })
                .then(() => {
                  navigate(path);
                });
            }
          } else {
            // Handle any other navigation
            navigate(path);
          }
        }
      } catch (error) {
        console.error('Error handling navigation:', error);
      } finally {
        navigationLock.current = false;
      }
    };

    updateStateAndNavigate();
  };

  const linkClasses = useMemo(() => [
    'inline-flex items-center',
    'px-2 py-1',
    'text-blue-800 hover:text-blue-900',
    'hover:underline focus:outline-none',
    'focus:ring-2 focus:ring-blue-600 focus:ring-offset-1',
    'rounded',
    'text-sm sm:text-base md:text-base',
    'transition-all duration-200',
    'font-medium',
    'min-h-[44px]',
    'hover:bg-blue-50/50'
  ].join(' '), []);

  const currentPageClasses = useMemo(() => `
    inline-flex items-center
    px-2 py-1
    text-gray-900
    font-semibold
    text-sm sm:text-base md:text-base
    transition-colors duration-200
    min-h-[44px]
  `.trim(), []);

  if (isLast) {
    return (
      <span 
        className={currentPageClasses}
        aria-current="page"
      >
        {item.name}
      </span>
    );
  }

  return (
    <>      <Link 
        to={item.path}
        className={linkClasses}
        onClick={(e) => handleClick(e, item.path)}
        aria-label={`Navigate to ${item.name}`}
      >
        {item.name}
      </Link>
      {showSeparator && <BreadcrumbSeparator />}
    </>
  );
});

const Breadcrumb = memo(({ setSelectedCity, setSelectedState }) => {
  const location = useLocation();
    const { pathSegments, items, schema } = useMemo(() => {
    try {
      if (!location || !location.pathname) {
        return { pathSegments: [], items: [], schema: null };
      }

      const segments = location.pathname
        .split('/')
        .filter(segment => segment !== '' && segment != null);
      
      if (segments.length === 0) {
        return { pathSegments: [], items: [], schema: null };
      }

      let currentPath = '';
      const breadcrumbItems = [
        {
          name: 'Home',
          path: '/',
          position: 1,
          id: 'home'
        }
      ];

      segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const name = formatSegmentName(segment, index);
        
        breadcrumbItems.push({
          name,
          path: currentPath,
          position: index + 2,
          id: `${segment}-${index}`
        });
      });

      // Fixed schema structure according to Schema.org requirements
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems.map(item => ({
          "@type": "ListItem",
          "position": item.position,
          "item": {
            "@type": "WebPage",
            "@id": `https://todayeggrates.com${item.path}`,
            "name": item.name,
            "url": `https://todayeggrates.com${item.path}`
          }
        }))
      };      return { 
        pathSegments: segments, 
        items: breadcrumbItems,
        schema: breadcrumbSchema
      };
    } catch (error) {
      console.error('Error in breadcrumb generation:', error);
      return { pathSegments: [], items: [], schema: null };
    }
  }, [location]); // Including entire location object since we use it in the null check

  const containerClasses = useMemo(() => `
    flex py-3 px-4 mb-5
    bg-gray-50/90
    dark:bg-gray-800/90
    rounded-lg
    shadow-sm
    overflow-x-auto
    max-w-full
    backdrop-blur-sm
    border border-gray-100
    dark:border-gray-700
    sticky top-0
    z-10
    scroll-smooth
    scrollbar-thin
    scrollbar-thumb-gray-300
    dark:scrollbar-thumb-gray-600
    scrollbar-track-transparent
  `.trim(), []);

  // Skip rendering if we're on the homepage or if there's an error
  if (pathSegments.length === 0 || !schema) {
    return null;
  }
  
  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      </Helmet>
      
      <nav 
        className={containerClasses}
        aria-label="Breadcrumb navigation"
        role="navigation"
      >
        <ol 
          className="inline-flex items-center flex-nowrap min-w-0 gap-x-1"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {items.map((item, index) => (
            <li 
              key={item.id}
              className="inline-flex items-center whitespace-nowrap"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <meta itemProp="position" content={item.position} />
              <meta itemProp="item" content={`https://todayeggrates.com${item.path}`} />
              <meta itemProp="name" content={item.name} />              <BreadcrumbItem
                item={{
                  ...item,
                  onStateChange: setSelectedState,
                  onCityChange: setSelectedCity
                }}
                isLast={index === items.length - 1}
                showSeparator={index < items.length - 1}
              />
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
});

Breadcrumb.displayName = 'Breadcrumb';
BreadcrumbItem.displayName = 'BreadcrumbItem';

export default Breadcrumb;