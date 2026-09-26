import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { SectionHead } from '../../../components/common/SectionHead';
import { InlineDocumentUpload } from '../components/InlineDocumentUpload';
import { Btn } from '../../../components/common/Btn';
import { C, inputCls, inputStyle } from '../../../constants/theme';
import { Check, ChevronRight, Loader2, Bot, Sparkles, ArrowLeft } from 'lucide-react';
import { useApplications } from '../../../hooks/useApplications';

const STEPS = ["Initiation", "Form Data", "Documents", "Payment"];

export function ApplyService() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { create } = useApplications();
  
  const serviceName = location.state?.serviceName || 'Factory Licence';
  const serviceFee = location.state?.fee || 5000;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: '',
    unitId: '',
    appType: serviceName,
    employees: '',
    power: '',
    pan: '',
    cin: '',
    gstin: '',
    doi: '',
    address: '',
    district: '',
    pin: '',
    sector: '',
    investment: ''
  });

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isPrefilling, setIsPrefilling] = useState(false);
  const [prefillStatusText, setPrefillStatusText] = useState('Auto-fill Data');

  if (!currentUser) {
    return (
      <div className="px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <Btn onClick={() => navigate('/login')}>Login Now</Btn>
      </div>
    );
  }

  // Mocks backend draft saving
  const handleNext = async () => {
    setIsSaving(true);
    // Simulate API call to save draft: POST/PATCH /api/applications/draft
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await create({
        service_name: formData.appType,
        applicant_name: formData.businessName || currentUser.name,
        // Let backend handle business_id or leave null for now to prevent FK error
        status: 'draft' 
      });
      alert("Application Submitted Successfully!");
      navigate('/app/applications');
    } catch (error) {
      alert("Failed to submit application");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrefill = async () => {
    setIsPrefilling(true);
    setPrefillStatusText('Connecting to PRAVAH Vault...');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setPrefillStatusText('Verifying DigiLocker KYC...');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setPrefillStatusText('Mapping Data Fields (AI)...');
    await new Promise(resolve => setTimeout(resolve, 800));

    setFormData({
      ...formData,
      businessName: 'Sahyadri Precision Ltd',
      unitId: 'U-99283-MH',
      employees: '145',
      power: '750',
      pan: 'ABCDE1234F',
      cin: 'U72900MH2021PTC123456',
      gstin: '27ABCDE1234F1Z5',
      doi: '2021-04-15',
      address: 'Plot No. 45, MIDC Industrial Area, Andheri East',
      district: 'Mumbai Suburban',
      pin: '400093',
      sector: 'Manufacturing',
      investment: '25000000'
    });
    setIsPrefilling(false);
    setIsPrefilled(true);
    setPrefillStatusText('Auto-fill Data');
  };

  const inputHighlightedCls = `${inputCls} transition-all duration-500 ${isPrefilled ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-100' : ''}`;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Services
        </button>
      </div>
      <SectionHead
        eyebrow="New Application"
        title={`Apply for ${serviceName}`}
        sub="Complete the multi-step form. Your progress is auto-saved as a draft."
      />

      {/* Stepper Header */}
      <div className="flex items-center justify-between mt-8 mb-10 border-b pb-6" style={{ borderColor: C.line }}>
        {STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isPast = currentStep > stepNum;
          return (
            <div key={step} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${isActive ? 'ring-4 ring-orange-100' : ''}`}
                style={{ 
                  background: isPast ? C.green : isActive ? C.saffron : C.bg,
                  color: isPast || isActive ? C.white : C.slate,
                  border: !isActive && !isPast ? `1px solid ${C.line}` : 'none'
                }}
              >
                {isPast ? <Check size={16} /> : stepNum}
              </div>
              <span className={`ml-3 text-sm font-medium hidden md:block ${isActive ? 'text-navy-900' : 'text-gray-500'}`}>
                {step}
              </span>
              {idx < STEPS.length - 1 && (
                <div className="w-12 md:w-24 h-px mx-4" style={{ background: C.line }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Stepper Content */}
      <div className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-gray-100 relative">
        
        {/* Phase 8: AI Pre-fill Engine Banner */}
        {(currentStep === 1 || currentStep === 2) && !isPrefilled && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex flex-col items-center justify-center shrink-0 border border-blue-200">
              <Bot size={20} className="text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                PRAVAH AI Pre-fill <span className="bg-blue-600 text-white text-[9px] uppercase px-1.5 py-0.5 rounded font-black">Available</span>
              </h4>
              <p className="text-xs text-blue-800 mt-1 mb-3">
                We've detected matching business details in your centralized vault (PRAVAH). Would you like to auto-fill this form securely?
              </p>
              <button 
                onClick={handlePrefill} 
                disabled={isPrefilling}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded shadow-sm flex items-center gap-2 transition-colors"
              >
                {isPrefilling ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {prefillStatusText}
              </button>
            </div>
          </div>
        )}
        
        {isPrefilled && (currentStep === 1 || currentStep === 2) && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-8 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
            <Check className="text-emerald-600" size={18} />
            <p className="text-xs font-bold text-emerald-800">Fields successfully pre-filled from your central vault profile.</p>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold" style={{ color: C.navyDeep }}>Step 1: Entity Details</h3>
            <p className="text-sm text-gray-500 mb-6">Confirm your primary business details to initiate the application draft.</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 flex justify-between">
                  Business / Company Name
                  {isPrefilled && <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 rounded">AI Filled</span>}
                </label>
                <input type="text" className={inputHighlightedCls} style={inputStyle} value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} placeholder="e.g. Tata Motors" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex justify-between">
                  Date of Incorporation
                  {isPrefilled && <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 rounded">AI Filled</span>}
                </label>
                <input type="date" className={inputHighlightedCls} style={inputStyle} value={formData.doi} onChange={e => setFormData({...formData, doi: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex justify-between">
                  PAN Number
                  {isPrefilled && <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 rounded">AI Filled</span>}
                </label>
                <input type="text" className={inputHighlightedCls} style={inputStyle} value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value})} placeholder="e.g. ABCDE1234F" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex justify-between">
                  Corporate Identification Number (CIN)
                  {isPrefilled && <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 rounded">AI Filled</span>}
                </label>
                <input type="text" className={inputHighlightedCls} style={inputStyle} value={formData.cin} onChange={e => setFormData({...formData, cin: e.target.value})} placeholder="e.g. U72900MH2021PTC123456" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 flex justify-between">
                  GSTIN
                  {isPrefilled && <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 rounded">AI Filled</span>}
                </label>
                <input type="text" className={inputHighlightedCls} style={inputStyle} value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} placeholder="e.g. 27ABCDE1234F1Z5" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold" style={{ color: C.navyDeep }}>Step 2: Operational Data & Location</h3>
            <p className="text-sm text-gray-500 mb-6">Enter the specifics required by the department for this service.</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 flex justify-between">
                  Registered Address
                  {isPrefilled && <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 rounded">AI Filled</span>}
                </label>
                <input type="text" className={inputHighlightedCls} style={inputStyle} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full Address" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex justify-between">
                  District
                  {isPrefilled && <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 rounded">AI Filled</span>}
                </label>
                <input type="text" className={inputHighlightedCls} style={inputStyle} value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} placeholder="e.g. Mumbai Suburban" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex justify-between">
                  PIN Code
                  {isPrefilled && <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 rounded">AI Filled</span>}
                </label>
                <input type="text" className={inputHighlightedCls} style={inputStyle} value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value})} placeholder="e.g. 400093" />
              </div>
              <div className="border-t border-gray-100 col-span-2 pt-4"></div>
              <div>
                <label className="block text-sm font-medium mb-1 flex justify-between">
                  Industry Sector
                  {isPrefilled && <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 rounded">AI Filled</span>}
                </label>
                <input type="text" className={inputHighlightedCls} style={inputStyle} value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})} placeholder="e.g. Manufacturing" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex justify-between">
                  Projected Investment (₹)
                  {isPrefilled && <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 rounded">AI Filled</span>}
                </label>
                <input type="number" className={inputHighlightedCls} style={inputStyle} value={formData.investment} onChange={e => setFormData({...formData, investment: e.target.value})} placeholder="e.g. 25000000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex justify-between">
                  Number of Employees
                  {isPrefilled && <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 rounded">AI Filled</span>}
                </label>
                <input type="number" className={inputHighlightedCls} style={inputStyle} value={formData.employees} onChange={e => setFormData({...formData, employees: e.target.value})} placeholder="e.g. 100" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex justify-between">
                  Total HP Power Required
                  {isPrefilled && <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 rounded">AI Filled</span>}
                </label>
                <input type="number" className={inputHighlightedCls} style={inputStyle} value={formData.power} onChange={e => setFormData({...formData, power: e.target.value})} placeholder="e.g. 500" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold" style={{ color: C.navyDeep }}>Step 3: Upload Documents</h3>
            <p className="text-sm text-gray-500 mb-6">Our AI will validate your documents instantly. You cannot proceed until mandatory documents are verified or submitted for manual review.</p>
            
            <div>
              <label className="block text-sm font-medium mb-2">Incorporation Certificate (Required)</label>
              <InlineDocumentUpload onValidationComplete={(isValid) => setIsValidated(isValid)} />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in text-center py-8">
            <h3 className="text-2xl font-bold mb-2" style={{ color: C.navyDeep }}>Final Review</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-8">
              I hereby declare that all information provided is true. I understand that submitting false documents is punishable under law.
            </p>
            <div className="p-6 bg-gray-50 rounded-lg max-w-sm mx-auto text-left mb-8 border border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Application Fee</span>
                <span className="font-semibold">₹{serviceFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2 border-gray-200">
                <span className="text-sm font-bold">Total to Pay</span>
                <span className="font-bold text-lg text-green-700">₹{serviceFee.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Stepper Footer / Controls */}
        <div className="mt-10 pt-6 border-t flex items-center justify-between" style={{ borderColor: C.line }}>
          <Btn 
            variant="ghost" 
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 1 || isSaving}
          >
            Back
          </Btn>

          {currentStep < 4 ? (
            <Btn onClick={handleNext} disabled={isSaving || (currentStep === 3 && !isValidated)}>
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : "Save Draft & Next"} 
              {!isSaving && <ChevronRight size={18} className="ml-1" />}
            </Btn>
          ) : (
            <Btn onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Check size={18} className="mr-2" />}
              Pay & Submit
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}
