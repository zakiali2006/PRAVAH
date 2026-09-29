import React, { useState } from 'react';
import { SectionHead } from '../../../components/common/SectionHead';
import { C } from '../../../constants/theme';
import { FolderOpen, Upload, FileText, CheckCircle2, Shield, Cloud, Lock, Server, Link as LinkIcon, Loader2, AlertTriangle, X, Trash2 } from 'lucide-react';
import { Btn } from '../../../components/common/Btn';
import { useMockApp } from '../../../contexts/MockAppContext';
import { UploadDocumentModal } from '../components/UploadDocumentModal';
import { useTranslation } from '../../../contexts/TranslationContext';

export function DocumentDrive() {
  const { t } = useTranslation();
  const { addDocument } = useMockApp(); // Keeping addDocument just in case other parts of the app rely on it, but we won't use it here
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocForView, setSelectedDocForView] = useState(null);
  const [isFetchingDigiLocker, setIsFetchingDigiLocker] = useState(false);
  const [digiLockerConnected, setDigiLockerConnected] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { getMyDocuments } = await import('../../../api/client');
      const res = await getMyDocuments();
      // Map backend documents to frontend format
      const formattedDocs = res.data.map(doc => {
        const verification = doc.extracted_data?.verification || {};
        const isVerified = doc.validation_status === 'VALID' || doc.status === 'VALID';
        const isFlagged = doc.validation_status === 'INVALID' || doc.status === 'INVALID';
        const isWarning = doc.validation_status === 'WARNING' || doc.status === 'WARNING';
        
        let finalStatus = 'pending';
        if (isVerified) finalStatus = 'verified';
        else if (isFlagged || isWarning) finalStatus = 'ai_flagged';

        const formatSize = (bytes) => {
          if (!bytes) return '0 KB';
          if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
          return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        };

        return {
          id: `DOC-${doc.id}`,
          rawId: doc.id,
          name: doc.original_name || doc.filename,
          type: doc.mime_type,
          uploadDate: new Date(doc.created_at || Date.now()).toISOString().split('T')[0],
          size: formatSize(doc.size_bytes),
          status: finalStatus,
          confidence: verification.confidence,
          matches: verification.matches || [],
          mismatches: verification.mismatches || [],
          reasons: verification.reasons || [],
          extracted_data: doc.extracted_data?.fields || {},
          isDigiLocker: (doc.file_path || '').includes('/mock/')
        };
      });
      setDocuments(formattedDocs);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (rawId) => {
    if (!window.confirm("Are you sure you want to delete this document? This will remove all AI insights related to it.")) return;
    try {
      const { deleteDocumentAPI } = await import('../../../api/client');
      await deleteDocumentAPI(rawId);
      setDocuments(docs => docs.filter(d => d.rawId !== rawId));
    } catch (err) {
      console.error("Failed to delete document", err);
      alert("Could not delete document.");
    }
  };

  React.useEffect(() => {
    fetchDocuments();
  }, []);

  const location = window.location;
  const navigate = React.useCallback((path) => window.location.href = path, []);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('digilocker_success') === 'true') {
      const runSync = async () => {
        setIsFetchingDigiLocker(true);
        try {
          const { syncDigiLockerAPI } = await import('../../../api/client');
          await syncDigiLockerAPI();
          await fetchDocuments();
          setDigiLockerConnected(true);
          // Remove query param without reloading page
          window.history.replaceState({}, document.title, location.pathname);
        } catch (err) {
          console.error("Failed to sync DigiLocker", err);
        } finally {
          setIsFetchingDigiLocker(false);
        }
      };
      runSync();
    }
  }, [location.search, location.pathname]);

  const handleDigiLockerSync = () => {
    // Navigate to dummy DigiLocker flow
    window.location.href = '/digilocker-auth';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <SectionHead 
        eyebrow="Phase 3 & 21"
        title={t.vault.title} 
        sub={t.vault.sub} 
      />

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Security & Integrations */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Security Status Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-lg border border-slate-700 relative overflow-hidden">
            <Shield className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
                <Lock size={20} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Vault Status</h3>
                <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Secured & Active</p>
              </div>
            </div>
            <div className="space-y-3 text-xs text-slate-300 relative z-10">
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span>Encryption</span>
                <span className="font-mono text-white">AES-256</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span>Server Location</span>
                <span className="font-mono text-white">Mumbai, IN</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Last Audit</span>
                <span className="font-mono text-white">Today, 09:00 AM</span>
              </div>
            </div>
          </div>

          {/* DigiLocker Integration Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <Cloud size={18} className="text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-800">DigiLocker Integration</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Link your DigiLocker account to instantly fetch verified personal and business credentials without manual uploads.
            </p>
            
            {digiLockerConnected ? (
              <div className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-emerald-200">
                <CheckCircle2 size={16} /> Connected to DigiLocker
              </div>
            ) : (
              <button 
                onClick={handleDigiLockerSync}
                disabled={isFetchingDigiLocker}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-sm shadow-emerald-600/20"
              >
                {isFetchingDigiLocker ? (
                  <><Loader2 size={16} className="animate-spin" /> {t.vault.digilockerSyncing}</>
                ) : (
                  <><LinkIcon size={16} /> {t.vault.digilocker}</>
                )}
              </button>
            )}
          </div>

          {/* Storage Quota */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
             <div className="flex items-center gap-2 mb-4">
              <Server size={18} className="text-slate-600" />
              <h3 className="font-bold text-sm text-slate-800">Storage Quota</h3>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000" style={{ width: documents.length > 0 ? '15%' : '2%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>{documents.length > 0 ? '150 MB' : '0 MB'} Used</span>
              <span>1 GB Total</span>
            </div>
          </div>
        </div>

        {/* Right Area: Document List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[500px]">
            {/* Toolbar */}
            <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <FolderOpen size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Root Directory</h2>
                  <p className="text-xs text-slate-500">{documents.length} files stored securely</p>
                </div>
              </div>
              <Btn className="flex items-center gap-2 shadow-sm" onClick={() => setShowUploadModal(true)}>
                <Upload size={16} /> {t.vault.upload}
              </Btn>
            </div>
            
            {/* List */}
            <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
              {documents.map((doc) => (
                <div key={doc.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50/80 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                      <FileText size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800 group-hover:text-blue-700 transition-colors">{doc.name || doc.type}</div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{doc.id}</span>
                        <span>{doc.uploadDate}</span>
                        <span className="text-slate-300">•</span>
                        {doc.status === 'verified' || doc.isDigiLocker ? (
                          <span className="text-emerald-600 flex items-center font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            <CheckCircle2 size={12} className="mr-1" /> 
                            {doc.isDigiLocker ? 'DigiLocker Verified' : 'AI Verified'}
                          </span>
                        ) : doc.status === 'ai_flagged' ? (
                          <span className="text-rose-600 flex items-center font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                            <AlertTriangle size={12} className="mr-1" />
                            AI Flagged: Review Required
                          </span>
                        ) : (
                          <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Pending AI Review</span>
                        )}
                        {doc.confidence !== undefined && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {Math.round(doc.confidence * 100)}% Match
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 sm:mt-0 pl-16 sm:pl-0">
                    <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">{doc.size || '1.2 MB'}</span>
                    <div className="flex items-center gap-2">
                      <Btn 
                        variant="outline" 
                        className="text-xs py-1.5 px-4"
                        onClick={() => setSelectedDocForView(doc)}
                      >
                        {t.vault.view}
                      </Btn>
                      <button 
                        onClick={() => handleDeleteDocument(doc.rawId)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center p-12 text-slate-400 min-h-[300px]">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <FolderOpen size={32} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Your vault is empty.</p>
                  <p className="text-xs mt-1">Upload a document or link DigiLocker to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showUploadModal && (
        <UploadDocumentModal 
          onClose={() => setShowUploadModal(false)} 
          onUpload={() => {
            fetchDocuments();
            setShowUploadModal(false);
          }} 
        />
      )}

      {/* Verification Details Modal */}
      {selectedDocForView && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-6 shadow-2xl border border-slate-200 overflow-hidden relative">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{selectedDocForView.name || selectedDocForView.type}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedDocForView.id || 'DOC-VAULT'}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDocForView(null)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
              
              {/* Top Status Banner */}
              <div className={`border rounded-xl p-4 flex items-center justify-between shadow-sm ${
                selectedDocForView.status === 'verified' ? 'bg-emerald-50 border-emerald-200' : 
                selectedDocForView.status === 'ai_flagged' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedDocForView.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 
                    selectedDocForView.status === 'ai_flagged' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedDocForView.status === 'verified' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                  </div>
                  <div>
                    <h4 className={`text-base font-extrabold uppercase ${
                      selectedDocForView.status === 'verified' ? 'text-emerald-900' : 
                      selectedDocForView.status === 'ai_flagged' ? 'text-red-900' : 'text-amber-900'
                    }`}>
                      {selectedDocForView.status === 'verified' ? 'Verified' : 
                       selectedDocForView.status === 'ai_flagged' ? 'AI Flagged' : 'Pending'}
                    </h4>
                    <p className={`text-xs font-medium ${
                      selectedDocForView.status === 'verified' ? 'text-emerald-700' : 
                      selectedDocForView.status === 'ai_flagged' ? 'text-red-700' : 'text-amber-700'
                    }`}>
                      PRAVAH OCR Engine
                    </p>
                  </div>
                </div>
                {selectedDocForView.confidence !== undefined && (
                  <div className="text-right">
                    <div className={`text-lg font-black ${
                      selectedDocForView.confidence >= 0.85 ? 'text-emerald-700' : 
                      selectedDocForView.confidence >= 0.60 ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      {Math.round(selectedDocForView.confidence * 100)}%
                    </div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Confidence</div>
                  </div>
                )}
              </div>

              {/* Mismatches Section */}
              {selectedDocForView.mismatches && selectedDocForView.mismatches.length > 0 && (
                <div className="space-y-2.5">
                  <h5 className="text-xs font-black uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Critical Mismatches Detected
                  </h5>
                  <div className="space-y-2">
                    {selectedDocForView.mismatches.map((m, mIdx) => (
                      <div key={mIdx} className="bg-red-50/50 border border-red-100 rounded-lg p-3 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></div>
                        <div className="pl-2">
                          <h6 className="font-bold text-slate-900 text-sm capitalize mb-1">{m.field?.replace(/_/g, ' ') || 'Discrepancy'}</h6>
                          <p className="text-xs text-red-800 font-medium leading-relaxed mb-2">{m.reason}</p>
                          {(m.expected || m.extracted) && (
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
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Verification Remarks */}
              {selectedDocForView.reasons && selectedDocForView.reasons.length > 0 && (
                <div className="space-y-2">
                   <h5 className="text-xs font-black uppercase tracking-wider text-slate-500">AI Observations</h5>
                   <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                     <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 marker:text-slate-400">
                       {selectedDocForView.reasons.map((r, i) => <li key={i}>{r}</li>)}
                     </ul>
                   </div>
                </div>
              )}

              {/* Success / Matched Fields */}
              {selectedDocForView.matches && selectedDocForView.matches.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-500">Verified Matches</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocForView.matches.map((m, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={12} className="text-emerald-500" /> {m.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Data Summary */}
              {selectedDocForView.extracted_data && Object.keys(selectedDocForView.extracted_data).length > 0 && (
                 <div className="space-y-2 pt-2 border-t border-slate-100">
                   <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">Extracted Metadata</h5>
                   <div className="grid grid-cols-2 gap-3">
                     {Object.entries(selectedDocForView.extracted_data)
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
              <div className="flex justify-end pt-4 mt-2 border-t border-slate-100 sticky bottom-0 bg-white/90 backdrop-blur pb-1">
                <button
                  onClick={() => setSelectedDocForView(null)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-slate-800/20"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
