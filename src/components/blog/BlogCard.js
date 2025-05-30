import React from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../common/OptimizedImage';

const BlogCard = ({ blog, priority = false }) => {
  const formattedDate = new Date(blog.uploadDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <article 
      className="group h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg 
        transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
      itemScope 
      itemType="http://schema.org/BlogPosting"
    >
      <Link 
        to={`/blog/${blog.link}`}
        className="block h-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
        aria-label={`Read article: ${blog.title}`}
      >
        <div className="relative aspect-w-16 aspect-h-9 overflow-hidden">
          <OptimizedImage
            src={blog.image}
            alt={blog.title}
            className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            width={600}
            height={338}
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            itemProp="image"
          />
          {blog.category && (
            <div className="absolute top-0 left-0 m-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white shadow-lg">
                {blog.category}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex-grow">
            <h3 
              className="font-bold text-xl text-gray-900 dark:text-gray-100 group-hover:text-blue-600 
                dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2 mb-2"
              itemProp="headline"
            >
              {blog.title}
            </h3>
            
            <p 
              className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4"
              itemProp="description"
            >
              {blog.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100 dark:border-gray-700">
            <time 
              dateTime={blog.uploadDate}
              className="text-gray-500 dark:text-gray-400 flex items-center"
              itemProp="datePublished"
            >
              <svg 
                className="w-4 h-4 mr-1.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              {formattedDate}
            </time>
            
            <span className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform duration-200">
              Read more
              <svg 
                className="w-4 h-4 ml-1.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 7l5 5m0 0l-5 5m5-5H6" 
                />
              </svg>
            </span>
          </div>

          {/* Hidden SEO metadata */}
          <meta itemProp="author" content="Today Egg Rates" />
          <meta itemProp="publisher" content="Today Egg Rates" />
          <meta itemProp="url" content={`https://todayeggrates.com/blog/${blog.link}`} />
          {blog.tags && <meta itemProp="keywords" content={blog.tags.join(', ')} />}
        </div>
      </Link>
    </article>
  );
};

export default React.memo(BlogCard);