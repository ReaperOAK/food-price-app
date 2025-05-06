# Food Price App Documentation

## 📋 Project Overview

The Food Price App provides real-time egg price information across different cities and states in India. It offers comprehensive features including:

- 📊 Real-time price tracking
- 📈 Historical data analysis
- 📝 Educational blogs about egg markets
- 📱 Visual web stories for enhanced engagement

## 🗂️ Directory Structure

```
food-price-app/
└── src/
    ├── components/
    │   ├── admin/
    │   │   ├── AddCityForm.js
    │   │   ├── AddStateForm.js
    │   │   ├── LoginPage.js
    │   │   └── RateForm.js
    │   ├── blog/
    │   │   ├── BlogCard.js
    │   │   ├── BlogList.js
    │   │   └── TableOfContents.js
    │   ├── common/
    │   │   ├── CitySelect.js
    │   │   ├── Disclaimer.js
    │   │   ├── FAQ.js
    │   │   ├── PrivacyPolicy.js
    │   │   ├── RedirectInterceptor.js
    │   │   ├── StakeAdPopup.js
    │   │   ├── StateSelect.js
    │   │   └── TOS.js
    │   ├── layout/
    │   │   ├── AdminNavbar.js
    │   │   ├── Breadcrumb.js
    │   │   ├── Footer.js
    │   │   └── Navbar.js
    │   ├── rates/
    │   │   ├── BodyOne.js
    │   │   ├── BodyThree.js
    │   │   ├── BodyTwo.js
    │   │   ├── DefaultTable.js
    │   │   ├── EggRatesTable.js
    │   │   ├── RateTable.js
    │   │   ├── SpecialRatesTable.js
    │   │   ├── StateList.js
    │   │   └── StatePage.js
    │   └── webstories/
    │       ├── WebStoriesList.js
    │       └── WebStoryViewer.js
    ├── data/
    │   ├── blogs.js
    │   └── eggprices.js
    ├── pages/
    │   ├── blogs/
    │   │   ├── blog-1.js
    │   │   ├── blog-2.js
    │   │   └── egg-rate-barwala.js
    │   ├── AdminPage.js
    │   ├── BlogPage.js
    │   └── MainPage.js
    ├── utils/
    │   └── ScrollToTop.js
    ├── App.css
    ├── App.js
    ├── App.test.js
    ├── index.css
    ├── index.js
    ├── logo.svg
    ├── reportWebVitals.js
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
- **RedirectInterceptor.js**: Manages internal redirects and navigation paths for legacy URLs

#### Content Sections
- **BodyOne.js**: Hero section with location-specific heading and featured stories
- **BodyTwo.js**: Informational section about egg pricing, NECC, and market factors
- **BodyThree.js**: Data-driven analysis section with price trends and comparisons
- **FAQ.js**: Dynamic FAQ section with location-tailored questions
- **StakeAdPopup.js**: Promotional component for displaying targeted advertisements

#### Data Display
- **RateTable.js**: Interactive table showing egg rates with visualization charts
- **DefaultTable.js**: Generic table for displaying egg rates without specific location
- **SpecialRatesTable.js**: Highlights featured or promoted egg rates from specific markets
- **StateList.js**: Interactive grid of states and cities with direct navigation links
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

- **Frontend Framework**: React.js for component-based UI
- **Routing**: React Router for navigation and dynamic routing
- **Data Visualization**: Chart.js for interactive graphs and charts
- **Styling**: Tailwind CSS for responsive design
- **Backend**: PHP API endpoints for data retrieval and management
- **SEO**: React Helmet for metadata management
- **Authentication**: JWT-based auth system for admin access

## 👨‍💻 Development Best Practices

- Component composition for maximum reusability
- Controlled forms for reliable user input handling
- Dynamic content loading based on URL parameters
- Structured data implementation for improved SEO
- Mobile-first responsive design patterns
- Fallback states for loading and error conditions
- Comprehensive prop validation with PropTypes
