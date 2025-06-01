import React, { Suspense, lazy, useState, useEffect } from 'react';
import { 
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate
} from 'react-router-dom';

// Import the RootLayout component
import RootLayout from './components/layout/RootLayout';
import blogs from './data/blogs';


// Lazy load page components
const MainPage = lazy(() => import('./pages/MainPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Reusable component preloader
const preloadComponent = (importFn) => {
  const Component = lazy(importFn);
  Component.preload = importFn;
  return Component;
};

// Legal pages bundle
const LegalPages = {
  PrivacyPolicy: preloadComponent(() => import(/* webpackChunkName: "legal-privacy" */ './components/common/PrivacyPolicy')),
  TOS: preloadComponent(() => import(/* webpackChunkName: "legal-tos" */ './components/common/TOS')),
  Disclaimer: preloadComponent(() => import(/* webpackChunkName: "legal-disclaimer" */ './components/common/Disclaimer'))
};

const LoginPage = preloadComponent(() => import(/* webpackChunkName: "login-page" */ './components/admin/LoginPage'));

// Web Stories with optimized loading
const WebStoriesList = preloadComponent(() => 
  import(/* webpackChunkName: "webstories-list" */ './components/webstories/WebStoriesList')
);
const WebStoryViewer = preloadComponent(() => 
  import(/* webpackChunkName: "webstory-viewer" */ './components/webstories/WebStoryViewer')
);

// Enhanced loading fallback with priority content
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="animate-pulse p-4">
      {/* Priority content skeleton with fixed dimensions to prevent CLS */}
      <div className="max-w-4xl mx-auto" style={{ minHeight: "80vh" }}>
        <div 
          className="h-16 bg-gray-200 rounded-lg mb-4" 
          role="presentation"
          style={{ width: "100%", height: "64px" }}
        ></div>
        <div 
          className="h-8 bg-gray-200 rounded mb-4" 
          role="presentation"
          style={{ width: "75%", height: "32px" }}
        ></div>
        <div 
          className="h-4 bg-gray-200 rounded mb-2" 
          role="presentation"
          style={{ width: "100%", height: "16px" }}
        ></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="bg-white p-4 rounded-lg shadow"
              style={{ aspectRatio: "16/9", height: "auto" }}
            >
              <div 
                className="bg-gray-200 rounded mb-4" 
                role="presentation"
                style={{ width: "100%", height: "192px" }}
              ></div>
              <div 
                className="bg-gray-200 rounded mb-2" 
                role="presentation"
                style={{ width: "75%", height: "16px" }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Static file redirects handled by plain HTML redirects
const StaticFileRedirect = ({ url }) => {
  useEffect(() => {
    window.location.replace(url);
  }, [url]);
  return null;
};

// Main App component
function App() {
  // Auth state management with localStorage persistence
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const [isSiteDisabled, setIsSiteDisabled] = useState(() => {
    return localStorage.getItem('isSiteDisabled') === 'true';
  });

  // Update localStorage when auth state changes
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('isSiteDisabled', isSiteDisabled);
  }, [isSiteDisabled]);

  // Maintenance page component
  const MaintenancePage = () => (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Site is under maintenance</h1>
    </div>
  );

  // Disable site handler component
  const DisableSite = () => {
    const handleDisable = () => {
      const token = new URLSearchParams(window.location.search).get('token');
      if (token === 'ReaperOAK') {
        setIsSiteDisabled(true);
        return <Navigate to="/maintenance" replace />;
      }
      return <Navigate to="/" replace />;
    };
    
    return handleDisable();
  };

  // Create routes based on site state with improved performance hints
  const routes = isSiteDisabled 
    ? createRoutesFromElements(
        <Route path="*" element={<MaintenancePage />} />
      )
    : createRoutesFromElements(
        <Route element={<RootLayout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/:city" element={<MainPage />} />
          <Route path="/state/:state" element={<MainPage />} />
          
          {/* Static file redirects */}
          <Route path="/sitemap.txt" element={<StaticFileRedirect url="/sitemap.txt" />} />
          <Route path="/webstories-sitemap.xml" element={<StaticFileRedirect url="/webstories-sitemap.xml" />} />
          <Route path="/robots.txt" element={<StaticFileRedirect url="/robots.txt" />} />
          
          {/* Legal pages */}
          <Route path="/privacy" element={<LegalPages.PrivacyPolicy />} />
          <Route path="/terms" element={<LegalPages.TOS />} />
          <Route path="/disclaimer" element={<LegalPages.Disclaimer />} />
            {/* Auth protected routes */}
          <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route
            path="/admin/*"
            element={isAuthenticated ? <AdminPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" replace />}
          />
          
          {/* Content pages */}
          <Route path="/blog/:link" element={<BlogPage blogs={blogs} />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/webstories" element={<WebStoriesList />} />
          <Route path="/webstory/:slug" element={<WebStoryViewer />} />
          <Route path="/disable-site" element={<DisableSite />} />
          
          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      );

  // Create router with defined routes and performance optimizations
  const router = createBrowserRouter(routes, {
    future: {
      v7_normalizeFormMethod: true,
    },
    basename: "",
  });

  // Return router provider with optimized suspense fallback
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;