import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Zap, UploadCloud, X } from 'react-feather';
import { registerNotificationJob } from '../../components/Header/DropdownNotification';

const ProductionSuccessEstimator: React.FC = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [formData, setFormData] = useState({
    // Contact fields — always enabled, always sent to worker
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    // Project field — always enabled
    projectName: '',
    // All fields below are disabled when a file is uploaded
    genre: 'Action',
    productionType: 'Cinema',
    releaseType: 'Theatrical',
    productionBudget: 50000000,
    marketingBudget: 10000000,
    locationCountry: 'United States',
    locationCity: '',
    locationState: '',
    locationBudget: 1000000,
    director: '',
    producer: '',
    productionCompany: '',
    leadActor: '',
    supportingActor1: '',
    supportingActor2: '',
    castStrength: 5,
    soundBudget: 50000,
    leadStylist: '',
    wardrobeBudget: 25000,
    notes: '',
  });

  const fileUploaded = !!file;

  const usStates = [
    "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia",
    "Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland",
    "Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey",
    "New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina",
    "South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming","District of Columbia"
  ];

  const genres = [
    "Action", "Animation", "Comedy", "Documentary", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Thriller"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleRemoveFile = () => {
    setFile(null);
    const fileInput = document.getElementById('budget-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleAnalyze = async () => {
    const API_BASE = "https://jdig9yqazd.execute-api.us-east-1.amazonaws.com/prod";

    if (!formData.projectName) { alert("Please enter a Project Name to proceed."); return; }
    if (!formData.contactName)  { alert("Please enter your Name to proceed.");         return; }
    if (!formData.contactEmail) { alert("Please enter your Email to proceed.");        return; }

    setIsAnalyzing(true);

    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ Send full formData — worker now reads contactName/contactEmail/contactPhone
        body: JSON.stringify({ formData }),
      });

      if (!response.ok && response.status !== 202) {
        const err = await response.json();
        throw new Error(err.error || `Gateway Reject: ${response.status}`);
      }

      const data = await response.json();
      const { auditId } = data;

      if (!auditId) throw new Error("Handshake failed: The server did not provide a valid audit identifier.");

      registerNotificationJob({
        id: auditId,
        type: 'estimator',
        projectName: formData.projectName,
      });

      navigate(`/estimator-detail/${auditId}?projectName=${encodeURIComponent(formData.projectName)}`);

    } catch (error: any) {
      console.error("Critical Execution Error:", error);
      alert(`Synthesis Failed: ${error.message}`);
      setIsAnalyzing(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const highlightVal    = "font-bold text-meta-3 ml-1";
  const inputClass      = "w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-meta-3 active:border-meta-3 disabled:cursor-not-allowed disabled:bg-whiter disabled:opacity-50 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-meta-3";
  const labelClass      = "mb-3 block text-black dark:text-white font-bold uppercase text-[10px] tracking-widest flex items-center";
  const cardClass       = "rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-9 overflow-hidden";
  const cardHeaderClass = "border-b border-stroke py-4 px-6.5 dark:border-strokedark bg-gray-2 dark:bg-meta-4";
  const lockedWhenFile  = fileUploaded;

  const RequiredIcon = () => (
    <span className="text-red-500 text-xl font-bold ml-1 leading-none">*</span>
  );

  return (
    <>
      {/* ── Full-screen loading overlay ────────────────────────────────────── */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="h-20 w-20 animate-spin rounded-full border-4 border-meta-3 border-t-transparent shadow-2xl" />
          <h2 className="mt-6 text-3xl font-black text-white uppercase tracking-tighter">
            Initializing Intelligence Engine
          </h2>
          <p className="mt-2 text-white/70 italic font-serif">
            Aggregating TMDB · OMDb · Tavily · News API dossier...
          </p>
        </div>
      )}

      <Breadcrumb pageName="Production Success Estimator" />

      {/* ── Budget Documentation ───────────────────────────────────────────── */}
      <div className={cardClass}>
        <div className={cardHeaderClass}>
          <h3 className="font-bold text-black dark:text-white uppercase tracking-widest text-xs text-meta-3">
            Budget Documentation
          </h3>
        </div>
        <div className="flex flex-col gap-5.5 p-6.5">
          <p className="text-sm text-body dark:text-bodydark italic font-medium leading-relaxed">
            To get started, either <strong>upload a Top Sheet or Production Budget</strong> for automatic analysis, or <strong>complete the Production Estimator form</strong> below — whichever works best for your workflow.
          </p>

          {!file ? (
            <div className="relative">
              <input
                id="budget-file-input"
                type="file"
                onChange={handleFileChange}
                className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-0 file:bg-meta-3 file:text-white file:py-3 file:px-5 file:hover:bg-opacity-90 focus:border-meta-3 active:border-meta-3 dark:border-form-strokedark dark:bg-form-input"
              />
              <UploadCloud className="absolute right-4 top-1/2 -translate-y-1/2 text-black/20" size={20} />
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border-[1.5px] border-meta-3 bg-meta-3/5 py-3 px-5">
              <div className="flex items-center gap-3">
                <UploadCloud size={18} className="text-meta-3 shrink-0" />
                <span className="text-sm font-semibold text-black dark:text-white truncate max-w-xs">{file.name}</span>
                <span className="text-xs text-body dark:text-bodydark">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                onClick={handleRemoveFile}
                className="flex items-center gap-1 text-xs font-bold uppercase text-red-500 hover:text-red-700 transition ml-4 shrink-0"
              >
                <X size={14} /> Remove
              </button>
            </div>
          )}

          {fileUploaded && (
            <p className="text-xs text-meta-3 font-semibold italic">
              ✓ Document uploaded — form fields are locked. Only <strong>Project Title</strong>, <strong>Name</strong>, and <strong>Email</strong> are required to proceed.
            </p>
          )}
        </div>
      </div>

      {/* ── Contact Information ────────────────────────────────────────────── */}
      <div className={cardClass}>
        <div className={cardHeaderClass}>
          <h3 className="font-bold text-black dark:text-white uppercase tracking-widest text-xs">Contact Information</h3>
        </div>
        <div className="flex flex-col gap-5.5 p-6.5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Name <RequiredIcon /></label>
              <input type="text" name="contactName" placeholder="Full Name"
                value={formData.contactName} onChange={handleInputChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email <RequiredIcon /></label>
              <input type="email" name="contactEmail" placeholder="email@example.com"
                value={formData.contactEmail} onChange={handleInputChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input type="tel" name="contactPhone" placeholder="+1 (555) 000-0000"
                value={formData.contactPhone} onChange={handleInputChange} className={inputClass} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div className="flex flex-col">

          {/* Core Production */}
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <h3 className="font-bold text-meta-3 uppercase tracking-widest text-xs">Core Production</h3>
            </div>
            <div className="flex flex-col gap-5.5 p-6.5">
              <div>
                <label className={labelClass}>Project Title <RequiredIcon /></label>
                <input type="text" name="projectName" placeholder="Project Name"
                  value={formData.projectName} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className={`${labelClass} ${lockedWhenFile ? 'opacity-50' : ''}`}>Genre <RequiredIcon /></label>
                <select name="genre" value={formData.genre} onChange={handleInputChange}
                  disabled={lockedWhenFile} className={inputClass}>
                  {genres.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={`${labelClass} ${lockedWhenFile ? 'opacity-50' : ''}`}>Production Media <RequiredIcon /></label>
                <div className="flex items-center gap-10 mt-2">
                  {['Cinema', 'Television'].map((t) => (
                    <label key={t} className={`flex cursor-pointer items-center gap-2 text-xs font-bold text-black dark:text-white uppercase hover:text-meta-3 transition ${lockedWhenFile ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input type="radio" name="productionType" value={t}
                        checked={formData.productionType === t} onChange={handleInputChange}
                        disabled={lockedWhenFile} className="h-5 w-5 accent-meta-3" /> {t}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className={`${labelClass} ${lockedWhenFile ? 'opacity-50' : ''}`}>Release Strategy <RequiredIcon /></label>
                <div className="flex items-center gap-10 mt-2">
                  {['Theatrical', 'Streaming'].map((t) => (
                    <label key={t} className={`flex cursor-pointer items-center gap-2 text-xs font-bold text-black dark:text-white uppercase hover:text-meta-3 transition ${lockedWhenFile ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input type="radio" name="releaseType" value={t}
                        checked={formData.releaseType === t} onChange={handleInputChange}
                        disabled={lockedWhenFile} className="h-5 w-5 accent-meta-3" /> {t}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className={`${labelClass} ${lockedWhenFile ? 'opacity-50' : ''}`}>
                  Production Budget <span className={highlightVal}>{formatCurrency(Number(formData.productionBudget))}</span>
                </label>
                <input type="range" name="productionBudget" min="100000" max="400000000" step="100000"
                  value={formData.productionBudget} onChange={handleInputChange} disabled={lockedWhenFile}
                  className={`w-full cursor-pointer appearance-none rounded-lg bg-stroke dark:bg-form-strokedark h-2 accent-meta-3 ${lockedWhenFile ? 'opacity-50 cursor-not-allowed' : ''}`} />
              </div>
            </div>
          </div>

          {/* Marketing Reach */}
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <h3 className="font-bold text-black dark:text-white uppercase tracking-widest text-xs">Marketing Reach</h3>
            </div>
            <div className="p-6.5">
              <label className={`${labelClass} ${lockedWhenFile ? 'opacity-50' : ''}`}>
                Marketing Allocation <span className={highlightVal}>{formatCurrency(Number(formData.marketingBudget))}</span>
              </label>
              <input type="range" name="marketingBudget" min="25000" max="100000000" step="25000"
                value={formData.marketingBudget} onChange={handleInputChange} disabled={lockedWhenFile}
                className={`w-full cursor-pointer appearance-none rounded-lg bg-stroke dark:bg-form-strokedark h-2 accent-meta-3 ${lockedWhenFile ? 'opacity-50 cursor-not-allowed' : ''}`} />
            </div>
          </div>

          {/* Attached Talent */}
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <h3 className="font-bold text-black dark:text-white uppercase tracking-widest text-xs">Attached Talent</h3>
            </div>
            <div className="flex flex-col gap-5.5 p-6.5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`${labelClass} ${lockedWhenFile ? 'opacity-50' : ''}`}>Director</label>
                  <input type="text" name="director" placeholder="Director"
                    value={formData.director} onChange={handleInputChange} disabled={lockedWhenFile} className={inputClass} />
                </div>
                <div>
                  <label className={`${labelClass} ${lockedWhenFile ? 'opacity-50' : ''}`}>Lead Talent</label>
                  <input type="text" name="leadActor" placeholder="Lead Actor / Actress"
                    value={formData.leadActor} onChange={handleInputChange} disabled={lockedWhenFile} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`${labelClass} ${lockedWhenFile ? 'opacity-50' : ''}`}>Supporting Actor / Actress</label>
                  <input type="text" name="supportingActor1" placeholder="Supporting Actor / Actress"
                    value={formData.supportingActor1} onChange={handleInputChange} disabled={lockedWhenFile} className={inputClass} />
                </div>
                <div>
                  <label className={`${labelClass} ${lockedWhenFile ? 'opacity-50' : ''}`}>Supporting Actor / Actress</label>
                  <input type="text" name="supportingActor2" placeholder="Supporting Actor / Actress"
                    value={formData.supportingActor2} onChange={handleInputChange} disabled={lockedWhenFile} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`${labelClass} ${lockedWhenFile ? 'opacity-50' : ''}`}>Producer</label>
                  <input type="text" name="producer" placeholder="Producer"
                    value={formData.producer} onChange={handleInputChange} disabled={lockedWhenFile} className={inputClass} />
                </div>
                <div>
                  <label className={`${labelClass} ${lockedWhenFile ? 'opacity-50' : ''}`}>Production Company</label>
                  <input type="text" name="productionCompany" placeholder="Production Company"
                    value={formData.productionCompany} onChange={handleInputChange} disabled={lockedWhenFile} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={`${labelClass} ${lockedWhenFile ? 'opacity-50' : ''}`}>
                  Cast Market Strength ({formData.castStrength}/10)
                </label>
                <input type="range" name="castStrength" min="1" max="10"
                  value={formData.castStrength} onChange={handleInputChange} disabled={lockedWhenFile}
                  className={`w-full cursor-pointer appearance-none rounded-lg bg-stroke dark:bg-form-strokedark h-2 accent-meta-3 ${lockedWhenFile ? 'opacity-50 cursor-not-allowed' : ''}`} />
              </div>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex w-full items-center justify-center gap-3 rounded bg-meta-3 p-4 font-black uppercase tracking-[0.2em] text-white hover:bg-opacity-90 disabled:bg-opacity-50 shadow-2xl transition-all mb-10"
          >
            <Zap size={20} fill="currentColor" />
            {isAnalyzing ? 'Processing Model...' : 'Execute Success Analysis'}
          </button>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
        <div className="flex flex-col">

          {/* Production Logistics */}
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <h3 className="font-bold text-black dark:text-white uppercase tracking-widest text-xs">Production Logistics</h3>
            </div>
            <div className="flex flex-col gap-5.5 p-6.5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`${labelClass} ${lockedWhenFile ? 'opacity-50' : ''}`}>Country</label>
                  <select name="locationCountry" value={formData.locationCountry}
                    onChange={handleInputChange} disabled={lockedWhenFile} className={inputClass}>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Mexico">Mexico</option>
                  </select>
                </div>
                <div>
                  <label className={`${labelClass} ${lockedWhenFile ? 'opacity-50' : ''}`}>State/Prov</label>
                  <select name="locationState" value={formData.locationState}
                    onChange={handleInputChange} disabled={lockedWhenFile} className={inputClass}>
                    <option value="">Select State</option>
                    {usStates.map((state) => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={`${labelClass} ${lockedWhenFile ? 'opacity-50' : ''}`}>City</label>
                <input type="text" name="locationCity" placeholder="Production City"
                  value={formData.locationCity} onChange={handleInputChange} disabled={lockedWhenFile} className={inputClass} />
              </div>
              <div>
                <label className={`${labelClass} ${lockedWhenFile ? 'opacity-50' : ''}`}>
                  Local Production Spend <span className={highlightVal}>{formatCurrency(Number(formData.locationBudget))}</span>
                </label>
                <input type="range" name="locationBudget" min="100000" max="20000000" step="100000"
                  value={formData.locationBudget} onChange={handleInputChange} disabled={lockedWhenFile}
                  className={`w-full cursor-pointer appearance-none rounded-lg bg-stroke dark:bg-form-strokedark h-2 accent-meta-3 ${lockedWhenFile ? 'opacity-50 cursor-not-allowed' : ''}`} />
              </div>
            </div>
          </div>

          {/* Technical Craft */}
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <h3 className="font-bold text-black dark:text-white uppercase tracking-widest text-xs">Technical Craft</h3>
            </div>
            <div className="flex flex-col gap-5.5 p-6.5">
              <div>
                <label className={`${labelClass} ${lockedWhenFile ? 'opacity-50' : ''}`}>
                  Sound & Mix Budget <span className={highlightVal}>{formatCurrency(Number(formData.soundBudget))}</span>
                </label>
                <input type="range" name="soundBudget" min="10000" max="1000000" step="10000"
                  value={formData.soundBudget} onChange={handleInputChange} disabled={lockedWhenFile}
                  className={`w-full cursor-pointer appearance-none rounded-lg bg-stroke dark:bg-form-strokedark h-2 accent-meta-3 ${lockedWhenFile ? 'opacity-50 cursor-not-allowed' : ''}`} />
              </div>
              <div>
                <label className={`${labelClass} ${lockedWhenFile ? 'opacity-50' : ''}`}>Lead Stylist / Wardrobe</label>
                <input type="text" name="leadStylist" placeholder="Lead Stylist"
                  value={formData.leadStylist} onChange={handleInputChange} disabled={lockedWhenFile} className={inputClass} />
              </div>
              <div>
                <label className={`${labelClass} ${lockedWhenFile ? 'opacity-50' : ''}`}>
                  Wardrobe Allocation <span className={highlightVal}>{formatCurrency(Number(formData.wardrobeBudget))}</span>
                </label>
                <input type="range" name="wardrobeBudget" min="10000" max="100000" step="1000"
                  value={formData.wardrobeBudget} onChange={handleInputChange} disabled={lockedWhenFile}
                  className={`w-full cursor-pointer appearance-none rounded-lg bg-stroke dark:bg-form-strokedark h-2 accent-meta-3 ${lockedWhenFile ? 'opacity-50 cursor-not-allowed' : ''}`} />
              </div>
            </div>
          </div>

          {/* Strategic Context */}
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <h3 className="font-bold text-black dark:text-white uppercase tracking-widest text-xs">Strategic Context</h3>
            </div>
            <div className="p-6.5">
              <textarea name="notes" rows={6}
                placeholder="Plot hooks, market readiness, competitive advantages..."
                value={formData.notes} onChange={handleInputChange} disabled={lockedWhenFile}
                className={inputClass} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ProductionSuccessEstimator;