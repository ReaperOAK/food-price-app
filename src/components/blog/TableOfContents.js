import React, { useEffect, useState } from 'react';

const TableOfContents = ({ contentId, blogId, isSticky = false }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const contentElement = document.getElementById(contentId);
    if (!contentElement) return;
    
    // Get all h2 and h3 elements from the content
    const elements = contentElement.querySelectorAll('h2, h3');
    
    // Add ids to elements that don't have them based on blogId and text
    elements.forEach((element, index) => {
      if (!element.id) {
        const slugifiedText = element.innerText
          .toLowerCase()
          .replace(/[^\w ]+/g, '')
          .replace(/ +/g, '-');
        element.id = `${blogId}-heading-${slugifiedText}`;
      }
    });
    
    const headingElements = Array.from(elements).map(element => ({
      id: element.id,
      text: element.innerText,
      level: element.tagName === 'H2' ? 2 : 3
    }));
    
    setHeadings(headingElements);

    // Set up IntersectionObserver to track active heading
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    // Observe all heading elements
    elements.forEach(element => observer.observe(element));

    return () => observer.disconnect();
  }, [contentId, blogId]);

  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (headings.length === 0) return null;

  return (
    <div className={`toc-container bg-white p-4 rounded-lg shadow-md mb-6 ${isSticky ? 'sticky top-24' : ''}`}>
      <div className="flex justify-between items-center cursor-pointer" onClick={toggleCollapse}>
        <h2 className="text-xl font-bold text-gray-800">Table of Contents</h2>
        <button 
          aria-label={isCollapsed ? "Expand" : "Collapse"} 
          className="text-gray-600 hover:text-blue-600 focus:outline-none"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
          </svg>
        </button>
      </div>
      
      {!isCollapsed && (
        <ul className="space-y-2 mt-3">
          {headings.map((heading) => (
            <li 
              key={heading.id}
              className={`toc-item ${heading.level === 3 ? 'ml-4' : ''}`}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHeading(heading.id);
                }}
                className={`block text-${heading.level === 2 ? 'md' : 'sm'} ${
                  activeId === heading.id
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-700 hover:text-blue-600'
                } transition-colors duration-200`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TableOfContents;