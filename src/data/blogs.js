const blogs = [
  {
    link: 'blog-1',
    image: '/desiegg.jpg',
    title: 'Blog Title 1',
    description: 'Short description of blog 1',
    contentComponent: './blogs/BlogContent1', // Path to the content component
    uploadDate: '2023-10-01',
  },
  {
    link: 'blog-2',
    image: '/eggpic.png',
    title: 'Blog Title 2',
    description: 'Short description of blog 2',
    contentComponent: './blogs/BlogContent2', // Path to the content component
    uploadDate: '2023-10-02',
  },
  {
    link: 'egg-rates',
    image: '/path/to/egg-rates-thumbnail.jpg',
    title: 'Understanding Egg Rates in India',
    description: 'A comprehensive guide to understanding the factors that influence egg prices in India.',
    contentComponent: './blogs/EggRates',
    uploadDate: '2023-10-03',
  },
  // Add more blog objects as needed
];

export default blogs;