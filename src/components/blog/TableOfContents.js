import React, { useEffect, useState } from 'react';

const TableOfContents = ({ contentRef }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (!contentRef.current) return;
    
    // Get all h2 and h3 elements from the content
    const elements = contentRef.current.querySelectorAll('h2, h3');
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
  }, [contentRef]);

  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="toc-container sticky top-24 bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-3 text-gray-800">Table of Contents</h2>
      <ul className="space-y-2">
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
    </div>
  );
};

export default TableOfContents;