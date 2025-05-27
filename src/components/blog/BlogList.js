import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import OptimizedImage from '../common/OptimizedImage';

const BlogList = ({ blogs, selectedCity, selectedState }) => {
  // Sort blogs by upload date (newest first)
  const sortedBlogs = [...blogs].sort((a, b) => 
    new Date(b.uploadDate) - new Date(a.uploadDate)
  );

  // Create keyword-rich heading based on the current page context
  const getContextHeading = () => {
    if (selectedCity) {
      return `Egg Rate Articles & Insights for ${selectedCity}`;
    } else if (selectedState) {
      return `Egg Market Articles & Updates for ${selectedState}`;
    } else {
      return 'Latest Egg Rate Articles & Market Insights';
    }
  };

  return (
    <div className="mt-10 bg-white shadow-lg rounded-lg p-6">
      {/* Add schema.org structured data for blog listings */}
      <Helmet>
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": [
              ${sortedBlogs.map((blog, index) => `
              {
                "@type": "ListItem",
                "position": ${index + 1},
                "url": "https://todayeggrates.com/blog/${blog.link}",
                "name": "${blog.title}"
              }
              `).join(',')}
            ]
          }
        `}</script>
      </Helmet>
      
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        {getContextHeading()}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedBlogs.map((blog, index) => (
          <div key={index} className="bg-gray-50 rounded-lg overflow-hidden shadow transition-transform hover:scale-105">
            <Link to={`/blog/${blog.link}`} className="block">
              <OptimizedImage 
                src={blog.image}
                alt={blog.title}
                className="w-full h-48 object-cover"
                width={400}
                height={300}
                loading={index < 3 ? "eager" : "lazy"}
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{blog.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{blog.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-medium text-sm">Read more</span>
                  <time dateTime={blog.uploadDate} className="text-gray-500 text-sm">
                    {new Date(blog.uploadDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </time>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      
      {/* Add contextual internal linking section */}
      {(selectedCity || selectedState) && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Related Egg Rate Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-700 mb-1">Popular Cities</h4>
              <ul className="list-disc pl-5 text-blue-600">
                <li><Link to="/mumbai-egg-rate" className="hover:underline">Mumbai Egg Rate</Link></li>
                <li><Link to="/delhi-egg-rate" className="hover:underline">Delhi Egg Rate</Link></li>
                <li><Link to="/hyderabad-egg-rate" className="hover:underline">Hyderabad Egg Rate</Link></li>
                <li><Link to="/barwala-egg-rate" className="hover:underline">Barwala Egg Rate</Link></li>
                <li><Link to="/bengaluru-egg-rate" className="hover:underline">Bengaluru Egg Rate</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-1">Market Resources</h4>
              <ul className="list-disc pl-5 text-blue-600">
                <li><Link to="/webstories" className="hover:underline">Egg Rate Web Stories</Link></li>
                <li><Link to="/blog/egg-rate-barwala" className="hover:underline">Barwala Market Analysis</Link></li>
                <li><Link to="/blog/blog-1" className="hover:underline">Understanding Today's Egg Rates</Link></li>
                <li><Link to="/blog/blog-2" className="hover:underline">Egg Rate Trends in India</Link></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogList;