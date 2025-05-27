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
            └── LoginPage.js
            └── RateForm.js
        └── 📁blog
            └── BlogCard.js
            └── BlogList.js
            └── TableOfContents.js
        └── 📁common
            └── CitySelect.js
            └── Disclaimer.js
            └── FAQ.js
            └── OptimizedImage.js
            └── PrivacyPolicy.js
            └── StateSelect.js
            └── TOS.js
        └── 📁layout
            └── AdminNavbar.js
            └── Breadcrumb.js
            └── Footer.js
            └── Navbar.js
            └── RootLayout.js
        └── 📁rates
            └── RateChart.js
            └── RateTable.js
            └── StateList.js
            └── StatePage.js
        └── 📁webstories
            └── WebStoriesList.js
            └── WebStoryViewer.js
    └── 📁data
        └── blogs.js
        └── eggprices.js
    └── 📁pages
        └── AdminPage.js
        └── BlogPage.js
        └── 📁blogs
            └── blog-1.js
            └── blog-2.js
            └── egg-rate-barwala.js
        └── MainPage.js
    └── 📁utils
        └── ScrollToTop.js
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
- **Navbar.js**: Main navigation with search dropdown to find cities/states
- **AdminNavbar.js**: Admin-specific navigation with logout functionality
- **Footer.js**: Site-wide footer with copyright info and legal links
- **Breadcrumb.js**: Context-aware navigation path with structured data for SEO
- **RootLayout.js**: Main layout component for wrapping pages with common elements

#### Content Sections
- **FAQ.js**: Dynamic FAQ section with location-tailored questions

#### Data Display
- **RateTable.js**: Interactive table showing egg rates with rich features:
  - Pagination support
  - Sortable columns (city, state, date, rate)
  - Special rates display for wholesale/bulk buyers
  - Price calculations (per piece, tray of 30, pack of 100, peti of 210)
  - SEO-optimized with structured data (Schema.org)
  - Admin mode for CRUD operations
  - Responsive design with horizontal scrolling
  - Price change indicators with percentage calculations

- **RateChart.js**: Interactive price visualization component with features:
  - Support for both bar and line charts
  - Historical trend visualization
  - Price comparison across locations
  - Customizable time ranges
  - Responsive design with adaptive layout
  - Dynamic tooltips with detailed price information
  - Color-coded price change indicators

- **RateChart.js**: Chart component for visualizing egg rates with features:
  - Support for both bar and line charts
  - Customizable data points and hover states
  - Currency formatting for price values
  - Automatic date formatting for x-axis
  - Responsive layout with maintainable aspect ratio
  - Custom tooltips with price information

- **StateList.js**: Interactive grid of states and cities with:
  - Direct navigation links to city/state specific pages
  - Last updated timestamps
  - Organized display of market locations
  - Hierarchical data presentation

- **DefaultTable.js**: Generic table for displaying egg rates without specific location
- **SpecialRatesTable.js**: Highlights featured or promoted egg rates from special markets
- **EggRatesTable.js**: Admin-facing table for managing egg rate entries

#### Forms & Inputs
- **CitySelect.js**: Multi-select dropdown for choosing cities
- **StateSelect.js**: Dropdown for selecting states with filtering capabilities
- **RateForm.js**: Form for updating egg rates with batch operations
- **AddStateForm.js**: Admin form for adding new states
- **AddCityForm.js**: Admin form for adding new cities with state association

#### Blog Components
- **BlogList.js**: Grid display of blog posts with sorting and filtering
- **BlogCard.js**: Card component for individual blog previews
- **TableOfContents.js**: Dynamic table of contents for blog posts with anchor links
- **blogs/blog-1.js**: "Understanding Today's Egg Rates Across Major Indian Cities"
- **blogs/blog-2.js**: "Understanding Egg Rates in India"
- **blogs/egg-rate-barwala.js**: Barwala market analysis article

#### Legal Pages
- **PrivacyPolicy.js**: Privacy policy information
- **TOS.js**: Terms of Service details
- **Disclaimer.js**: Legal disclaimers about the egg price data

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
