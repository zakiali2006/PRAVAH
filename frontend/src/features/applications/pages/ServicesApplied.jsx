import React, { useState, useMemo } from "react";
import { Loader2, Check, Clock, AlertTriangle, ArrowRight, Network, FileText, ShieldCheck, Calendar, Award, ChevronRight, Building } from "lucide-react";
import { SectionHead } from "../../../components/common/SectionHead";
import { Btn } from "../../../components/common/Btn";
import { C } from "../../../constants/theme";
import { useMockApp } from "../../../contexts/MockAppContext";

export function ServicesApplied() {
  const [view, setView] = useState('journey'); // 'journey' or 'roadmap'
  const state = useMockApp();
  
  // Hardcoded for demo purposes as in the original dashboard
  const isFireNOCUploaded = false; 

  const intelligenceStats = useMemo(() => {
    const active = state.applications.filter((a) => a.status === 'pending' || a.status === 'scrutiny').length;
    const atRisk = state.applications.filter((a) => a.status === 'action_required' || a.status === 'rejected').length;
    const completed = state.applications.filter((a) => a.status === 'approved').length;

    const healthy = state.documents.filter((d) => d.status === 'verified').length;
    const needsAttention = state.documents.filter((d) => d.status === 'rejected' || (d.issues && d.issues.length > 0)).length;
    const missing = isFireNOCUploaded ? 0 : 1;

    const overdue = state.compliances ? state.compliances.filter((c) => c.status === 'overdue').length : 0;

    return {
      apps: { active: active || 3, atRisk: atRisk || 1, completed: completed || 2 },
      docs: { healthy: healthy || 4, needsAttention: needsAttention || 1, missing: missing },
      compliance: { upcomingDeadline: 'Form V Environmental Return (30 Sep)', overdueCount: overdue },
      opportunities: {
        scheme: 'PSI 2019 (Zone C)',
        incentives: '₹ 22.5 Cr Capital Subsidy',
        regulatory: 'DISH Plan Self-Certification GR'
      }
    };
  }, [state, isFireNOCUploaded]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {view === 'roadmap' ? (
        <>
          <div className="flex items-start justify-between">
            <SectionHead
              eyebrow="AI Approval Roadmap"
              title="Project Dependency Graph"
              sub="PRAVAH AI has analyzed your project profile and sequenced the required clearances to minimize delays."
            />
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView('journey')}
                className="text-sm font-bold text-slate-500 hover:text-slate-800"
              >
                Back to Journey
              </button>
              <Btn className="flex items-center gap-2" style={{ background: C.saffron }}>
                <Network size={16} /> Re-Calculate Path
              </Btn>
            </div>
          </div>

          {/* AI Roadmap Visualization */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
            <div className="p-5 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Project: Sahyadri Precision Factory Setup</h3>
                <p className="text-sm text-gray-500 mt-1">Estimated Total Time: 45 Days (Optimized by AI)</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500"></span> Cleared</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Active</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-300"></span> Blocked/Pending</span>
              </div>
            </div>

            <div className="p-8 overflow-x-auto">
              {/* Node Based Dependency Flow */}
              <div className="min-w-[800px] flex items-center justify-between">
                
                {/* Stage 1: Pre-Establishment */}
                <div className="flex flex-col items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">Phase 1: Foundation</h4>
                  <div className="relative bg-green-50 border-2 border-green-500 text-green-800 p-4 rounded-lg w-56 text-center shadow-sm">
                    <Check size={20} className="mx-auto mb-2 text-green-600" />
                    <h5 className="font-bold text-sm">Land Allotment (MIDC)</h5>
                    <p className="text-xs mt-1">Cleared: Aug 12, 2026</p>
                  </div>
                </div>

                <ArrowRight className="text-gray-300 mx-4" size={32} />

                {/* Stage 2: Parallel NOCs */}
                <div className="flex flex-col items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">Phase 2: Parallel Approvals</h4>
                  <div className="space-y-4">
                    <div className="relative bg-amber-50 border-2 border-amber-500 text-amber-900 p-4 rounded-lg w-56 text-center shadow-sm">
                      <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow animate-pulse">SLA RISK</div>
                      <Clock size={20} className="mx-auto mb-2 text-amber-600" />
                      <h5 className="font-bold text-sm">Fire NOC</h5>
                      <p className="text-xs mt-1">Day 12 / 15 (Delayed)</p>
                    </div>
                    <div className="relative bg-green-50 border-2 border-green-500 text-green-800 p-4 rounded-lg w-56 text-center shadow-sm">
                      <Check size={20} className="mx-auto mb-2 text-green-600" />
                      <h5 className="font-bold text-sm">Tree Cutting NOC</h5>
                      <p className="text-xs mt-1">Cleared: Aug 20, 2026</p>
                    </div>
                  </div>
                </div>

                <ArrowRight className="text-gray-300 mx-4" size={32} />

                {/* Stage 3: Building Plan (Dependent on Fire NOC) */}
                <div className="flex flex-col items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">Phase 3: Construction</h4>
                  <div className="relative bg-gray-50 border-2 border-gray-300 text-gray-500 p-4 rounded-lg w-56 text-center opacity-70">
                    <AlertTriangle size={20} className="mx-auto mb-2 text-gray-400" />
                    <h5 className="font-bold text-sm">Building Plan Approval</h5>
                    <p className="text-xs mt-1">Blocked by: Fire NOC</p>
                  </div>
                </div>

                <ArrowRight className="text-gray-300 mx-4" size={32} />

                {/* Stage 4: Factory License */}
                <div className="flex flex-col items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">Phase 4: Operations</h4>
                  <div className="relative bg-gray-50 border-2 border-gray-200 text-gray-400 p-4 rounded-lg w-56 text-center opacity-50">
                    <Clock size={20} className="mx-auto mb-2 text-gray-300" />
                    <h5 className="font-bold text-sm">Factory License</h5>
                    <p className="text-xs mt-1">Pending Pre-requisites</p>
                  </div>
                </div>

              </div>
            </div>

            {/* AI Insight Box */}
            <div className="bg-blue-50 p-5 border-t border-blue-100 flex items-start gap-4">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mt-1">
                <Network size={20} />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-1">PRAVAH AI Insight</h4>
                <p className="text-sm text-blue-800">
                  The Building Plan Approval is currently blocked because the Fire NOC is experiencing regional delays. 
                  <strong> Action Recommended:</strong> Prepare your factory site layouts now, so you can submit the Building Plan application the exact moment the Fire NOC is issued.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <SectionHead
            eyebrow="My Industrial Journey"
            title="Track Application"
            sub="Standard Maharashtra RTS Industrial Setup Pipeline."
          />
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4 mt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  My Industrial Journey
                </h2>
                <span className="text-xs text-slate-400">• Standard Maharashtra RTS Industrial Setup Pipeline</span>
              </div>
            </div>

            {/* AI Risk Score Banner (Phase 12) */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-700 shadow-md my-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-16 h-16 absolute inset-0 -rotate-90">
                    <path
                      className="text-slate-700"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="text-red-500"
                      strokeDasharray="84, 100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                  </svg>
                  <div className="text-white font-black text-lg">84<span className="text-[10px] text-slate-400">%</span></div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    AI SLA Risk Score <span className="bg-red-500/20 text-red-400 border border-red-500/50 px-1.5 py-0.5 rounded text-[10px] uppercase font-black tracking-wider">Critical</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-xl">
                    Your overall industrial setup is predicted to face a <strong className="text-slate-200">22-day delay</strong>. The primary bottleneck is the <strong>Fire NOC</strong> approval block due to an incomplete document submission detected by the AI.
                  </p>
                </div>
              </div>
              <button onClick={() => setView('roadmap')} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm whitespace-nowrap transition-colors">
                View Predictive Roadmap
              </button>
            </div>

            {/* Horizontal Linear Pipeline */}
            <div className="relative pt-3 pb-2 overflow-x-auto">
              <div className="min-w-[760px] flex items-center justify-between relative">
                
                {/* Connecting Baseline */}
                <div className="absolute top-5 left-8 right-8 h-1 bg-slate-100 z-0"></div>
                
                {/* Completed Line Progress */}
                <div 
                  className="absolute top-5 left-8 h-1 bg-emerald-500 z-0 transition-all duration-500"
                  style={{ width: isFireNOCUploaded ? '50%' : '35%' }}
                ></div>

                {/* Stage 1: Business Setup */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-1.5 w-28">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md ring-4 ring-white">
                    <Check size={18} className="stroke-[3]" />
                  </div>
                  <p className="text-xs font-black text-slate-900">Business Setup</p>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Completed
                  </span>
                  <span className="text-[10px] text-slate-400">MIDC Plot Allotted</span>
                </div>

                {/* Stage 2: Documents */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-1.5 w-28">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md ring-4 ring-white">
                    <Check size={18} className="stroke-[3]" />
                  </div>
                  <p className="text-xs font-black text-slate-900">Documents</p>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    5/6 Verified
                  </span>
                  <span className="text-[10px] text-slate-400">Vault & DSC Check</span>
                </div>

                {/* Stage 3: Approvals (Active / Blocked) */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-1.5 w-28">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md ring-4 ring-white transition-colors ${
                    isFireNOCUploaded ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white ring-amber-100'
                  }`}>
                    {isFireNOCUploaded ? <Clock size={18} /> : <AlertTriangle size={18} />}
                  </div>
                  <p className="text-xs font-black text-slate-900">Approvals</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isFireNOCUploaded 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                  }`}>
                    {isFireNOCUploaded ? 'Scrutiny Active' : 'Action Needed'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isFireNOCUploaded ? 'DISH & MPCB' : 'Fire NOC Blocked'}
                  </span>
                </div>

                {/* Stage 4: Inspection */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-1.5 w-28">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 border border-slate-300 flex items-center justify-center font-bold ring-4 ring-white">
                    <Building size={16} />
                  </div>
                  <p className="text-xs font-semibold text-slate-500">Inspection</p>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    Queued
                  </span>
                  <span className="text-[10px] text-slate-400">Joint Site Visit</span>
                </div>

                {/* Stage 5: Decision */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-1.5 w-28">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 border border-slate-300 flex items-center justify-center font-bold ring-4 ring-white">
                    <ShieldCheck size={16} />
                  </div>
                  <p className="text-xs font-semibold text-slate-500">Decision</p>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    Pending
                  </span>
                  <span className="text-[10px] text-slate-400">Sanction / Grant</span>
                </div>

                {/* Stage 6: Compliance */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-1.5 w-28">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 border border-slate-300 flex items-center justify-center font-bold ring-4 ring-white">
                    <Calendar size={16} />
                  </div>
                  <p className="text-xs font-semibold text-slate-500">Compliance</p>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    Ongoing
                  </span>
                  <span className="text-[10px] text-slate-400">Form V & Returns</span>
                </div>

              </div>
            </div>
          </div>

          {/* 4 COMPACT INTELLIGENCE AREAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            
            {/* Area 1: APPLICATIONS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-900 font-black text-xs uppercase tracking-wider">
                    <FileText size={15} className="text-blue-600" />
                    <span>Applications</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Clearance Pipeline</span>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/70 border border-blue-100">
                    <span className="text-slate-700 font-semibold">Active</span>
                    <span className="font-black text-blue-800 text-sm">{intelligenceStats.apps.active}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/80 border border-amber-200">
                    <span className="text-slate-800 font-semibold flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                      At Risk
                    </span>
                    <span className="font-black text-amber-800 text-sm">{intelligenceStats.apps.atRisk}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Completed</span>
                    <span className="font-black text-emerald-700 text-sm">{intelligenceStats.apps.completed}</span>
                  </div>
                </div>
              </div>

              <button className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-between w-full">
                <span>View All Applications</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Area 2: DOCUMENTS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-900 font-black text-xs uppercase tracking-wider">
                    <ShieldCheck size={15} className="text-emerald-600" />
                    <span>Documents</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Vault Health</span>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                    <span className="text-slate-700 font-semibold">Healthy (300 DPI)</span>
                    <span className="font-black text-emerald-800 text-sm">{intelligenceStats.docs.healthy}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-700 font-semibold">Needs Attention</span>
                    <span className="font-black text-amber-700 text-sm">{intelligenceStats.docs.needsAttention}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-red-50/70 border border-red-100">
                    <span className="text-slate-800 font-semibold flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
                      Missing
                    </span>
                    <span className="font-black text-red-700 text-sm">{intelligenceStats.docs.missing}</span>
                  </div>
                </div>
              </div>

              <button className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-between w-full">
                <span>Open Document Vault</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Area 3: COMPLIANCE */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-900 font-black text-xs uppercase tracking-wider">
                    <Calendar size={15} className="text-indigo-600" />
                    <span>Compliance</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Statutory RTS</span>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Upcoming Deadline</span>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5 truncate">
                      {intelligenceStats.compliance.upcomingDeadline}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">MPCB Water & Air Act filing</p>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                    <span className="text-slate-700 font-semibold">Overdue Items</span>
                    <span className="font-black text-emerald-800 text-sm">
                      {intelligenceStats.compliance.overdueCount} (Zero Overdue)
                    </span>
                  </div>
                </div>
              </div>

              <button className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-between w-full">
                <span>Compliance Calendar</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Area 4: OPPORTUNITIES */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-900 font-black text-xs uppercase tracking-wider">
                    <Award size={15} className="text-amber-600" />
                    <span>Opportunities</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Subsidies & GR</span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-100">
                    <span className="text-[10px] uppercase font-bold text-amber-800">Eligible Scheme</span>
                    <p className="font-bold text-slate-900 truncate">{intelligenceStats.opportunities.scheme}</p>
                    <p className="text-[11px] text-emerald-700 font-black">{intelligenceStats.opportunities.incentives}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">New Regulatory Change</span>
                    <p className="font-bold text-slate-800 truncate">{intelligenceStats.opportunities.regulatory}</p>
                  </div>
                </div>
              </div>

              <button className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-between w-full">
                <span>Calculate PSI Subsidies</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
