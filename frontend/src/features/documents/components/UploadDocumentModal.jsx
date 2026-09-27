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

    const formatSize = (bytes) => {
      if (!bytes) return '0 KB';
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    await onUpload({
      id: documentId ? `DOC-${documentId}` : undefined,
      name: docName,
      type: selectedFile?.type || 'application/pdf',
      size: selectedFile ? formatSize(selectedFile.size) : '1.2 MB',
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
      <div className="bg-white max-w-2xl w-full rounded-2xl p-6 shadow-2xl border border-slate-200 overflow-hidden relative transition-all duration-300">
        
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
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedFile.size < 1024 * 1024 
                    ? `${(selectedFile.size / 1024).toFixed(0)} KB` 
                    : `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`}
                </p>
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
            <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500 border-t border-slate-100 pt-5 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
              
              {/* Top Status Banner */}
              <div className={`border rounded-xl p-4 flex items-center justify-between shadow-sm ${
                validationData.status === 'VALID' ? 'bg-emerald-50 border-emerald-200' : 
                validationData.status === 'WARNING' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    validationData.status === 'VALID' ? 'bg-emerald-100 text-emerald-700' : 
                    validationData.status === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {validationData.status === 'VALID' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                  </div>
                  <div>
                    <h4 className={`text-base font-extrabold ${
                      validationData.status === 'VALID' ? 'text-emerald-900' : 
                      validationData.status === 'WARNING' ? 'text-amber-900' : 'text-red-900'
                    }`}>
                      {validationData.status === 'VALID' ? 'Document Verified' : 
                       validationData.status === 'WARNING' ? 'Needs Attention' : 'Verification Failed'}
                    </h4>
                    <p className={`text-xs font-medium ${
                      validationData.status === 'VALID' ? 'text-emerald-700' : 
                      validationData.status === 'WARNING' ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      AI Analysis Complete
                    </p>
                  </div>
                </div>
                {validationData.confidence !== undefined && (
                  <div className="text-right">
                    <div className={`text-lg font-black ${
                      validationData.confidence >= 0.85 ? 'text-emerald-700' : 
                      validationData.confidence >= 0.60 ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      {Math.round(validationData.confidence * 100)}%
                    </div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Confidence</div>
                  </div>
                )}
              </div>

              {/* Mismatches Section - Prominently Displayed if Present */}
              {validationData.mismatches && validationData.mismatches.length > 0 && (
                <div className="space-y-2.5">
                  <h5 className="text-xs font-black uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Critical Mismatches Detected
                  </h5>
                  <div className="space-y-2">
                    {validationData.mismatches.map((m, mIdx) => (
                      <div key={mIdx} className="bg-red-50/50 border border-red-100 rounded-lg p-3 relative overflow-hidden group">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></div>
                        <div className="pl-2">
                          <h6 className="font-bold text-slate-900 text-sm capitalize mb-1">{m.field.replace(/_/g, ' ')}</h6>
                          <p className="text-xs text-red-800 font-medium leading-relaxed mb-2">{m.reason}</p>
                          <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t border-red-100/50">
                            <div>
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Expected (Profile)</span>
                              <span className="block text-xs font-medium text-slate-700 mt-0.5">{m.expected || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Found (Document)</span>
                              <span className="block text-xs font-medium text-slate-700 mt-0.5">{m.extracted || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Verification Remarks */}
              {validationData.reasons && validationData.reasons.length > 0 && (
                <div className="space-y-2">
                   <h5 className="text-xs font-black uppercase tracking-wider text-slate-500">AI Observations</h5>
                   <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                     <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 marker:text-slate-400">
                       {validationData.reasons.map((r, i) => <li key={i}>{r}</li>)}
                     </ul>
                   </div>
                </div>
              )}

              {/* Success / Matched Fields */}
              {validationData.matches && validationData.matches.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-500">Verified Matches</h5>
                  <div className="flex flex-wrap gap-2">
                    {validationData.matches.map((m, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={12} className="text-emerald-500" /> {m.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Data Summary */}
              {validationData.extracted_data && Object.keys(validationData.extracted_data).length > 0 && (
                 <div className="space-y-2 pt-2 border-t border-slate-100">
                   <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">Extracted Metadata</h5>
                   <div className="grid grid-cols-2 gap-3">
                     {Object.entries(validationData.extracted_data)
                       .filter(([k, v]) => v && typeof v !== 'object' && k !== 'raw_extracted_text')
                       .slice(0, 6)
                       .map(([key, value]) => (
                         <div key={key} className="bg-white border border-slate-100 rounded-md p-2 shadow-sm">
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wide truncate">{key.replace(/_/g, ' ')}</span>
                            <span className="block font-medium text-slate-800 text-xs mt-0.5 truncate">{String(value)}</span>
                         </div>
                     ))}
                   </div>
                 </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100 sticky bottom-0 bg-white/90 backdrop-blur pb-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={step === 'saving'}
                  className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinalSave}
                  disabled={step === 'saving'}
                  className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-70 shadow-md shadow-blue-600/20 transition-colors"
                >
                  {step === 'saving' ? <Loader2 size={16} className="animate-spin" /> : null}
                  {validationData.status === 'VALID' ? 'Save Document' : 'Save & Flag for Review'}
                </button>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
