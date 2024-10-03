import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white p-6 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} Egg Rate Finder. All Rights Reserved.
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:space-x-6">
          <a
            href="/privacy"
            className="text-gray-400 hover:text-white transition duration-300 mb-2 md:mb-0"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="text-gray-400 hover:text-white transition duration-300"
          >
            Terms of Service
          </a>
        </div>
      </div>
      <div className="mt-6 text-center">
        <p className="text-gray-500 text-sm">
          Follow us on{" "}
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition duration-300"
          >
            Facebook
          </a>
          ,{" "}
          <a
            href="https://www.twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition duration-300"
          >
            Twitter
          </a>
          ,{" "}
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition duration-300"
          >
            Instagram
          </a>
          .
        </p>
      </div>
    </footer>
  );
};

export default Footer;
