import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import blogs from '../data/blogs'; 
import BlogList from '../components/blog/BlogList';

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

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow p-4 md:p-8 lg:p-12">
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
          {ContentComponent ? <ContentComponent /> : <p>Loading content...</p>}
        </div>
      </div>
      <BlogList blogs={otherBlogs} />
      <Footer />
    </div>
  );
};

export default BlogPage;