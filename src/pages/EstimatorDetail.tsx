import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import html2canvas from 'html2canvas'; 
import { jsPDF } from 'jspdf';

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

  // --- BULLETPROOF RENDERER ---
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
              <span className="text-blue-400 font-black text-xs">
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

  if (isPolling || !analysisData) return <div className="p-20 text-center animate-pulse text-primary font-black uppercase">Synthesizing...</div>;

  return (
    <>
      <Breadcrumb pageName="Success Estimator Report" />
      <div ref={reportRef} className="mx-auto max-w-270 bg-white dark:bg-boxdark p-10 rounded-sm shadow-xl border border-stroke mb-10 overflow-hidden">
        <div className="flex justify-between items-center mb-10 border-b-2 border-primary pb-8">
          <div>
            <h4 className="text-[10px] font-black uppercase text-gray-400 mb-1">Project Name</h4>
            <h1 className="text-3xl font-black uppercase">{analysisData.projectName}</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleDownloadPDF} className="bg-black text-white px-6 py-2 rounded font-black uppercase text-[10px]">Export PDF</button>
            <div className={`px-8 py-2 border-2 font-black text-xl ${analysisData.verdict === 'PASS' ? 'text-success border-success' : 'text-danger border-danger'}`}>VERDICT: {analysisData.verdict}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
           <div className="bg-gray-50 dark:bg-meta-4 p-10 rounded-lg text-center border-2 border-stroke shadow-inner">
              <h4 className="text-xs font-black uppercase text-gray-400 mb-4">Success Probability</h4>
              <span className="text-8xl font-black text-primary">{analysisData.score}%</span>
           </div>
           <div className="bg-black p-8 rounded-lg shadow-2xl relative min-h-[300px]">
              <h4 className="text-xs font-black uppercase text-blue-400 tracking-[0.3em] mb-6 border-b border-white/10 pb-2">Market Comps</h4>
              {renderMarketComps()}
           </div>
        </div>

        <div className="mb-12">
           <h3 className="mb-4 text-xs font-black uppercase text-primary tracking-widest">Executive Analysis</h3>
           <div className="text-lg leading-loose font-serif italic bg-gray-50 dark:bg-meta-4 p-10 rounded border-l-8 border-primary">{analysisData.summary}</div>
        </div>

        <div>
           <h3 className="mb-4 text-xs font-black uppercase text-gray-400 tracking-widest">Strategic Recommendations</h3>
           <div className="bg-gray-100 dark:bg-meta-4 p-10 rounded border-l-8 border-black font-semibold">{analysisData.recommendations}</div>
        </div>
      </div>
    </>
  );
};

export default EstimatorDetail;