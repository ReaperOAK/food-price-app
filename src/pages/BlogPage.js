import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import blogs from '../data/blogs'; 
import BlogList from '../components/blog/BlogList';
import Breadcrumb from '../components/layout/Breadcrumb';
import TableOfContents from '../components/blog/TableOfContents';

// Pre-define the import mapping for webpack to analyze
const blogComponentMap = {
  'egg-rate-barwala': () => import('../pages/blogs/egg-rate-barwala'),
  'blog-1': () => import('../pages/blogs/blog-1'),
  'blog-2': () => import('../pages/blogs/blog-2'),
  // Add any future blog links here
};

const BlogPage = () => {
  const { link } = useParams();
  const blog = blogs.find((b) => b.link === link);
  const [ContentComponent, setContentComponent] = useState(null);
  
  // Format the date for schema
  const formattedDate = blog ? new Date(blog.uploadDate).toISOString() : new Date().toISOString();
  
  // Generate related articles links based on current blog tags
  const relatedBlogs = blog ? blogs.filter(b => 
    b.link !== link && 
    b.tags && blog.tags && 
    b.tags.some(tag => blog.tags.includes(tag))
  ).slice(0, 3) : [];

  useEffect(() => {
    if (blog && blogComponentMap[blog.link]) {
      blogComponentMap[blog.link]()
        .then((module) => {
          setContentComponent(() => module.default);
        })
        .catch((error) => {
          console.error("Error loading content component:", error);
        });
    }
  }, [blog]);

  if (!blog) {
    return <div>Blog not found</div>;
  }

  // Filter out the current blog from the list of blogs
  const otherBlogs = blogs.filter((b) => b.link !== link);
  
  // Create article schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://todayeggrates.com/blog/${blog.link}`
    },
    "headline": blog.title,
    "description": blog.description,
    "image": blog.image,
    "author": {
      "@type": "Organization",
      "name": "Today Egg Rates",
      "url": "https://todayeggrates.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Today Egg Rates",
      "logo": {
        "@type": "ImageObject",
        "url": "https://todayeggrates.com/eggpic.png"
      }
    },
    "datePublished": formattedDate,
    "dateModified": formattedDate
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Helmet>
        <title>{blog.title} - Today Egg Rates</title>
        <meta name="description" content={blog.description} />
        <meta name="keywords" content={blog.tags ? blog.tags.join(', ') : 'egg rate, egg price, NECC egg rate'} />
        <link rel="canonical" href={`https://todayeggrates.com/blog/${blog.link}`} />
        
        {/* Article Schema */}
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://todayeggrates.com/blog/${blog.link}`} />
        <meta property="og:image" content={blog.image} />
        <meta property="article:published_time" content={formattedDate} />
        <meta property="article:modified_time" content={formattedDate} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.description} />
        <meta name="twitter:image" content={blog.image} />
      </Helmet>
      
      <Navbar />
      
      <div className="flex-grow p-4 md:p-8 lg:p-12">
        {/* Breadcrumb */}
        <div className="max-w-4xl mx-auto mb-4">
          <Breadcrumb />
        </div>
        
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
          {/* Blog Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{blog.title}</h1>
            <div className="flex items-center text-sm text-gray-600 mb-6">
              <time dateTime={blog.uploadDate}>
                {new Date(blog.uploadDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              <span className="mx-2">•</span>
              <span>Today Egg Rates</span>
            </div>
            <img 
              src={blog.image} 
              alt={blog.title} 
              className="w-full h-auto rounded-lg mb-6 object-cover"
              width="800"
              height="400"
            />
          </div>
          
          {/* Table of Contents - only show for longer posts */}
          {ContentComponent && <TableOfContents contentId="blog-content" />}
          
          {/* Blog Content */}
          <div id="blog-content">
            {ContentComponent ? <ContentComponent /> : <p>Loading content...</p>}
          </div>
          
          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-8 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Related Articles */}
          {relatedBlogs.length > 0 && (
            <div className="mt-8 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedBlogs.map(relatedBlog => (
                  <Link 
                    key={relatedBlog.link} 
                    to={`/blog/${relatedBlog.link}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <h4 className="font-medium text-blue-700">{relatedBlog.title}</h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{relatedBlog.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <BlogList blogs={otherBlogs} />
      <Footer />
    </div>
  );
};

export default BlogPage;