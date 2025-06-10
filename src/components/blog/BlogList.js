import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import BlogCard from './BlogCard';
import { useInView } from 'react-intersection-observer';

const BlogList = ({ blogs, selectedCity, selectedState, loading = false }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px',
  });

  // Memoize sorted blogs to prevent unnecessary re-sorts
  const sortedBlogs = useMemo(() => 
    [...blogs]?.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
  , [blogs]);

  const contextHeading = useMemo(() => {
    if (selectedCity) {
      return `Egg Rate Articles & Insights for ${selectedCity}`;
    } else if (selectedState) {
      return `Egg Market Articles & Updates for ${selectedState}`;
    }
    return 'Latest Egg Rate Articles & Market Insights';
  }, [selectedCity, selectedState]);
  // Generate structured data for SEO
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": sortedBlogs.map((blog, index) => ({
      "@type": "ListItem",
      "position": String(index + 1),
      "item": {
        "@type": "BlogPosting",
        "headline": String(blog.title || ''),
        "description": String(blog.description || ''),
        "image": `https://todayeggrates.com${blog.image}`,
        "datePublished": String(blog.uploadDate || ''),
        "url": `https://todayeggrates.com/blog/${blog.link}`,
        "author": {
          "@type": "Organization",
          "name": "Today Egg Rates"
        }
      }
    }))
  };

  // Memoize resource links for better performance - Enhanced with orphan pages
  const resourceLinks = useMemo(() => ({
    popularCities: {
      'Mumbai': '/mumbai-egg-rate-today',
      'Delhi': '/delhi-egg-rate-today',
      'Hyderabad': '/hyderabad-egg-rate-today',
      'Barwala': '/barwala-egg-rate-today',
      'Bengaluru': '/bengaluru-egg-rate-today',
      'Chennai': '/chennai-egg-rate-today',
      'Kolkata': '/kolkata-egg-rate-today',
      'Lucknow': '/lucknow-egg-rate-today',
      'Kanpur': '/kanpur-(cc)-egg-rate-today',
      'Varanasi': '/varanasi-(cc)-egg-rate-today',
      'Allahabad': '/allahabad-(cc)-egg-rate-today',
      'Muzaffurpur': '/muzaffurpur-(cc)-egg-rate-today',
      'Ranchi': '/ranchi--(cc)-egg-rate-today',
      'Indore': '/indore-(cc)-egg-rate-today',
      'Brahmapur': '/brahmapur-(od)-egg-rate-today'
    },
    majorStates: {      'Maharashtra': '/state/maharashtra-egg-rate-today',
      'Uttar Pradesh': '/state/uttar-pradesh-egg-rate-today',
      'West Bengal': '/state/west-bengal-egg-rate-today',
      'Tamil Nadu': '/state/tamil-nadu-egg-rate-today',
      'Karnataka': '/state/karnataka-egg-rate-today',
      'Telangana': '/state/telangana-egg-rate-today',
      'Gujarat': '/state/gujarat-egg-rate-today',
      'Rajasthan': '/state/rajasthan-egg-rate-today',
      'Andhra Pradesh': '/state/andhra-pradesh-egg-rate-today',
      'Madhya Pradesh': '/state/madhya-pradesh-egg-rate-today',
      'Haryana': '/state/haryana-egg-rate-today',
      'Punjab': '/state/punjab-egg-rate-today'
    },
    marketResources: {
      'Egg Rate Web Stories': '/webstories',
      'Barwala Market Analysis': '/blog/egg-rate-barwala',
      'Understanding Today\'s Egg Rates': '/blog/blog-1',
      'Egg Rate Trends in India': '/blog/blog-2',
      'Delhi Egg Market': '/delhi-egg-rate-today',
      'Kerala Egg Rates': '/state/kerala-egg-rate-today',
      'Bihar Egg Market': '/state/bihar-egg-rate-today'
    }
  }), []);

  return (    <section 
      ref={ref} 
      className={`py-12 px-4 max-w-7xl mx-auto transition-opacity duration-1000 ${inView ? 'opacity-100' : 'opacity-0'}`}
      aria-labelledby="blog-list-heading"
    >
      {/* Only render Helmet when not loading to prevent React Helmet errors */}
      {!loading && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(schemaData)}
          </script>
        </Helmet>
      )}
      
      <h2 
        id="blog-list-heading" 
        className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8 sm:mb-12"
      >
        {contextHeading}
      </h2>

      {/* Filter Tags */}
      {(selectedCity || selectedState) && (
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {selectedCity && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              City: {selectedCity}
              <button 
                onClick={() => window.location.href = '/blog'}
                className="ml-2 focus:outline-none"
                aria-label="Remove city filter"
              >
                ×
              </button>
            </span>
          )}
          {selectedState && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              State: {selectedState}
              <button 
                onClick={() => window.location.href = '/blog'}
                className="ml-2 focus:outline-none"
                aria-label="Remove state filter"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
      
      {/* Blog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 mb-12" role="list">
        {sortedBlogs.map((blog, index) => (
          <BlogCard 
            key={blog.link} 
            blog={blog}
            priority={index < 3} // Load first 3 images with priority
          />
        ))}
      </div>

      {/* Resource Sidebar */}
      {(selectedCity || selectedState) && (
        <aside className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-6">
            Related Egg Rate Resources
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-8">
            {/* Popular Cities - Enhanced with orphan pages */}
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                Popular Cities
              </h4>
              <nav className="grid gap-2" aria-label="Popular cities navigation">
                {Object.entries(resourceLinks.popularCities).map(([city, path]) => (
                  <Link 
                    key={city}
                    to={path}
                    className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 transition-colors duration-200 flex items-center group"
                  >
                    <svg 
                      className="w-4 h-4 mr-2 text-blue-400 group-hover:text-blue-600 dark:text-blue-500 dark:group-hover:text-blue-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {city}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Major States - New section for state orphan pages */}
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                Major States
              </h4>
              <nav className="grid gap-2" aria-label="Major states navigation">
                {Object.entries(resourceLinks.majorStates).map(([state, path]) => (
                  <Link 
                    key={state}
                    to={path}
                    className="text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100 transition-colors duration-200 flex items-center group"
                  >
                    <svg 
                      className="w-4 h-4 mr-2 text-green-400 group-hover:text-green-600 dark:text-green-500 dark:group-hover:text-green-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {state}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Market Resources - Enhanced */}
          <div className="mt-8 space-y-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">
              Market Resources
            </h4>
            <nav className="grid sm:grid-cols-2 gap-2" aria-label="Market resources navigation">
              {Object.entries(resourceLinks.marketResources).map(([title, path]) => (
                <Link 
                  key={title}
                  to={path}
                  className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 transition-colors duration-200 flex items-center group"
                >
                  <svg 
                    className="w-4 h-4 mr-2 text-blue-400 group-hover:text-blue-600 dark:text-blue-500 dark:group-hover:text-blue-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {title}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
      )}
    </section>
  );
};

export default React.memo(BlogList);