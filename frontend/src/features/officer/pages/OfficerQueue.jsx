import React, { useState } from "react";
import { Loader2, CheckCircle, Clock, AlertTriangle, ChevronRight, Filter, ShieldCheck, X } from "lucide-react";
import { SectionHead } from "../../../components/common/SectionHead";
import { Btn } from "../../../components/common/Btn";
import { useApplications } from "../../../hooks/useApplications";
import { ActionRequiredModal } from "../components/ActionRequiredModal";

export function OfficerQueue() {
  const { applications: queue, loading, updateStatus } = useApplications(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [processingState, setProcessingState] = useState(false);

  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : 'unknown';
    if (s === 'approved') return <span className="uppercase text-[10px] font-black tracking-wider px-2 py-1 rounded-full border border-green-200 bg-green-50 text-green-700">Approved</span>;
    if (s === 'rejected') return <span className="uppercase text-[10px] font-black tracking-wider px-2 py-1 rounded-full border border-red-200 bg-red-50 text-red-700">Rejected</span>;
    if (s === 'submitted') return <span className="uppercase text-[10px] font-black tracking-wider px-2 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700">Submitted</span>;
    if (s === 'pending' || s === 'scrutiny' || s === 'final_approval') return <span className="uppercase text-[10px] font-black tracking-wider px-2 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700">Pending</span>;
    if (s === 'clarification') return <span className="uppercase text-[10px] font-black tracking-wider px-2 py-1 rounded-full border border-orange-200 bg-orange-50 text-orange-700">Clarification</span>;
    return <span className="uppercase text-[10px] font-black tracking-wider px-2 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600">{s}</span>;
  };

  const handleProcessClick = (app) => {
    setSelectedApp(app);
  };

  const submitAction = async (status, actionRemarks) => {
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
                <th className="p-4 font-bold">Priority Score</th>
                <th className="p-4 font-bold">SLA Risk</th>
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
                            className={`h-2 rounded-full ${item.ai_score > 3 ? 'bg-red-500' : item.ai_score > 2 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${((item.ai_score || 0) / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-slate-700">{item.ai_score ? item.ai_score.toFixed(1) : '0.0'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {item.ai_score > 3 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                          <AlertTriangle size={12} /> High
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">
                          <CheckCircle size={12} /> Normal
                        </span>
                      )}
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

      <ActionRequiredModal 
        selectedApp={selectedApp}
        onClose={() => setSelectedApp(null)}
        onAction={submitAction}
        processingState={processingState}
      />
    </div>
  );
}
