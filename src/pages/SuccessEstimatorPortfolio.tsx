import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

interface ESTIMATOR_RECORD {
  auditId: string;
  projectName: string; 
  status: string;
  score: number;
  lastUpdatedAt: string;
  verdict: string;
  reportUrl?: string;
}

const SuccessEstimatorPortfolio = () => {
  const [records, setRecords] = useState<ESTIMATOR_RECORD[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRedriving, setIsRedriving] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch('https://jdig9yqazd.execute-api.us-east-1.amazonaws.com/prod/get-estimator-portfolio');
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        setRecords(data.records || []);
      } catch (err) {
        console.error("Portfolio Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  // --- NEW: REDRIVE HANDLER ---
  const handleRedrive = async (auditId: string, projectName: string) => {
    setIsRedriving(auditId);
    try {
      const response = await fetch('https://jdig9yqazd.execute-api.us-east-1.amazonaws.com/prod/analyze', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Trigger a re-run using the existing keys
        body: JSON.stringify({ auditId, projectName, isRedrive: true }),
      });

      if (response.ok) {
        alert(`Synthesis restarted for: ${projectName}. Please allow 30 seconds for AI research.`);
        window.location.reload(); // Refresh to update status to PROCESSING
      } else {
        throw new Error("Failed to initiate Redrive.");
      }
    } catch (err) {
      console.error("Redrive Execution Error:", err);
      alert("Could not restart analysis. Please check system logs.");
    } finally {
      setIsRedriving(null);
    }
  };

  // Adjusted grid for the additional "Rerun" column
  const gridLayout = "grid grid-cols-3 sm:grid-cols-[1.5fr_3fr_1.5fr_1fr_1fr_1fr_0.5fr] items-center";

  return (
    <>
      <Breadcrumb pageName="Success Intelligence Portfolio" />
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="flex flex-col">
          {/* TABLE HEADER */}
          <div className={`rounded-sm bg-gray-2 dark:bg-meta-4 ${gridLayout}`}>
            <div className="p-2.5 xl:p-5 text-xs font-bold uppercase tracking-widest text-black dark:text-white">Audit ID</div>
            <div className="p-2.5 text-center xl:p-5 text-xs font-bold uppercase tracking-widest text-black dark:text-white">Project Title</div>
            <div className="hidden sm:block p-2.5 text-center text-xs font-bold uppercase tracking-widest text-black dark:text-white">Status</div>
            <div className="hidden sm:block p-2.5 text-center text-xs font-bold uppercase tracking-widest text-black dark:text-white">Verdict</div>
            <div className="hidden sm:block p-2.5 text-center text-xs font-bold uppercase tracking-widest text-black dark:text-white">Score</div>
            <div className="hidden sm:block p-2.5 text-center text-xs font-bold uppercase tracking-widest text-black dark:text-white">PDF</div>
            <div className="p-2.5 text-center text-xs font-bold uppercase tracking-widest text-black dark:text-white">Act</div>
          </div>

          {loading ? (
            <div className="p-10 text-center animate-pulse italic text-primary font-bold uppercase tracking-widest">
              Syncing Executive Intelligence...
            </div>
          ) : records.length === 0 ? (
            <div className="p-10 text-center text-gray-400">No projects analyzed yet.</div>
          ) : (
            records.map((record, key) => (
              <div 
                className={`${gridLayout} ${key === records.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}`} 
                key={`${record.auditId}-${record.projectName}`}
              >
                {/* ID LINK */}
                <div className="p-2.5 xl:p-5">
                  <Link 
                    to={`/estimator-detail/${record.auditId}?projectName=${encodeURIComponent(record.projectName)}`} 
                    className="text-primary font-bold text-xs hover:underline"
                  >
                    {record.auditId.substring(0,14)}...
                  </Link>
                </div>

                {/* PROJECT TITLE */}
                <div className="p-2.5 text-center xl:p-5 text-sm font-black uppercase tracking-tight text-black dark:text-white">
                  {record.projectName}
                </div>

                {/* STATUS BADGE */}
                <div className="hidden sm:flex justify-center p-2.5">
                  <p className={`rounded-full py-1 px-3 text-[9px] font-black uppercase shadow-sm border ${
                    record.status === 'COMPLETED' ? 'bg-success/10 text-success border-success/20' : 
                    record.status === 'ERROR' || record.status === 'FAILED' ? 'bg-danger/10 text-danger border-danger/20' : 
                    'bg-warning/10 text-warning border-warning/20'
                  }`}>
                    {record.status || 'QUEUED'}
                  </p>
                </div>

                {/* VERDICT */}
                <div className="hidden sm:flex justify-center p-2.5 font-black text-xs">
                   {record.verdict || '--'}
                </div>

                {/* SCORE */}
                <div className="hidden sm:flex justify-center p-2.5 font-black text-meta-3">
                  {record.status === 'COMPLETED' ? `${record.score}%` : '--'}
                </div>

                {/* PDF ICON */}
                <div className="hidden sm:flex justify-center p-2.5">
                  {record.status === 'COMPLETED' ? (
                    <svg className="fill-primary" width="18" height="18" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                  ) : (
                    <span className="text-[10px] opacity-20 italic">Pending</span>
                  )}
                </div>

                {/* REDRIVE ACTION */}
                <div className="p-2.5 text-center">
                  <button 
                    onClick={() => handleRedrive(record.auditId, record.projectName)}
                    disabled={isRedriving === record.auditId}
                    className={`text-gray-400 hover:text-primary transition-all ${isRedriving === record.auditId ? 'animate-spin text-primary' : ''}`}
                    title="Restart AI Analysis"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default SuccessEstimatorPortfolio;