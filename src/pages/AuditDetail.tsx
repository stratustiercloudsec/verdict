import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Download, FileText, AlertTriangle, TrendingUp,
  Users, DollarSign, Film, CheckCircle, RefreshCw
} from 'react-feather';

import Logo from '../images/logo/verdict_logo_white.png';

// ─── Interfaces — aligned to new worker output schema ────────────────────────

// Section 3: Characters
interface Character {
  name: string;
  role: string;           // Protagonist | Antagonist | Supporting | Minor
  arc: string;
  castability: string;    // e.g. "A-List star vehicle"
  screen_time: string;    // Lead | Major | Supporting | Minor
}

// Section 5: Risk Matrix (array of risk items)
interface RiskItem {
  category: string;       // Narrative | Financial | Market | Production | Legal | Talent
  description: string;
  severity: string;       // High | Medium | Low
  mitigation: string;
}

// Section 6: Production Costs (string-value object)
interface ProductionCosts {
  above_the_line: string;
  below_the_line: string;
  post_production: string;
  marketing_p_and_a: string;
  total_estimated_budget: string;
  budget_tier: string;    // Micro | Low | Mid | High | Tentpole
}

// Section 7: Revenue Projections (string-value object)
interface RevenueProjections {
  domestic_box_office: string;
  international_box_office: string;
  streaming_rights: string;
  ancillary: string;
  total_projected_revenue: string;
  roi_outlook: string;    // Strong | Moderate | Marginal | At-Risk
}

// Section 8: Comparable Films
interface ComparableFilm {
  title: string;
  year: string;
  box_office: string;
  budget: string;
  why_comparable: string;
}

// Section 9: Greenlight Conditions
interface GreenlightCondition {
  condition: string;
  priority: string;       // Must-Have | High | Medium
  rationale: string;
}

// Section 10: Market Timing
interface MarketTiming {
  optimal_release_window: string;
  release_strategy: string;
  deal_structure_recommendation: string;
  competitive_window_analysis: string;
  urgency: string;        // Act Now | 6-12 Months | 12-24 Months | No Time Pressure
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const safeParse = <T,>(val: any, fallback: T): T => {
  if (!val) return fallback;
  if (typeof val === 'object') return val as T;
  try { return JSON.parse(val) as T; } catch { return fallback; }
};

// ─── Shared UI primitives ─────────────────────────────────────────────────────

const SectionHeader: React.FC<{ number: string; title: string; icon?: React.ReactNode }> = ({ number, title, icon }) => (
  <h3 className="mb-6 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] border-b-2 border-meta-3 pb-2 text-black dark:text-white">
    {icon && <span className="text-meta-3">{icon}</span>}
    <span>{number} — {title}</span>
  </h3>
);

const PendingSection: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex items-center gap-3 bg-gray-50 dark:bg-meta-4 border border-dashed border-gray-300 dark:border-strokedark rounded-md px-6 py-8">
    <RefreshCw size={16} className="text-gray-400 shrink-0" />
    <p className="text-xs text-gray-400 italic">
      {message || 'This section requires the updated analysis engine. Re-run the audit to generate this data.'}
    </p>
  </div>
);

const SeverityBadge: React.FC<{ level: string }> = ({ level }) => {
  const norm = level?.toUpperCase();
  const styles: Record<string, string> = {
    LOW:    'bg-meta-3 text-white',
    MEDIUM: 'bg-warning text-white',
    HIGH:   'bg-danger text-white',
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest ${styles[norm] || 'bg-gray-300 text-gray-600'}`}>
      {level || '—'}
    </span>
  );
};

const PriorityBadge: React.FC<{ level: string }> = ({ level }) => {
  const norm = level?.toUpperCase();
  const styles: Record<string, string> = {
    'MUST-HAVE': 'bg-danger text-white',
    'HIGH':      'bg-warning text-white',
    'MEDIUM':    'bg-primary text-white',
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest ${styles[norm] || 'bg-gray-300 text-gray-600'}`}>
      {level || '—'}
    </span>
  );
};

const UrgencyBadge: React.FC<{ level: string }> = ({ level }) => {
  const norm = level?.toUpperCase();
  const styles: Record<string, string> = {
    'ACT NOW':          'border-danger text-danger',
    '6-12 MONTHS':      'border-warning text-warning',
    '12-24 MONTHS':     'border-primary text-primary',
    'NO TIME PRESSURE': 'border-meta-3 text-meta-3',
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border-2 ${styles[norm] || 'border-gray-400 text-gray-400'}`}>
      {level || '—'}
    </span>
  );
};

const ROIBadge: React.FC<{ level: string }> = ({ level }) => {
  const norm = level?.toUpperCase();
  const styles: Record<string, string> = {
    'STRONG':   'bg-meta-3 text-white',
    'MODERATE': 'bg-warning text-white',
    'MARGINAL': 'bg-orange-400 text-white',
    'AT-RISK':  'bg-danger text-white',
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest ${styles[norm] || 'bg-gray-300 text-gray-600'}`}>
      {level || '—'}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AuditDetail: React.FC = () => {
  const { auditId } = useParams<{ auditId: string }>();
  const reportRef   = useRef<HTMLDivElement>(null);

  const [data, setData]               = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const formatProjectTitle = (str: string) => {
    if (!str) return 'Untitled Project';
    const nameWithoutUUID = str.replace(/^[0-9a-fA-F-]{36}-/, '');
    const nameWithoutExt  = nameWithoutUUID.split('.').slice(0, -1).join('.') || nameWithoutUUID;
    return nameWithoutExt.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getVerdictStyle = (rec: string) => {
    if (['Recommend', 'GREENLIGHT'].includes(rec)) return 'border-meta-3 text-meta-3';
    if (['Consider',  'CONSIDER'  ].includes(rec)) return 'border-warning text-warning';
    if (['Not Recommended', 'PASS'].includes(rec)) return 'border-danger text-danger';
    return 'border-meta-3 text-meta-3';
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      // ── Step 1: render the full report to a high-res canvas ──────────────
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        // Expand to full scrollable height so nothing is clipped
        windowHeight: reportRef.current.scrollHeight,
      });

      const pdf         = new jsPDF('p', 'mm', 'a4');
      const pageW_mm    = pdf.internal.pageSize.getWidth();   // 210mm
      const pageH_mm    = pdf.internal.pageSize.getHeight();  // 297mm

      // ── Step 2: figure out how tall one PDF page is in canvas pixels ─────
      // canvas.width  px  =  pageW_mm  mm
      // so 1 px = pageW_mm / canvas.width mm
      // one page height in px = pageH_mm / (pageW_mm / canvas.width)
      const pxPerMm      = canvas.width / pageW_mm;
      const pageH_px     = Math.floor(pageH_mm * pxPerMm);
      const totalPages   = Math.ceil(canvas.height / pageH_px);

      // ── Step 3: slice canvas into A4 strips and add each as a page ───────
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();

        // Height of this strip (last page may be shorter)
        const srcY      = page * pageH_px;
        const srcH      = Math.min(pageH_px, canvas.height - srcY);
        const destH_mm  = srcH / pxPerMm;

        // Draw only the slice we need onto a temporary canvas
        const strip        = document.createElement('canvas');
        strip.width        = canvas.width;
        strip.height       = srcH;
        const ctx          = strip.getContext('2d')!;
        ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

        const stripData = strip.toDataURL('image/png');
        pdf.addImage(stripData, 'PNG', 0, 0, pageW_mm, destH_mm);
      }

      pdf.save(`Verdict_Coverage_${data.projectName?.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (!auditId) { setError('Missing audit ID.'); setLoading(false); return; }
    (async () => {
      try {
        const res     = await fetch(`https://jdig9yqazd.execute-api.us-east-1.amazonaws.com/prod/get-audit?auditId=${auditId}`);
        const raw     = await res.json();
        const payload = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw;
        const name    = formatProjectTitle(payload.title || payload.projectName || payload.fileName || '');
        setData({ ...payload, projectName: name });
      } catch { setError('Failed to load audit data.'); }
      finally  { setLoading(false); }
    })();
  }, [auditId]);

  // ── Loading / status gates ─────────────────────────────────────────────────
  if (loading) return (
    <div className="p-10 text-center animate-pulse italic text-meta-3 font-black uppercase">
      Assembling Creative Intelligence...
    </div>
  );
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;

  if (!data || data.status === 'QUEUED' || data.status === 'PROCESSING') return (
    <div className="flex flex-col items-center justify-center p-20 gap-6">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-meta-3 border-t-transparent" />
      <h2 className="text-xl font-black uppercase tracking-widest text-meta-3">Analysis In Progress</h2>
      <p className="text-sm text-bodydark italic text-center max-w-md">
        The AI engine is processing this submission — typically 60–90 seconds.
      </p>
      <p className="text-xs font-mono text-gray-400">Audit ID: {auditId}</p>
    </div>
  );

  if (data.status === 'FAILED') return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <h2 className="text-xl font-black uppercase tracking-widest text-red-500">Analysis Failed</h2>
      <p className="text-sm text-bodydark italic text-center max-w-md">
        {data.errorMessage || 'An error occurred. Please resubmit.'}
      </p>
      <p className="text-xs font-mono text-gray-400">Audit ID: {auditId}</p>
    </div>
  );

  // ── Deserialise DynamoDB fields — matched to new worker schema ─────────────
  const characters        = safeParse<Character[]>(data.characters, []);
  const riskMatrix        = safeParse<RiskItem[]>(data.risk_matrix, []);
  const productionCosts   = safeParse<ProductionCosts>(data.production_costs, {} as ProductionCosts);
  const revenueProjections = safeParse<RevenueProjections>(data.revenue_projections, {} as RevenueProjections);
  const comparableFilms   = safeParse<ComparableFilm[]>(data.comparable_films, []);
  const greenlightConds   = safeParse<GreenlightCondition[]>(data.greenlight_conditions, []);
  const marketTiming      = safeParse<MarketTiming>(data.market_timing, {} as MarketTiming);
  const recommendation    = data.verdict || data.recommendation || '';

  // Section presence flags
  const hasChars      = characters.length > 0;
  const hasRisk       = riskMatrix.length > 0;
  const hasCosts      = !!productionCosts.total_estimated_budget;
  const hasRevenue    = !!revenueProjections.total_projected_revenue;
  const hasComps      = comparableFilms.length > 0;
  const hasGreenlight = greenlightConds.length > 0;
  const hasMarket     = !!marketTiming.optimal_release_window;

  return (
    <>
      <Breadcrumb pageName={`Coverage: ${data.projectName}`} />

      {/* ── Action bar ────────────────────────────────────────────────────── */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 bg-meta-3 text-white px-6 py-3 rounded font-black uppercase text-xs tracking-widest hover:bg-opacity-90 shadow-lg transition-all disabled:bg-opacity-50"
        >
          <Download size={16} />
          {isExporting ? 'Generating PDF...' : 'Export Executive Coverage PDF'}
        </button>
      </div>

      <div
        ref={reportRef}
        className="w-full bg-white dark:bg-boxdark p-10 rounded-sm shadow-xl border border-stroke dark:border-strokedark mb-10"
      >

        {/* ── Document header ────────────────────────────────────────────── */}
        <div className="flex justify-between items-start mb-10 border-b-2 border-meta-3 pb-8">
          <div className="h-20 w-auto bg-black p-3 flex items-center justify-center rounded-lg shadow-lg">
            <img src={Logo} alt="Verdict" className="h-full w-auto object-contain" />
          </div>
          <div className="text-right">
            <div className={`mb-3 inline-block px-4 py-1.5 rounded-sm text-xs font-black uppercase tracking-widest border-2 shadow-sm ${getVerdictStyle(recommendation)}`}>
              Executive Verdict: {recommendation || 'PENDING'}
            </div>
            <p className="text-[9px] uppercase font-black text-gray-400">Official Audit ID: {auditId?.substring(0, 8)}</p>
            <p className="text-[10px] font-medium text-gray-500 mt-1">
              {new Date(data.timestamp || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* ── Title ─────────────────────────────────────────────────────── */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-black text-black dark:text-white uppercase mb-2 tracking-tighter">
            {data.projectName}
          </h1>
          <div className="h-1.5 w-32 bg-meta-3 mx-auto" />
        </div>

        {/* ── Metrics row ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5 mb-12">
          {[
            { label: 'Creative Score', value: `${data.score ?? 0}%`, big: true },
            { label: 'Lead Writer',    value: data.writer || data.author || 'Unknown' },
            { label: 'Characters',     value: hasChars ? String(characters.length) : (data.character_count || '—') },
            { label: 'Primary Tone',   value: data.tone || 'N/A' },
            { label: 'Budget Tier',    value: productionCosts?.budget_tier || 'TBD' },
          ].map(({ label, value, big }: any) => (
            <div key={label} className="rounded-lg border-2 border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4 p-5 text-center flex flex-col justify-center shadow-sm">
              <h4 className="text-[9px] font-black uppercase text-gray-500 mb-2 tracking-widest">{label}</h4>
              <span className={`font-black text-meta-3 uppercase leading-tight ${big ? 'text-4xl' : 'text-sm'}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════
            1.0  EXECUTIVE ANALYSIS SUMMARY
        ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <SectionHeader number="1.0" title="Executive Analysis Summary & Synopsis" icon={<FileText size={14} />} />
          <div className="whitespace-pre-wrap text-black dark:text-white leading-loose text-lg font-serif italic bg-gray-50 dark:bg-meta-4 p-10 rounded-md border-l-8 border-meta-3 shadow-inner">
            {data.summary || data.analysisText || data.synopsis || 'Finalizing synthesis...'}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            2.0  NARRATIVE STRUCTURE
        ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <SectionHeader number="2.0" title="Narrative Structure" icon={<Film size={14} />} />

          {/* Logline */}
          <div className="mb-6 bg-black text-white p-10 rounded-md shadow-xl border-l-8 border-meta-3">
            <span className="text-[9px] font-black uppercase text-meta-3 mb-4 block tracking-widest">Executive Logline</span>
            <p className="text-2xl font-bold italic leading-relaxed">"{data.logline || 'Pending...'}"</p>
          </div>

          {/* Investment Thesis */}
          <div className="mb-6">
            {data.investment_thesis ? (
              <div className="bg-gray-100 dark:bg-meta-4 p-8 rounded-md border-l-8 border-primary shadow-sm">
                <span className="text-[9px] font-black uppercase text-primary mb-3 block tracking-widest">Investment Thesis</span>
                <p className="text-black dark:text-white text-base leading-relaxed font-semibold whitespace-pre-line">
                  {data.investment_thesis}
                </p>
              </div>
            ) : (
              <PendingSection message="Investment thesis not available — re-run audit with the updated worker." />
            )}
          </div>

          {/* Market Position */}
          {data.market_position ? (
            <div className="bg-gray-50 dark:bg-meta-4 p-8 rounded-md border-l-8 border-gray-300 shadow-sm">
              <span className="text-[9px] font-black uppercase text-gray-500 mb-3 block tracking-widest">Market Position</span>
              <p className="text-black dark:text-white text-base leading-relaxed italic whitespace-pre-line">
                {data.market_position}
              </p>
            </div>
          ) : (
            <PendingSection message="Market position not available — re-run audit with the updated worker." />
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            3.0  CHARACTER ANALYSIS
        ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <SectionHeader number="3.0" title="Character Analysis" icon={<Users size={14} />} />
          {hasChars ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {characters.map((char: Character, idx: number) => (
                <div key={idx} className="border border-stroke dark:border-strokedark rounded-lg overflow-hidden shadow-sm">
                  {/* Card header */}
                  <div className="bg-black px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-black uppercase text-sm tracking-wide">{char.name}</p>
                      <p className="text-meta-3 text-[9px] font-bold uppercase tracking-widest mt-0.5">{char.role}</p>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest border border-gray-500 text-gray-300">
                      {char.screen_time}
                    </span>
                  </div>
                  {/* Card body */}
                  <div className="bg-gray-50 dark:bg-meta-4 px-6 py-5 space-y-3">
                    {char.arc && (
                      <div>
                        <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Arc — </span>
                        <span className="text-[11px] font-semibold text-black dark:text-white">{char.arc}</span>
                      </div>
                    )}
                    {char.castability && (
                      <div className="pt-2 border-t border-stroke dark:border-strokedark">
                        <span className="text-[9px] font-black uppercase text-meta-3 tracking-widest block mb-1">Casting Note</span>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">{char.castability}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <PendingSection />
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            4.0  STRATEGIC INTELLIGENCE
        ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <SectionHeader number="4.0" title="Strategic Intelligence" icon={<TrendingUp size={14} />} />

          {/* Talent Assessment */}
          <div className="mb-6">
            {data.talent_assessment ? (
              <div className="bg-gray-50 dark:bg-meta-4 p-8 rounded-md border-l-8 border-meta-3 shadow-sm">
                <span className="text-[9px] font-black uppercase text-gray-500 mb-3 block tracking-widest">Talent Assessment</span>
                <p className="text-black dark:text-white text-base leading-relaxed font-semibold italic whitespace-pre-line">
                  {data.talent_assessment}
                </p>
              </div>
            ) : (
              <PendingSection message="Talent assessment not available — re-run audit with the updated worker." />
            )}
          </div>

          {/* Editorial Comments */}
          <div className="bg-gray-100 dark:bg-meta-4 p-10 rounded-md border-l-8 border-black shadow-sm">
            <span className="text-[9px] font-black uppercase text-gray-500 mb-4 block tracking-widest">
              Editorial & Market Comments
            </span>
            <p className="text-black dark:text-white text-md leading-relaxed font-semibold italic">
              {data.recommendations || data.comments || 'Critique finalizing...'}
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            5.0  RISK MATRIX
        ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <SectionHeader number="5.0" title="Risk Matrix" icon={<AlertTriangle size={14} />} />
          {hasRisk ? (
            <div className="space-y-3">
              {riskMatrix.map((risk: RiskItem, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-5 bg-gray-50 dark:bg-meta-4 px-6 py-5 rounded-md border border-stroke dark:border-strokedark"
                >
                  <div className="shrink-0 pt-0.5">
                    <SeverityBadge level={risk.severity} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">{risk.category}</p>
                    <p className="text-sm text-black dark:text-white font-semibold leading-relaxed mb-2">{risk.description}</p>
                    {risk.mitigation && (
                      <p className="text-xs text-meta-3 italic leading-relaxed">
                        <span className="font-black not-italic">Mitigation: </span>{risk.mitigation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <PendingSection />
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            6.0  POTENTIAL PRODUCTION COSTS
        ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <SectionHeader number="6.0" title="Potential Production Costs" icon={<DollarSign size={14} />} />
          {hasCosts ? (
            <>
              {/* Total banner */}
              <div className="bg-black text-white px-8 py-5 rounded-t-md flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase text-meta-3 tracking-widest mb-1">Estimated Total Budget</p>
                  <p className="text-3xl font-black">{productionCosts.total_estimated_budget}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Budget Tier</p>
                  <span className="inline-block border-2 border-meta-3 text-meta-3 px-4 py-1 text-xs font-black uppercase tracking-widest rounded-sm">
                    {productionCosts.budget_tier || 'TBD'}
                  </span>
                </div>
              </div>

              {/* 4-cell breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 border border-t-0 border-stroke dark:border-strokedark rounded-b-md overflow-hidden">
                {[
                  { label: 'Above-the-Line',  value: productionCosts.above_the_line   },
                  { label: 'Below-the-Line',  value: productionCosts.below_the_line   },
                  { label: 'Post-Production', value: productionCosts.post_production  },
                  { label: 'Marketing P&A',   value: productionCosts.marketing_p_and_a },
                ].map(({ label, value }, i) => (
                  <div key={label} className={`p-6 text-center bg-gray-50 dark:bg-meta-4 ${i < 3 ? 'border-r border-stroke dark:border-strokedark' : ''}`}>
                    <p className="text-[9px] font-black uppercase text-gray-500 mb-2 tracking-widest">{label}</p>
                    <p className="text-lg font-black text-black dark:text-white">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <PendingSection />
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            7.0  REVENUE PROJECTIONS
        ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <SectionHeader number="7.0" title="Revenue Projections" icon={<TrendingUp size={14} />} />
          {hasRevenue ? (
            <>
              {/* Total + ROI banner */}
              <div className="bg-black text-white px-8 py-5 rounded-t-md flex items-center justify-between mb-0">
                <div>
                  <p className="text-[9px] font-black uppercase text-meta-3 tracking-widest mb-1">Total Projected Revenue</p>
                  <p className="text-3xl font-black">{revenueProjections.total_projected_revenue}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-2">ROI Outlook</p>
                  <ROIBadge level={revenueProjections.roi_outlook} />
                </div>
              </div>

              {/* 4-cell revenue breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 border border-t-0 border-stroke dark:border-strokedark rounded-b-md overflow-hidden">
                {[
                  { label: 'Domestic Box Office',      value: revenueProjections.domestic_box_office      },
                  { label: 'International Box Office',  value: revenueProjections.international_box_office },
                  { label: 'Streaming Rights',          value: revenueProjections.streaming_rights         },
                  { label: 'Ancillary',                 value: revenueProjections.ancillary                },
                ].map(({ label, value }, i) => (
                  <div key={label} className={`p-6 text-center bg-gray-50 dark:bg-meta-4 ${i < 3 ? 'border-r border-stroke dark:border-strokedark' : ''}`}>
                    <p className="text-[9px] font-black uppercase text-gray-500 mb-2 tracking-widest">{label}</p>
                    <p className="text-lg font-black text-black dark:text-white">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <PendingSection />
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            8.0  COMPARABLE FILMS
        ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <SectionHeader
            number="8.0"
            title={hasComps ? `Comparable Films (${comparableFilms.length})` : 'Comparable Films'}
            icon={<Film size={14} />}
          />
          {hasComps ? (
            <div className="overflow-hidden rounded-md border border-stroke dark:border-strokedark shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-meta-3 text-white">
                    <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-widest">Title</th>
                    <th className="text-center px-4 py-3 text-[9px] font-black uppercase tracking-widest">Year</th>
                    <th className="text-right px-5 py-3 text-[9px] font-black uppercase tracking-widest">Box Office</th>
                    <th className="text-right px-4 py-3 text-[9px] font-black uppercase tracking-widest hidden md:table-cell">Budget</th>
                    <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-widest hidden lg:table-cell">Why Comparable</th>
                  </tr>
                </thead>
                <tbody>
                  {comparableFilms.map((comp: ComparableFilm, idx: number) => (
                    <tr
                      key={idx}
                      className={`${idx % 2 === 0 ? 'bg-white dark:bg-boxdark' : 'bg-gray-50 dark:bg-meta-4'} border-b border-stroke dark:border-strokedark last:border-b-0`}
                    >
                      <td className="px-5 py-4 font-black text-black dark:text-white text-xs uppercase tracking-wide">{comp.title}</td>
                      <td className="px-4 py-4 text-center text-xs text-gray-500 dark:text-gray-400">{comp.year}</td>
                      <td className="px-5 py-4 text-right font-bold text-meta-3 text-sm whitespace-nowrap">{comp.box_office}</td>
                      <td className="px-4 py-4 text-right text-xs text-gray-500 dark:text-gray-400 hidden md:table-cell">{comp.budget || '—'}</td>
                      <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400 italic hidden lg:table-cell max-w-xs">{comp.why_comparable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <PendingSection />
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            9.0  GREENLIGHT CONDITIONS
        ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <SectionHeader number="9.0" title="Greenlight Conditions" icon={<CheckCircle size={14} />} />
          {hasGreenlight ? (
            <div className="space-y-3">
              {greenlightConds.map((item: GreenlightCondition, idx: number) => (
                <div key={idx} className="flex items-start gap-5 bg-gray-50 dark:bg-meta-4 px-6 py-5 rounded-md border-l-4 border-meta-3">
                  <div className="shrink-0 pt-0.5">
                    <PriorityBadge level={item.priority} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-black dark:text-white font-semibold leading-relaxed mb-1">{item.condition}</p>
                    {item.rationale && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed">{item.rationale}</p>
                    )}
                  </div>
                  <span className="text-meta-3 font-black text-sm shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                </div>
              ))}
            </div>
          ) : (
            <PendingSection />
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            10.0  MARKET TIMING & DEAL STRUCTURE
        ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <SectionHeader number="10.0" title="Market Timing & Deal Structure" />
          {hasMarket ? (
            <>
              {/* Top banner: release window + urgency */}
              <div className="bg-black text-white px-8 py-5 rounded-t-md flex items-center justify-between mb-0">
                <div>
                  <p className="text-[9px] font-black uppercase text-meta-3 tracking-widest mb-1">Optimal Release Window</p>
                  <p className="text-2xl font-black">{marketTiming.optimal_release_window}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-2">Urgency</p>
                  <UrgencyBadge level={marketTiming.urgency} />
                </div>
              </div>

              {/* 3-cell detail grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 border border-t-0 border-stroke dark:border-strokedark rounded-b-md overflow-hidden mb-4">
                <div className="p-6 bg-gray-50 dark:bg-meta-4 border-r border-stroke dark:border-strokedark">
                  <p className="text-[9px] font-black uppercase text-gray-500 mb-2 tracking-widest">Release Strategy</p>
                  <p className="text-sm font-black text-meta-3 uppercase">{marketTiming.release_strategy}</p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-meta-4 border-r border-stroke dark:border-strokedark">
                  <p className="text-[9px] font-black uppercase text-gray-500 mb-2 tracking-widest">Deal Structure</p>
                  <p className="text-sm text-black dark:text-white leading-relaxed">{marketTiming.deal_structure_recommendation}</p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-meta-4">
                  <p className="text-[9px] font-black uppercase text-gray-500 mb-2 tracking-widest">Competitive Window</p>
                  <p className="text-sm text-black dark:text-white leading-relaxed italic">{marketTiming.competitive_window_analysis}</p>
                </div>
              </div>
            </>
          ) : (
            <PendingSection />
          )}
        </div>

        {/* ── Confidential footer ─────────────────────────────────────── */}
        <div className="mt-16 pt-8 border-t border-stroke text-center dark:border-strokedark opacity-50">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 italic flex items-center justify-center gap-2">
            <FileText size={10} />
            © 2026 Verdict AI | Engineered by StratusTier Innovation Labs
          </p>
        </div>

      </div>
    </>
  );
};

export default AuditDetail;