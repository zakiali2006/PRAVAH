import React, { useState } from 'react';
import { SectionHead } from '../../../components/common/SectionHead';
import { C } from '../../../constants/theme';
import { FolderOpen, Upload, FileText, CheckCircle2, Shield, Cloud, Lock, Server, Link as LinkIcon, Loader2, AlertTriangle, X } from 'lucide-react';
import { Btn } from '../../../components/common/Btn';
import { useMockApp } from '../../../contexts/MockAppContext';
import { UploadDocumentModal } from '../components/UploadDocumentModal';

export function DocumentDrive() {
  const { documents, addDocument } = useMockApp();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocForView, setSelectedDocForView] = useState(null);
  const [isFetchingDigiLocker, setIsFetchingDigiLocker] = useState(false);
  const [digiLockerConnected, setDigiLockerConnected] = useState(false);

  const handleDigiLockerSync = () => {
    setIsFetchingDigiLocker(true);
    setTimeout(() => {
      // Mock fetching from DigiLocker
      addDocument({
        name: 'Aadhaar Card (Masked)',
        type: 'application/pdf',
        size: '450 KB'
      });
      addDocument({
        name: 'PAN Card',
        type: 'application/pdf',
        size: '320 KB'
      });
      setIsFetchingDigiLocker(false);
      setDigiLockerConnected(true);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <SectionHead 
        eyebrow="Phase 3 & 21"
        title="Secure Document Vault" 
        sub="Your centralized, end-to-end encrypted repository for all official documents." 
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
                  <><Loader2 size={16} className="animate-spin" /> Fetching Credentials...</>
                ) : (
                  <><LinkIcon size={16} /> Link DigiLocker</>
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
                <Upload size={16} /> Upload New Document
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
                        {doc.status === 'verified' || (doc.name || doc.type || '').includes('Aadhaar') || (doc.name || doc.type || '').includes('PAN') ? (
                          <span className="text-emerald-600 flex items-center font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            <CheckCircle2 size={12} className="mr-1" /> 
                            {(doc.name || doc.type || '').includes('Aadhaar') || (doc.name || doc.type || '').includes('PAN') ? 'DigiLocker Verified' : 'AI Verified'}
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
                    <Btn 
                      variant="outline" 
                      className="text-xs py-1.5 px-4"
                      onClick={() => setSelectedDocForView(doc)}
                    >
                      View
                    </Btn>
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
          onUpload={addDocument} 
        />
      )}

      {/* Verification Details Modal */}
      {selectedDocForView && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{selectedDocForView.name || selectedDocForView.type}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedDocForView.id || 'DOC-VAULT'}</p>
              </div>
              <button 
                onClick={() => setSelectedDocForView(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] font-black uppercase text-slate-400 mb-1">OCR Verification Status</div>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                    selectedDocForView.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                    selectedDocForView.status === 'ai_flagged' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedDocForView.status === 'verified' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                    {selectedDocForView.status ? selectedDocForView.status.toUpperCase() : 'VERIFIED'}
                  </span>
                  {selectedDocForView.confidence && (
                    <span className="text-xs font-extrabold text-slate-700">
                      {Math.round(selectedDocForView.confidence * 100)}% Confidence
                    </span>
                  )}
                </div>
              </div>

              {selectedDocForView.matches && selectedDocForView.matches.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-700 mb-1.5">Profile Matches:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDocForView.matches.map((m, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={10} /> {m.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedDocForView.mismatches && selectedDocForView.mismatches.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-red-700 mb-1.5">Mismatches / Attention Required:</div>
                  <div className="space-y-1.5">
                    {selectedDocForView.mismatches.map((m, idx) => (
                      <div key={idx} className="text-[11px] bg-red-50 text-red-800 p-2 rounded border border-red-200">
                        <span className="font-bold capitalize">{m.field.replace(/_/g, ' ')}:</span> {m.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDocForView.reasons && selectedDocForView.reasons.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-700 mb-1">Verification Remarks:</div>
                  <ul className="text-xs text-slate-600 list-disc pl-4 space-y-0.5">
                    {selectedDocForView.reasons.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedDocForView(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
