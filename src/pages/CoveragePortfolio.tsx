import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

interface AUDIT {
  id: string;
  reportDate: string;
  auditName: string;
  reportType: string;
  successGauge: number;
  status: string;
  reportUrl?: string; // Critical for the download link
}

const CoveragePortfolio = () => {
  const [auditData, setAuditData] = useState<AUDIT[]>([]);
  const [loading, setLoading] = useState(true);

  const formatProjectName = (str: string) => {
    if (!str) return 'Untitled Project';
    const clean = str.replace(/^[0-9a-fA-F-]{36}-/, '').replace(/-/g, ' ').split('.')[0];
    return clean.replace(/\b\w/g, (char) => char.toUpperCase()); 
  };

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const response = await fetch('https://jdig9yqazd.execute-api.us-east-1.amazonaws.com/prod/get-audits');
        const data = await response.json();
        // The API should now return the updated records with reportUrl
        setAuditData(data.audits || []);
      } catch (err) { 
        console.error("Portfolio Fetch Error:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchAudits();
  }, []);

  const gridLayout = "grid grid-cols-3 sm:grid-cols-[1fr_1.5fr_3.5fr_1.5fr_1.5fr_1fr_1fr] items-center";

  return (
    <>
      <Breadcrumb pageName="Coverage Portfolio" />
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="flex flex-col">
          <div className={`rounded-sm bg-gray-2 dark:bg-meta-4 ${gridLayout}`}>
            <div className="p-2.5 xl:p-5 text-xs font-bold uppercase tracking-widest text-black dark:text-white">ID</div>
            <div className="p-2.5 text-center xl:p-5 text-xs font-bold uppercase tracking-widest text-black dark:text-white">Date</div>
            <div className="p-2.5 text-center xl:p-5 text-xs font-bold uppercase tracking-widest text-black dark:text-white">Project Title</div>
            <div className="hidden sm:block p-2.5 text-center text-xs font-bold uppercase tracking-widest text-black dark:text-white">Type</div>
            <div className="hidden sm:block p-2.5 text-center text-xs font-bold uppercase tracking-widest text-black dark:text-white">Status</div>
            <div className="hidden sm:block p-2.5 text-center text-xs font-bold uppercase tracking-widest text-black dark:text-white">Score</div>
            <div className="hidden sm:block p-2.5 text-center text-xs font-bold uppercase tracking-widest text-black dark:text-white">PDF</div>
          </div>

          {loading ? (
            <div className="p-10 text-center animate-pulse italic text-primary">Syncing Executive Portfolio...</div>
          ) : (
            auditData.map((audit, key) => (
              <div 
                className={`${gridLayout} ${key === auditData.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}`} 
                key={audit.id}
              >
                <div className="p-2.5 xl:p-5">
                  <Link to={`/audit-detail/${audit.id}`} className="text-primary font-bold text-xs hover:underline">
                    {audit.id.substring(0,8)}
                  </Link>
                </div>
                <div className="p-2.5 text-center xl:p-5 text-xs text-black dark:text-white">
                  {audit.reportDate || 'N/A'}
                </div>
                <div className="p-2.5 text-center xl:p-5 text-sm font-bold uppercase tracking-tight text-black dark:text-white">
                  {formatProjectName(audit.auditName)}
                </div>
                <div className="hidden sm:flex justify-center p-2.5 text-[10px] font-black text-primary uppercase">
                  {audit.reportType || 'TREATMENT'}
                </div>
                <div className="hidden sm:flex justify-center p-2.5">
                  <p className={`rounded-full py-1 px-3 text-[9px] font-black uppercase shadow-sm ${
                    audit.status === 'COMPLETED' ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'
                  }`}>
                    {audit.status || 'QUEUED'}
                  </p>
                </div>
                <div className="hidden sm:flex justify-center p-2.5 font-black text-meta-3">
                  {audit.status === 'COMPLETED' ? `${audit.successGauge}%` : '--'}
                </div>
                
                {/* PDF DOWNLOAD COLUMN */}
                <div className="hidden sm:flex justify-center p-2.5">
                  {audit.status === 'COMPLETED' && audit.reportUrl ? (
                    <a 
                      href={audit.reportUrl} 
                      download 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-meta-3 transition-colors"
                      title="Download Analysis JSON"
                    >
                      <svg 
                        className="fill-current" 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                      </svg>
                    </a>
                  ) : (
                    <span className="text-[10px] opacity-20 italic">Pending</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default CoveragePortfolio;