import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Check, Clock, AlertTriangle, ChevronRight, FileText, Calendar, ArrowLeft, Trash2 } from "lucide-react";
import { SectionHead } from "../../../components/common/SectionHead";
import { Btn } from "../../../components/common/Btn";
import { C } from "../../../constants/theme";
import { useApplications } from "../../../hooks/useApplications";

export function ServicesApplied() {
  const [view, setView] = useState('list'); // 'list' or 'track'
  const [selectedApp, setSelectedApp] = useState(null);
  const { applications, loading: appsLoading, refresh } = useApplications();

  const handleTrack = (app) => {
    setSelectedApp(app);
    setView('track');
  };

  const handleBack = () => {
    setView('list');
    setSelectedApp(null);
  };

  const handleDeleteApp = async (appId) => {
    if (!window.confirm("Are you sure you want to delete this application? All tracking and submitted data will be removed forever.")) return;
    try {
      const { deleteApplicationAPI } = await import('../../../api/client');
      await deleteApplicationAPI(appId);
      refresh();
    } catch (err) {
      console.error("Failed to delete application", err);
      alert("Could not delete application.");
    }
  };

  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : 'unknown';
    if (s === 'approved') return <span className="px-2.5 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-xs font-bold uppercase tracking-wider">Approved</span>;
    if (s === 'draft') return <span className="px-2.5 py-1 bg-gray-100 text-gray-800 border border-gray-200 rounded-full text-xs font-bold uppercase tracking-wider">Draft</span>;
    if (s === 'submitted') return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider">Submitted</span>;
    if (s === 'rejected') return <span className="px-2.5 py-1 bg-red-100 text-red-800 border border-red-200 rounded-full text-xs font-bold uppercase tracking-wider">Rejected</span>;
    if (s === 'pending' || s === 'scrutiny' || s === 'final_approval') return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider">Pending Processing</span>;
    if (s === 'clarification') return <span className="px-2.5 py-1 bg-orange-100 text-orange-800 border border-orange-200 rounded-full text-xs font-bold uppercase tracking-wider">Clarification Needed</span>;
    return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-full text-xs font-bold uppercase tracking-wider">{s}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0 mb-20">
      
      {view === 'list' ? (
        <>
          <SectionHead
            eyebrow="My Applications"
            title="Application Tracking Dashboard"
            sub="View all your applied services, track their progress, and take action on pending items."
          />
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
            <div className="p-5 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                Submitted Applications
              </h3>
              <div className="text-sm font-semibold text-slate-500">
                Total: {applications.length}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="p-4 font-bold">App ID</th>
                    <th className="p-4 font-bold">Service Name</th>
                    <th className="p-4 font-bold">Applicant</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Date</th>
                    <th className="p-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appsLoading ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                        Loading applications...
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">
                        You have not applied for any services yet.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                            {app.id}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-900">{app.service_name}</td>
                        <td className="p-4 text-sm text-slate-600">{app.applicant_name}</td>
                        <td className="p-4">{getStatusBadge(app.status)}</td>
                        <td className="p-4 text-sm text-slate-600">
                          {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'Not Submitted'}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleTrack(app)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-bold text-xs transition-colors"
                            >
                              Track <ChevronRight size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteApp(app.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Application"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <SectionHead
              eyebrow="Live Tracking"
              title={`Track Application`}
              sub={`Monitoring timeline for ${selectedApp?.service_name}`}
            />
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
            >
              <ArrowLeft size={16} /> Back to List
            </button>
          </div>

          {/* Tracking Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
            <div className="p-5 bg-slate-50 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Application Details</h3>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-400">ID:</span> 
                    <span className="font-mono text-slate-800 bg-white px-1.5 py-0.5 rounded border">{selectedApp?.id}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-400">Applicant:</span> 
                    <span className="font-semibold text-slate-800">{selectedApp?.applicant_name}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-400">Date:</span> 
                    <span className="font-semibold text-slate-800">
                      {selectedApp?.submitted_at ? new Date(selectedApp.submitted_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </span>
                </div>
              </div>
              <div>
                {getStatusBadge(selectedApp?.status)}
              </div>
            </div>

            <div className="p-4 sm:p-8">
              <div className="w-full py-8">
                <div className="flex items-start justify-between w-full">
                  {selectedApp?.stages?.length > 0 ? (
                    selectedApp.stages.map((stage, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center text-center relative group">
                        
                        {/* Connecting Line Segment (starts from center of this node, goes to center of next) */}
                        {idx < selectedApp.stages.length - 1 && (
                          <div className="absolute top-5 left-[50%] w-full h-1 bg-slate-200 z-0">
                            <motion.div 
                              className="h-full bg-emerald-500"
                              initial={{ width: '0%' }}
                              animate={{ width: stage.status === 'completed' ? '100%' : '0%' }}
                              transition={{ duration: 1, delay: idx * 1, ease: 'easeInOut' }}
                            ></motion.div>
                          </div>
                        )}

                        {/* Circle Indicator */}
                        <motion.div 
                          className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold shadow-sm ring-4 ring-white relative z-10
                            ${stage.status === 'completed' ? 'text-white' : 
                              stage.status === 'pending' ? 'text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 
                              'text-slate-300 border border-slate-200'}`}
                          initial={{ backgroundColor: '#f1f5f9', scale: 0.8 }}
                          animate={{ 
                            backgroundColor: stage.status === 'completed' ? '#10b981' : stage.status === 'pending' ? '#f59e0b' : '#f1f5f9',
                            scale: stage.status === 'completed' ? 1.1 : 1
                          }}
                          transition={{ duration: 0.5, delay: idx === 0 ? 0 : (idx * 1) - 0.2 }}
                        >
                          {stage.status === 'completed' ? <Check size={18} className="stroke-[3]" /> : 
                           stage.status === 'pending' ? <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}><Clock size={18} className="stroke-[3]" /></motion.div> : 
                           <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>}
                        </motion.div>
                        
                        {/* Text Content */}
                        <motion.div 
                          className="mt-4 px-1 sm:px-4 hidden sm:block relative z-10"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: idx === 0 ? 0 : (idx * 1) - 0.2 }}
                        >
                          <p className={`text-[13px] font-bold tracking-tight transition-colors duration-500 ${stage.status === 'completed' || stage.status === 'pending' ? 'text-slate-800' : 'text-slate-400'}`}>
                            {stage.name}
                          </p>
                          {stage.desc && (
                            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed hidden md:block max-w-[140px] mx-auto">{stage.desc}</p>
                          )}
                          <span className={`inline-block mt-3 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider transition-all duration-500
                            ${stage.status === 'completed' ? 'text-emerald-700 bg-emerald-50/80 border border-emerald-200/50' : 
                              stage.status === 'pending' ? 'text-amber-700 bg-amber-50/80 border border-amber-200/50' : 
                              'text-slate-500 bg-slate-50 border border-slate-200'}`}
                          >
                            {stage.status}
                          </span>
                        </motion.div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full text-center text-slate-500 py-4 font-semibold text-sm">
                      No tracking stages found for this application yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
