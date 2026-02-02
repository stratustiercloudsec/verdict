import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../images/cover/hp_hero_1.jpg'; 
import LogisticsHero from '../components/LogisticsHero'; // The new component

const MainPage = () => {
  return (
    <div className="mt-4">
      {/* --- SECTION 1: VISIONARY HERO --- */}
      <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
        <div className="relative z-20 h-100 md:h-125 lg:h-150">
          <img src={heroImage} alt="Verdict Production Hero" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/60 flex items-center px-6 md:px-12 lg:px-20">
            <div className="max-w-3xl text-white">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
                Verdict: Predictive Intelligence for Production.
              </h1>
              <p className="text-lg md:text-xl mb-8 opacity-90 leading-relaxed">
                The first release of Verdict brings AI-driven clarity to the development process. 
                Validate your creative vision and predict production success before the first frame is shot.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/forms/production-success-estimator" className="rounded bg-primary py-3 px-8 font-medium text-white hover:bg-opacity-90 transition shadow-lg">
                  Start Analysis
                </Link>
                <Link to="/forms/coverage-report" className="rounded border border-white py-3 px-8 font-medium text-white hover:bg-white hover:text-black transition">
                  Generate Coverage
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 2: LOGISTICS HERO (NEW) --- */}
      <LogisticsHero />

      {/* --- SECTION 3: MARKET UTILITY GRID --- */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
         {[
           { title: "The Majors", desc: "Global supply chain optimization for volume content creators like Netflix & Amazon MGM.", color: "text-primary" },
           { title: "The Facilities", desc: "Maximize stage occupancy by identifying technical needs months in advance.", color: "text-meta-3" },
           { title: "Financiers", desc: "Objective ROI validation for independent slate financing and gap funding.", color: "text-warning" }
         ].map((tier, idx) => (
           <div key={idx} className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
             <h3 className={`text-xl font-black uppercase mb-3 ${tier.color}`}>{tier.title}</h3>
             <p className="text-sm dark:text-gray-400">{tier.desc}</p>
           </div>
         ))}
      </div>

      {/* --- SECTION 4: CAPABILITIES --- */}
      <div className="rounded-sm border border-stroke bg-white py-8 px-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-black dark:text-white mb-2 uppercase tracking-widest">Release 1.0 Pipeline</h2>
          <p className="text-bodydark2">Core tools engineered by StratusTier to quantify creative potential.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="p-6 rounded-md border border-stroke dark:border-strokedark hover:border-primary transition group">
            <h4 className="text-xl font-bold text-black dark:text-white mb-3 group-hover:text-primary transition">Script Analysis</h4>
            <p className="text-sm leading-relaxed dark:text-gray-400">Audit narrative pacing and scene density via AWS Bedrock to ensure scripts are production-ready.</p>
          </div>
          <div className="p-6 rounded-md border border-stroke dark:border-strokedark hover:border-primary transition group">
            <h4 className="text-xl font-bold text-black dark:text-white mb-3 group-hover:text-primary transition">Treatment Analysis</h4>
            <p className="text-sm leading-relaxed dark:text-gray-400">Identify thematic strengths early in the cycle through isolated data processing.</p>
          </div>
          <div className="p-6 rounded-md border border-stroke dark:border-strokedark hover:border-primary transition group">
            <h4 className="text-xl font-bold text-black dark:text-white mb-3 group-hover:text-primary transition">Success Prediction</h4>
            <p className="text-sm leading-relaxed dark:text-gray-400">Utilize the Scenario Simulator to estimate project viability based on market trends.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;