import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumb = ({ selectedCity, selectedState }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
  
  // Generate structured data for breadcrumbs
  const generateStructuredData = () => {
    const items = [{ name: 'Home', url: 'https://todayeggrates.com/' }];
    
    if (selectedState && !selectedCity) {
      items.push({ 
        name: `${selectedState} Egg Rates`, 
        url: `https://todayeggrates.com/state/${selectedState.toLowerCase()}-egg-rate` 
      });
    }
    
    if (selectedCity) {
      if (selectedState) {
        items.push({ 
          name: `${selectedState} Egg Rates`, 
          url: `https://todayeggrates.com/state/${selectedState.toLowerCase()}-egg-rate` 
        });
      }
      items.push({ 
        name: `${selectedCity} Egg Rate`, 
        url: `https://todayeggrates.com/${selectedCity.toLowerCase()}-egg-rate` 
      });
    }
    
    if (pathSegments.includes('webstories')) {
      items.push({ 
        name: 'Web Stories', 
        url: 'https://todayeggrates.com/webstories' 
      });
    }
    
    if (pathSegments.includes('blog')) {
      items.push({ 
        name: 'Blog', 
        url: 'https://todayeggrates.com/blog' 
      });
      
      if (pathSegments.length > 1) {
        const blogSlug = pathSegments[pathSegments.length - 1];
        items.push({ 
          name: blogSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
          url: `https://todayeggrates.com/blog/${blogSlug}` 
        });
      }
    }
    
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    };
  };
  
  let breadcrumbItems = [];
  
  // Home link is always present
  breadcrumbItems.push(
    <li key="home" className="inline-flex items-center">
      <Link to="/" className="text-gray-600 hover:text-blue-500">Home</Link>
      <span className="mx-2 text-gray-400">/</span>
    </li>
  );
  
  // Add state if available
  if (selectedState && !selectedCity) {
    breadcrumbItems.push(
      <li key="state" className="inline-flex items-center">
        <Link to={`/state/${selectedState.toLowerCase()}-egg-rate`} className="text-gray-800 font-medium">
          {selectedState} Egg Rates
        </Link>
      </li>
    );
  }
  
  // Add state and city if both available
  if (selectedCity) {
    if (selectedState) {
      breadcrumbItems.push(
        <li key="state" className="inline-flex items-center">
          <Link to={`/state/${selectedState.toLowerCase()}-egg-rate`} className="text-gray-600 hover:text-blue-500">
            {selectedState}
          </Link>
          <span className="mx-2 text-gray-400">/</span>
        </li>
      );
    }
    
    breadcrumbItems.push(
      <li key="city" className="inline-flex items-center">
        <span className="text-gray-800 font-medium">{selectedCity} Egg Rate</span>
      </li>
    );
  }
  
  // Handle other paths
  if (pathSegments.includes('webstories')) {
    if (pathSegments.length === 1) {
      breadcrumbItems = [
        <li key="home" className="inline-flex items-center">
          <Link to="/" className="text-gray-600 hover:text-blue-500">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
        </li>,
        <li key="webstories" className="inline-flex items-center">
          <span className="text-gray-800 font-medium">Web Stories</span>
        </li>
      ];
    } else {
      const storyName = pathSegments[pathSegments.length - 1].replace(/\.html$/, '').replace(/-/g, ' ');
      breadcrumbItems = [
        <li key="home" className="inline-flex items-center">
          <Link to="/" className="text-gray-600 hover:text-blue-500">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
        </li>,
        <li key="webstories" className="inline-flex items-center">
          <Link to="/webstories" className="text-gray-600 hover:text-blue-500">Web Stories</Link>
          <span className="mx-2 text-gray-400">/</span>
        </li>,
        <li key="webstory" className="inline-flex items-center">
          <span className="text-gray-800 font-medium">{storyName}</span>
        </li>
      ];
    }
  }
  
  if (pathSegments.includes('blog')) {
    if (pathSegments.length === 1) {
      breadcrumbItems = [
        <li key="home" className="inline-flex items-center">
          <Link to="/" className="text-gray-600 hover:text-blue-500">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
        </li>,
        <li key="blog" className="inline-flex items-center">
          <span className="text-gray-800 font-medium">Blog</span>
        </li>
      ];
    } else {
      const blogTitle = pathSegments[pathSegments.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      breadcrumbItems = [
        <li key="home" className="inline-flex items-center">
          <Link to="/" className="text-gray-600 hover:text-blue-500">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
        </li>,
        <li key="blog" className="inline-flex items-center">
          <Link to="/blog" className="text-gray-600 hover:text-blue-500">Blog</Link>
          <span className="mx-2 text-gray-400">/</span>
        </li>,
        <li key="blogpost" className="inline-flex items-center">
          <span className="text-gray-800 font-medium">{blogTitle}</span>
        </li>
      ];
    }
  }
  
  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(generateStructuredData())}
      </script>
      <nav className="flex py-3 px-4 text-sm bg-gray-100 rounded mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center flex-wrap">
          {breadcrumbItems}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumb;