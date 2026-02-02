import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
// Note: Ensure feather-icons is installed via npm to render icons properly
import { Play, FileText, CheckCircle, AlertTriangle } from 'react-feather';

type WorkflowStatus = 'idle' | 'uploading' | 'queued' | 'complete' | 'error';

const CoverageReport: React.FC = () => {
  /* =========================
      STATE & CONFIG
  ========================= */
  const [reportType, setReportType] = useState('Full Script');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<WorkflowStatus>('idle');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentAuditId, setCurrentAuditId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const [userDetails, setUserDetails] = useState({
    projectName: '',
    userName: '',
    userEmail: '',
    userRole: 'Executive',
  });

  const generateMasterId = () => {
    try { 
        return window.crypto.randomUUID(); 
    } catch (e) {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'queued' && currentAuditId) {
      const timeout = setTimeout(() => {
        interval = setInterval(async () => {
          try {
            const res = await fetch(`https://jdig9yqazd.execute-api.us-east-1.amazonaws.com/prod/get-audit?auditId=${currentAuditId}`);
            if (res.status === 404) return; 
            
            const data = await res.json();
            const payload = typeof data.body === 'string' ? JSON.parse(data.body) : data;
            
            if (payload.status === 'COMPLETED') {
              setProgress(100);
              setStatus('complete');
              clearInterval(interval);
            } else {
              setProgress((prev) => (prev < 95 ? prev + 1 : prev));
            }
          } catch (e) { console.error("Sync error:", e); }
        }, 5000);
      }, 3000);

      return () => {
        clearTimeout(timeout);
        if (interval) clearInterval(interval);
      };
    }
  }, [status, currentAuditId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true); 
    setStatus('uploading');
    setProgress(5);
    
    const masterId = generateMasterId();
    setCurrentAuditId(masterId);

    try {
      const uploadUrlRes = await fetch('https://jdig9yqazd.execute-api.us-east-1.amazonaws.com/prod/get-upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: `${masterId}-${selectedFile.name}`, reportType }),
      });
      const { uploadUrl, key } = await uploadUrlRes.json();

      const contentType = selectedFile.name.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf';
      await fetch(uploadUrl, { method: 'PUT', body: selectedFile, headers: { 'Content-Type': contentType } });

      const analysisRes = await fetch('https://jdig9yqazd.execute-api.us-east-1.amazonaws.com/prod/coverage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ auditId: masterId, s3Key: key, reportType, ...userDetails }),
      });

      if (analysisRes.ok) {
        setStatus('queued'); 
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Workflow disruption.');
      setStatus('error');
    } finally { 
      setLoading(false); 
    }
  };

  const cardClass = 'rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6';
  
  // Custom required asterisk component
  const RequiredIcon = () => (
    <span className="text-red-500 text-xl font-bold ml-1 leading-none">*</span>
  );

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="h-20 w-20 animate-spin rounded-full border-4 border-meta-3 border-t-transparent shadow-2xl"></div>
          <h2 className="mt-6 text-3xl font-black text-white uppercase tracking-tighter">Initializing Creative Engine</h2>
          <p className="mt-2 text-white/70 italic font-serif">Deploying Verdict AI analysis layers...</p>
        </div>
      )}

      <Breadcrumb pageName="Coverage Report" />
      
      <div className="mx-auto w-full">
        
        {/* Intelligence Parameters */}
        <div className={cardClass}>
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark bg-meta-4">
            <h3 className="font-bold text-white text-xl uppercase tracking-tight">
              Intelligence Parameters
            </h3>
          </div>
          <div className="p-6.5 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="font-black text-meta-3 uppercase text-sm">Full Script Analysis</h4>
              <p className="text-black dark:text-white text-sm leading-relaxed opacity-80">
                A comprehensive diagnostic of feature-length screenplays. Evaluates narrative 
                pacing, dialogue authenticity, and character arcs.
              </p>
            </div>
            <div className="space-y-3 border-t md:border-t-0 md:border-l border-stroke pl-0 md:pl-8 dark:border-strokedark pt-6 md:pt-0">
              <h4 className="font-black text-meta-3 uppercase text-sm">Development Treatment</h4>
              <p className="text-black dark:text-white text-sm leading-relaxed opacity-80">
                Concepts are audited for structural soundness before draft phase.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Banner */}
        {(status === 'queued' || status === 'complete') && (
          <div className="mb-6 rounded-sm border border-stroke bg-white p-8 shadow-default dark:border-strokedark dark:bg-boxdark text-center">
            <h3 className={`text-xl font-black uppercase tracking-widest ${status === 'complete' ? 'text-success' : 'text-meta-3'}`}>
              {status === 'complete' ? 'Executive Verdict Ready' : 'Creative Intelligence Auditing'}
            </h3>
            <div className="mt-6 h-4 w-full rounded-full bg-gray-2 dark:bg-meta-4">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${status === 'complete' ? 'bg-success' : 'bg-meta-3 animate-pulse'}`} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Submission Portal Form */}
        <form onSubmit={handleSubmit} className={cardClass}>
           <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
             <h3 className="font-medium text-black dark:text-white uppercase text-sm text-center tracking-widest">
               Submission Portal
             </h3>
           </div>
           <div className="p-6.5 flex flex-col gap-6">
             <div>
               <label className="mb-3 block text-black dark:text-white font-bold uppercase text-xs tracking-widest flex items-center">
                 Project Title <RequiredIcon />
               </label>
               <input required name="projectName" placeholder="Enter title" value={userDetails.projectName} onChange={(e) => setUserDetails({...userDetails, projectName: e.target.value})} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none focus:border-meta-3 dark:border-form-strokedark" />
             </div>

             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
               <div>
                   <label className="mb-3 block text-black dark:text-white font-bold uppercase text-xs tracking-widest flex items-center">
                     Name <RequiredIcon />
                   </label>
                   <input required value={userDetails.userName} onChange={(e) => setUserDetails({...userDetails, userName: e.target.value})} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none focus:border-meta-3" />
               </div>
               <div>
                   <label className="mb-3 block text-black dark:text-white font-bold uppercase text-xs tracking-widest flex items-center">
                     Email Address <RequiredIcon />
                   </label>
                   <input required type="email" value={userDetails.userEmail} onChange={(e) => setUserDetails({...userDetails, userEmail: e.target.value})} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none focus:border-meta-3" />
               </div>
             </div>

             <div>
               <label className="mb-3 block text-black dark:text-white font-bold uppercase text-xs tracking-widest flex items-center">
                 Asset Category <RequiredIcon />
               </label>
               <div className="flex gap-8 p-4 rounded-lg bg-gray-2 dark:bg-meta-4">
                 {['Full Script', 'Treatment'].map((t) => (
                   <label key={t} className="flex items-center gap-3 text-xs font-black uppercase cursor-pointer text-black dark:text-white hover:text-meta-3 transition-colors">
                       <input type="radio" checked={reportType === t} onChange={() => setReportType(t)} className="form-radio text-meta-3 h-5 w-5" />{t}
                   </label>
                 ))}
               </div>
             </div>

             <div>
               <label className="mb-3 block text-black dark:text-white font-bold uppercase text-xs tracking-widest flex items-center">
                 Upload PDF or DOCX <RequiredIcon />
               </label>
               <div className="relative">
                 <input required type="file" accept=".pdf,.docx" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent font-medium outline-none transition file:mr-5 file:py-3 file:px-5 file:border-0 file:bg-meta-3 file:text-white file:hover:bg-opacity-90 dark:border-strokedark" />
                 <FileText className="absolute right-4 top-1/2 -translate-y-1/2 text-black/20" size={20} />
               </div>
             </div>

             {/* GREEN BUTTON WITH ICON */}
             <button 
              type="submit" 
              disabled={loading} 
              className="w-full rounded bg-meta-3 p-4 font-black text-white uppercase tracking-widest hover:bg-opacity-90 shadow-lg disabled:bg-opacity-50 transition-all mt-4 flex items-center justify-center gap-3"
             >
               <Play size={20} fill="currentColor" />
               START EXECUTIVE ANALYSIS
             </button>

             {status === 'error' && (
               <div className="mt-4 flex items-center gap-2 justify-center text-red-500 font-bold uppercase text-xs">
                 <AlertTriangle size={16} />
                 {errorMessage}
               </div>
             )}
           </div>
        </form>
      </div>
    </>
  );
};

export default CoverageReport;