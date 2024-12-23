import React from 'react';
import { useNavigate } from 'react-router-dom';

const BlogCard = ({ blog }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/blog/${blog.link}`);
  };

  return (
    <div className="max-w-sm w-full rounded overflow-hidden shadow-lg m-4 cursor-pointer" onClick={handleClick}>
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        <img className="h-full w-full object-cover" src={blog.image} alt={blog.title} />
      </div>
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{blog.title}</div>
        <p className="text-gray-700 text-base">{blog.description}</p>
        <p className="text-gray-500 text-sm">Uploaded on: {blog.uploadDate}</p>
      </div>
    </div>
  );
};

export default BlogCard;