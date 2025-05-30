import React, { memo } from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const FooterLink = memo(({ href, children, external = false, className = "", icon: Icon = null }) => {
  const baseClasses = "inline-flex items-center gap-2 text-gray-200 dark:text-gray-300 hover:text-white dark:hover:text-white focus:text-white dark:focus:text-white focus:outline-none focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-300 rounded-sm px-2 py-1.5 transition-all duration-300 ease-in-out text-base sm:text-sm";
  
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} ${className} transform hover:translate-x-1`}
        aria-label={`Visit our ${children} page (opens in new tab)`}
      >
        {Icon && <Icon className="w-5 h-5 sm:w-4 sm:h-4" aria-hidden="true" />}
        <span>{children}</span>
      </a>
    );
  }
  
  return (
    <Link
      to={href}
      className={`${baseClasses} ${className} transform hover:translate-x-1`}
    >
      {Icon && <Icon className="w-5 h-5 sm:w-4 sm:h-4" aria-hidden="true" />}
      <span>{children}</span>
    </Link>
  );
});

const socialLinks = [
  { name: "Facebook", url: "https://www.facebook.com/todayeggrates", icon: FaFacebook },
  { name: "Twitter", url: "https://www.twitter.com/todayeggrates", icon: FaTwitter },
  { name: "Instagram", url: "https://www.instagram.com/todayeggrates", icon: FaInstagram }
];

const legalLinks = [
  { name: "Disclaimer", path: "/disclaimer" },
  { name: "Privacy Policy", path: "/privacy" },
  { name: "Terms of Service", path: "/terms" }
];

const Footer = memo(() => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#2D1810] dark:bg-gray-900 text-white py-8 sm:py-12 px-4 mt-8 relative print:hidden" role="contentinfo">
      
      {/* Subtle background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM37.656 0l8.485 8.485-1.414 1.414L36.242 1.414 37.656 0zM22.344 0L13.858 8.485 15.272 9.9l8.485-8.485L22.344 0zM32.4 0l10.142 10.142-1.414 1.414L30.986 1.414 32.4 0zM27.6 0L17.458 10.142l1.414 1.414L28.014 1.414 27.6 0z' fill='%23E6CCB2' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto w-full max-w-7xl relative">
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white dark:text-gray-100 mb-4">Today Egg Rates</h2>
            <p className="text-gray-200 dark:text-gray-300 text-base sm:text-sm leading-relaxed max-w-xs">
              Your trusted source for daily egg price updates across India. Get reliable, up-to-date information about egg rates in your city.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white dark:text-gray-100 mb-4">Quick Links</h2>
            <nav className="flex flex-col space-y-3" aria-label="Footer quick links">
              {legalLinks.map(({ name, path }) => (
                <FooterLink key={name} href={path}>
                  {name}
                </FooterLink>
              ))}
            </nav>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white dark:text-gray-100 mb-4">Connect With Us</h2>
            <nav className="flex flex-col space-y-3" aria-label="Social media links">
              {socialLinks.map(({ name, url, icon }) => (
                <FooterLink 
                  key={name} 
                  href={url} 
                  external 
                  icon={icon}
                >
                  {name}
                </FooterLink>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white dark:text-gray-100 mb-4">Contact</h2>
            <div className="text-gray-200 dark:text-gray-300 space-y-3">
              <p className="flex items-center transition-colors duration-300 text-base sm:text-sm">
                <span aria-hidden="true" className="mr-2">📧</span>
                <a 
                  href="mailto:contact@todayeggrates.com" 
                  className="hover:text-white dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-300 rounded-sm px-1"
                  aria-label="Send us an email"
                >
                  contact@todayeggrates.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Divider with improved design */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200/10 dark:border-gray-700/30"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-[#2D1810] dark:bg-gray-900 px-4">
              <img 
                src="/logo.webp" 
                alt="Today Egg Rates" 
                className="h-10 w-auto" 
                loading="lazy"
                width="40"
                height="40"
              />
            </div>
          </div>
        </div>

        {/* Bottom bar with improved layout */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-sm">
          <p className="text-gray-200 dark:text-gray-300">
            © {currentYear} Today Egg Rates. All Rights Reserved.
          </p>
          <p className="text-gray-200 dark:text-gray-300 flex items-center space-x-1 text-sm">
            <span>Made with</span>
            <span className="text-red-400 dark:text-red-300 mx-1" role="img" aria-label="love">♥</span>
            <span>by</span>
            <FooterLink 
              href="https://www.instagram.com/being._owais" 
              external 
              className="font-medium hover:text-orange-200 dark:hover:text-orange-300"
            >
              Owais Khan
            </FooterLink>
          </p>
        </div>
      </div>
    </footer>
  );
});

FooterLink.displayName = 'FooterLink';
Footer.displayName = 'Footer';

export default Footer;
