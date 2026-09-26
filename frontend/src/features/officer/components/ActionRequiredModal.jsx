import React, { useState } from 'react';
import { Loader2, CheckCircle, AlertTriangle, ShieldCheck, X, FileText, ShieldAlert, RefreshCw } from 'lucide-react';

export function ActionRequiredModal({ selectedApp, onClose, onAction, processingState, onRecalculateRisk, recalculatingRisk }) {
  const [actionRemarks, setActionRemarks] = useState("");

  if (!selectedApp) return null;

  const pendingStage = selectedApp.stages?.find(s => s.status === 'pending');

  let approveText = "Approve Application";
  let approveAction = "approved";

  if (pendingStage?.name === "Document Verification") {
    approveText = "Approve Documents";
    approveAction = "approve_documents";
  } else if (pendingStage?.name === "Department Scrutiny") {
    approveText = "Complete Scrutiny";
    approveAction = "approve_scrutiny";
  } else if (pendingStage?.name === "Final Approval") {
    approveText = "Grant Final Approval";
    approveAction = "approve_final";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-blue-600" /> Action Required: {selectedApp.id}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-8">
          {/* Explainable AI Risk Assessment & Smart Triage Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className={
                  (selectedApp.risk_score?.risk_level === 'HIGH' || selectedApp.ai_score > 65)
                    ? "text-red-600"
                    : (selectedApp.risk_score?.risk_level === 'MEDIUM' || selectedApp.ai_score > 30)
                    ? "text-amber-600"
                    : "text-emerald-600"
                } size={18} />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  AI Risk Triage Analysis
                </h4>
              </div>
              <div className="flex items-center gap-2">
                {onRecalculateRisk && (
                  <button
                    onClick={onRecalculateRisk}
                    disabled={recalculatingRisk}
                    title="Recalculate Risk Score"
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-blue-600 bg-white border border-slate-200 rounded-md transition-colors"
                  >
                    <RefreshCw size={11} className={recalculatingRisk ? "animate-spin text-blue-600" : ""} />
                    {recalculatingRisk ? "Calculating..." : "Recalculate"}
                  </button>
                )}
                <span className={`px-2 py-0.5 rounded text-xs font-black uppercase ${
                  (selectedApp.risk_score?.risk_level === 'HIGH' || selectedApp.ai_score > 65)
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : (selectedApp.risk_score?.risk_level === 'MEDIUM' || selectedApp.ai_score > 30)
                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                    : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                }`}>
                  {selectedApp.risk_score?.risk_level || (selectedApp.ai_score > 65 ? "HIGH" : selectedApp.ai_score > 30 ? "MEDIUM" : "LOW")} RISK ({Math.round(selectedApp.ai_score || 0)}/100)
                </span>
              </div>
            </div>

            {/* Summary */}
            <p className="text-xs text-slate-600 leading-relaxed font-medium bg-white p-2.5 rounded-lg border border-slate-200/80 mb-3">
              {selectedApp.risk_score?.summary || `Application evaluated with priority score of ${Math.round(selectedApp.ai_score || 0)}/100.`}
            </p>

            {/* Factors list */}
            {selectedApp.risk_score?.factors && selectedApp.risk_score.factors.length > 0 ? (
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase text-slate-400">Identified Risk Factors</div>
                {selectedApp.risk_score.factors.map((f, fIdx) => (
                  <div key={fIdx} className="flex items-start justify-between gap-2 p-2 bg-white rounded-md border border-slate-100 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{f.factor}:</span>{" "}
                      <span className="text-slate-600">{f.reason}</span>
                    </div>
                    <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-black bg-red-50 text-red-600 border border-red-100">
                      +{f.impact} pts
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                <CheckCircle size={14} /> Zero high-risk compliance discrepancies detected across submitted documents.
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-400 mb-2">Service Details</h4>
              <p className="font-bold text-slate-800">{selectedApp.service_name}</p>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-slate-400 mb-2">Applicant / Business Profile</h4>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                <p className="font-bold text-slate-800 text-base">{selectedApp.applicant_name}</p>
                <div className="text-sm text-slate-600 grid grid-cols-2 gap-4">
                  <div><span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-0.5">PAN</span>ABCDE1234F</div>
                  <div><span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-0.5">GSTIN</span>27ABCDE1234F1Z5</div>
                  <div><span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-0.5">Sector</span>Manufacturing</div>
                  <div><span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-0.5">District</span>Mumbai Suburban</div>
                </div>
              </div>
            </div>

            {pendingStage && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <h4 className="text-xs font-black uppercase text-blue-800 mb-1">Current Pending Step</h4>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <p className="font-bold text-slate-900">{pendingStage.name}</p>
                </div>
                <p className="text-sm text-slate-600 mt-1">{pendingStage.desc}</p>
              </div>
            )}

          </div>

          <div className="space-y-6">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
               <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><FileText size={16}/> Submitted Documents</h4>
               <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg mb-2 shadow-sm">
                 <span className="text-sm font-medium text-slate-700">Incorporation Certificate</span>
                 <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">AI Verified</span>
               </div>
               <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                 <span className="text-sm font-medium text-slate-700">PAN Card</span>
                 <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">Vault Verified</span>
               </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-3">Officer Remarks</h4>
              <textarea 
                value={actionRemarks}
                onChange={(e) => setActionRemarks(e.target.value)}
                placeholder="Enter remarks for the investor..."
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[120px] resize-none shadow-sm"
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
              <p className="text-xs font-medium text-amber-800 leading-relaxed">
                This action immediately notifies the investor and updates their live tracking.
              </p>
            </div>
          </div>
        </div>
      </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 font-bold text-sm text-slate-600 hover:text-slate-900 transition-colors"
            disabled={processingState}
          >
            Cancel
          </button>
          <button 
            onClick={() => onAction('clarification', actionRemarks)}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
            disabled={processingState}
          >
            Request Clarification
          </button>
          <button 
            onClick={() => onAction('rejected', actionRemarks)}
            className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 shadow-sm"
            disabled={processingState}
          >
            Reject Application
          </button>
          <button 
            onClick={() => onAction(approveAction, actionRemarks)}
            className="px-6 py-2 bg-[#002a5c] text-white hover:bg-blue-900 rounded-lg font-bold text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            disabled={processingState}
          >
            {processingState ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            {approveText}
          </button>
        </div>
      </div>
    </div>
  );
}
