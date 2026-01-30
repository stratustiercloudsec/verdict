import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

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

  /* =========================
      ID HANDSHAKE GENERATOR
  ========================= */
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

  /* =========================
      LIVE POLLING ENGINE
      Fixes 404 by adding a delay before the first poll
  ========================= */
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'queued' && currentAuditId) {
      // Delay first poll by 3 seconds to allow DB propagation
      const timeout = setTimeout(() => {
        interval = setInterval(async () => {
          try {
            const res = await fetch(`https://jdig9yqazd.execute-api.us-east-1.amazonaws.com/prod/get-audit?auditId=${currentAuditId}`);
            if (res.status === 404) return; // Silent skip if DB record is still settling
            
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

  /* =========================
      SUBMISSION HANDLER
  ========================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true); // Triggers Full-Page Loader
    setStatus('uploading');
    setProgress(5);
    
    const masterId = generateMasterId();
    setCurrentAuditId(masterId);

    try {
      // 1. Authorize Upload
      const uploadUrlRes = await fetch('https://jdig9yqazd.execute-api.us-east-1.amazonaws.com/prod/get-upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: `${masterId}-${selectedFile.name}`, reportType }),
      });
      const { uploadUrl, key } = await uploadUrlRes.json();

      // 2. S3 Asset Storage
      const contentType = selectedFile.name.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf';
      await fetch(uploadUrl, { method: 'PUT', body: selectedFile, headers: { 'Content-Type': contentType } });

      // 3. Trigger Analysis Worker
      const analysisRes = await fetch('https://jdig9yqazd.execute-api.us-east-1.amazonaws.com/prod/coverage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ auditId: masterId, s3Key: key, reportType, ...userDetails }),
      });

      if (analysisRes.ok) {
        setStatus('queued'); // Moves from Loader to Progress Banner
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Workflow disruption.');
      setStatus('error');
    } finally { 
      setLoading(false); 
    }
  };

  const cardClass = 'rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-9';
  const labelClass = 'mb-3 block text-black dark:text-white font-bold uppercase text-xs tracking-widest';

  return (
    <>
      {/* RESTORED: FULL PAGE LOADER */}
      {loading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="h-20 w-20 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-2xl"></div>
          <h2 className="mt-6 text-3xl font-black text-white uppercase tracking-tighter">Initializing Creative Engine</h2>
          <p className="mt-2 text-white/70 italic font-serif">Securing executive asset and deploying AI analysis layers...</p>
        </div>
      )}

      <Breadcrumb pageName="Coverage Report" />
      <div className="mx-auto max-w-270">
        
        {/* DESCRIPTIONS */}
        <div className={cardClass}>
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-bold text-black dark:text-white text-xl uppercase tracking-tight">Professional Script & Development Coverage</h3>
          </div>
          <div className="p-6.5 space-y-4 text-black dark:text-white text-sm italic opacity-80">
            <p>Full Script Analysis: Deep-dive narrative evaluation and marketability for features.</p>
            <p className="border-t border-stroke pt-4 dark:border-strokedark">Development Treatment: Evaluates story beats to determine concept readiness.</p>
          </div>
        </div>

        {/* PROGRESS BANNER */}
        {(status === 'queued' || status === 'complete') && (
          <div className="mb-9 rounded-sm border border-stroke bg-white p-8 shadow-default dark:border-strokedark dark:bg-boxdark text-center">
            <h3 className={`text-xl font-black uppercase tracking-widest ${status === 'complete' ? 'text-success' : 'text-primary'}`}>
              {status === 'complete' ? 'Executive Verdict Ready' : 'Creative Intelligence Auditing'}
            </h3>
            <div className="mt-6 h-4 w-full rounded-full bg-gray-2 dark:bg-meta-4">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${status === 'complete' ? 'bg-success' : 'bg-primary animate-pulse'}`} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="mt-4 text-sm font-medium">
              {status === 'complete' ? `Analysis for "${userDetails.projectName}" finalized.` : `Step 3/3: The engine is auditing "${userDetails.projectName}"...`}
            </p>
          </div>
        )}

        {/* SUBMISSION PORTAL */}
        <form onSubmit={handleSubmit} className={cardClass}>
           <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark"><h3 className="font-medium text-black dark:text-white uppercase text-sm text-center tracking-widest">Submission Portal</h3></div>
           <div className="p-6.5 flex flex-col gap-5.5">
              <div>
                <label className={labelClass}>Project Title*</label>
                <input required name="projectName" placeholder="Enter title" value={userDetails.projectName} onChange={(e) => setUserDetails({...userDetails, projectName: e.target.value})} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none focus:border-primary dark:border-form-strokedark" />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label className={labelClass}>Name*</label>
                    <input required value={userDetails.userName} onChange={(e) => setUserDetails({...userDetails, userName: e.target.value})} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5" />
                </div>
                <div>
                    <label className={labelClass}>Email Address*</label>
                    <input required type="email" value={userDetails.userEmail} onChange={(e) => setUserDetails({...userDetails, userEmail: e.target.value})} className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Asset Category*</label>
                <div className="flex gap-4 p-4 rounded-lg bg-gray-2 dark:bg-meta-4">
                  {['Full Script', 'Treatment'].map((t) => (
                    <label key={t} className="flex items-center gap-2 text-xs font-black uppercase cursor-pointer text-black dark:text-white">
                        <input type="radio" checked={reportType === t} onChange={() => setReportType(t)} className="form-radio text-primary h-4 w-4" />{t}
                    </label>
                  ))}
                </div>
              </div>

              {/* RESTORED: FILE UPLOAD */}
              <div>
                <label className={labelClass}>Upload PDF or DOCX*</label>
                <input required type="file" accept=".pdf,.docx" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent font-medium outline-none transition file:mr-5 file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 dark:border-strokedark dark:file:bg-white/10 dark:file:text-white" />
              </div>

              <button type="submit" disabled={loading} className="w-full rounded bg-primary p-4 font-black text-white uppercase tracking-widest hover:bg-opacity-90 shadow-lg disabled:bg-opacity-50 transition-all">
                START EXECUTIVE ANALYSIS
              </button>
              {status === 'error' && <p className="mt-2 text-center text-red-500 font-bold uppercase text-xs">{errorMessage}</p>}
           </div>
        </form>
      </div>
    </>
  );
};

export default CoverageReport;