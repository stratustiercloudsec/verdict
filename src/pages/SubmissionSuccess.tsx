import React from 'react';
import { Link } from 'react-router-dom';

const SubmissionSuccess = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Success Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-meta-3/10 text-meta-3">
        <svg
          className="fill-current"
          width="40"
          height="40"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z"
          />
        </svg>
      </div>

      <h2 className="mb-3 text-3xl font-bold text-black dark:text-white">
        Inquiry Captured Successfully
      </h2>
      <p className="mb-8 max-w-lg text-bodydark2">
        Your project goals have been securely logged within the Verdict intelligence vault. 
        A strategic partner will review your production vision and reach out to discuss how 
        our predictive models can optimize your development pipeline and mitigate execution risk.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded bg-primary py-3 px-10 text-center font-medium text-white hover:bg-opacity-90"
        >
          Return Home
        </Link>
        <Link
          to="/forms/production-success-estimator"
          className="inline-flex items-center justify-center rounded border border-stroke py-3 px-10 text-center font-medium text-black hover:border-primary hover:text-primary dark:border-strokedark dark:text-white dark:hover:border-primary"
        >
          Start New Analysis
        </Link>
      </div>
    </div>
  );
};

export default SubmissionSuccess;
