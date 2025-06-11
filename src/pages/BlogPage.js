import React, { useState, useEffect, Suspense } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeadSection from '../components/common/HeadSection';
import blogs from '../data/blogs'; 
import BlogList from '../components/blog/BlogList';
import Breadcrumb from '../components/layout/Breadcrumb';
import TableOfContents from '../components/common/TableOfContents';
import OptimizedImage from '../components/common/OptimizedImage';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

// Pre-define the import mapping for webpack to analyze
const blogComponentMap = {
  'egg-rate-barwala': () => import('../pages/blogs/egg-rate-barwala'),
  'blog-1': () => import('../pages/blogs/blog-1'),
  'blog-2': () => import('../pages/blogs/blog-2'),
  'ajmer-egg-rate-today': () => import('../pages/blogs/ajmer-egg-rate-today'),
  // Add more blog links and their corresponding imports here
};

const BlogPage = () => {
  const { link } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const blog = blogs.find((b) => b.link === link);
  const [ContentComponent, setContentComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,  });
  
  // Format dates for display
  const displayDate = blog ? new Date(blog.uploadDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';
  
  // Generate related articles based on tags
  const relatedBlogs = blog ? blogs
    .filter(b => 
      b.link !== link && 
      b.tags && blog.tags && 
      b.tags.some(tag => blog.tags.includes(tag))
    )
    .slice(0, 3) : [];

  // Filter out current blog from recommendations
  const otherBlogs = blogs.filter((b) => b.link !== link);

  useEffect(() => {
    let isMounted = true;
    
    const loadContent = async () => {
      if (!blog || !blogComponentMap[blog.link]) {
        setError('Blog not found');
        setIsLoading(false);
        return;
      }

      try {
        const module = await blogComponentMap[blog.link]();
        if (isMounted) {
          setContentComponent(() => module.default);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error loading content:", err);
          setError('Failed to load blog content');
          setIsLoading(false);
        }
      }
    };

    setIsLoading(true);
    loadContent();

    return () => {
      isMounted = false;
    };
  }, [blog]);

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Blog Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">The blog post you're looking for doesn't exist.</p>
        <Link 
          to="/blog"
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Blog List
        </Link>
      </div>
    );  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">      {/* Only render HeadSection when not loading to prevent React Helmet errors */}
      {!isLoading && (
        <HeadSection
          location={location}
          selectedCity={blog?.title || 'Blog'}
          selectedState=""
          eggRates={[]}
          isLoading={isLoading}
        />
      )}
      
      <Navbar />
        <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb isLoading={isLoading} />
          
          <article ref={ref} className={`mt-8 transition-opacity duration-1000 ${inView ? 'opacity-100' : 'opacity-0'}`}>
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              {/* Hero Section */}
              <div className="relative">
                <OptimizedImage 
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-[40vh] sm:h-[50vh] object-cover"
                  width={1200}
                  height={600}
                  priority={true}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 p-6 sm:p-8 text-white">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                    {blog.title}
                  </h1>
                  <div className="mt-4 flex items-center space-x-4 text-sm sm:text-base">
                    <time dateTime={blog.uploadDate} className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {displayDate}
                    </time>
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      Today Egg Rates
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {/* Content */}
                {isLoading ? (
                  <LoadingSkeleton />
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
                    <button 
                      onClick={() => navigate(0)} 
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Table of Contents */}
                    {ContentComponent && (
                      <div className="mb-8">
                        <TableOfContents 
                          key={blog.link} 
                          contentId="blog-content" 
                          blogId={blog.link} 
                          isSticky={true}
                        />
                      </div>
                    )}
                    
                    {/* Main Content */}
                    <div id="blog-content" className="prose prose-lg dark:prose-invert max-w-none">
                      <Suspense fallback={<LoadingSkeleton />}>
                        {ContentComponent && <ContentComponent />}
                      </Suspense>
                    </div>
                    
                    {/* Tags */}
                    {blog.tags && blog.tags?.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                          Related Topics
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {blog.tags.map(tag => (
                            <span 
                              key={tag}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Related Articles */}
            {relatedBlogs?.length > 0 && (
              <section className="mt-12 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Related Articles
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedBlogs.map(relatedBlog => (
                    <Link 
                      key={relatedBlog.link} 
                      to={`/blog/${relatedBlog.link}`}
                      className="group block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                      <div className="aspect-w-16 aspect-h-9 relative">
                        <OptimizedImage
                          src={relatedBlog.image}
                          alt={relatedBlog.title}
                          className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                          width={400}
                          height={225}
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                          {relatedBlog.title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {relatedBlog.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </main>      {/* More Articles */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            More Articles
          </h2>
          <BlogList blogs={otherBlogs} loading={isLoading} />
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default BlogPage;