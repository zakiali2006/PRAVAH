import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, XCircle, Loader2, FileText, Server, Search } from 'lucide-react';
import { uploadDocumentAPI, validateDocumentAPI } from '../../../api/client';
import { C } from '../../../constants/theme';

const VAULT_DOCS = [
  { id: 'v1', name: 'DigiLocker PAN Card', date: '10 Aug 2026', valid: true },
  { id: 'v2', name: 'MCA Incorporation Certificate', date: '14 Sep 2026', valid: true },
  { id: 'v3', name: 'GST Registration Certificate', date: '01 Jan 2026', valid: true }
];

export function InlineDocumentUpload({ onValidationComplete }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'vault'
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
      // 1. Upload
      const uploadRes = await uploadDocumentAPI(selectedFile, 1);
      const documentId = uploadRes.data.id;

      // 2. Validate
      const validationRes = await validateDocumentAPI(documentId);
      const data = validationRes.data;

      const isPass = data.status === 'VALID';
      setResult({
        success: isPass,
        proof: isPass ? "Document successfully validated" : (data.reasons?.join(', ') || 'Validation failed')
      });
      if (onValidationComplete) onValidationComplete(isPass);
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

  const handleVaultSelect = (doc) => {
    setFile({ name: doc.name });
    setResult({
      success: true,
      proof: "Verified from PRAVAH Central Vault"
    });
    if (onValidationComplete) onValidationComplete(true);
    setActiveTab('upload'); // Switch back to main view to show success
  };

  return (
    <div className="w-full">
      {/* Tabs */}
      {!result && (
        <div className="flex border-b border-gray-200 mb-4">
          <button 
            className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 ${activeTab === 'upload' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('upload')}
          >
            <UploadCloud size={16} /> Upload New
          </button>
          <button 
            className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 ${activeTab === 'vault' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('vault')}
          >
            <Server size={16} /> Select from PRAVAH Vault
          </button>
        </div>
      )}

      {activeTab === 'upload' || result ? (
        <div 
          className="border-2 border-dashed rounded p-6 text-center cursor-pointer transition-colors"
          style={{ borderColor: result?.success ? C.green : result?.success === false ? '#EF4444' : C.navySoft, background: C.white }}
          onClick={() => !loading && !result && fileInputRef.current?.click()}
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
                      if (onValidationComplete) onValidationComplete(e.target.checked);
                    }}
                  />
                  <label htmlFor="manualOverride" className="text-sm text-orange-900 cursor-pointer">
                    <strong>Submit for Manual Review:</strong> My document is correct, but the AI failed to read it properly. I request a manual check.
                  </label>
                </div>
              )}
              
              <button 
                className="text-xs mt-4 underline text-blue-600 hover:text-blue-800"
                onClick={(e) => {
                  e.stopPropagation();
                  setResult(null);
                  setFile(null);
                  if (onValidationComplete) onValidationComplete(false);
                }}
              >
                Upload a different file or select from Vault
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <UploadCloud size={36} color={C.navy} className="mb-3" />
              <p className="font-semibold" style={{ color: C.navyDeep }}>Upload Requirement</p>
              <p className="text-sm mt-1" style={{ color: C.slate }}>Drag and drop your file here, or click to browse.</p>
              <p className="text-xs mt-2 text-gray-400">Must be in JPG, PNG, or PDF format.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-gray-200 rounded bg-gray-50 p-4">
          <div className="flex items-center gap-2 mb-4 bg-white border border-gray-300 rounded px-3 py-1.5 shadow-sm">
            <Search size={16} className="text-gray-400" />
            <input type="text" placeholder="Search your vault..." className="w-full text-sm outline-none" />
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {VAULT_DOCS.map(doc => (
              <div 
                key={doc.id} 
                onClick={() => handleVaultSelect(doc)}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded text-blue-600">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">{doc.name}</p>
                    <p className="text-xs text-gray-500">Added: {doc.date}</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Verified
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
