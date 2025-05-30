import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import BlogCard from './BlogCard';
import { useInView } from 'react-intersection-observer';

const BlogList = ({ blogs, selectedCity, selectedState }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px',
  });

  // Memoize sorted blogs to prevent unnecessary re-sorts
  const sortedBlogs = useMemo(() => 
    [...blogs].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
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
      "position": index + 1,
      "item": {
        "@type": "BlogPosting",
        "headline": blog.title,
        "description": blog.description,
        "image": `https://todayeggrates.com${blog.image}`,
        "datePublished": blog.uploadDate,
        "url": `https://todayeggrates.com/blog/${blog.link}`,
        "author": {
          "@type": "Organization",
          "name": "Today Egg Rates"
        }
      }
    }))
  };

  // Memoize resource links for better performance
  const resourceLinks = useMemo(() => ({
    popularCities: {
      'Mumbai': '/mumbai-egg-rate',
      'Delhi': '/delhi-egg-rate',
      'Hyderabad': '/hyderabad-egg-rate',
      'Barwala': '/barwala-egg-rate',
      'Bengaluru': '/bengaluru-egg-rate'
    },
    marketResources: {
      'Egg Rate Web Stories': '/webstories',
      'Barwala Market Analysis': '/blog/egg-rate-barwala',
      'Understanding Today\'s Egg Rates': '/blog/blog-1',
      'Egg Rate Trends in India': '/blog/blog-2'
    }
  }), []);

  return (
    <section 
      ref={ref} 
      className={`py-12 px-4 max-w-7xl mx-auto transition-opacity duration-1000 ${inView ? 'opacity-100' : 'opacity-0'}`}
      aria-labelledby="blog-list-heading"
    >
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>
      
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
            {/* Popular Cities */}
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

            {/* Market Resources */}
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                Market Resources
              </h4>
              <nav className="grid gap-2" aria-label="Market resources navigation">
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    {title}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </aside>
      )}
    </section>
  );
};

export default React.memo(BlogList);