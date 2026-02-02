import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

const Contact = () => {
  const navigate = useNavigate();

  // State management for form inputs
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    role: '',
    goals: '',
  });

  const [loading, setLoading] = useState(false);

  // Syncs input changes with the formData state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const API_URL = "https://jdig9yqazd.execute-api.us-east-1.amazonaws.com/prod/contact";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        mode: 'cors',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("Response Status:", response.status);

      if (response.ok) {
        console.log("Submission successful, navigating...");
        setTimeout(() => {
          navigate('/contact/success');
        }, 100);
      } else {
        const errorText = await response.text();
        console.error("Submission failed with status:", response.status, errorText);
        alert(`Submission failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Network or Fetch Error:", error);
      alert("Network error. Please check your API Gateway CORS settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Strategic Consultations & Partnerships" />

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        {/* --- LEFT COLUMN: Strategic Context --- */}
        <div className="flex flex-col gap-9">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white uppercase tracking-widest text-sm">
                Aligning Vision with Reality
              </h3>
            </div>
            <div className="p-6.5">
              <h4 className="font-bold text-black dark:text-white mb-4 text-lg">
                The Bridge Between Vision and Execution
              </h4>
              <p className="mb-6 text-sm leading-relaxed dark:text-gray-400">
                Verdict is the strategic interface where creative development meets physical production. 
                We help <strong>Major Studios</strong> de-risk high-stakes greenlight decisions and 
                <strong>Facility Hubs</strong> optimize their stage footprints through predictive forecasting.
              </p>
              
              <p className="mb-8 text-sm leading-relaxed dark:text-gray-400 font-medium italic border-l-4 border-primary pl-4 bg-gray-2 dark:bg-meta-4 py-2">
                "Our mission is to help you quantify the 'unquantifiable,' ensuring every project 
                is positioned for operational success before a single camera is balanced."
              </p>

              <h4 className="font-bold text-black dark:text-white mb-2 text-sm uppercase tracking-tighter">Strategic Consultations</h4>
              <ul className="flex flex-col gap-4 mb-6">
                <li>
                   <span className="block text-xs font-bold text-primary uppercase mb-1">Executive Partnerships</span>
                   <a href="mailto:admin@stratustiercloudsec.com" className="text-sm hover:text-primary transition dark:text-bodydark2">admin@stratustiercloudsec.com</a>
                </li>
                <li>
                   <span className="block text-xs font-bold text-primary uppercase mb-1">Strategic Support</span>
                   <a href="mailto:admin@stratustiercloudsec.com" className="text-sm hover:text-primary transition dark:text-bodydark2">admin@stratustiercloudsec.com</a>
                </li>
              </ul>

              <div className="mt-10 pt-6 border-t border-stroke dark:border-strokedark">
                <h4 className="font-bold text-black dark:text-white mb-1 text-sm">Verdict AI Intelligence</h4>
                <p className="text-xs dark:text-bodydark2">
                  Atlanta, Georgia, USA
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: The Wired Form --- */}
        <div className="flex flex-col gap-9">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white uppercase tracking-widest text-sm">
                Inquire for Consultation
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6.5">
                <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">
                      First Name <span className="text-meta-1">*</span>
                    </label>
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      type="text"
                      required
                      placeholder="Jane"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Last Name <span className="text-meta-1">*</span>
                    </label>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      type="text"
                      required
                      placeholder="Doe"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Work Email <span className="text-meta-1">*</span>
                  </label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    required
                    placeholder="name@studio.com"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>

                <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">Company / Studio</label>
                    <input
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      type="text"
                      placeholder="e.g., Netflix, Amazon MGM"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                   <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">Role / Title</label>
                    <input
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      type="text"
                      placeholder="e.g., VP of Production"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-2.5 block text-black dark:text-white">Consultation Goals</label>
                  <textarea
                    name="goals"
                    value={formData.goals}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe your production slate optimization goals..."
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded bg-meta-3 p-3 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50 transition-all duration-300"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Capturing Vision...
                    </span>
                  ) : "Send Inquiry"}
                </button>

                <p className="text-[10px] text-center mt-4 dark:text-bodydark2 opacity-60">
                  By submitting, you agree to our{' '}
                  <Link to="/terms" className="text-primary hover:underline">Terms</Link> and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;