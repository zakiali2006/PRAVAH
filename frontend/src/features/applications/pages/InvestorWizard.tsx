import React, { useState } from 'react';
import { 
  Compass, ArrowRight, CheckCircle2, Building, 
  Zap 
} from 'lucide-react';
import { GOVERNMENT_SERVICES_CATALOG } from '../../../data/mockData';



export const InvestorWizard = ({ onApplyForServices }) => {
  const [step, setStep] = useState(1);
  const [sector, setSector] = useState('Automotive & Engineering');
  const [investmentTier, setInvestmentTier] = useState('Large (₹ 50 Cr - ₹ 500 Cr)');
  const [district, setDistrict] = useState('Pune (MIDC Chakan / Ranjangaon)');
  const [landStatus, setLandStatus] = useState('Acquiring MIDC Plot');
  const [hasHazardousChemicals, setHasHazardousChemicals] = useState(true);
  const [powerRequirementKva, setPowerRequirementKva] = useState(5000);
  const [waterRequirementKld, setWaterRequirementKld] = useState(150);

  // Calculate recommended clearances
  const recommendedClearances = React.useMemo(() => {
    const list = ['MIDC-LAN-01', 'MPCB-CTE-04', 'FIRE-NOC-02', 'DISH-PLN-01', 'WATER-IND-01'];
    if (powerRequirementKva > 1000) {
      list.push('MSED-HT-01');
    }
    if (hasHazardousChemicals || sector.includes('Chemical') || sector.includes('Automotive')) {
      list.push('BOIL-REG-01');
    }
    return list;
  }, [powerRequirementKva, hasHazardousChemicals, sector]);

  const recommendedServices = GOVERNMENT_SERVICES_CATALOG.filter((s) => 
    recommendedClearances.includes(s.code)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
      {/* Wizard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Compass size={16} />
            <span>PRAVAH Investor Clearance Advisor</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Pre-Establishment & Pre-Operation Clearance Wizard</h2>
          <p className="text-slate-600 text-xs mt-1">
            Answer a few questions about your project to generate your customized statutory approval roadmap, estimated fees, and statutory RTS Act timeframes.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                step === s ? 'bg-blue-600 text-white shadow' : 
                step > s ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Enterprise & Location Details */}
      {step === 1 && (
        <div className="space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center">
            <Building size={18} className="mr-2 text-blue-600" />
            Step 1: Industrial Sector & Capital Investment Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Industrial Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Automotive & Engineering">Automotive & Engineering (Red Category)</option>
                <option value="Food Processing & Agribusiness">Food Processing & Agribusiness (Orange Category)</option>
                <option value="Chemicals & Pharmaceuticals">Chemicals & Pharmaceuticals (Red Category)</option>
                <option value="Textiles & Apparel">Textiles & Apparel (Orange Category)</option>
                <option value="Electronics & IT Hardware">Electronics & IT Hardware (Green/White Category)</option>
                <option value="Logistics & Warehousing">Logistics & Warehousing (White Category)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Project Investment Ceiling</label>
              <select
                value={investmentTier}
                onChange={(e) => setInvestmentTier(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Micro (< ₹ 1 Crore)">Micro Enterprise (&lt; ₹ 1 Crore)</option>
                <option value="Small (₹ 1 Cr - ₹ 10 Cr)">Small Enterprise (₹ 1 Cr - ₹ 10 Cr)</option>
                <option value="Medium (₹ 10 Cr - ₹ 50 Cr)">Medium Enterprise (₹ 10 Cr - ₹ 50 Cr)</option>
                <option value="Large (₹ 50 Cr - ₹ 500 Cr)">Large Industrial Unit (₹ 50 Cr - ₹ 500 Cr)</option>
                <option value="Mega / Ultra Mega (> ₹ 500 Cr)">Mega / Ultra-Mega Project (&gt; ₹ 500 Cr)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Proposed Location / District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Pune (MIDC Chakan / Ranjangaon)">Pune (MIDC Chakan / Talegaon / Ranjangaon)</option>
                <option value="Nashik (MIDC Dindori / Ambad)">Nashik (MIDC Dindori / Ambad / Sinnar)</option>
                <option value="Aurangabad / CSMN (Shendra / Waluj / DMIC)">Chhatrapati Sambhajinagar (AURIC DMIC / Shendra)</option>
                <option value="Nagpur (MIDC Butibori / MIHAN)">Nagpur (MIDC Butibori / MIHAN SEZ)</option>
                <option value="Raigad / Konkan (Dighi Port / Taloja)">Raigad (Dighi Port Industrial Zone / Taloja)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Land Possession Status</label>
              <select
                value={landStatus}
                onChange={(e) => setLandStatus(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Acquiring MIDC Plot">Applying for New Plot in Notified MIDC Estate</option>
                <option value="Already Own MIDC Plot">Already Possess Executed MIDC Lease Deed</option>
                <option value="Private NA Land">Private Non-Agricultural (NA) Land Outside MIDC</option>
                <option value="Renting Industrial Shed">Leasing / Renting Existing Industrial Shed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow flex items-center space-x-2"
            >
              <span>Next: Utility & Environmental Demand</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Utilities & Environmental Parameters */}
      {step === 2 && (
        <div className="space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center">
            <Zap size={18} className="mr-2 text-amber-500" />
            Step 2: Utility Loads & Environmental Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Connected Power Load Demand (kVA)
              </label>
              <input
                type="number"
                value={powerRequirementKva}
                onChange={(e) => setPowerRequirementKva(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl p-3 text-sm font-bold bg-white"
                min={50}
                max={50000}
                step={250}
              />
              <p className="text-[11px] text-slate-500">
                {powerRequirementKva >= 1000 
                  ? '⚠️ Requires High Tension (HT) 11kV/22kV/33kV MSEDCL Sanction + Dedicated Substation Bay.' 
                  : '✓ Eligible for Low Tension (LT) industrial connection.'}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Industrial Water Consumption (Kilo Liters / Day)
              </label>
              <input
                type="number"
                value={waterRequirementKld}
                onChange={(e) => setWaterRequirementKld(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl p-3 text-sm font-bold bg-white"
                min={5}
                max={2000}
                step={25}
              />
              <p className="text-[11px] text-slate-500">
                {waterRequirementKld >= 100 
                  ? '⚠️ Requires dedicated Effluent Treatment Plant (ETP) with Zero Liquid Discharge (ZLD).' 
                  : '✓ Standard MIDC CETP discharge permissible.'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-800">Steam Boilers or Hazardous Chemical Storage?</p>
              <p className="text-[11px] text-slate-500">Includes industrial boilers, flammable solvents, or hazardous chemical inventories.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={hasHazardousChemicals} 
                onChange={(e) => setHasHazardousChemicals(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="border border-slate-300 text-slate-700 font-bold text-xs px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow flex items-center space-x-2"
            >
              <span>Generate Approval Roadmap</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Customized Roadmap Output */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start space-x-3">
            <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-extrabold text-emerald-950">
                Clearance Roadmap Successfully Computed
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Based on your {sector} profile in {district}, you require <strong>{recommendedServices.length} statutory approvals</strong> across Pre-Establishment and Pre-Operation stages under Maharashtra Right to Services (RTS) Act.
              </p>
            </div>
          </div>

          {/* List of recommended clearances */}
          <div className="space-y-3">
            {recommendedServices.map((svc, idx) => (
              <div key={svc.code} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-lg flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900 text-sm">{svc.title}</span>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-600">{svc.department}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{svc.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs font-semibold">
                  <span className="text-slate-600">SLA: <strong>{svc.timelineDays} Days</strong></span>
                  <span className="text-blue-700 font-bold">{svc.fee}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="border border-slate-300 text-slate-700 font-bold text-xs px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Modify Answers
            </button>
            <button
              onClick={() => onApplyForServices(recommendedClearances)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs px-8 py-3.5 rounded-xl transition-all shadow-md flex items-center space-x-2"
            >
              <span>Auto-Fill Common Application Form (CAF)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
