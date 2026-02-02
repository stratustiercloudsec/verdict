import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import html2canvas from 'html2canvas'; 
import { jsPDF } from 'jspdf';
import { FileText, Download } from 'react-feather';

const EstimatorDetail: React.FC = () => {
  const { auditId } = useParams<{ auditId: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectName = queryParams.get('projectName') || '';
  const reportRef = useRef<HTMLDivElement>(null); 

  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (!auditId || !projectName) return;
    const fetchResult = async () => {
      try {
        const res = await fetch(`https://jdig9yqazd.execute-api.us-east-1.amazonaws.com/prod/get-estimator?auditId=${auditId}&projectName=${encodeURIComponent(projectName)}`);
        const data = await res.json();
        setAnalysisData(data);
        if (data.status === 'COMPLETED' || data.status === 'ERROR') setIsPolling(false);
      } catch (err) { console.error(err); }
    };
    const interval = setInterval(fetchResult, 4000);
    fetchResult();
    return () => clearInterval(interval);
  }, [auditId, projectName]);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), (canvas.height * pdf.internal.pageSize.getWidth()) / canvas.width);
    pdf.save(`${projectName}_Analysis.pdf`);
  };

  const renderMarketComps = () => {
    let list: any[] = [];
    try {
      const raw = analysisData?.comps;
      list = typeof raw === 'string' ? JSON.parse(raw) : (Array.isArray(raw) ? raw : []);
    } catch (e) { return <p className="text-gray-500 italic">Data format error.</p>; }

    if (list.length === 0) return null;

    return (
      <div className="space-y-6">
        {list.map((comp, i) => (
          <div key={i} className="border-b border-white/10 pb-4 last:border-0">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-white font-black text-sm uppercase">
                {comp.TITLE || comp.title || "Unknown Movie"}
              </span>
              <span className="text-meta-3 font-black text-xs">
                {comp.BOXOFFICE || comp.boxOffice || "N/A"}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-bold uppercase italic leading-relaxed">
              {comp.NOTES || comp.notes || ""}
            </p>
          </div>
        ))}
      </div>
    );
  };

  if (isPolling || !analysisData) return <div className="p-20 text-center animate-pulse text-meta-3 font-black uppercase">Synthesizing Executive Verdict...</div>;

  return (
    <>
      <Breadcrumb pageName="Success Estimator Report" />

      {/* --- EXTERNAL ACTION BAR: Excluded from reportRef --- */}
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleDownloadPDF} 
          className="flex items-center gap-2 bg-meta-3 text-white px-6 py-3 rounded font-black uppercase text-xs tracking-widest hover:bg-opacity-90 shadow-lg transition-all"
        >
          <Download size={16} />
          Export Executive PDF
        </button>
      </div>

      {/* --- WIDER CARD AREA: Removed max-w-270 constraint --- */}
      <div 
        ref={reportRef} 
        className="w-full bg-white dark:bg-boxdark p-10 rounded-sm shadow-xl border border-stroke mb-10 overflow-hidden"
      >
        {/* Report Header */}
        <div className="flex justify-between items-end mb-10 border-b-2 border-meta-3 pb-8">
          <div>
            <h4 className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-[0.2em]">Project Identification</h4>
            <h1 className="text-4xl font-black uppercase text-black dark:text-white">{analysisData.projectName}</h1>
          </div>
          <div className={`px-10 py-3 border-2 font-black text-2xl tracking-tighter ${analysisData.verdict === 'PASS' ? 'text-success border-success' : 'text-danger border-danger'}`}>
            VERDICT: {analysisData.verdict}
          </div>
        </div>

        {/* Scoring & Market Comps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
           <div className="bg-gray-50 dark:bg-meta-4 p-12 rounded-lg text-center border-2 border-stroke shadow-inner flex flex-col justify-center">
              <h4 className="text-xs font-black uppercase text-gray-400 mb-6 tracking-widest">Success Probability</h4>
              <span className="text-[10rem] leading-none font-black text-meta-3">{analysisData.score}%</span>
           </div>
           <div className="bg-black p-8 rounded-lg shadow-2xl relative min-h-[350px]">
              <h4 className="text-xs font-black uppercase text-meta-3 tracking-[0.4em] mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
                <FileText size={14} /> Market Comps
              </h4>
              {renderMarketComps()}
           </div>
        </div>

        {/* Narrative Analysis */}
        <div className="mb-12">
            <h3 className="mb-4 text-xs font-black uppercase text-meta-3 tracking-widest">Executive Summary</h3>
            <div className="text-xl leading-relaxed font-serif italic bg-gray-50 dark:bg-meta-4 p-10 rounded border-l-8 border-meta-3 text-black dark:text-white shadow-sm">
              {analysisData.summary}
            </div>
        </div>

        {/* Strategic Roadmap */}
        <div>
            <h3 className="mb-4 text-xs font-black uppercase text-gray-400 tracking-widest">Strategic Recommendations</h3>
            <div className="bg-gray-100 dark:bg-meta-4 p-10 rounded border-l-8 border-black font-semibold text-black dark:text-white">
              {analysisData.recommendations}
            </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stroke text-center">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">© Verdict AI Intelligence Platform | Production Analytics Division</p>
        </div>
      </div>
    </>
  );
};

export default EstimatorDetail;