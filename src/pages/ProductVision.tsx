import React from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

const ProductVision = () => {
  return (
    <>
      <Breadcrumb pageName="Product Vision & Industry Impact" />

      <div className="flex flex-col gap-10">
        {/* Section 1: The Strategic Problem */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-7.5">
          <h3 className="mb-4 text-xl font-bold text-black dark:text-white uppercase tracking-tight">
            Bridging the "Greenlight Gap"
          </h3>
          <p className="mb-5 leading-relaxed text-black dark:text-gray-400">
            The entertainment industry currently suffers from a massive data disconnect. 
            Development teams greenlight projects based on creative merit, but physical 
            production teams often inherit those projects with little logistical or 
            financial preparation. Verdict was engineered to bridge this gap by providing 
            objective, real-time analysis of a script's financial and operational footprint.
          </p>
          
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded border-l-4 border-danger bg-danger/5 p-4 dark:border-danger">
              <h4 className="font-bold text-danger mb-1 text-xs uppercase">Subjectivity Risk</h4>
              <p className="text-[11px] text-black dark:text-gray-400">Standard coverage is inconsistent, leading to "false positives" and missed commercial opportunities.</p>
            </div>
            <div className="rounded border-l-4 border-danger bg-danger/5 p-4 dark:border-danger">
              <h4 className="font-bold text-danger mb-1 text-xs uppercase">Operational Blindness</h4>
              <p className="text-[11px] text-black dark:text-gray-400">Logistical requirements are often assessed too late, causing soundstage and crew bottlenecks.</p>
            </div>
            <div className="rounded border-l-4 border-danger bg-danger/5 p-4 dark:border-danger">
              <h4 className="font-bold text-danger mb-1 text-xs uppercase">Financial Misalignment</h4>
              <p className="text-[11px] text-black dark:text-gray-400">ROI projections rarely account for real-world production complexity found within the script.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Core Analysis Engines */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Financial ROI Engine */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-7.5">
            <h4 className="mb-3 text-lg font-bold text-primary uppercase tracking-widest">Scenario Simulator</h4>
            <p className="mb-4 text-sm dark:text-gray-400">
              Verdict utilizes a <strong>Sensitivity Analysis</strong> model to simulate ROI variance. 
              By manipulating variables like talent strength and marketing allocation, executives 
              can identify a project's financial "breaking point" before committing millions to production.
            </p>
            <div className="space-y-2">
               <div className="flex justify-between text-[10px] font-bold uppercase border-b border-stroke dark:border-strokedark pb-1">
                  <span>Inquiry</span>
                  <span>Impact Metric</span>
               </div>
               <div className="flex justify-between text-[11px] py-1">
                  <span>Talent Tier Swap</span>
                  <span className="text-success">+14% ROI Variance</span>
               </div>
               <div className="flex justify-between text-[11px] py-1">
                  <span>Marketing Delta</span>
                  <span className="text-warning">Sensitivity: High</span>
               </div>
            </div>
          </div>

          {/* Physical Production Engine */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-7.5">
            <h4 className="mb-3 text-lg font-bold text-primary uppercase tracking-widest">Production Log</h4>
            <p className="mb-4 text-sm dark:text-gray-400">
              The <strong>Stage-to-Page</strong> estimator bridge's the gap between creative and facilities. 
              By parsing scene complexity via NLP, Verdict generates accurate infrastructure forecasts 
              to maximize soundstage utilization and facility scheduling.
            </p>
            <ul className="list-disc pl-5 text-xs space-y-2 dark:text-gray-400 italic">
              <li>Automated Soundstage Day forecasting</li>
              <li>Virtual Production (LED Volume) candidacy flagging</li>
              <li>Mill and set-prep timeline projection</li>
            </ul>
          </div>
        </div>

        {/* Section 3: Market Utility Index */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-7.5">
          <h3 className="mb-8 text-xl font-bold text-black dark:text-white text-center uppercase tracking-widest">Who Verdict Serves</h3>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
              </div>
              <h5 className="mb-2 font-black text-black dark:text-white uppercase text-sm">Tech Majors</h5>
              <p className="text-xs dark:text-gray-400">Global supply chain optimization for volume content creators.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>
              </div>
              <h5 className="mb-2 font-black text-black dark:text-white uppercase text-sm">Facility Hubs</h5>
              <p className="text-xs dark:text-gray-400">Maximizing soundstage occupancy through predictive booking.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
              </div>
              <h5 className="mb-2 font-black text-black dark:text-white uppercase text-sm">Financiers</h5>
              <p className="text-xs dark:text-gray-400">Objective risk validation for independent slate financing.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductVision;