import React from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

const PrivacyPolicy = () => {
  return (
    <>
      <Breadcrumb pageName="Privacy & Data Policy" />
      <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-4xl">
          <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">Sovereign Data Protection</h2>
          <p className="mb-6 text-black dark:text-gray-400">
            At StratusTier Innovation Labs, we understand that a script is a studio's most valuable asset. 
            Verdict is built on a <strong>"Zero-Trust" Infrastructure</strong> designed for the high-security 
            needs of Major Studios and Independent Financiers.
          </p>

          <blockquote className="mb-6 border-l-4 border-primary bg-gray-2 p-4 dark:bg-meta-4">
            <p className="text-sm font-medium text-black dark:text-white">
              <strong>The StratusTier Promise:</strong> Your data is never used to train public Large Language Models (LLMs). 
              All analysis is performed in isolated, sovereign compute environments.
            </p>
          </blockquote>

          <h3 className="mb-3 text-xl font-bold text-black dark:text-white">1. Data Storage & Encryption</h3>
          <p className="mb-6 text-black dark:text-gray-400">
            All script uploads are encrypted at rest using AES-256 and in transit via TLS 1.2+. 
            Executive Audits (PDFs) are stored in private S3 buckets with restricted Origin Access Identity.
          </p>

          <h3 className="mb-3 text-xl font-bold text-black dark:text-white">2. Third-Party AI Services</h3>
          <p className="mb-6 text-black dark:text-gray-400">
            Verdict utilizes <strong>AWS Bedrock</strong> for inference. Unlike public AI interfaces, 
            Bedrock ensures that your inputs and outputs remain within our private AWS VPC and are 
            specifically excluded from model training datasets.
          </p>

          <h3 className="mb-3 text-xl font-bold text-black dark:text-white">3. Information Disclosure</h3>
          <p className="text-black dark:text-gray-400">
            We do not sell, trade, or share your proprietary data with any third parties, including other 
            studios or market competitors.
          </p>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
