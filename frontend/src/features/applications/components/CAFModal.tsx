import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
export const CAFModal = ({ isOpen, onClose, onSubmitCAF, activeUser }) => {
  const [tab, setTab] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fraudCheckResult, setFraudCheckResult] = useState(null);
  
  // Mock API function
  const checkFraudRisk = async (data) => {
    return new Promise(resolve => setTimeout(() => resolve({ riskScore: 12, riskLevel: 'LOW', details: [] }), 800));
  };

  // Form State
  const [formData, setFormData] = useState({
    enterpriseName: activeUser?.name || 'Tata Motors Maharashtra Unit',
    panNumber: activeUser?.panNumber || 'AAACT2001A',
    gstin: activeUser?.gstin || '27AAACT2001A1Z5',
    constitution: 'Public Limited Company',
    contactPerson: 'Mr. Anand Kulkarni',
    mobile: '+91 98220 54321',
    email: 'regulatory@company.com',

    // Land & Location
    midcArea: 'Chakan Industrial Phase II',
    plotNumber: 'Plot E-14/3 (Phase II Expansion)',
    surveyNumber: 'Survey 384/2B',
    taluka: 'Khed',
    district: 'Pune',
    totalLandAreaSqM: '65,000',
    builtUpAreaSqM: '38,000',

    // Investment & Employment
    landBuildingInvestmentCr: '120.0',
    plantMachineryInvestmentCr: '280.0',
    otherAssetsInvestmentCr: '50.0',
    directEmployment: '850',
    indirectEmployment: '1200',

    // Utilities
    powerLoadKva: '7500',
    waterDemandKld: '180',
    effluentGenerationKld: '120',
    pollutionCategory: 'Red',

    // Declarations
    agreeToTerms: true
  });

  if (!isOpen) return null;

  const handleNext = () => setTab(prev => Math.min(5, prev + 1));
  const handleBack = () => setTab(prev => Math.max(1, prev - 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Call UdyogSetu Fraud / Duplicate Detection
    const fraudResult = await checkFraudRisk({
      plotNumber: formData.plotNumber,
      surveyNumber: formData.surveyNumber,
      applicantPan: formData.panNumber,
      district: formData.district
    });

    setFraudCheckResult(fraudResult);
    setIsSubmitting(false);

    // Complete CAF submission
    setTimeout(() => {
      onSubmitCAF({
        ...formData,
        submittedAt: new Date().toISOString().split('T')[0],
        cafId: `CAF-MH-${Math.floor(100000 + Math.random() * 900000)}`
      });
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow">
              CAF
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-lg">Common Application Form (CAF)</h3>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold px-2 py-0.5 rounded">
                  PRAVAH Master Single-Window
                </span>
              </div>
              <p className="text-xs text-slate-400">Statutory Master Form for Industrial Approvals & State Clearances</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation Progress */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-3 flex space-x-2 overflow-x-auto scrollbar-none flex-shrink-0">
          {[
            { id: 1, label: '1. Enterprise' },
            { id: 2, label: '2. Land & Location' },
            { id: 3, label: '3. Investment & Jobs' },
            { id: 4, label: '4. Utilities & Pollution' },
            { id: 5, label: '5. Declaration & Submit' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                tab === item.id 
                  ? 'bg-blue-600 text-white shadow' 
                  : tab > item.id 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab > item.id ? `✓ ${item.label}` : item.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* Section 1: Enterprise Info */}
          {tab === 1 && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Enterprise & Authorized Signatory Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Entity Name</label>
                  <input
                    type="text"
                    value={formData.enterpriseName}
                    onChange={(e) => setFormData({ ...formData, enterpriseName: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-white font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Constitution of Business</label>
                  <select
                    value={formData.constitution}
                    onChange={(e) => setFormData({ ...formData, constitution: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-white font-medium"
                  >
                    <option value="Public Limited Company">Public Limited Company</option>
                    <option value="Private Limited Company">Private Limited Company</option>
                    <option value="Partnership Firm">Partnership Firm</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                    <option value="Proprietorship">Proprietorship</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Permanent Account Number (PAN)</label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-white font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-white font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Authorized Signatory Name</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-white font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Mobile & Email</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl p-3 bg-white font-medium"
                      required
                    />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl p-3 bg-white font-medium"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Land & Location */}
          {tab === 2 && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Proposed Plot & Cadastral Demarcation
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">MIDC Industrial Area</label>
                  <input
                    type="text"
                    value={formData.midcArea}
                    onChange={(e) => setFormData({ ...formData, midcArea: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-white font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plot Identification Number</label>
                  <input
                    type="text"
                    value={formData.plotNumber}
                    onChange={(e) => setFormData({ ...formData, plotNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Revenue Survey / Gut Number</label>
                  <input
                    type="text"
                    value={formData.surveyNumber}
                    onChange={(e) => setFormData({ ...formData, surveyNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-white font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">District & Taluka</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl p-3 bg-white font-medium"
                      required
                    />
                    <input
                      type="text"
                      value={formData.taluka}
                      onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl p-3 bg-white font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Plot Area (Sq. Meters)</label>
                  <input
                    type="text"
                    value={formData.totalLandAreaSqM}
                    onChange={(e) => setFormData({ ...formData, totalLandAreaSqM: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Proposed Built-up Area (Sq. Meters)</label>
                  <input
                    type="text"
                    value={formData.builtUpAreaSqM}
                    onChange={(e) => setFormData({ ...formData, builtUpAreaSqM: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-white font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Investment & Jobs */}
          {tab === 3 && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Capital Expenditure & Employment Generation
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Land & Civil Works (₹ Crores)</label>
                  <input
                    type="number"
                    value={formData.landBuildingInvestmentCr}
                    onChange={(e) => setFormData({ ...formData, landBuildingInvestmentCr: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plant & Machinery (₹ Crores)</label>
                  <input
                    type="number"
                    value={formData.plantMachineryInvestmentCr}
                    onChange={(e) => setFormData({ ...formData, plantMachineryInvestmentCr: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-white font-bold text-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Gross Capital (₹ Crores)</label>
                  <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 font-black text-slate-900">
                    ₹ {(Number(formData.landBuildingInvestmentCr) + Number(formData.plantMachineryInvestmentCr) + Number(formData.otherAssetsInvestmentCr)).toFixed(1)} Cr
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Direct Employment</label>
                  <input
                    type="number"
                    value={formData.directEmployment}
                    onChange={(e) => setFormData({ ...formData, directEmployment: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Indirect Employment</label>
                  <input
                    type="number"
                    value={formData.indirectEmployment}
                    onChange={(e) => setFormData({ ...formData, indirectEmployment: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-white font-bold"
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <p className="font-bold text-blue-900">PSI 2019 Incentive Category:</p>
                  <p className="text-blue-700 mt-0.5">Qualifies for <strong>Large Industrial Project</strong> (Eligible for 100% SGST IPS refund).</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Utilities & Pollution */}
          {tab === 4 && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Utilities & Pollution Categorization (MPCB & MSEDCL)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Connected Power Load (kVA)</label>
                  <input
                    type="number"
                    value={formData.powerLoadKva}
                    onChange={(e) => setFormData({ ...formData, powerLoadKva: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-white font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Routes to MSEDCL High Tension (HT) Wing.</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Water Demand (Kilo Liters / Day)</label>
                  <input
                    type="number"
                    value={formData.waterDemandKld}
                    onChange={(e) => setFormData({ ...formData, waterDemandKld: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-white font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Routes to MIDC Water Works Department.</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pollution Category Index</label>
                  <select
                    value={formData.pollutionCategory}
                    onChange={(e) => setFormData({ ...formData, pollutionCategory: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-white font-bold text-red-600"
                  >
                    <option value="Red">Red Category (Pollution Score &gt; 60) - Heavy</option>
                    <option value="Orange">Orange Category (Score 41 - 59) - Moderate</option>
                    <option value="Green">Green Category (Score 21 - 40) - Low</option>
                    <option value="White">White Category (Score &lt; 20) - Non-polluting</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Effluent Generation (KLD)</label>
                  <input
                    type="number"
                    value={formData.effluentGenerationKld}
                    onChange={(e) => setFormData({ ...formData, effluentGenerationKld: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-white font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Requires Zero Liquid Discharge (ZLD) plant layout.</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Declaration & Submit */}
          {tab === 5 && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Digital Declaration & Statutory Undertaking
              </h4>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <p className="text-slate-700 leading-relaxed font-medium">
                  I hereby declare that all information furnished in this Common Application Form (CAF) under the 
                  <strong> Maharashtra Right to Services Act, 2015</strong> is true and accurate to the best of my knowledge. 
                  I understand that any misrepresentation of plot cadastral boundaries or environmental parameters will attract 
                  statutory penalties and revocation of provisional licenses.
                </p>

                <label className="flex items-center space-x-2 text-slate-900 font-bold cursor-pointer pt-2">
                  <input 
                    type="checkbox" 
                    checked={formData.agreeToTerms} 
                    onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                    required
                  />
                  <span>I agree to statutory terms and authorize UdyogSetu AI verification checks.</span>
                </label>
              </div>

              {/* UdyogSetu Pre-flight Scanner Notice */}
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl flex items-start space-x-3">
                <Sparkles size={20} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="text-indigo-950">
                  <p className="font-extrabold">UdyogSetu Pre-Submission Integrity Scan</p>
                  <p className="text-[11px] text-indigo-800 mt-0.5">
                    Upon submission, UdyogSetu AI will cross-verify cadastral survey boundaries with the Maharashtra Revenue GIS and calculate your instant clearance roadmap.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {tab > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            ) : <div />}

            {tab < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !formData.agreeToTerms}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-3 rounded-xl font-black transition-all shadow-md text-sm"
              >
                {isSubmitting ? (
                  <span>Running Pre-Submission Scans...</span>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Submit Master CAF & Generate Approvals</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>

      </div>
    </div>
  );
};
