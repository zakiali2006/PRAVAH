import React, { useState } from "react";
import { Loader2, CheckCircle, Clock, AlertTriangle, ChevronRight, Filter, ShieldCheck, X, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";
import { SectionHead } from "../../../components/common/SectionHead";
import { Btn } from "../../../components/common/Btn";
import { useApplications } from "../../../hooks/useApplications";
import { recalculateApplicationRisk } from "../../../api/client";

export function OfficerQueue() {
  const { applications: queue, loading, updateStatus, refresh } = useApplications(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [processingState, setProcessingState] = useState(false);
  const [actionRemarks, setActionRemarks] = useState("");
  const [recalculatingRisk, setRecalculatingRisk] = useState(false);

  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : 'unknown';
    if (s === 'approved') return <span className="uppercase text-[10px] font-black tracking-wider px-2 py-1 rounded-full border border-green-200 bg-green-50 text-green-700">Approved</span>;
    if (s === 'rejected') return <span className="uppercase text-[10px] font-black tracking-wider px-2 py-1 rounded-full border border-red-200 bg-red-50 text-red-700">Rejected</span>;
    if (s === 'submitted') return <span className="uppercase text-[10px] font-black tracking-wider px-2 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700">Submitted</span>;
    if (s === 'pending' || s === 'scrutiny' || s === 'final_approval') return <span className="uppercase text-[10px] font-black tracking-wider px-2 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700">Pending</span>;
    if (s === 'clarification') return <span className="uppercase text-[10px] font-black tracking-wider px-2 py-1 rounded-full border border-orange-200 bg-orange-50 text-orange-700">Clarification</span>;
    return <span className="uppercase text-[10px] font-black tracking-wider px-2 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600">{s}</span>;
  };

  const getTriageBadge = (app) => {
    const risk = app.risk_score;
    const cat = risk?.triage_category || (app.ai_score > 65 ? 'HIGH_RISK_REVIEW' : app.ai_score > 30 ? 'DOCUMENT_REVIEW' : 'FAST_TRACK');
    
    if (cat === 'FAST_TRACK') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle size={11} /> Fast Track
        </span>
      );
    }
    if (cat === 'DOCUMENT_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <AlertTriangle size={11} /> Doc Review
        </span>
      );
    }
    if (cat === 'HIGH_RISK_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-200">
          <AlertTriangle size={11} /> High Risk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
        Standard
      </span>
    );
  };

  const handleProcessClick = (app) => {
    setSelectedApp(app);
    setActionRemarks("");
  };

  const handleCloseModal = () => {
    setSelectedApp(null);
  };

  const handleRecalculateRisk = async () => {
    if (!selectedApp) return;
    setRecalculatingRisk(true);
    try {
      const updatedRisk = await recalculateApplicationRisk(selectedApp.id);
      setSelectedApp(prev => ({
        ...prev,
        ai_score: updatedRisk.score,
        risk_score: updatedRisk,
      }));
      if (refresh) refresh();
    } catch (err) {
      console.error("Failed to recalculate risk", err);
      alert("Failed to recalculate risk. Please try again.");
    } finally {
      setRecalculatingRisk(false);
    }
  };

  const submitAction = async (status) => {
    if (!selectedApp) return;
    setProcessingState(true);
    try {
      await updateStatus(selectedApp.id, status, actionRemarks || `Application marked as ${status}`);
      setSelectedApp(null);
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setProcessingState(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0 relative mb-20">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <SectionHead
          eyebrow="Processing"
          title="Application Queue"
          sub="Review, scrutinize, and approve pending investor applications."
        />
        <div className="flex gap-2">
          <Btn variant="outline" className="flex items-center gap-2"><Filter size={16}/> Filter</Btn>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-xs">
                <th className="p-4 font-bold">App ID</th>
                <th className="p-4 font-bold">Service & Applicant</th>
                <th className="p-4 font-bold">Risk Score</th>
                <th className="p-4 font-bold">Smart Triage</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
                    Loading your workload queue...
                  </td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-500 font-semibold text-base">
                    No applications pending for review! You're all caught up.
                  </td>
                </tr>
              ) : (
                queue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                        {item.id}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{item.service_name}</div>
                      <div className="text-slate-500 mt-0.5 text-xs">{item.applicant_name}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-200 rounded-full h-2 max-w-[80px]">
                          <div 
                            className={`h-2 rounded-full ${
                              (item.risk_score?.risk_level === 'HIGH' || item.ai_score > 65) 
                                ? 'bg-red-500' 
                                : (item.risk_score?.risk_level === 'MEDIUM' || item.ai_score > 30) 
                                ? 'bg-amber-500' 
                                : 'bg-emerald-500'
                            }`} 
                            style={{ width: `${Math.min(100, Math.max(0, item.ai_score || 0))}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-xs text-slate-700">
                          {Math.round(item.ai_score || 0)}/100
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {getTriageBadge(item)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleProcessClick(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#002a5c] text-white hover:bg-blue-800 rounded-md font-bold text-xs transition-colors shadow-sm"
                      >
                        Process <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Processing Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-blue-600" /> Action Required: {selectedApp.id}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {(() => {
                const pendingStage = selectedApp.stages?.find(s => s.status === 'pending');
                
                return (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-400 mb-1">Service Details</h4>
                        <p className="font-bold text-slate-800 text-sm">{selectedApp.service_name}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-400 mb-1">Applicant</h4>
                        <p className="font-bold text-slate-800 text-sm">{selectedApp.applicant_name}</p>
                      </div>
                    </div>

                    {pendingStage && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <h4 className="text-xs font-black uppercase text-blue-800 mb-1">Current Pending Step</h4>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                          <p className="font-bold text-slate-900">{pendingStage.name}</p>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{pendingStage.desc}</p>
                      </div>
                    )}

                    {/* Explainable AI Risk Assessment & Smart Triage Card */}
                    <div className="mt-6 p-4 rounded-xl border border-slate-200 bg-slate-50/80">
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
                          <button
                            onClick={handleRecalculateRisk}
                            disabled={recalculatingRisk}
                            title="Recalculate Risk Score"
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-blue-600 bg-white border border-slate-200 rounded-md transition-colors"
                          >
                            <RefreshCw size={11} className={recalculatingRisk ? "animate-spin text-blue-600" : ""} />
                            {recalculatingRisk ? "Calculating..." : "Recalculate"}
                          </button>
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

              <div className="mt-8">
                <h4 className="text-sm font-bold text-slate-800 mb-3">Officer Remarks</h4>
                <textarea 
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder="Enter remarks for the investor..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#f99d1c] focus:border-transparent outline-none min-h-[100px] resize-none"
                />
              </div>

                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                      <p className="text-xs font-medium text-amber-800 leading-relaxed">
                        You are about to change the status of this application. This action will immediately notify the investor and update their live tracking timeline. Please ensure remarks are clear.
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-end gap-3">
              {(() => {
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
                  <>
                    <button 
                      onClick={handleCloseModal}
                      className="px-4 py-2 font-bold text-sm text-slate-600 hover:text-slate-900 transition-colors"
                      disabled={processingState}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => submitAction('clarification')}
                      className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
                      disabled={processingState}
                    >
                      Request Clarification
                    </button>
                    <button 
                      onClick={() => submitAction('rejected')}
                      className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                      disabled={processingState}
                    >
                      Reject Application
                    </button>
                    <button 
                      onClick={() => submitAction(approveAction)}
                      className="px-6 py-2 bg-[#002a5c] text-white hover:bg-blue-900 rounded-lg font-bold text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                      disabled={processingState}
                    >
                      {processingState ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      {approveText}
                    </button>
                  </>
                );
              })()}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
