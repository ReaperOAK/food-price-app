import React from "react";

const Footer = () => {
    return (
      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="flex justify-between">
          <div>
            <p>© {new Date().getFullYear()} Egg Rate Finder. All Rights Reserved.</p>
          </div>
          <div>
            <a href="/privacy" className="text-gray-400 mr-4">Privacy Policy</a>
            <a href="/terms" className="text-gray-400">Terms of Service</a>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  