import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, QrCode, FileText, CheckCircle2 } from 'lucide-react';

export function DigiLockerMockAuth() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState({
    aadhaar: true,
    pan: true,
  });

  const handleNext = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(step + 1);
    }, 800);
  };

  const handleConsent = () => {
    setLoading(true);
    setTimeout(() => {
      navigate('/app/documents?digilocker_success=true');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f3f4fa] flex flex-col font-sans">
      {/* Top Black Bar */}
      <div className="bg-[#1e1e1e] text-white text-xs py-1.5 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" alt="India" className="h-3 rounded-sm" />
          <span>Government of India</span>
        </div>
        <div className="flex items-center gap-4 hidden sm:flex text-[11px]">
          <span className="hover:underline cursor-pointer">Skip to main content</span>
          <span>|</span>
          <div className="flex gap-2">
            <button>A+</button>
            <button>A</button>
            <button>A-</button>
          </div>
          <span>|</span>
          <select className="bg-transparent outline-none border-none cursor-pointer">
            <option className="text-black">English</option>
            <option className="text-black">Hindi</option>
          </select>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-6 shadow-sm flex items-center gap-4">
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Gov" className="h-10 opacity-80" />
        <div className="flex items-center gap-2">
          {/* Mock DigiLocker Logo */}
          <div className="text-[#6442bc] flex items-center font-bold text-2xl tracking-tight">
            <div className="mr-2 border-2 border-[#6442bc] rounded-t-xl rounded-b-sm px-2 pb-1 pt-2 relative">
               <div className="w-2 h-2 bg-[#6442bc] rounded-full mx-auto"></div>
               <div className="w-1 h-2 bg-[#6442bc] mx-auto mt-0.5"></div>
            </div>
            DigiLocker
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[440px] bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-10">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-[22px] font-semibold text-gray-800 mb-1">Login or Create Account</h2>
              <p className="text-sm text-gray-500 mb-8">Enter your mobile number to proceed</p>

              <div className="flex items-center rounded-lg border-2 border-[#a394ec] overflow-hidden focus-within:ring-4 focus-within:ring-[#e4deff] transition-all mb-4">
                <div className="px-4 py-3 bg-white text-gray-600 font-medium border-r border-gray-200">
                  +91
                </div>
                <input 
                  type="text" 
                  value="9876543210"
                  readOnly
                  className="w-full px-4 py-3 outline-none text-gray-900 font-medium tracking-wide bg-white"
                />
              </div>

              <button 
                onClick={handleNext}
                disabled={loading}
                className="w-full py-3.5 bg-[#c2b5f5] hover:bg-[#b09df0] text-white font-medium rounded-lg transition-colors flex items-center justify-center mt-2"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Continue'}
              </button>

              <div className="text-center mt-4 text-[13px] text-gray-500">
                By continuing, I agree to the <span className="text-[#3b82f6] cursor-pointer hover:underline">Terms of Service</span>
              </div>

              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-gray-100"></div>
                <span className="px-3 text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-100"></div>
              </div>

              <button className="w-full py-3 border border-gray-200 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-3 transition-colors group">
                <QrCode className="text-[#6442bc] group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-800">Login using QR Code</div>
                  <div className="text-[11px] text-gray-500">Scan using DigiLocker Mobile App</div>
                </div>
              </button>

              <div className="text-center mt-8 text-sm text-gray-500">
                Facing trouble? <span className="text-[#3b82f6] cursor-pointer hover:underline">Try using Aadhaar or VID</span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#f3f4fa] text-[#6442bc] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e4deff]">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-[22px] font-semibold text-gray-800 mb-2">Consent to Share</h2>
                <p className="text-sm text-gray-500 px-2 leading-relaxed">
                  <strong>PRAVAH (Govt. of Maharashtra)</strong> is requesting access to the following documents from your DigiLocker.
                </p>
              </div>

              <div className="bg-[#f3f4fa] rounded-xl p-5 mb-8 border border-[#e4deff]">
                <div className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-4">Select Documents to Share</div>
                
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-0.5">
                      <input 
                        type="checkbox" 
                        className="peer sr-only"
                        checked={selectedDocs.aadhaar}
                        onChange={(e) => setSelectedDocs({...selectedDocs, aadhaar: e.target.checked})}
                      />
                      <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-[#6442bc] peer-checked:border-[#6442bc] transition-colors flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800 group-hover:text-[#6442bc] transition-colors">Aadhaar Card</div>
                      <div className="text-xs text-gray-500 mt-0.5">UIDAI - Unique Identification Authority of India</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-0.5">
                      <input 
                        type="checkbox" 
                        className="peer sr-only"
                        checked={selectedDocs.pan}
                        onChange={(e) => setSelectedDocs({...selectedDocs, pan: e.target.checked})}
                      />
                      <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-[#6442bc] peer-checked:border-[#6442bc] transition-colors flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800 group-hover:text-[#6442bc] transition-colors">PAN Verification Record</div>
                      <div className="text-xs text-gray-500 mt-0.5">Income Tax Department, All India</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  className="flex-1 py-3 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" 
                  onClick={() => navigate('/app/documents')}
                >
                  Deny
                </button>
                <button 
                  className="flex-1 py-3 text-sm font-semibold text-white bg-[#6442bc] hover:bg-[#5233a0] rounded-lg transition-colors flex items-center justify-center" 
                  onClick={handleConsent} 
                  disabled={loading || (!selectedDocs.aadhaar && !selectedDocs.pan)}
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Allow'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
