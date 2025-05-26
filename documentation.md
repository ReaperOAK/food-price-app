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
            └── BodyOne.js
            └── BodyThree.js
            └── BodyTwo.js
            └── DefaultTable.js
            └── EggRatesTable.js
            └── RateTable.js
            └── SpecialRatesTable.js
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
| **App.js** | Main application component handling routing configuration, authentication logic, and maintenance mode |
| **index.js** | Entry point that renders the React application to the DOM |
| **ScrollToTop.js** | Utility that scrolls to the top of the page on route changes |

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

### 🧱 UI Components

#### Navigation & Structure
- **Navbar.js**: Main navigation with search dropdown to find cities/states
- **AdminNavbar.js**: Admin-specific navigation with logout functionality
- **Footer.js**: Site-wide footer with copyright info and legal links
- **Breadcrumb.js**: Context-aware navigation path with structured data for SEO
- **RootLayout.js**: Main layout component for wrapping pages with common elements

#### Content Sections
- **BodyOne.js**: Hero section with location-specific heading and featured stories
- **BodyTwo.js**: Informational section about egg pricing, NECC, and market factors
- **BodyThree.js**: Data-driven analysis section with price trends and comparisons
- **FAQ.js**: Dynamic FAQ section with location-tailored questions

#### Data Display
- **RateTable.js**: Interactive table showing egg rates with rich features:
  - Price visualization using configurable charts (bar/line)
  - Pagination support
  - Sortable columns (city, state, date, rate)
  - Special rates display for wholesale/bulk buyers
  - Price calculations (per piece, tray of 30, pack of 100, peti of 210)
  - SEO-optimized with structured data (Schema.org)
  - Admin mode for CRUD operations
  - Responsive design with horizontal scrolling
  - Price change indicators with percentage calculations

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
- **Core Framework**: React.js for component-based architecture
- **Routing**: React Router v6 for dynamic routing and navigation
- **Data Visualization**: Chart.js with React-Chartjs-2 for interactive visualizations
- **Styling**: Tailwind CSS for responsive, utility-first design
- **SEO**: React Helmet for dynamic metadata management
- **Data Management**: Custom hooks for data fetching and state management
- **Form Handling**: Controlled components with validation
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### Backend
- **API Layer**: PHP REST API endpoints
- **Database**: MySQL with optimized queries and indexing
- **Caching**: Server-side caching for performance optimization
- **Authentication**: JWT-based secure authentication system
- **Rate Limiting**: API request throttling for stability
- **Error Handling**: Centralized error handling and logging

### SEO & Performance
- **Structured Data**: Schema.org implementation for rich snippets
- **Meta Tags**: Dynamic meta tags for better search visibility
- **Performance**: Lazy loading and code splitting
- **Accessibility**: ARIA attributes and semantic HTML
- **Analytics**: Built-in performance monitoring
- **Caching**: Client and server-side caching strategies

## 👨‍💻 Development Best Practices

- Component composition for maximum reusability
- Controlled forms for reliable user input handling
- Dynamic content loading based on URL parameters
- Structured data implementation for improved SEO
- Mobile-first responsive design patterns
- Fallback states for loading and error conditions
- Comprehensive prop validation with PropTypes
