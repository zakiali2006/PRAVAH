import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { validateDocument } from '../../../api/client';
import { C } from '../../../constants/theme';

export function InlineDocumentUpload({ onValidationComplete }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);
    setResult(null);

    try {
      const response = await validateDocument(selectedFile);
      setResult({
        success: response.status === 'Pass',
        proof: response.proof
      });
      if (onValidationComplete) {
        onValidationComplete(response.status === 'Pass');
      }
    } catch (err) {
      setResult({
        success: false,
        proof: "❌ " + err.message
      });
      if (onValidationComplete) onValidationComplete(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div 
        className="border-2 border-dashed rounded p-6 text-center cursor-pointer transition-colors"
        style={{ borderColor: result?.success ? C.green : result?.success === false ? '#EF4444' : C.navySoft, background: C.white }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/png, image/jpeg, application/pdf"
        />
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="animate-spin mb-3" size={32} color={C.saffron} />
            <p className="font-semibold text-sm" style={{ color: C.navyDeep }}>AI is validating document context...</p>
            <p className="text-xs mt-1" style={{ color: C.slate }}>Cross-referencing your Business Profile</p>
          </div>
        ) : result ? (
          <div className="flex flex-col items-center justify-center py-2">
            {result.success ? (
              <CheckCircle2 size={36} color={C.green} className="mb-2" />
            ) : (
              <XCircle size={36} color="#EF4444" className="mb-2" />
            )}
            <p className="font-semibold text-sm mb-1">{file.name}</p>
            <div className={`text-sm px-4 py-2 rounded font-medium ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {result.proof}
            </div>
            
            {result.success === false && (
              <div 
                className="mt-3 flex items-start gap-2 text-left bg-orange-50 p-3 rounded border border-orange-200"
                onClick={(e) => e.stopPropagation()}
              >
                <input 
                  type="checkbox" 
                  id="manualOverride" 
                  className="mt-1"
                  onChange={(e) => {
                    if (onValidationComplete) {
                      onValidationComplete(e.target.checked); // true unlocks the button
                    }
                  }}
                />
                <label htmlFor="manualOverride" className="text-sm text-orange-900 cursor-pointer">
                  <strong>Submit for Manual Review:</strong> My document is correct, but the AI failed to read it properly. I request a manual check by an officer.
                </label>
              </div>
            )}
            
            <p className="text-xs mt-3 underline text-gray-500">Click anywhere here to upload a different file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <UploadCloud size={32} color={C.navy} className="mb-3" />
            <p className="font-semibold text-sm" style={{ color: C.navyDeep }}>Upload Incorporation Certificate</p>
            <p className="text-xs mt-1" style={{ color: C.slate }}>Must be in JPG, PNG, or PDF format.</p>
          </div>
        )}
      </div>
    </div>
  );
}
