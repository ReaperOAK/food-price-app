import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../common/OptimizedImage';
import './WebStoriesCarousel.css';

const WebStoriesCarousel = ({ webStories }) => {  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [visibleCards, setVisibleCards] = useState(3);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);
  const dragRef = useRef(null);

  // Memoize stories to prevent unnecessary re-renders
  const memoizedStories = useMemo(() => webStories || [], [webStories]);

  // Debug effect to log image loading issues
  useEffect(() => {
    if (memoizedStories.length > 0) {
      console.log('WebStoriesCarousel: Stories loaded:', memoizedStories.length);
      console.log('WebStoriesCarousel: Sample thumbnails:', memoizedStories.slice(0, 3).map(s => s.thumbnail));
    }
  }, [memoizedStories]);
  // Handle image error callback
  const handleImageError = useCallback((storySlug) => {
    console.warn('WebStoriesCarousel: Image failed to load for story:', storySlug);
  }, []);

  // Enhanced responsive design with more breakpoints
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setVisibleCards(1); // Extra small phones
      } else if (width < 640) {
        setVisibleCards(1); // Small phones
      } else if (width < 768) {
        setVisibleCards(1.5); // Large phones (show partial next card)
      } else if (width < 1024) {
        setVisibleCards(2); // Tablets
      } else if (width < 1280) {
        setVisibleCards(3); // Small desktops
      } else if (width < 1536) {
        setVisibleCards(3.5); // Large desktops (show partial next card)
      } else {
        setVisibleCards(4); // Extra large screens
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);  // Auto-play functionality with slower timing
  useEffect(() => {
    if (!isAutoPlay || !memoizedStories?.length || isDragging) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = Math.max(0, memoizedStories.length - Math.floor(visibleCards));
        return prevIndex >= maxIndex ? 0 : prevIndex + 1;
      });
    }, 6000); // Increased from 4000ms to 6000ms for slower auto-play

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlay, memoizedStories?.length, visibleCards, isDragging]);  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, memoizedStories.length - Math.floor(visibleCards));
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  }, [memoizedStories.length, visibleCards]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, memoizedStories.length - Math.floor(visibleCards));
      return prevIndex <= 0 ? maxIndex : prevIndex - 1;
    });
  }, [memoizedStories.length, visibleCards]);

  const goToSlide = useCallback((index) => {
    const maxIndex = Math.max(0, memoizedStories.length - Math.floor(visibleCards));
    setCurrentIndex(Math.min(index, maxIndex));
  }, [memoizedStories.length, visibleCards]);
  // Touch/drag handlers for mobile
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    if (dragRef.current) dragRef.current.style.cursor = 'grabbing';
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 50) {
      if (walk > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 50) {
      if (walk > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (dragRef.current) dragRef.current.style.cursor = 'grab';
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  if (!memoizedStories?.length) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <svg 
          className="w-16 h-16 mx-auto text-gray-400 mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Stories Available</p>
        <p className="text-gray-600 dark:text-gray-400">Check back later for updates on egg prices and market trends.</p>
      </div>
    );
  }
  
  const maxIndex = Math.max(0, memoizedStories.length - Math.floor(visibleCards));
  const showNavigation = memoizedStories.length > Math.floor(visibleCards);
  return (
    <div className="webstories-carousel relative px-2 sm:px-4">
      {/* Auto-play toggle with improved mobile layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">        <div className="flex items-center space-x-2">
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {currentIndex + 1}-{Math.min(currentIndex + Math.floor(visibleCards), memoizedStories.length)} of {memoizedStories.length} stories
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="webstories-autoplay-button flex items-center space-x-2 px-3 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            aria-label={isAutoPlay ? 'Pause auto-play' : 'Start auto-play'}
          >
            {isAutoPlay ? (
              <>
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span className="hidden sm:inline">Play</span>
              </>
            )}
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
            Auto-advances every 6s
          </span>
        </div>
      </div>{/* Carousel container with touch support */}
      <div 
        className="relative overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-900 p-2 sm:p-4"
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
      >        <div
          ref={carouselRef}          className="webstories-carousel-container flex cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
            width: `${(memoizedStories.length / visibleCards) * 100}%`
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="listbox"
          aria-label="Web stories carousel"
        >          {memoizedStories.map((story, index) => (
            <div
              key={story.slug}
              className="flex-shrink-0 px-1 sm:px-2"
              style={{ width: `${100 / memoizedStories.length}%` }}
              role="option"
              aria-selected={index >= currentIndex && index < currentIndex + Math.floor(visibleCards)}
            >              <Link 
                to={`/webstory/${story.slug}`}
                className="webstories-card group block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                aria-label={`View web story about egg rates in ${story.city}, ${story.state}. Current rate: ₹${story.rate} per egg`}
                onClick={(e) => isDragging && e.preventDefault()}
              >                <div className="webstories-card-image relative aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700">                  <OptimizedImage 
                    key={`${story.slug}-${story.thumbnail}`}
                    src={story.thumbnail} 
                    alt={`Fresh eggs in India rate visualization for ${story.city}, ${story.state} - Farm fresh eggs market analysis`}
                    className="w-full h-32 sm:h-40 md:h-44 object-cover"
                    fallbackSrc="/eggpic.webp"
                    width={300}
                    height={160}
                    loading={index < Math.floor(visibleCards) ? 'eager' : 'lazy'}
                    priority={index < 3}
                    onError={() => handleImageError(story.slug)}
                  />
                  <div className="webstories-card-overlay absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                    <p className="text-white text-xs font-medium bg-black/40 rounded px-2 py-1 inline-block">
                      {story.date}
                    </p>
                  </div>
                </div>
                <div className="p-3 sm:p-4">                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 line-clamp-2 mb-2 leading-snug">
                    {story.title}
                  </h3>
                  <div className="flex justify-between items-center">
                    <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm sm:text-base">₹{story.rate}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate ml-2">
                      {story.city}, {story.state}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>      {/* Navigation arrows with improved positioning */}
      {showNavigation && (
        <>          <button
            onClick={prevSlide}
            className="webstories-nav-button absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 sm:-translate-x-4 bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl z-20 group disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-600"
            aria-label="Previous stories"
            disabled={currentIndex === 0}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-disabled:text-gray-300 dark:group-disabled:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="webstories-nav-button absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 sm:translate-x-4 bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl z-20 group disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-600"
            aria-label="Next stories"
            disabled={currentIndex >= maxIndex}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-disabled:text-gray-300 dark:group-disabled:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}      {/* Dot indicators with responsive sizing */}
      {showNavigation && (
        <div className="flex justify-center space-x-1 sm:space-x-2 mt-4 sm:mt-6">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`webstories-dot h-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                index === currentIndex
                  ? 'active bg-indigo-600 dark:bg-indigo-400 w-6 sm:w-8'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 w-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Story counter and view all link with better mobile layout */}
      <div className="mt-6 sm:mt-8 text-center">        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
          Showing all {memoizedStories.length} city web stories with current egg rates
        </p>
        <Link
          to="/webstories"
          className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm sm:text-base font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <span className="hidden sm:inline">View All Web Stories</span>
          <span className="sm:hidden">View All</span>
        </Link>
      </div>
    </div>
  );
};

export default WebStoriesCarousel;
