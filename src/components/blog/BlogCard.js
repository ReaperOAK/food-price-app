import React from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../common/OptimizedImage';

const BlogCard = ({ blog }) => {
  const formattedDate = new Date(blog.uploadDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <article 
      className="group h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg 
        transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
    >
      <Link 
        to={`/blog/${blog.link}`}
        className="block h-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
        aria-label={`Read article: ${blog.title}`}
      >
        <div className="relative h-48 overflow-hidden">
          <OptimizedImage
            src={blog.image}
            alt={blog.title}
            className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            width={400}
            height={300}
            loading="lazy"
          />
          {blog.category && (
            <span className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {blog.category}
            </span>
          )}
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 group-hover:text-blue-600 
            transition-colors duration-200 line-clamp-2 mb-2">
            {blog.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 flex-grow">
            {blog.description}
          </p>
          
          <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
            <time 
              dateTime={blog.uploadDate}
              className="text-gray-500 dark:text-gray-400"
            >
              {formattedDate}
            </time>
            
            <span className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform duration-200">
              Read more
              <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default React.memo(BlogCard);