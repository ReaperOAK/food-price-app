import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import BlogCard from './BlogCard';

const BlogList = ({ blogs, selectedCity, selectedState }) => {
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
        "image": blog.image,
        "datePublished": blog.uploadDate,
        "url": `https://todayeggrates.com/blog/${blog.link}`
      }
    }))
  };

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>
      
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8 sm:mb-12">
        {contextHeading}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 mb-12">
        {sortedBlogs.map((blog, index) => (
          <BlogCard 
            key={blog.link} 
            blog={blog}
          />
        ))}
      </div>
      
      {(selectedCity || selectedState) && (
        <aside className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
            Related Egg Rate Resources
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">Popular Cities</h4>
              <nav className="grid gap-2">
                {{
                  'Mumbai': '/mumbai-egg-rate',
                  'Delhi': '/delhi-egg-rate',
                  'Hyderabad': '/hyderabad-egg-rate',
                  'Barwala': '/barwala-egg-rate',
                  'Bengaluru': '/bengaluru-egg-rate'
                }[selectedCity]}
              </nav>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">Market Resources</h4>
              <nav className="grid gap-2">
                {{
                  'Egg Rate Web Stories': '/webstories',
                  'Barwala Market Analysis': '/blog/egg-rate-barwala',
                  'Understanding Today\'s Egg Rates': '/blog/blog-1',
                  'Egg Rate Trends in India': '/blog/blog-2'
                }[selectedState]}
              </nav>
            </div>
          </div>
        </aside>
      )}
    </section>
  );
};

export default React.memo(BlogList);