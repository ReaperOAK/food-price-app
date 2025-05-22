import React from 'react';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '../common/OptimizedImage';

const BlogCard = ({ blog }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/blog/${blog.link}`);
  };

  return (
    <div className="max-w-sm w-full h-96 rounded overflow-hidden shadow-lg m-4 cursor-pointer" onClick={handleClick}>      <div className="h-48 bg-gray-200 flex items-center justify-center">
        <OptimizedImage
          src={blog.image}
          alt={blog.title}
          className="h-full w-full object-cover"
          width={400}
          height={300}
        />
      </div>
      <div className="px-6 py-4 flex flex-col justify-between h-48">
        <div>
          <div className="font-bold text-xl mb-2">{blog.title}</div>
          <p className="text-gray-700 text-base">{blog.description}</p>
        </div>
        <p className="text-gray-500 text-sm mt-4">Uploaded on: {blog.uploadDate}</p>
      </div>
    </div>
  );
};

export default BlogCard;