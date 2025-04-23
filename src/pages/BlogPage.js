import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import blogs from '../data/blogs'; // Import the blogs list
import BlogList from '../components/blog/BlogList';

const BlogPage = () => {
  const { link } = useParams();
  const blog = blogs.find((b) => b.link === link);
  const [ContentComponent, setContentComponent] = useState(null);

  useEffect(() => {
    if (blog) {
      import(`${blog.contentComponent}`).then((module) => {
        setContentComponent(() => module.default);
      }).catch((error) => {
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
      <BlogList blogs={otherBlogs} /> {/* Pass the filtered list of blogs */}
      <Footer />
    </div>
  );
};

export default BlogPage;