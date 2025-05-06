import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const Breadcrumb = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
  
  // Skip rendering if we're on the homepage
  if (pathSegments.length === 0) {
    return null;
  }
  
  // Generate breadcrumb items
  const breadcrumbItems = [
    {
      name: 'Home',
      path: '/',
      position: 1
    }
  ];
  
  // Build the breadcrumb path segments
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Format the segment name to be more readable
    let name = segment;
    
    // Handle special cases
    if (segment.includes('-egg-rate')) {
      name = segment.replace('-egg-rate', '');
      name = name.charAt(0).toUpperCase() + name.slice(1) + ' Egg Rate';
    } else if (segment === 'blog' && index === 0) {
      name = 'Blog';
    } else if (segment === 'state' && index === 0) {
      name = 'States';
    } else if (segment === 'webstories') {
      name = 'Web Stories';
    } else {
      // Capitalize and replace hyphens with spaces for other segments
      name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    breadcrumbItems.push({
      name,
      path: currentPath,
      position: index + 2
    });
  });
  
  // Create schema for breadcrumbs
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
  
  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      
      <nav className="flex mb-5 text-sm" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="inline-flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-500">/</span>
              )}
              
              {index === breadcrumbItems.length - 1 ? (
                <span className="text-gray-700 font-medium" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link 
                  to={item.path} 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumb;