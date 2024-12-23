import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import blogs from '../data/blogs'; // Import the blogs list
import BlogList from './BlogList';

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

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow p-4 md:p-8 lg:p-12">
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
          {ContentComponent ? <ContentComponent /> : <p>Loading content...</p>}
        </div>
      </div>
      <BlogList blogs={blogs} />
      <Footer />
    </div>
  );
};

export default BlogPage;