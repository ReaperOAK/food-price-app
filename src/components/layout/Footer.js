import React, { memo } from "react";
import { Link } from "react-router-dom";

const FooterLink = memo(({ href, children, external = false, className = "" }) => {
  const baseClasses = "text-[#E6CCB2] hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-[#E6CCB2] rounded-sm px-2 py-1 transition-all duration-300 ease-in-out";
  
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} ${className}`}
        aria-label={`Visit our ${children} page (opens in new tab)`}
      >
        {children}
      </a>
    );
  }
  
  return (
    <Link
      to={href}
      className={`${baseClasses} ${className}`}
    >
      {children}
    </Link>
  );
});

const socialLinks = [
  { name: "Facebook", url: "https://www.facebook.com/todayeggrates" },
  { name: "Twitter", url: "https://www.twitter.com/todayeggrates" },
  { name: "Instagram", url: "https://www.instagram.com/todayeggrates" }
];

const legalLinks = [
  { name: "Disclaimer", path: "/disclaimer" },
  { name: "Privacy Policy", path: "/privacy" },
  { name: "Terms of Service", path: "/terms" }
];

const Footer = memo(() => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#422C18] text-white py-8 px-4 mt-8" role="contentinfo">
      <div className="container mx-auto w-full max-w-7xl">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Today Egg Rates</h2>
            <p className="text-[#E6CCB2] text-sm leading-relaxed">
              Your trusted source for daily egg price updates across India. Get reliable, up-to-date information about egg rates in your city.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
            <nav className="flex flex-col space-y-2" aria-label="Footer quick links">
              {legalLinks.map(({ name, path }) => (
                <FooterLink key={name} href={path}>
                  {name}
                </FooterLink>
              ))}
            </nav>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Connect With Us</h2>
            <nav className="flex flex-col space-y-2" aria-label="Social media links">
              {socialLinks.map(({ name, url }) => (
                <FooterLink key={name} href={url} external>
                  {name}
                </FooterLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E6CCB2]/20 my-6"></div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm">
          <p className="text-[#E6CCB2]">
            © {currentYear} Today Egg Rates. All Rights Reserved.
          </p>
          <p className="text-[#E6CCB2] flex items-center space-x-1">
            <span>Made with</span>
            <span className="text-red-500 mx-1" aria-label="love">♥</span>
            <span>by</span>
            <FooterLink 
              href="https://www.instagram.com/being._owais" 
              external 
              className="font-medium"
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
