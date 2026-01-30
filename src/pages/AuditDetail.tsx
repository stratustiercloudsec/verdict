import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ASSET: Your master agency branding icon
import Logo from '../images/logo/verdict_logo_white.png';

const AuditDetail: React.FC = () => {
  const params = useParams();
  const auditId = params.id || (params as any).auditId;
  const reportRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const formatProjectTitle = (str: string) => {
    if (!str) return 'Untitled Project';
    const nameWithoutUUID = str.replace(/^[0-9a-fA-F-]{36}-/, '');
    const nameWithoutExtension = nameWithoutUUID.split('.').slice(0, -1).join('.') || nameWithoutUUID;
    return nameWithoutExtension.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // UPDATE: Verdict Color Logic - Default changed to GREEN
  const getVerdictStyle = (rec: string) => {
    if (rec === 'Recommend') return 'border-meta-3 text-meta-3'; // Green
    if (rec === 'Consider') return 'border-warning text-warning'; // Orange
    if (rec === 'Not Recommended') return 'border-danger text-danger'; // Red
    // REQUESTED CHANGE: Default catch-all is now GREEN instead of RED
    return 'border-meta-3 text-meta-3'; 
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Verdict_Report_${data.projectName?.replace(/\s+/g, '_')}.pdf`);
    } catch (err) { console.error('Export failed:', err); } finally { setIsExporting(false); }
  };

  useEffect(() => {
    if (!auditId) { setError('Missing audit ID.'); setLoading(false); return; }
    const fetchDetail = async () => {
      try {
        const response = await fetch(`https://jdig9yqazd.execute-api.us-east-1.amazonaws.com/prod/get-audit?auditId=${auditId}`);
        const raw = await response.json();
        let payload = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw;
        const cleanName = formatProjectTitle(payload.title || payload.projectName || payload.fileName);
        setData({ ...payload, projectName: cleanName });
      } catch (err: any) { setError('Failed to load audit data.'); } finally { setLoading(false); }
    };
    fetchDetail();
  }, [auditId]);

  if (loading) return <div className="p-10 text-center animate-pulse italic text-primary">Assembling Creative Intelligence...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Breadcrumb pageName={`Project: ${data.projectName}`} />
        <button onClick={handleExportPDF} className="rounded-md bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90 shadow-lg transition-all">
          {isExporting ? 'Generating PDF...' : 'Export to PDF'}
        </button>
      </div>

      <div ref={reportRef} className="mx-auto max-w-270 bg-white dark:bg-boxdark p-10 rounded-sm shadow-xl border border-stroke dark:border-strokedark">
        
        {/* UPDATE: Header now uses only the logo, removing the text "VERDICT" */}
        <div className="flex justify-between items-start mb-10 border-b-2 border-primary pb-8">
            <div className="flex items-center gap-4">
                <div className="h-20 w-auto bg-black p-3 flex items-center justify-center rounded-lg shadow-lg">
                    <img src={Logo} alt="Verdict Creative Intelligence" className="h-full w-auto object-contain" />
                </div>
            </div>
            <div className="text-right">
                {/* UPDATE: Verdict badge now defaults to GREEN */}
                <div className={`mb-3 inline-block px-4 py-1.5 rounded-sm text-xs font-black uppercase tracking-widest border-2 shadow-sm ${getVerdictStyle(data.recommendation)}`}>
                    Executive Verdict: {data.recommendation || 'PASS'}
                </div>
                <p className="text-[9px] uppercase font-black text-gray-400">Official Report ID: {auditId.substring(0, 8)}</p>
                <p className="text-[10px] font-medium text-gray-500 mt-1">{new Date(data.timestamp || Date.now()).toLocaleDateString()}</p>
            </div>
        </div>

        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-black dark:text-white uppercase mb-2 tracking-tight">{data.projectName}</h1>
          <div className="h-1.5 w-24 bg-primary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-10">
          <div className="rounded-lg border-2 border-stroke bg-gray-50 p-6 text-center dark:border-strokedark dark:bg-meta-4 shadow-sm">
            <h4 className="text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">Creative Score</h4>
            <span className="text-5xl font-black text-meta-3">{data.score ?? 0}%</span>
          </div>
          <div className="rounded-lg border-2 border-stroke bg-gray-50 p-6 text-center dark:border-strokedark dark:bg-meta-4 shadow-sm">
            <h4 className="text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">Lead Writer</h4>
            <span className="text-xs font-black text-black dark:text-white uppercase leading-tight block">{data.writer || data.author || "Unknown"}</span>
          </div>
          <div className="rounded-lg border-2 border-stroke bg-gray-50 p-6 text-center dark:border-strokedark dark:bg-meta-4 shadow-sm">
            <h4 className="text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">Character Count</h4>
            {/* This will display the correct number once the backend is updated and a new file is processed */}
            <span className="text-4xl font-black text-primary uppercase">{data.character_count || 0}</span>
          </div>
          <div className="rounded-lg border-2 border-stroke bg-gray-50 p-6 text-center dark:border-strokedark dark:bg-meta-4 shadow-sm">
            <h4 className="text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">Primary Tone</h4>
            <span className="text-[11px] font-black text-primary uppercase leading-tight block">{data.tone || "N/A"}</span>
          </div>
        </div>

        <div className="mb-12">
          <h3 className="mb-6 text-xs font-black uppercase tracking-[0.2em] border-b-2 border-stroke pb-2 text-black dark:text-white dark:border-strokedark">1.0 Executive Analysis Summary & Synopsis</h3>
          <div className="whitespace-pre-wrap text-black dark:text-white leading-loose text-md font-serif italic bg-gray-50 dark:bg-meta-4 p-10 rounded-md border-l-8 border-primary shadow-inner antialiased">
            {data.analysisText || data.synopsis || 'Finalizing synthesis...'}
          </div>
        </div>

        <div className="space-y-12">
          <div>
            <h3 className="mb-6 text-xs font-black uppercase tracking-[0.2em] border-b-2 border-stroke pb-2 text-black dark:text-white dark:border-strokedark">2.0 Narrative Structure</h3>
            <div className="mb-8 bg-black text-white p-8 rounded-md shadow-xl">
                <span className="text-[9px] font-black uppercase text-primary mb-2 block tracking-widest">Executive Logline</span>
                <p className="text-xl font-bold italic leading-tight">"{data.logline || 'Pending...'}"</p>
            </div>
          </div>
          {data.characters && data.characters.length > 0 && (
            <div className="pt-6">
              <span className="text-[9px] font-black uppercase text-gray-400 mb-6 block tracking-widest">Principal Character Breakdown</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.characters.map((char: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-primary pl-4 py-1">
                    <p className="text-sm font-black uppercase text-black dark:text-white mb-1">{char.name}</p>
                    <p className="text-xs text-gray-500 leading-normal">{char.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="mb-6 text-xs font-black uppercase tracking-[0.2em] border-b-2 border-stroke pb-2 text-black dark:text-white dark:border-strokedark">3.0 Strategic Intelligence</h3>
            <div className="bg-gray-100 dark:bg-meta-4 p-8 rounded-md border-l-8 border-black shadow-sm">
                <span className="text-[9px] font-black uppercase text-gray-500 mb-4 block tracking-widest">Editorial & Market Comments</span>
                <p className="text-black dark:text-white text-sm leading-relaxed font-semibold italic antialiased">{data.comments || "Critique finalizing..."}</p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-stroke text-center dark:border-strokedark opacity-40">
            <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">© 2026 Verdict Creative Intelligence • Private & Confidential • Official Document</p>
        </div>
      </div>
    </>
  );
};

export default AuditDetail;