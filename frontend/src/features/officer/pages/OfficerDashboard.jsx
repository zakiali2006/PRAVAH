import React, { useState, useEffect } from "react";
import { Loader2, AlertTriangle, CheckCircle2, XCircle, Clock, ShieldAlert, Cpu, BarChart3, Users, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SectionHead } from "../../../components/common/SectionHead";
import { Btn } from "../../../components/common/Btn";
import { useApplications } from "../../../hooks/useApplications";
import { getSLADashboard, getOfficerWorkload, getOfficerDuplicates } from "../../../api/client";

export function OfficerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("workload");
  const { applications: queue, loading: queueLoading } = useApplications(true);

  // SLA Dashboard state
  const [slaData, setSlaData] = useState(null);
  const [slaLoading, setSlaLoading] = useState(false);

  // Workload state
  const [workloadData, setWorkloadData] = useState(null);
  const [workloadLoading, setWorkloadLoading] = useState(false);

  // Duplicate Detection state
  const [duplicateData, setDuplicateData] = useState(null);
  const [duplicateLoading, setDuplicateLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "sla") {
      setSlaLoading(true);
      getSLADashboard()
        .then(setSlaData)
        .catch(console.error)
        .finally(() => setSlaLoading(false));
    }
    if (activeTab === "workload" && !workloadData) {
      setWorkloadLoading(true);
      getOfficerWorkload()
        .then(setWorkloadData)
        .catch(console.error)
        .finally(() => setWorkloadLoading(false));
    }
    if (activeTab === "duplicates") {
      setDuplicateLoading(true);
      getOfficerDuplicates()
        .then(setDuplicateData)
        .catch(console.error)
        .finally(() => setDuplicateLoading(false));
    }
  }, [activeTab]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative mb-20">
      
      <div className="flex items-start justify-between flex-wrap gap-4">
        <SectionHead
          eyebrow="PRAVAH AI OPS"
          title="Smart Workload Balancer"
          sub="AI automatically prioritizes your queue based on SLA risk and detects potential fraudulent applications."
        />
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg border border-gray-200 flex-wrap">
          <button onClick={() => setActiveTab('workload')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'workload' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Workload Queue</button>
          <button onClick={() => setActiveTab('sla')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${activeTab === 'sla' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            <BarChart3 size={16} /> SLA Dashboard
          </button>
          <button onClick={() => setActiveTab('duplicates')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${activeTab === 'duplicates' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}>
            <Copy size={16} /> Duplicates
          </button>
          <button onClick={() => setActiveTab('fraud')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${activeTab === 'fraud' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>
            <ShieldAlert size={16} /> Fraud Alerts
          </button>
        </div>
      </div>

      {/* ---- WORKLOAD QUEUE TAB ---- */}
      {activeTab === 'workload' && (
        <div className="space-y-4">
          {/* Workload Summary Cards */}
          {workloadData && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-bold uppercase text-gray-500 tracking-wider">Total Assigned</div>
                <div className="text-2xl font-black text-gray-900 mt-1">{workloadData.total_assigned}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-bold uppercase text-gray-500 tracking-wider">Pending</div>
                <div className="text-2xl font-black text-blue-600 mt-1">{workloadData.pending}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-bold uppercase text-gray-500 tracking-wider">In Review</div>
                <div className="text-2xl font-black text-amber-600 mt-1">{workloadData.in_review}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-bold uppercase text-gray-500 tracking-wider">High Risk</div>
                <div className="text-2xl font-black text-red-600 mt-1">{workloadData.high_risk_count}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-bold uppercase text-gray-500 tracking-wider">Avg Risk Score</div>
                <div className="text-2xl font-black text-gray-700 mt-1">{workloadData.avg_risk_score}</div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-4">
            <Cpu className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-900">AI Priority Engine Active</h4>
              <p className="text-sm text-blue-800 mt-1">
                Your queue has been dynamically sorted. Applications breaching SLA or belonging to high-value FDI projects are pushed to the top.
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {queueLoading ? (
              <div className="p-8 text-center text-slate-500 flex justify-center items-center gap-2">
                <Loader2 className="animate-spin" /> Loading queue...
              </div>
            ) : queue.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No applications pending for review.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                  <tr>
                    <th className="px-6 py-4">Application</th>
                    <th className="px-6 py-4">AI Priority Score</th>
                    <th className="px-6 py-4">SLA Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {queue.map((item, i) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{item.id}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.service_name} · {item.applicant_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div className={`h-2 rounded-full ${item.ai_score > 65 ? 'bg-red-500' : item.ai_score > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, Math.max(0, item.ai_score || 0))}%` }}></div>
                          </div>
                          <span className="font-semibold text-gray-700">{item.ai_score ? item.ai_score.toFixed(1) : 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.ai_score > 65 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            <AlertTriangle size={14} /> Breach Risk
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            <Clock size={14} /> On Track
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Btn variant={i === 0 ? "navy" : "outline"} className={i===0 ? "bg-red-600 hover:bg-red-700 border-transparent text-white" : ""} onClick={() => navigate("/officer/queue")}>
                          Process
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ---- SLA DASHBOARD TAB ---- */}
      {activeTab === 'sla' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-4">
            <BarChart3 className="text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-indigo-900">SLA Performance Monitor</h4>
              <p className="text-sm text-indigo-800 mt-1">
                Real-time SLA tracking across all active applications and departments.
              </p>
            </div>
          </div>

          {slaLoading ? (
            <div className="p-12 text-center text-slate-500 flex justify-center items-center gap-2">
              <Loader2 className="animate-spin" /> Loading SLA data...
            </div>
          ) : slaData ? (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="text-xs font-bold uppercase text-gray-500 tracking-wider">Total Active</div>
                  <div className="text-3xl font-black text-gray-900 mt-1">{slaData.total_applications}</div>
                </div>
                <div className="bg-white border border-green-200 rounded-xl p-5 shadow-sm">
                  <div className="text-xs font-bold uppercase text-green-600 tracking-wider">On Track</div>
                  <div className="text-3xl font-black text-green-600 mt-1">{slaData.on_track}</div>
                </div>
                <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm">
                  <div className="text-xs font-bold uppercase text-amber-600 tracking-wider">At Risk</div>
                  <div className="text-3xl font-black text-amber-600 mt-1">{slaData.at_risk}</div>
                </div>
                <div className="bg-white border border-red-200 rounded-xl p-5 shadow-sm">
                  <div className="text-xs font-bold uppercase text-red-600 tracking-wider">Breached</div>
                  <div className="text-3xl font-black text-red-600 mt-1">{slaData.breached}</div>
                </div>
              </div>

              {/* Department breakdown */}
              {slaData.departments && slaData.departments.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-bold text-gray-900">Department SLA Breakdown</h3>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3 font-bold">Service</th>
                        <th className="px-6 py-3 font-bold text-center">Total</th>
                        <th className="px-6 py-3 font-bold text-center">On Track</th>
                        <th className="px-6 py-3 font-bold text-center">At Risk</th>
                        <th className="px-6 py-3 font-bold text-center">Breached</th>
                        <th className="px-6 py-3 font-bold text-center">Avg Days Left</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {slaData.departments.map((dept, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-900">{dept.department}</td>
                          <td className="px-6 py-4 text-center font-bold">{dept.total}</td>
                          <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-bold text-xs">{dept.on_track}</span></td>
                          <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-xs">{dept.at_risk}</span></td>
                          <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-xs">{dept.breached}</span></td>
                          <td className="px-6 py-4 text-center font-semibold text-gray-700">{dept.avg_days_remaining}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-slate-500">No SLA data available.</div>
          )}
        </div>
      )}

      {/* ---- DUPLICATES TAB ---- */}
      {activeTab === 'duplicates' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-4">
            <Copy className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900">Duplicate Application Detection</h4>
              <p className="text-sm text-amber-800 mt-1">
                PRAVAH AI cross-references PAN numbers, company names, and addresses to flag potential duplicate submissions for manual review.
              </p>
            </div>
          </div>

          {duplicateLoading ? (
            <div className="p-12 text-center text-slate-500 flex justify-center items-center gap-2">
              <Loader2 className="animate-spin" /> Scanning for duplicates...
            </div>
          ) : duplicateData ? (
            <>
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="text-xs font-bold uppercase text-gray-500 tracking-wider">Total Flagged</div>
                <div className="text-3xl font-black text-amber-600 mt-1">{duplicateData.total_flagged}</div>
              </div>

              {duplicateData.candidates && duplicateData.candidates.length > 0 ? (
                <div className="grid gap-4">
                  {duplicateData.candidates.map((dup, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded text-sm">{dup.application_id}</span>
                          <span className="text-gray-400">↔</span>
                          <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded text-sm">{dup.matched_application_id}</span>
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">{dup.match_type.replace(/_/g, ' ').toUpperCase()}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{dup.details}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {dup.applicant_name} · {dup.matched_applicant_name}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <div className="text-sm text-gray-500 mb-1">Confidence</div>
                        <div className="text-xl font-black text-gray-900">{dup.confidence}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-gray-200">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                  No duplicate applications detected. All submissions appear unique.
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-slate-500">Failed to load duplicate data.</div>
          )}
        </div>
      )}

      {/* ---- FRAUD ALERTS TAB ---- */}
      {activeTab === 'fraud' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-4">
            <ShieldAlert className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-900">Automated Fraud Prevention</h4>
              <p className="text-sm text-red-800 mt-1">
                PRAVAH AI cross-references submitted documents against the national database to flag forgeries, duplicates, and metadata anomalies.
              </p>
            </div>
          </div>

          <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-gray-200">
            <ShieldAlert className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <p className="font-semibold">No active fraud alerts.</p>
            <p className="text-sm text-gray-400 mt-1">
              Document-level fraud detection runs automatically when documents are validated.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
