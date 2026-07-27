import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  FileText, Download, AlertTriangle, TrendingUp,
  Users, DollarSign, Film, CheckCircle, RefreshCw,
  BarChart2, Target
} from 'react-feather';
import Logo from '../images/logo/verdict_logo_white.png';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Character {
  name: string;
  role: string;
  arc: string;
  castability: string;
  screen_time: string;
}

interface RiskItem {
  category: string;
  description: string;
  severity: string;
  mitigation: string;
}

interface RevenueProjection {
  conservative_usd: number;
  base_case_usd: number;
  upside_usd: number;
  breakeven_multiple: string | number;
  rationale: string;
}

interface ProductionCostLine {
  category: string;
  estimated_usd: number;
  notes: string;
}

interface ProductionCostEstimate {
  above_the_line_usd: number;
  below_the_line_usd: number;
  post_production_usd: number;
  contingency_usd: number;
  total_estimated_usd: number;
  budget_tier: string;
  cost_breakdown: ProductionCostLine[];
  cost_rationale: string;
}

interface Comp {
  TITLE: string;
  BOXOFFICE: string;
  IMDB: string;
  RT: string;
  METACRITIC?: string;
  BUDGET?: string;
  NOTES: string;
}

interface GreenlightCondition {
  condition: string;
  priority: string;
  rationale: string;
}

interface MarketTiming {
  optimal_release_window: string;
  release_strategy: string;
  deal_structure_recommendation: string;
  competitive_window_analysis: string;
  urgency: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const safeParse = <T,>(val: any, fallback: T): T => {
  if (!val) return fallback;
  if (typeof val === 'object') return val as T;
  try { return JSON.parse(val) as T; } catch { return fallback; }
};

const fmt = (n: number) =>
  n >= 1_000_000_000 ? `$${(n / 1_000_000_000).toFixed(1)}B`
  : n >= 1_000_000   ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000       ? `$${(n / 1_000).toFixed(0)}K`
  : `$${n}`;

// ─── Shared UI Primitives ─────────────────────────────────────────────────────

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
      {message || 'This section requires the updated analysis engine. Re-run the analysis to generate this data.'}
    </p>
  </div>
);

const SeverityBadge: React.FC<{ level: string }> = ({ level }) => {
  const norm = level?.toUpperCase();
  const s: Record<string, string> = {
    LOW: 'bg-meta-3 text-white', MEDIUM: 'bg-warning text-white', HIGH: 'bg-danger text-white',
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest ${s[norm] || 'bg-gray-300 text-gray-600'}`}>
      {level || '—'}
    </span>
  );
};

const PriorityBadge: React.FC<{ level: string }> = ({ level }) => {
  const norm = level?.toUpperCase();
  const s: Record<string, string> = {
    'MUST-HAVE': 'bg-danger text-white', 'HIGH': 'bg-warning text-white', 'MEDIUM': 'bg-primary text-white',
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest ${s[norm] || 'bg-gray-300 text-gray-600'}`}>
      {level || '—'}
    </span>
  );
};

const UrgencyBadge: React.FC<{ level: string }> = ({ level }) => {
  const norm = level?.toUpperCase();
  const s: Record<string, string> = {
    'ACT NOW': 'border-danger text-danger',
    '6-12 MONTHS': 'border-warning text-warning',
    '12-24 MONTHS': 'border-primary text-primary',
    'NO TIME PRESSURE': 'border-meta-3 text-meta-3',
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border-2 ${s[norm] || 'border-gray-400 text-gray-400'}`}>
      {level || '—'}
    </span>
  );
};

const verdictStyle = (v: string) => {
  const n = v?.toUpperCase();
  if (n === 'GREENLIGHT') return 'border-meta-3 text-meta-3';
  if (n === 'CONSIDER')   return 'border-warning text-warning';
  if (n === 'PASS')       return 'border-danger text-danger';
  return 'border-meta-3 text-meta-3';
};

// ─── Main Component ───────────────────────────────────────────────────────────

const EstimatorDetail: React.FC = () => {
  const { auditId }  = useParams<{ auditId: string }>();
  const location     = useLocation();
  const projectName  = new URLSearchParams(location.search).get('projectName') || '';
  const reportRef    = useRef<HTMLDivElement>(null);

  const [data, setData]               = useState<any>(null);
  const [isPolling, setIsPolling]     = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!auditId || !projectName) return;
    const fetchResult = async () => {
      try {
        const res  = await fetch(
          `https://jdig9yqazd.execute-api.us-east-1.amazonaws.com/prod/get-estimator?auditId=${auditId}&projectName=${encodeURIComponent(projectName)}`
        );
        const json = await res.json();
        setData(json);
        if (json.status === 'COMPLETED' || json.status === 'ERROR') setIsPolling(false);
      } catch (err) { console.error(err); }
    };
    const interval = setInterval(fetchResult, 4000);
    fetchResult();
    return () => clearInterval(interval);
  }, [auditId, projectName]);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      // ── Step 1: render the full report to a high-res canvas ──────────────
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowHeight: reportRef.current.scrollHeight,
      });

      const pdf         = new jsPDF('p', 'mm', 'a4');
      const pageW_mm    = pdf.internal.pageSize.getWidth();   // 210mm
      const pageH_mm    = pdf.internal.pageSize.getHeight();  // 297mm

      // ── Step 2: figure out how tall one PDF page is in canvas pixels ─────
      const pxPerMm      = canvas.width / pageW_mm;
      const pageH_px     = Math.floor(pageH_mm * pxPerMm);
      const totalPages   = Math.ceil(canvas.height / pageH_px);

      // ── Step 3: slice canvas into A4 strips and add each as a page ───────
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();

        const srcY      = page * pageH_px;
        const srcH      = Math.min(pageH_px, canvas.height - srcY);
        const destH_mm  = srcH / pxPerMm;

        const strip        = document.createElement('canvas');
        strip.width        = canvas.width;
        strip.height       = srcH;
        const ctx          = strip.getContext('2d')!;
        ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

        const stripData = strip.toDataURL('image/png');
        pdf.addImage(stripData, 'PNG', 0, 0, pageW_mm, destH_mm);
      }

      pdf.save(`Verdict_Estimator_${projectName?.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // ── Status gates ──────────────────────────────────────────────────────────
  if (isPolling || !data) return (
    <div className="flex flex-col items-center justify-center p-20 gap-6">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-meta-3 border-t-transparent" />
      <h2 className="text-xl font-black uppercase tracking-widest text-meta-3">Synthesizing Intelligence Dossier</h2>
      <p className="text-sm text-bodydark italic text-center max-w-md">
        Aggregating TMDB · OMDb · Tavily · News API — typically 45–90 seconds.
      </p>
      <p className="text-xs font-mono text-gray-400">Audit ID: {auditId}</p>
    </div>
  );

  if (data.status === 'ERROR') return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <h2 className="text-xl font-black uppercase tracking-widest text-red-500">Analysis Failed</h2>
      <p className="text-sm text-bodydark italic text-center max-w-md">
        {data.stage_label || data.errorMessage || 'An error occurred. Please resubmit.'}
      </p>
      <p className="text-xs font-mono text-gray-400">Audit ID: {auditId}</p>
    </div>
  );

  // ── Deserialise DynamoDB fields ────────────────────────────────────────────
  const characters     = safeParse<Character[]>(data.characters, []);
  const riskMatrix     = safeParse<RiskItem[]>(data.risk_matrix, []);
  const revProj        = safeParse<RevenueProjection>(data.revenue_projection, {} as RevenueProjection);
  const prodCosts      = safeParse<ProductionCostEstimate>(data.production_cost_estimate, {} as ProductionCostEstimate);
  const comps          = safeParse<Comp[]>(data.comps, []);
  const greenlightCond = safeParse<GreenlightCondition[]>(data.greenlight_conditions, []);
  const marketTiming   = safeParse<MarketTiming>(data.market_timing, {} as MarketTiming);

  const hasChars      = characters.length > 0;
  const hasRisk       = riskMatrix.length > 0;
  const hasRevenue    = (revProj.base_case_usd || 0) > 0;
  const hasCosts      = (prodCosts.total_estimated_usd || 0) > 0;
  const hasComps      = comps.length > 0;
  const hasGreenlight = greenlightCond.length > 0;
  const hasMarket     = !!marketTiming.optimal_release_window;
  const verdict       = data.verdict || '';

  return (
    <>
      <Breadcrumb pageName={`Success Estimator: ${projectName}`} />

      {/* ── Action bar ────────────────────────────────────────────────────── */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 bg-meta-3 text-white px-6 py-3 rounded font-black uppercase text-xs tracking-widest hover:bg-opacity-90 shadow-lg transition-all disabled:bg-opacity-50"
        >
          <Download size={16} />
          {isExporting ? 'Generating PDF...' : 'Export Executive PDF'}
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
            <div className={`mb-3 inline-block px-4 py-1.5 rounded-sm text-xs font-black uppercase tracking-widest border-2 shadow-sm ${verdictStyle(verdict)}`}>
              Executive Verdict: {verdict || 'PENDING'}
            </div>
            <p className="text-[9px] uppercase font-black text-gray-400">Official Audit ID: {auditId?.substring(0, 8)}</p>
            <p className="text-[10px] font-medium text-gray-500 mt-1">
              {new Date(data.lastUpdatedAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* ── Title ─────────────────────────────────────────────────────── */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-black text-black dark:text-white uppercase mb-2 tracking-tighter">
            {projectName}
          </h1>
          <div className="h-1.5 w-32 bg-meta-3 mx-auto" />
        </div>

        {/* ── Metrics row ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5 mb-12">
          {[
            { label: 'Success Score', value: `${data.score ?? 0}%`,                                                                         big: true },
            { label: 'Lead Talent',   value: data.formData?.leadActor || data.leadActor || data.lead_actor || data.writer || 'Not Specified'           },
            { label: 'Budget Tier',   value: prodCosts?.budget_tier || 'TBD'                                                                           },
            { label: 'Breakeven',     value: revProj?.breakeven_multiple ? `${revProj.breakeven_multiple}x` : '—'                                     },
            { label: 'Release',       value: data.formData?.releaseType || data.releaseType || data.release_type || 'Theatrical'                       },
          ].map(({ label, value, big }: any) => (
            <div key={label} className="rounded-lg border-2 border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4 p-5 text-center flex flex-col justify-center shadow-sm">
              <h4 className="text-[9px] font-black uppercase text-gray-500 mb-2 tracking-widest">{label}</h4>
              <span className={`font-black text-meta-3 uppercase leading-tight ${big ? 'text-4xl' : 'text-sm'}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════
            1.0  EXECUTIVE SUMMARY
        ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <SectionHeader number="1.0" title="Executive Summary" icon={<FileText size={14} />} />
          <div className="whitespace-pre-wrap text-black dark:text-white leading-loose text-lg font-serif italic bg-gray-50 dark:bg-meta-4 p-10 rounded-md border-l-8 border-meta-3 shadow-inner">
            {data.summary || 'Finalizing synthesis...'}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            2.0  INVESTMENT THESIS & MARKET POSITION
        ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <SectionHeader number="2.0" title="Investment Thesis & Market Position" icon={<TrendingUp size={14} />} />
          {data.investment_thesis ? (
            <div className="mb-6 bg-gray-100 dark:bg-meta-4 p-8 rounded-md border-l-8 border-primary shadow-sm">
              <span className="text-[9px] font-black uppercase text-primary mb-3 block tracking-widest">Investment Thesis</span>
              <p className="text-black dark:text-white text-base leading-relaxed font-semibold whitespace-pre-line">{data.investment_thesis}</p>
            </div>
          ) : <PendingSection message="Investment thesis not available — re-run with the updated worker." />}

          {data.market_position ? (
            <div className="bg-gray-50 dark:bg-meta-4 p-8 rounded-md border-l-8 border-gray-300 shadow-sm">
              <span className="text-[9px] font-black uppercase text-gray-500 mb-3 block tracking-widest">Market Position</span>
              <p className="text-black dark:text-white text-base leading-relaxed italic whitespace-pre-line">{data.market_position}</p>
            </div>
          ) : <PendingSection message="Market position not available — re-run with the updated worker." />}
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
                  <div className="bg-black px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-black uppercase text-sm tracking-wide">{char.name}</p>
                      <p className="text-meta-3 text-[9px] font-bold uppercase tracking-widest mt-0.5">{char.role}</p>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest border border-gray-500 text-gray-300">
                      {char.screen_time}
                    </span>
                  </div>
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
          ) : <PendingSection />}
        </div>

        {/* ═══════════════════════════════════════════════════════
            4.0  STRATEGIC INTELLIGENCE
        ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <SectionHeader number="4.0" title="Strategic Intelligence" icon={<Target size={14} />} />
          {data.talent_assessment ? (
            <div className="mb-6 bg-gray-50 dark:bg-meta-4 p-8 rounded-md border-l-8 border-meta-3 shadow-sm">
              <span className="text-[9px] font-black uppercase text-gray-500 mb-3 block tracking-widest">Talent Assessment</span>
              <p className="text-black dark:text-white text-base leading-relaxed font-semibold italic whitespace-pre-line">{data.talent_assessment}</p>
            </div>
          ) : <PendingSection message="Talent assessment not available — re-run with the updated worker." />}

          {data.recommendations && (
            <div className="bg-gray-100 dark:bg-meta-4 p-10 rounded-md border-l-8 border-black shadow-sm">
              <span className="text-[9px] font-black uppercase text-gray-500 mb-4 block tracking-widest">Strategic Recommendations</span>
              <p className="text-black dark:text-white text-md leading-relaxed font-semibold italic">{data.recommendations}</p>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            5.0  RISK MATRIX
        ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <SectionHeader number="5.0" title="Risk Matrix" icon={<AlertTriangle size={14} />} />
          {hasRisk ? (
            <div className="space-y-3">
              {riskMatrix.map((risk: RiskItem, idx: number) => (
                <div key={idx} className="flex items-start gap-5 bg-gray-50 dark:bg-meta-4 px-6 py-5 rounded-md border border-stroke dark:border-strokedark">
                  <div className="shrink-0 pt-0.5"><SeverityBadge level={risk.severity} /></div>
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
          ) : <PendingSection />}
        </div>

        {/* ═══════════════════════════════════════════════════════
            6.0  POTENTIAL PRODUCTION COSTS
        ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <SectionHeader number="6.0" title="Potential Production Costs" icon={<DollarSign size={14} />} />
          {hasCosts ? (
            <>
              <div className="bg-black text-white px-8 py-5 rounded-t-md flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase text-meta-3 tracking-widest mb-1">Estimated Total Budget</p>
                  <p className="text-3xl font-black">{fmt(prodCosts.total_estimated_usd)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Budget Tier</p>
                  <span className="inline-block border-2 border-meta-3 text-meta-3 px-4 py-1 text-xs font-black uppercase tracking-widest rounded-sm">
                    {prodCosts.budget_tier || 'TBD'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 border border-t-0 border-stroke dark:border-strokedark rounded-b-md overflow-hidden mb-4">
                {[
                  { label: 'Above-the-Line',  value: prodCosts.above_the_line_usd  },
                  { label: 'Below-the-Line',  value: prodCosts.below_the_line_usd  },
                  { label: 'Post-Production', value: prodCosts.post_production_usd },
                  { label: 'Contingency',     value: prodCosts.contingency_usd     },
                ].map(({ label, value }, i) => (
                  <div key={label} className={`p-6 text-center bg-gray-50 dark:bg-meta-4 ${i < 3 ? 'border-r border-stroke dark:border-strokedark' : ''}`}>
                    <p className="text-[9px] font-black uppercase text-gray-500 mb-2 tracking-widest">{label}</p>
                    <p className="text-xl font-black text-black dark:text-white">{fmt(value || 0)}</p>
                  </div>
                ))}
              </div>
              {(prodCosts.cost_breakdown?.length ?? 0) > 0 && (
                <div className="mb-4 overflow-hidden rounded-md border border-stroke dark:border-strokedark">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-meta-3 text-white">
                        <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-widest">Category</th>
                        <th className="text-right px-5 py-3 text-[9px] font-black uppercase tracking-widest">Estimated Cost</th>
                        <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-widest hidden md:table-cell">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prodCosts.cost_breakdown.map((line: ProductionCostLine, idx: number) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-boxdark' : 'bg-gray-50 dark:bg-meta-4'}>
                          <td className="px-5 py-3 font-semibold text-black dark:text-white text-xs uppercase tracking-wide">{line.category}</td>
                          <td className="px-5 py-3 text-right font-black text-meta-3 text-sm">{fmt(line.estimated_usd || 0)}</td>
                          <td className="px-5 py-3 text-gray-500 text-xs italic hidden md:table-cell">{line.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {prodCosts.cost_rationale && (
                <div className="bg-gray-50 dark:bg-meta-4 p-5 rounded-md border-l-4 border-meta-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed">{prodCosts.cost_rationale}</p>
                </div>
              )}
            </>
          ) : <PendingSection />}
        </div>

        {/* ═══════════════════════════════════════════════════════
            7.0  REVENUE PROJECTIONS
        ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <SectionHeader number="7.0" title="Revenue Projections" icon={<BarChart2 size={14} />} />
          {hasRevenue ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Conservative',    value: revProj.conservative_usd, accent: 'border-danger'  },
                  { label: 'Base Case',       value: revProj.base_case_usd,    accent: 'border-warning' },
                  { label: 'Upside Scenario', value: revProj.upside_usd,       accent: 'border-meta-3'  },
                ].map(({ label, value, accent }) => (
                  <div key={label} className={`border-t-4 ${accent} bg-gray-50 dark:bg-meta-4 rounded-b-md p-6 text-center shadow-sm`}>
                    <p className="text-[9px] font-black uppercase text-gray-500 mb-3 tracking-widest">{label}</p>
                    <p className="text-3xl font-black text-black dark:text-white">{fmt(value || 0)}</p>
                  </div>
                ))}
              </div>
              <div className="bg-black text-white px-8 py-4 rounded-md mb-4">
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Breakeven Multiple</p>
                <p className="text-2xl font-black text-meta-3">{revProj.breakeven_multiple}x</p>
              </div>
              {revProj.rationale && (
                <div className="bg-gray-50 dark:bg-meta-4 p-5 rounded-md border-l-4 border-meta-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed">{revProj.rationale}</p>
                </div>
              )}
            </>
          ) : <PendingSection />}
        </div>

        {/* ═══════════════════════════════════════════════════════
            8.0  COMPARABLE FILMS
        ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <SectionHeader
            number="8.0"
            title={hasComps ? `Comparable Films (${comps.length})` : 'Comparable Films'}
            icon={<Film size={14} />}
          />
          {hasComps ? (
            <div className="overflow-hidden rounded-md border border-stroke dark:border-strokedark shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-meta-3 text-white">
                    <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-widest">Title</th>
                    <th className="text-right px-5 py-3 text-[9px] font-black uppercase tracking-widest">Box Office</th>
                    <th className="text-center px-4 py-3 text-[9px] font-black uppercase tracking-widest">IMDB</th>
                    <th className="text-center px-4 py-3 text-[9px] font-black uppercase tracking-widest">RT</th>
                    <th className="text-center px-4 py-3 text-[9px] font-black uppercase tracking-widest hidden md:table-cell">Meta</th>
                    <th className="text-center px-4 py-3 text-[9px] font-black uppercase tracking-widest hidden md:table-cell">Budget</th>
                    <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-widest hidden lg:table-cell">Analyst Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {comps.map((comp: Comp, idx: number) => (
                    <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white dark:bg-boxdark' : 'bg-gray-50 dark:bg-meta-4'} border-b border-stroke dark:border-strokedark last:border-b-0`}>
                      <td className="px-5 py-4 font-black text-black dark:text-white text-xs uppercase tracking-wide">{comp.TITLE}</td>
                      <td className="px-5 py-4 text-right font-bold text-meta-3 text-sm whitespace-nowrap">{comp.BOXOFFICE}</td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-[10px] font-bold">{comp.IMDB || '—'}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          parseInt(comp.RT) >= 75 ? 'bg-meta-3 text-white' :
                          parseInt(comp.RT) >= 50 ? 'bg-warning text-white' : 'bg-danger text-white'
                        }`}>{comp.RT || '—'}</span>
                      </td>
                      <td className="px-4 py-4 text-center hidden md:table-cell">
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{comp.METACRITIC || '—'}</span>
                      </td>
                      <td className="px-4 py-4 text-center hidden md:table-cell">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">{comp.BUDGET || '—'}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400 italic hidden lg:table-cell max-w-xs">{comp.NOTES}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <PendingSection />}
        </div>

        {/* ═══════════════════════════════════════════════════════
            9.0  GREENLIGHT CONDITIONS
        ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <SectionHeader number="9.0" title="Greenlight Conditions" icon={<CheckCircle size={14} />} />
          {hasGreenlight ? (
            <div className="space-y-3">
              {greenlightCond.map((item: GreenlightCondition, idx: number) => (
                <div key={idx} className="flex items-start gap-5 bg-gray-50 dark:bg-meta-4 px-6 py-5 rounded-md border-l-4 border-meta-3">
                  <div className="shrink-0 pt-0.5"><PriorityBadge level={item.priority} /></div>
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
          ) : <PendingSection />}
        </div>

        {/* ═══════════════════════════════════════════════════════
            10.0  MARKET TIMING & DEAL STRUCTURE
        ═══════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <SectionHeader number="10.0" title="Market Timing & Deal Structure" icon={<TrendingUp size={14} />} />
          {hasMarket ? (
            <>
              <div className="bg-black text-white px-8 py-5 rounded-t-md flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase text-meta-3 tracking-widest mb-1">Optimal Release Window</p>
                  <p className="text-2xl font-black">{marketTiming.optimal_release_window}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-2">Urgency</p>
                  <UrgencyBadge level={marketTiming.urgency} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 border border-t-0 border-stroke dark:border-strokedark rounded-b-md overflow-hidden">
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
          ) : <PendingSection />}
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="mt-16 pt-8 border-t border-stroke dark:border-strokedark text-center opacity-50">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 italic flex items-center justify-center gap-2">
            <FileText size={10} />
            © 2026 Verdict AI | Engineered by StratusTier Innovation Labs
          </p>
        </div>

      </div>
    </>
  );
};

export default EstimatorDetail;