import React from 'react';
import Slider from 'react-slick';
import BlogCard from './BlogCard';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const BlogList = ({ blogs }) => {
  // Sort blogs by uploadDate in descending order
  const sortedBlogs = [...blogs].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="my-8">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Latest Blogs</h2>
      <Slider {...sliderSettings}>
        {sortedBlogs.map((blog) => (
          <BlogCard key={blog.link} blog={blog} />
        ))}
      </Slider>
    </div>
  );
};

const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} slick-arrow slick-next`}
      style={{ ...style, display: 'block', background: '#000', borderRadius: '50%' }}
      onClick={onClick}
    />
  );
};

const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} slick-arrow slick-prev`}
      style={{ ...style, display: 'block', background: '#000', borderRadius: '50%' }}
      onClick={onClick}
    />
  );
};

export default BlogList;