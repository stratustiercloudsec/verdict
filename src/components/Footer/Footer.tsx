import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-auto w-full border-t border-stroke bg-white py-8 px-6 text-center shadow-sm dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-0">
        
        {/* Product Brand & Copyright */}
        <div className="text-sm font-medium text-black dark:text-white">
          © {new Date().getFullYear()} <span className="text-primary font-bold">Verdict AI</span> | 
          Creative Intelligence Platform
        </div>

        {/* Corporate Signature */}
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-500 dark:text-bodydark2">
          <span>Engineered by</span>
          <a 
            href="https://stratustier.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-black text-black hover:text-primary dark:text-white dark:hover:text-primary transition-all duration-300 ease-in-out"
          >
            StratusTier <span className="text-primary">Innovation Labs</span>
          </a>
        </div>

        {/* Legal & Strategy Links */}
        <div className="flex items-center gap-6 text-xs">
          {/* THE STYLED PRODUCT VISION LINK */}
          <Link 
            to="/product-vision" 
            className="group relative font-semibold text-gray-500 transition-all duration-300 ease-in-out hover:text-primary hover:-translate-y-0.5 dark:text-bodydark2 dark:hover:text-primary"
          >
            Product Vision
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link 
            to="/privacy-policy" 
            className="group relative font-semibold text-gray-500 transition-all duration-300 ease-in-out hover:text-primary hover:-translate-y-0.5 dark:text-bodydark2 dark:hover:text-primary"
          >
            Privacy
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link 
            to="/terms-of-service" 
            className="group relative font-semibold text-gray-500 transition-all duration-300 ease-in-out hover:text-primary hover:-translate-y-0.5 dark:text-bodydark2 dark:hover:text-primary"
          >
            Terms
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;