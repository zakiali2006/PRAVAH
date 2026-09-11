import React, { useState, useEffect } from "react";
import { Loader2, AlertTriangle, CheckCircle2, XCircle, Clock, ShieldAlert, Cpu } from "lucide-react";
import { SectionHead } from "../../../components/common/SectionHead";
import { Btn } from "../../../components/common/Btn";

export function OfficerDashboard() {
  const [activeTab, setActiveTab] = useState("workload");
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const fetchQueue = async () => {
      // Simulate network request
      await new Promise(r => setTimeout(r, 800));
      setQueue([
        { id: "MTR/2026/001", service_name: "Fire NOC", applicant_name: "Sahyadri Precision", urgency: "critical", ai_score: 4.8, status: "pending" }
      ]);
    };
    fetchQueue();
  }, []);

  const MOCK_FRAUD = [
    { id: "MTR/2026/112", applicant: "Unknown Shell Corp", issue: "Duplicate PAN Card detected across 3 distinct entities", confidence: 99.8 },
    { id: "MTR/2026/156", applicant: "Global Traders Inc", issue: "Geotag metadata on property deed does not match declared coordinates", confidence: 87.5 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      <div className="flex items-start justify-between">
        <SectionHead
          eyebrow="PRAVAH AI OPS"
          title="Smart Workload Balancer"
          sub="AI automatically prioritizes your queue based on SLA risk and detects potential fraudulent applications."
        />
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg border border-gray-200">
          <button onClick={() => setActiveTab('workload')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'workload' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Workload Queue</button>
          <button onClick={() => setActiveTab('fraud')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${activeTab === 'fraud' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>
            <ShieldAlert size={16} /> Fraud Alerts
          </button>
        </div>
      </div>

      {activeTab === 'workload' && (
        <div className="space-y-4">
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
                          <div className={`h-2 rounded-full ${item.ai_score > 3 ? 'bg-red-500' : item.ai_score > 2 ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${(item.ai_score / 5) * 100}%` }}></div>
                        </div>
                        <span className="font-semibold text-gray-700">{item.ai_score}/5</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.urgency === 'critical' ? (
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
                      <Btn variant={i === 0 ? "navy" : "outline"} className={i===0 ? "bg-red-600 hover:bg-red-700 border-transparent text-white" : ""}>
                        Process
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

          <div className="grid gap-4">
            {MOCK_FRAUD.map(fraud => (
              <div key={fraud.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900">{fraud.id}</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600">{fraud.applicant}</span>
                  </div>
                  <p className="text-sm text-red-600 font-medium mt-2 flex items-center gap-2">
                    <XCircle size={16} /> {fraud.issue}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">AI Confidence</div>
                  <div className="text-xl font-black text-gray-900">{fraud.confidence}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
