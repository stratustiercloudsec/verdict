import React from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

const PlatformIntelligence = () => {
  return (
    <>
      <Breadcrumb pageName="Platform Intelligence & Methodology" />

      <div className="flex flex-col gap-10">
        {/* Industry Problem Section */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-7.5">
          <h3 className="mb-4 text-xl font-bold text-black dark:text-white uppercase tracking-tight">
            The Industry Challenge: The Content Supply Chain Gap
          </h3>
          <p className="mb-5 leading-relaxed text-black dark:text-gray-400">
            In a high-volume production environment, the disconnect between creative development and physical operations costs studios millions in budget overruns and missed delivery windows. Verdict was engineered to provide an objective, data-driven bridge between the script and the soundstage.
          </p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded border border-stroke p-4 dark:border-strokedark bg-danger/5">
              <h4 className="font-bold text-danger mb-2">Subjectivity Risk</h4>
              <p className="text-xs text-black dark:text-gray-400 leading-tight">Inconsistent human auditing leads to missed gems and "false positives" that fail at the box office.</p>
            </div>
            <div className="rounded border border-stroke p-4 dark:border-strokedark bg-danger/5">
              <h4 className="font-bold text-danger mb-2">Logistical Blindness</h4>
              <p className="text-xs text-black dark:text-gray-400 leading-tight">Physical production needs are often assessed too late, causing massive facility bottlenecks and scheduling conflicts.</p>
            </div>
            <div className="rounded border border-stroke p-4 dark:border-strokedark bg-danger/5">
              <h4 className="font-bold text-danger mb-2">Data Silos</h4>
              <p className="text-xs text-black dark:text-gray-400 leading-tight">Financial modeling and creative analysis rarely occupy the same environment, leading to misaligned greenlight decisions.</p>
            </div>
          </div>
        </div>

        {/* The Verdict Solution Engines */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Financial Engine */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-7.5">
            <h4 className="mb-3 text-lg font-bold text-primary uppercase tracking-wider">Scenario Simulator</h4>
            <p className="mb-4 text-sm dark:text-gray-400">
              Utilizing a proprietary <strong>Sensitivity Analysis</strong> model, Verdict simulates ROI variance by manipulating variables like talent strength and marketing allocation. This allows executives to identify a project's "breaking point" during pre-production.
            </p>
            <ul className="list-disc pl-5 text-xs space-y-2 dark:text-gray-400 italic">
              <li>Monte Carlo simulations for market volatility.</li>
              <li>Talent-to-Budget alignment audits.</li>
              <li>Predictive revenue modeling based on historical comps.</li>
            </ul>
          </div>

          {/* Operational Engine */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-7.5">
            <h4 className="mb-3 text-lg font-bold text-primary uppercase tracking-wider">Physical Production Log</h4>
            <p className="mb-4 text-sm dark:text-gray-400">
              Our <strong>Stage-to-Page</strong> estimator bridges the development gap. By utilizing NLP to parse scene complexity, Verdict generates infrastructure requirements to optimize soundstage utilization and facility scheduling.
            </p>
            <ul className="list-disc pl-5 text-xs space-y-2 dark:text-gray-400 italic">
              <li>Automated Soundstage Day forecasting.</li>
              <li>Virtual Production (LED Volume) candidacy flagging.</li>
              <li>Mill and set-prep timeline projection.</li>
            </ul>
          </div>
        </div>

        {/* Market Segments / Target Customers */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-7.5">
          <h3 className="mb-6 text-xl font-bold text-black dark:text-white text-center uppercase tracking-widest">Market Utility Index</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="text-center p-4 border-r border-stroke dark:border-strokedark last:border-0">
              <span className="mb-2 block text-xl font-black text-primary">THE MAJORS</span>
              <p className="text-[10px] uppercase dark:text-gray-500 mb-2">Netflix, Disney, Amazon MGM</p>
              <p className="text-xs dark:text-gray-400">Global content supply chain optimization and franchise risk management.</p>
            </div>
            <div className="text-center p-4 border-r border-stroke dark:border-strokedark last:border-0">
              <span className="mb-2 block text-xl font-black text-primary">THE FACILITIES</span>
              <p className="text-[10px] uppercase dark:text-gray-500 mb-2">Trilith, Assembly Studios</p>
              <p className="text-xs dark:text-gray-400">Maximizing stage occupancy and identifying technical client needs months in advance.</p>
            </div>
            <div className="text-center p-4">
              <span className="mb-2 block text-xl font-black text-primary">INDIE FINANCIERS</span>
              <p className="text-[10px] uppercase dark:text-gray-500 mb-2">A24, NEON, Private Equity</p>
              <p className="text-xs dark:text-gray-400">Validating niche ROI potential and securing gap financing through objective data.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlatformIntelligence;