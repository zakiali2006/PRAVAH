import React, { useState, useRef } from 'react';
import { Upload, X, File, Loader2, Bot, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { uploadDocumentAPI, validateDocumentAPI } from '../../../api/client';

export function UploadDocumentModal({ onClose, onUpload }) {
  // states: 'idle', 'analyzing', 'result', 'saving'
  const [step, setStep] = useState('idle');
  const [docName, setDocName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const [validationData, setValidationData] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [documentId, setDocumentId] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto-fill the doc name if empty
      if (!docName) {
        setDocName(file.name.split('.')[0]);
      }
      setUploadError(null);
    }
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
        alert("Please select a file first.");
        return;
    }
    if (!docName) return;
    
    // Switch to analyzing step
    setStep('analyzing');
    setUploadError(null);

    try {
      // 1. Upload Document
      // Assume documentTypeId = 1 (Certificate) for now
      const uploadRes = await uploadDocumentAPI(selectedFile, 1, JSON.stringify({ title: docName }));
      
      const newDocId = uploadRes.data.id;
      setDocumentId(newDocId);

      // 2. Validate Document via AI Pipeline
      const validationRes = await validateDocumentAPI(newDocId);
      
      setValidationData(validationRes.data);
      setStep('result');

    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'An error occurred during upload/validation.');
      setStep('idle');
    }
  };

  const handleFinalSave = async () => {
    setStep('saving');
    // For the UI, we use the returned status if available, else 'verified' if VALID
    let finalStatus = 'pending';
    if (validationData) {
        if (validationData.status === 'VALID') finalStatus = 'verified';
        else if (validationData.status === 'WARNING' || validationData.status === 'INVALID') finalStatus = 'ai_flagged';
    }

    await onUpload({
      id: documentId ? `DOC-${documentId}` : undefined,
      name: docName,
      type: selectedFile?.type || 'application/pdf',
      size: selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB` : '1.2 MB',
      status: finalStatus
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 overflow-hidden relative transition-all duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-lg text-slate-900">Upload Document</h3>
          <button onClick={onClose} disabled={step === 'analyzing' || step === 'saving'} className="text-slate-400 hover:text-slate-600 disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* ALWAYS VISIBLE: The File Dropzone / Selected File Display */}
          <div 
            className={`border-2 ${selectedFile ? 'border-solid border-emerald-300 bg-emerald-50' : 'border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100'} rounded-xl p-6 text-center transition-colors ${step === 'idle' ? 'cursor-pointer' : 'cursor-default'} relative overflow-hidden group`}
            onClick={() => step === 'idle' && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png" 
              disabled={step !== 'idle'} 
            />
            {selectedFile ? (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <File size={32} className="text-emerald-500 mb-2" />
                <p className="text-sm font-bold text-slate-800 truncate w-full px-4">{selectedFile.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                {step === 'idle' && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-2 bg-emerald-100 px-2 py-0.5 rounded">Click to change file</p>
                )}
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in duration-300">
                <Upload size={32} className="mx-auto text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-semibold text-slate-700">Click to browse or drag file here</p>
                <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 10MB</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {uploadError && (
             <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm font-medium">
                {uploadError}
             </div>
          )}

          {/* STEP 1: Upload Form Details (Idle) */}
          {step === 'idle' && (
            <form onSubmit={handleInitialSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Document Name / Title</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Fire Safety Layout Plan"
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || !docName}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                  Upload & Scan
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Analyzing (AI Simulation) */}
          {step === 'analyzing' && (
            <div className="py-4 text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 border-t border-slate-100 pt-6">
              <div className="flex items-center justify-center gap-3">
                <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                  <div className="absolute inset-0 border-2 border-blue-100 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                  <Bot size={20} className="text-blue-600 animate-pulse" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-black text-slate-800">PRAVAH AI Scanner</h4>
                  <p className="text-[11px] text-slate-500">Extracting content and running verifications via Server...</p>
                </div>
              </div>

              {/* Simulated progress texts */}
              <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-600 text-left w-full h-[88px] overflow-hidden border border-slate-200">
                <p className="text-blue-600 animate-pulse">⟳ Uploading document...</p>
                <p className="text-blue-600 mt-1 animate-pulse" style={{animationDelay: '1s', animationFillMode: 'both'}}>⟳ Extracting text via OCR...</p>
                <p className="text-blue-600 mt-1 animate-pulse" style={{animationDelay: '2s', animationFillMode: 'both'}}>⟳ Cross-referencing DB profile...</p>
              </div>
            </div>
          )}

          {/* STEP 3: Result (Real AI Output) */}
          {(step === 'result' || step === 'saving') && validationData && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 border-t border-slate-100 pt-4">
              
              {/* Dynamic Status Banner */}
              <div className={`border rounded-xl p-3 flex gap-3 items-start shadow-sm ${validationData.status === 'VALID' ? 'bg-emerald-50 border-emerald-200' : validationData.status === 'WARNING' ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'}`}>
                {validationData.status === 'VALID' ? (
                   <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                ) : (
                   <AlertTriangle className={`shrink-0 mt-0.5 ${validationData.status === 'WARNING' ? 'text-orange-500' : 'text-red-500'}`} size={18} />
                )}
                
                <div>
                  <h4 className={`text-[13px] font-bold mb-1 ${validationData.status === 'VALID' ? 'text-emerald-800' : validationData.status === 'WARNING' ? 'text-orange-800' : 'text-red-800'}`}>
                    AI Validation: {validationData.status}
                  </h4>
                  
                  {/* Render Reasons */}
                  {validationData.reasons && validationData.reasons.length > 0 ? (
                    <ul className={`text-[11px] leading-relaxed mb-2 list-disc pl-4 ${validationData.status === 'VALID' ? 'text-emerald-700' : validationData.status === 'WARNING' ? 'text-orange-700' : 'text-red-700'}`}>
                      {validationData.reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  ) : (
                     <p className={`text-[11px] leading-relaxed mb-2 ${validationData.status === 'VALID' ? 'text-emerald-700' : 'text-orange-700'}`}>
                       Document processed successfully.
                     </p>
                  )}

                  {/* Optional: Render extracted data subset if it exists */}
                  {validationData.extracted_data && Object.keys(validationData.extracted_data).length > 0 && (
                     <div className={`bg-white rounded border p-2 text-[10px] grid grid-cols-2 gap-2 mt-2 ${validationData.status === 'VALID' ? 'border-emerald-100' : 'border-orange-100'}`}>
                       {Object.entries(validationData.extracted_data).slice(0, 4).map(([key, value]) => (
                         <div key={key}>
                            <span className="block text-slate-400 font-semibold truncate capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="font-bold text-slate-800 text-xs truncate">{typeof value === 'object' ? '...' : String(value)}</span>
                         </div>
                       ))}
                     </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={step === 'saving'}
                  className="px-4 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  Cancel Upload
                </button>
                <button
                  type="button"
                  onClick={handleFinalSave}
                  disabled={step === 'saving'}
                  className="px-5 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-70 shadow-sm"
                >
                  {step === 'saving' ? <Loader2 size={16} className="animate-spin" /> : null}
                  Acknowledge & Save
                </button>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
