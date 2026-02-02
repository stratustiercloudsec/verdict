import React from 'react';
import { Link } from 'react-router-dom';
import logisticsImage from '../images/cover/production_stage.jpg'; // Recommended asset

const LogisticsHero = () => {
  return (
    <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
      <div className="relative flex flex-col md:flex-row items-stretch min-h-[300px]">
        
        {/* Visual Side: The "Physical Reality" */}
        <div className="w-full md:w-1/2 relative overflow-hidden">
          <img 
            src={logisticsImage} 
            alt="Physical Production Logistics" 
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
        </div>

        {/* Content Side: The "Operational Logic" */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-white to-gray-50 dark:from-boxdark dark:to-meta-4">
          <h4 className="text-primary font-black uppercase tracking-[3px] text-xs mb-3">
            Operational Intelligence
          </h4>
          <h2 className="text-2xl lg:text-3xl font-bold text-black dark:text-white mb-4">
            From Digital Ink to Physical Infrastructure.
          </h2>
          <p className="text-sm lg:text-base text-bodydark2 mb-6 leading-relaxed">
            Verdict parses creative complexity to forecast real-world facility needs. 
            Identify soundstage requirements, set-prep timelines, and LED volume 
            candidacy before your first production meeting.
          </p>
          <div>
            <Link 
              to="/product-vision" 
              className="inline-flex items-center gap-2 font-bold text-primary hover:underline transition-all"
            >
              Explore the Methodology
              <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20"><path d="M10 3l-1.4 1.4L13.2 9H3v2h10.2l-4.6 4.6L10 17l7-7-7-7z"/></svg>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LogisticsHero;
