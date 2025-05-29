import React, { useMemo, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const formatSegmentName = (segment, index) => {
  if (segment.includes('-egg-rate')) {
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

  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const BreadcrumbItem = memo(({ item, isLast, showSeparator }) => {
  if (isLast) {
    return (
      <span 
        className="text-gray-900 font-medium text-sm sm:text-base transition-colors duration-200"
        aria-current="page"
      >
        {item.name}
      </span>
    );
  }

  return (
    <>
      <Link 
        to={item.path}
        className="text-blue-700 hover:text-blue-900 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-sm text-sm sm:text-base transition-all duration-200 font-normal"
        aria-label={`Navigate to ${item.name}`}
      >
        {item.name}
      </Link>
      {showSeparator && (
        <span 
          className="mx-2 text-gray-500 select-none" 
          aria-hidden="true"
        >
          /
        </span>
      )}
    </>
  );
});

const Breadcrumb = memo(() => {
  const location = useLocation();
  
  const { pathSegments, items, schema } = useMemo(() => {
    const segments = location.pathname.split('/').filter(segment => segment !== '');
    
    // Skip rendering if we're on the homepage
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

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems.map(item => ({
        "@type": "ListItem",
        "position": item.position,
        "name": item.name,
        "item": `https://todayeggrates.com${item.path}`
      }))
    };

    return { 
      pathSegments: segments, 
      items: breadcrumbItems,
      schema: breadcrumbSchema
    };
  }, [location.pathname]);

  // Skip rendering if we're on the homepage
  if (pathSegments.length === 0) {
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
        className="flex py-3 px-4 mb-5 bg-gray-50 rounded-lg shadow-sm overflow-x-auto max-w-full backdrop-blur-sm" 
        aria-label="Breadcrumb navigation"
        role="navigation"
      >
        <ol 
          className="inline-flex items-center flex-nowrap min-w-0"
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
              <BreadcrumbItem
                item={item}
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