# Food Price App Documentation

## 📋 Project Overview

The Food Price App provides comprehensive egg price information across different cities and states in India. It offers a rich set of features including:

- 📊 Real-time price tracking with daily NECC updates
- 📈 Interactive price visualization with charts and graphs
- 💰 Multi-format pricing (per piece, tray, bulk packages)
- 📊 Historical trend analysis and price comparisons
- 📱 Mobile-responsive design for all devices
- 🔍 SEO-optimized with structured data (Schema.org)
- 📝 Educational blogs about egg markets and trends
- 📱 Visual web stories for enhanced engagement
- 🏢 Special wholesale rates for bulk buyers
- 🔄 Dynamic content updates with pagination
- 📊 Sortable and filterable data tables
- 🔍 City and state-wise price navigation

## 🗂️ Directory Structure

```
└── 📁src
    └── 📁components
        └── 📁admin
            └── AddCityForm.js
            └── AddStateForm.js
            └── CitySelect.js
            └── LoginPage.js
            └── RateForm.js
            └── StateSelect.js
        └── 📁blog
            └── BlogCard.js
            └── BlogList.js
        └── 📁common
            └── Disclaimer.js
            └── FAQ.js
            └── HeadSection.js
            └── LoadingSkeleton.js
            └── OptimizedImage.js
            └── PrivacyPolicy.js
            └── QuickInfo.js
            └── TableOfContents.js
            └── TOS.js
        └── 📁layout
            └── AdminNavbar.js
            └── Breadcrumb.js
            └── Footer.js
            └── 📁navbar
                └── Logo.js
                └── NavigationLinks.js
                └── SearchBox.js
                └── useLocationData.js
            └── Navbar.js
            └── RootLayout.js
        └── 📁prices
            └── DetailedEggInfo.js
            └── PriceOverview.js
            └── PriceTrends.js
            └── PriceTrendsWidget.js
        └── 📁rates
            └── MarketInfo.js
            └── Pagination.js
            └── PriceChart.js
            └── RateSummary.js
            └── RateTable.js
            └── StateList.js
            └── TableHeader.js
            └── TableRow.js
        └── 📁webstories
            └── WebStoriesList.js
            └── WebStoriesSection.js
            └── WebStoryViewer.js
    └── 📁data
        └── blogs.js
        └── eggprices.js
    └── 📁hooks
        └── useData.js
        └── useTheme.js
    └── 📁pages
        └── AdminPage.js
        └── BlogPage.js
        └── 📁blogs
            └── blog-1.js
            └── blog-2.js
            └── egg-rate-barwala.js
        └── MainPage.js
    └── 📁services
        └── api.js
    └── 📁utils
        └── formatters.js
        └── ScrollToTop.js
        └── seo.js
    └── App.css
    └── App.js
    └── App.test.js
    └── index.css
    └── index.js
    └── logo.svg
    └── reportWebVitals.js
    └── setupTests.js
```

## 🧩 Core Components

### 🚀 Main Application Components

| File | Purpose |
|------|---------|
| **App.js** | Main application component with smart code splitting, lazy loading, and enhanced performance optimizations |
| **index.js** | Entry point with router configuration and suspense handling |
| **useData.js** | Custom data fetching hooks for real-time state management |
| **useTheme.js** | Theme management hook for dark/light mode |
| **api.js** | Centralized API services for consistent data access |
| **formatters.js** | Utility functions for data formatting and presentation |
| **seo.js** | SEO utilities for metadata and structured data |

### 🆕 Enhanced Components

#### Performance Components
- **LoadingSkeleton.js**: Optimized loading states with CLS prevention
- **HeadSection.js**: Centralized meta tag and SEO management
- **QuickInfo.js**: Fast-loading summary information
- **WebStoriesSection.js**: Optimized web stories grid with lazy loading

#### Price Display Components
- **DetailedEggInfo.js**: Comprehensive price information display
- **PriceOverview.js**: Summarized price dashboard
- **PriceTrends.js**: Advanced trend analysis
- **PriceTrendsWidget.js**: Embeddable price trend widget
- **MarketInfo.js**: Market-specific information display
- **RateSummary.js**: Quick price summary component
- **TableHeader.js**: Reusable sortable table header
- **TableRow.js**: Optimized table row component with memoization

### 📄 Page Components

| Component | Description |
|-----------|-------------|
| **MainPage.js** | Landing page with egg rates, visualizations, and market information |
| **BlogPage.js** | Dynamically loads and renders individual blog posts based on URL parameters |
| **StatePage.js** | Displays state-specific egg rate information including historical averages |
| **WebStoriesList.js** | Grid layout of visual web stories about egg rates across India |
| **WebStoryViewer.js** | Full-screen immersive viewer for individual web stories |
| **LoginPage.js** | Authentication form with validation for admin access |
| **AdminPage.js** | Dashboard for administrators to manage egg rates, locations, and content |
| **OptimizedImage.js** | Optimized image component with lazy loading, WebP support, and placeholder handling |

### 🧱 UI Components

#### Navigation & Structure
- **Navbar/** 
  - **Logo.js**: Branded logo component
  - **NavigationLinks.js**: Navigation menu items
  - **SearchBox.js**: Location search with autocomplete
  - **useLocationData.js**: Location data management hook
- **AdminNavbar.js**: Admin-specific navigation with logout functionality
- **Footer.js**: Site-wide footer with copyright info and legal links
- **Breadcrumb.js**: Context-aware navigation path with structured data for SEO
- **RootLayout.js**: Main layout component for wrapping pages with common elements

#### Price Display Components
- **DetailedEggInfo.js**: Comprehensive price information display
- **PriceOverview.js**: Summarized price dashboard
- **PriceTrends.js**: Advanced trend analysis
- **PriceTrendsWidget.js**: Embeddable price trend widget
- **MarketInfo.js**: Market-specific information display
- **RateSummary.js**: Quick price summary component
- **RateTable.js**: Interactive data table with advanced features
- **TableHeader.js**: Reusable sortable table header
- **TableRow.js**: Optimized table row component with memoization
- **StateList.js**: Interactive grid of states and cities
- **Pagination.js**: Reusable pagination component

#### Performance Components
- **LoadingSkeleton.js**: Optimized loading states with CLS prevention
- **HeadSection.js**: Centralized meta tag and SEO management
- **QuickInfo.js**: Fast-loading summary information
- **OptimizedImage.js**: Optimized image component with lazy loading

#### Content Components
- **BlogCard.js**: Blog post preview component
- **BlogList.js**: Grid display of blog posts
- **TableOfContents.js**: Dynamic table of contents with scroll sync
- **FAQ.js**: Dynamic FAQ section with location-tailored questions
- **WebStoriesList.js**: Grid layout of web stories
- **WebStoriesSection.js**: Optimized web stories section
- **WebStoryViewer.js**: Full-screen story viewer

### 📊 Data Files

- **data/blogs.js**: Configuration for blog posts including metadata and content paths
- **data/eggprices.js**: Static fallback data for egg prices when API is unavailable

## ✨ Key Features

1. **Real-time Egg Price Tracking**: 
   Daily updated egg rates from NECC with immediate reflection on the platform

2. **Location-based Price Information**: 
   Detailed city and state-specific egg rates with user-friendly filtering

3. **Historical Data Analysis**: 
   Interactive visualizations showing price trends and comparisons over time

4. **Visual Web Stories**: 
   Engaging visual presentation of egg rates optimized for mobile consumption

5. **Admin Dashboard**: 
   Comprehensive CMS for authorized users to manage and update prices

6. **SEO Optimization**: 
   Built-in structured data and metadata for improved search engine visibility

7. **Responsive Design**: 
   Fully mobile-friendly interface across all pages and components

## 🛠️ Technical Implementation

### Frontend
- **Core Framework**: React.js with smart code splitting and lazy loading
- **Routing**: React Router v6 with suspense and error boundaries
- **Data Visualization**: Chart.js with React-Chartjs-2 and custom hooks
- **Styling**: Tailwind CSS with custom animations and transitions
- **SEO**: React Helmet with structured data and meta tag optimization
- **Data Management**: Custom hooks with optimized re-rendering
- **Form Handling**: Controlled components with advanced validation
- **Loading States**: CLS-optimized loading skeletons
- **Image Handling**: WebP support with fallbacks and lazy loading
- **Web Stories**: AMP-compliant web stories with image optimization

### Backend
- **API Layer**: PHP REST API with rate limiting and caching
- **Database**: MySQL with optimized indexing and query caching
- **Caching**: Multi-level caching with Redis support
- **Authentication**: JWT with refresh tokens and secure storage
- **Image Processing**: Automated image optimization and WebP conversion
- **Web Stories**: Automated generation and thumbnail creation
- **Error Handling**: Centralized logging with detailed tracing

### Performance Optimization
- **Code Splitting**: Route-based and component-based splitting
- **Lazy Loading**: Image, component, and route lazy loading
- **Caching Strategy**: 
  - In-memory caching for API responses
  - Service worker for offline support
  - Browser caching with proper headers
- **Bundling**: Webpack optimization with tree shaking
- **Image Pipeline**: 
  - WebP conversion
  - Responsive images
  - Thumbnail generation
  - Lazy loading with blur placeholders
  
### SEO & Analytics
- **Structured Data**: 
  - Product schema for egg rates
  - Article schema for blogs
  - WebStory schema for AMP stories
  - BreadcrumbList schema for navigation
- **Meta Tags**: 
  - Dynamic meta description and titles
  - Open Graph protocol support
  - Twitter Card integration
  - Canonical URL management
- **Performance Monitoring**:
  - Core Web Vitals tracking
  - User behavior analytics
  - Error tracking and reporting
  - Load time optimization

## 👨‍💻 Development Best Practices

### Code Organization
- Component composition with clear separation of concerns
- Custom hooks for reusable logic and state management
- Centralized API service layer
- Consistent file and folder structure
- Clear naming conventions and documentation

### Performance
- Code splitting for optimal bundle sizes
- Image optimization pipeline
- Caching strategies at multiple levels
- Lazy loading of non-critical resources
- Minimizing re-renders with React.memo and useMemo
- CLS prevention with loading skeletons

### Data Management
- Centralized data fetching through custom hooks
- Error boundary implementation for resilience
- Optimistic UI updates for better UX
- Proper loading and error state handling
- Data validation and sanitization

### SEO & Accessibility
- Semantic HTML structure
- ARIA attributes and roles
- Structured data implementation
- Meta tag optimization
- Mobile-first responsive design
- Keyboard navigation support

### Security
- Input validation and sanitization
- Secure authentication flow
- XSS prevention
- CSRF protection
- Secure cookie handling
- Rate limiting implementation

### Testing & Quality
- Component unit testing
- Integration testing with real API calls
- Performance monitoring
- Error tracking and logging
- Code quality checks and linting
- Accessibility testing

### Deployment
- Automated build and deployment pipeline
- Environment-specific configuration
- Error monitoring and logging
- Backup and recovery procedures
- SSL/TLS implementation
