import React from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

const TermsOfService = () => {
  return (
    <>
      <Breadcrumb pageName="Terms of Service" />
      <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-4xl">
          <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">1. Acceptance of Terms</h2>
          <p className="mb-6 text-black dark:text-gray-400">
            By accessing the Verdict AI Platform ("the Service"), provided by <strong>StratusTier Innovation Labs</strong>, 
            you agree to be bound by these Terms of Service. These terms govern your use of our Scenario Simulator, 
            Production Log, and Executive Audit tools.
          </p>

          <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">2. Proprietary Rights</h2>
          <p className="mb-3 text-black dark:text-gray-400">
            <strong>Platform Logic:</strong> All algorithms, scoring methodologies, and the "Verdict Intelligence" 
            framework are the exclusive property of StratusTier Innovation Labs.
          </p>
          <p className="mb-6 text-black dark:text-gray-400">
            <strong>User Content:</strong> You retain all ownership rights to any scripts, treatments, or project 
            metadata uploaded to the Service. StratusTier makes no claim to the underlying creative IP.
          </p>

          <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">3. Authorized Use</h2>
          <ul className="mb-6 list-disc pl-5 text-black dark:text-gray-400 space-y-2">
            <li>Users may not reverse-engineer the Scenario Simulator's sensitivity logic.</li>
            <li>Unauthorized scraping of market-tier directory data is strictly prohibited.</li>
            <li>Accounts are for individual or studio-wide use as defined by your subscription tier.</li>
          </ul>

          <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">4. Limitation of Liability</h2>
          <p className="text-black dark:text-gray-400 italic">
            Verdict AI provides "Decision Intelligence," not financial guarantees. StratusTier Innovation Labs 
            is not responsible for the commercial performance of any project greenlit through the use of this Service.
          </p>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
