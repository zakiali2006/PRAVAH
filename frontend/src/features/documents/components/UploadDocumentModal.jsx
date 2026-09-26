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
      status: finalStatus,
      confidence: validationData?.confidence,
      matches: validationData?.matches || [],
      mismatches: validationData?.mismatches || [],
      reasons: validationData?.reasons || [],
      extracted_data: validationData?.extracted_data || {}
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-slate-200 overflow-hidden relative transition-all duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-lg text-slate-900">Upload & Verify Document</h3>
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
                  placeholder="e.g. Incorporation Certificate"
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
                  Upload & Verify
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Analyzing (AI Verification) */}
          {step === 'analyzing' && (
            <div className="py-4 text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 border-t border-slate-100 pt-6">
              <div className="flex items-center justify-center gap-3">
                <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                  <div className="absolute inset-0 border-2 border-blue-100 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                  <Bot size={20} className="text-blue-600 animate-pulse" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-black text-slate-800">PRAVAH OCR & Verification Engine</h4>
                  <p className="text-[11px] text-slate-500">Scanning document text & cross-referencing Business Profile...</p>
                </div>
              </div>

              {/* Progress feedback */}
              <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-600 text-left w-full h-[88px] overflow-hidden border border-slate-200">
                <p className="text-blue-600 animate-pulse">⟳ Uploading document securely...</p>
                <p className="text-blue-600 mt-1 animate-pulse" style={{animationDelay: '1s', animationFillMode: 'both'}}>⟳ Running Gemini Vision OCR text extraction...</p>
                <p className="text-blue-600 mt-1 animate-pulse" style={{animationDelay: '2s', animationFillMode: 'both'}}>⟳ Matching company name, PAN, and credentials against registered profile...</p>
              </div>
            </div>
          )}

          {/* STEP 3: Result (Real AI Verification Output) */}
          {(step === 'result' || step === 'saving') && validationData && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 border-t border-slate-100 pt-4 max-h-[380px] overflow-y-auto pr-1">
              
              {/* Dynamic Status Banner */}
              <div className={`border rounded-xl p-3.5 flex flex-col gap-2.5 shadow-sm ${validationData.status === 'VALID' ? 'bg-emerald-50 border-emerald-200' : validationData.status === 'WARNING' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {validationData.status === 'VALID' ? (
                       <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
                    ) : (
                       <AlertTriangle className={`shrink-0 ${validationData.status === 'WARNING' ? 'text-amber-600' : 'text-red-600'}`} size={20} />
                    )}
                    <h4 className={`text-sm font-extrabold ${validationData.status === 'VALID' ? 'text-emerald-900' : validationData.status === 'WARNING' ? 'text-amber-900' : 'text-red-900'}`}>
                      Verification: {validationData.status}
                    </h4>
                  </div>
                  {validationData.confidence !== undefined && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      validationData.confidence >= 0.85 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      validationData.confidence >= 0.60 ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      'bg-red-100 text-red-800 border-red-300'
                    }`}>
                      {Math.round(validationData.confidence * 100)}% Confidence
                    </span>
                  )}
                </div>
                
                {/* Verified Matches Chips */}
                {validationData.matches && validationData.matches.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {validationData.matches.map((m, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 size={10} /> {m.replace(/_/g, ' ').toUpperCase()} MATCHED
                      </span>
                    ))}
                  </div>
                )}

                {/* Render Reasons */}
                {validationData.reasons && validationData.reasons.length > 0 && (
                  <ul className={`text-[11px] leading-relaxed list-disc pl-4 mt-1 ${validationData.status === 'VALID' ? 'text-emerald-800' : validationData.status === 'WARNING' ? 'text-amber-800' : 'text-red-800'}`}>
                    {validationData.reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                )}

                {/* Render Mismatches Breakdown if any */}
                {validationData.mismatches && validationData.mismatches.length > 0 && (
                  <div className="mt-2 space-y-1.5 bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Mismatches Detected</div>
                    {validationData.mismatches.map((m, mIdx) => (
                      <div key={mIdx} className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 flex flex-col gap-0.5">
                        <div className="font-bold text-slate-900 capitalize">{m.field.replace(/_/g, ' ')}: <span className="font-normal text-slate-600">{m.reason}</span></div>
                        {m.expected && <div className="text-[10px] text-slate-500 font-mono">Expected: <span className="font-semibold text-slate-800">{m.expected}</span></div>}
                        {m.extracted && <div className="text-[10px] text-slate-500 font-mono">Extracted: <span className="font-semibold text-slate-800">{m.extracted}</span></div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Extracted Fields Summary */}
                {validationData.extracted_data && Object.keys(validationData.extracted_data).length > 0 && (
                   <div className="bg-white rounded-lg border border-slate-200 p-2.5 text-[10px] grid grid-cols-2 gap-2 mt-1">
                     {Object.entries(validationData.extracted_data)
                       .filter(([k, v]) => v && typeof v !== 'object' && k !== 'raw_extracted_text')
                       .slice(0, 6)
                       .map(([key, value]) => (
                         <div key={key} className="overflow-hidden">
                            <span className="block text-slate-400 font-semibold truncate capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="block font-bold text-slate-800 text-xs truncate">{String(value)}</span>
                         </div>
                     ))}
                   </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={step === 'saving'}
                  className="px-4 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  Cancel
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
