import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

type WorkflowStatus = 'IDLE' | 'PROCESSING' | 'ERROR';

const ProductionSuccessEstimator: React.FC = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [formData, setFormData] = useState({
    projectName: '',
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
    leadActor: '',
    castStrength: 5,
    soundBudget: 50000,
    leadStylist: '',
    wardrobeBudget: 25000,
    notes: '',
  });

  const usStates = [
    "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia",
    "Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland",
    "Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey",
    "New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina",
    "South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming","District of Columbia"
  ];

  // Updated Top 10 Genre List based on PM strategic assessment
  const genres = [
    "Action", "Animation", "Comedy", "Documentary", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Thriller"
  ];

  // --- HANDLERS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    const API_BASE = "https://jdig9yqazd.execute-api.us-east-1.amazonaws.com/prod";
    
    if (!formData.projectName) {
      alert("Please enter a Project Name to proceed.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      });

      if (!response.ok && response.status !== 202) {
        const err = await response.json();
        throw new Error(err.error || `Gateway Reject: ${response.status}`);
      }

      const data = await response.json();
      const { auditId } = data;

      if (!auditId) {
        throw new Error("Handshake failed: The server did not provide a valid audit identifier.");
      }

      navigate(`/estimator-detail/${auditId}?projectName=${encodeURIComponent(formData.projectName)}`);

    } catch (error: any) {
      console.error("Critical Execution Error:", error);
      alert(`Synthesis Failed: ${error.message}`);
      setIsAnalyzing(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // --- STYLING CONSTANTS ---
  const highlightVal = "font-bold text-meta-3 ml-1";
  const inputClass = "w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary";
  const labelClass = "mb-3 block text-black dark:text-white font-bold uppercase text-[10px] tracking-widest";
  const cardClass = "rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-9 overflow-hidden";
  const cardHeaderClass = "border-b border-stroke py-4 px-6.5 dark:border-strokedark bg-gray-2 dark:bg-meta-4";

  return (
    <>
      <Breadcrumb pageName="Production Success Estimator" />

      {/* DOCUMENT UPLOAD SECTION */}
      <div className={cardClass}>
        <div className={cardHeaderClass}>
          <h3 className="font-bold text-black dark:text-white uppercase tracking-widest text-xs">
            Budget Documentation
          </h3>
        </div>
        <div className="flex flex-col gap-5.5 p-6.5">
          <p className="text-sm text-body dark:text-bodydark italic font-medium leading-relaxed">
            Anchor the Success Analysis in your primary financial data. Upload a Top Sheet or Production Budget to begin.
          </p>
          <div>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        {/* --- LEFT COLUMN: CORE PARAMETERS --- */}
        <div className="flex flex-col">
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <h3 className="font-bold text-black dark:text-white uppercase tracking-widest text-xs text-primary">Core Production</h3>
            </div>
            <div className="flex flex-col gap-5.5 p-6.5">
              <div>
                <label className={labelClass}>Project Title</label>
                <input type="text" name="projectName" placeholder="Project Name" value={formData.projectName} onChange={handleInputChange} className={inputClass} />
              </div>
              
              <div>
                <label className={labelClass}>Genre</label>
                <select name="genre" value={formData.genre} onChange={handleInputChange} className={inputClass}>
                  {genres.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Production Media</label>
                <div className="flex items-center gap-10 mt-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-black dark:text-white uppercase">
                    <input type="radio" name="productionType" value="Cinema" checked={formData.productionType === 'Cinema'} onChange={handleInputChange} className="h-4 w-4 accent-primary" /> Cinema
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-black dark:text-white uppercase">
                    <input type="radio" name="productionType" value="Television" checked={formData.productionType === 'Television'} onChange={handleInputChange} className="h-4 w-4 accent-primary" /> Television
                  </label>
                </div>
              </div>
              <div>
                <label className={labelClass}>Release Strategy</label>
                <div className="flex items-center gap-10 mt-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-black dark:text-white uppercase">
                    <input type="radio" name="releaseType" value="Theatrical" checked={formData.releaseType === 'Theatrical'} onChange={handleInputChange} className="h-4 w-4 accent-primary" /> Theatrical
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-black dark:text-white uppercase">
                    <input type="radio" name="releaseType" value="Streaming" checked={formData.releaseType === 'Streaming'} onChange={handleInputChange} className="h-4 w-4 accent-primary" /> Streaming
                  </label>
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  Production Budget 
                  <span className={highlightVal}>{formatCurrency(Number(formData.productionBudget))}</span>
                </label>
                <input type="range" name="productionBudget" min="100000" max="400000000" step="100000" value={formData.productionBudget} onChange={handleInputChange} className="w-full cursor-pointer appearance-none rounded-lg bg-stroke dark:bg-form-strokedark h-2 accent-primary" />
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <h3 className="font-bold text-black dark:text-white uppercase tracking-widest text-xs text-primary">Marketing Reach</h3>
            </div>
            <div className="p-6.5">
              <label className={labelClass}>
                Marketing Allocation 
                <span className={highlightVal}>{formatCurrency(Number(formData.marketingBudget))}</span>
              </label>
              <input type="range" name="marketingBudget" min="25000" max="100000000" step="25000" value={formData.marketingBudget} onChange={handleInputChange} className="w-full cursor-pointer appearance-none rounded-lg bg-stroke dark:bg-form-strokedark h-2 accent-primary" />
            </div>
          </div>

          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <h3 className="font-bold text-black dark:text-white uppercase tracking-widest text-xs text-primary">Attached Talent</h3>
            </div>
            <div className="flex flex-col gap-5.5 p-6.5">
              <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClass}>Director</label><input type="text" name="director" placeholder="Director" value={formData.director} onChange={handleInputChange} className={inputClass} /></div>
                  <div><label className={labelClass}>Lead Talent</label><input type="text" name="leadActor" placeholder="Lead Actor" value={formData.leadActor} onChange={handleInputChange} className={inputClass} /></div>
              </div>
              <div>
                <label className={labelClass}>Cast Market Strength ({formData.castStrength}/10)</label>
                <input type="range" name="castStrength" min="1" max="10" value={formData.castStrength} onChange={handleInputChange} className="w-full cursor-pointer appearance-none rounded-lg bg-stroke dark:bg-form-strokedark h-2 accent-primary" />
              </div>
            </div>
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex w-full justify-center rounded bg-primary p-4 font-black uppercase tracking-[0.3em] text-white hover:bg-opacity-90 disabled:bg-opacity-50 shadow-2xl transition-all mb-10"
          >
            {isAnalyzing ? 'Processing Model...' : 'Execute Success Analysis'}
          </button>
        </div>

        {/* --- RIGHT COLUMN: LOGISTICS & CONTEXT --- */}
        <div className="flex flex-col">
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <h3 className="font-bold text-black dark:text-white uppercase tracking-widest text-xs">Production Logistics</h3>
            </div>
            <div className="flex flex-col gap-5.5 p-6.5">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Country</label>
                    <select name="locationCountry" value={formData.locationCountry} onChange={handleInputChange} className={inputClass}>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Mexico">Mexico</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>State/Prov</label>
                    <select name="locationState" value={formData.locationState} onChange={handleInputChange} className={inputClass}>
                      <option value="">Select State</option>
                      {usStates.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
              </div>
              
              <div>
                <label className={labelClass}>City</label>
                <input type="text" name="locationCity" placeholder="Production City" value={formData.locationCity} onChange={handleInputChange} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>
                  Local Production Spend 
                  <span className={highlightVal}>{formatCurrency(Number(formData.locationBudget))}</span>
                </label>
                <input type="range" name="locationBudget" min="100000" max="20000000" step="100000" value={formData.locationBudget} onChange={handleInputChange} className="w-full cursor-pointer appearance-none rounded-lg bg-stroke dark:bg-form-strokedark h-2 accent-primary" />
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <h3 className="font-bold text-black dark:text-white uppercase tracking-widest text-xs">Technical Craft</h3>
            </div>
            <div className="flex flex-col gap-5.5 p-6.5">
                <div>
                    <label className={labelClass}>Sound & Mix Budget <span className={highlightVal}>{formatCurrency(Number(formData.soundBudget))}</span></label>
                    <input type="range" name="soundBudget" min="10000" max="1000000" step="10000" value={formData.soundBudget} onChange={handleInputChange} className="w-full cursor-pointer appearance-none rounded-lg bg-stroke dark:bg-form-strokedark h-2 accent-primary" />
                </div>
                <div><label className={labelClass}>Lead Stylist / Wardrobe</label><input type="text" name="leadStylist" placeholder="Lead Stylist" value={formData.leadStylist} onChange={handleInputChange} className={inputClass} /></div>
                <div>
                    <label className={labelClass}>Wardrobe Allocation <span className={highlightVal}>{formatCurrency(Number(formData.wardrobeBudget))}</span></label>
                    <input type="range" name="wardrobeBudget" min="10000" max="100000" step="1000" value={formData.wardrobeBudget} onChange={handleInputChange} className="w-full cursor-pointer appearance-none rounded-lg bg-stroke dark:bg-form-strokedark h-2 accent-primary" />
                </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <h3 className="font-bold text-black dark:text-white uppercase tracking-widest text-xs">Strategic Context</h3>
            </div>
            <div className="p-6.5">
              <textarea name="notes" rows={6} placeholder="Plot hooks, market readiness, competitive advantages..." value={formData.notes} onChange={handleInputChange} className={inputClass}></textarea>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductionSuccessEstimator;