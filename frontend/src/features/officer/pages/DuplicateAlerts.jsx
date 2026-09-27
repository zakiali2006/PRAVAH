import React, { useState, useEffect } from "react";
import { Loader2, Copy, ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { SectionHead } from "../../../components/common/SectionHead";
import { Btn } from "../../../components/common/Btn";
import apiClient from "../../../api/client";

export function DuplicateAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/officer/duplicates');
      setAlerts(res.data);
      if (res.data.length > 0) {
        setSelectedAlert(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (action) => {
    if (!selectedAlert) return;
    setResolving(true);
    try {
      // action can be 'dismiss' or 'fraud'
      await apiClient.post(`/officer/duplicates/${selectedAlert.id}/resolve`, { action });
      // Remove from list
      const updated = alerts.filter(a => a.id !== selectedAlert.id);
      setAlerts(updated);
      setSelectedAlert(updated.length > 0 ? updated[0] : null);
    } catch (err) {
      console.error(err);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative mb-20">
      <div className="flex items-start justify-between">
        <div className="flex gap-4 items-start">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Copy size={28} />
          </div>
          <SectionHead
            title="Duplicate Alerts"
            sub="AI-detected potential duplicate applications and fraud risks."
          />
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 items-center">
          <ShieldCheck className="text-blue-600" size={24} />
          <div>
            <div className="text-sm font-bold text-gray-900">System Status</div>
            <div className="text-xs text-blue-700">Real-time deduplication active</div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left Sidebar Queue */}
        <div className="w-80 shrink-0 space-y-4">
          {loading ? (
            <div className="p-8 text-center text-slate-500 flex justify-center items-center gap-2">
              <Loader2 className="animate-spin" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">No duplicate alerts found</div>
          ) : (
            alerts.map(alert => {
              const isSelected = selectedAlert?.id === alert.id;
              return (
                <div 
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-white border-blue-300 shadow-md ring-1 ring-blue-100' : 'bg-white border-gray-200 hover:border-blue-200'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500">{alert.id}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 uppercase">
                      <AlertTriangle size={12} /> {alert.match_score}% Match
                    </span>
                  </div>
                  <div className="font-bold text-gray-900 text-sm mb-1">{alert.type}</div>
                  <div className="text-xs text-gray-500">
                    Between {alert.app1_id} & {alert.app2_id}
                  </div>
                  <div className="text-xs text-gray-400 mt-3">{alert.date}</div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Content */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm min-h-[600px] flex flex-col p-6">
          {selectedAlert ? (
            <>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Compare Applications</h2>
                  <div className="text-sm text-gray-500 mt-1">Review similarities to determine if this is a duplicate.</div>
                </div>
                <div className="flex gap-2">
                  <Btn 
                    variant="outline" 
                    className="text-gray-700 border-gray-200"
                    disabled={resolving}
                    onClick={() => handleResolve('dismiss')}
                  >
                    Dismiss Alert
                  </Btn>
                  <Btn 
                    variant="navy" 
                    disabled={resolving}
                    onClick={() => handleResolve('fraud')}
                  >
                    {resolving ? <Loader2 size={16} className="animate-spin mr-2" /> : <AlertTriangle size={16} className="mr-2" />} 
                    Mark as Fraud
                  </Btn>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 p-4 bg-slate-50 border border-gray-200 rounded-xl text-center">
                  <div className="text-xs font-bold text-blue-600 mb-1 uppercase tracking-wider">Current Application</div>
                  <div className="text-lg font-black text-gray-900">{selectedAlert.app1_id}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center shrink-0 text-sm">
                  VS
                </div>
                <div className="flex-1 p-4 bg-slate-50 border border-gray-200 rounded-xl text-center">
                  <div className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Existing Application</div>
                  <div className="text-lg font-black text-gray-900">{selectedAlert.app2_id}</div>
                </div>
              </div>

              <div className="space-y-0 border-t border-gray-100">
                <div className="grid grid-cols-12 py-4 border-b border-gray-100 items-center">
                  <div className="col-span-3 text-sm font-bold text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Applicant Name
                  </div>
                  <div className="col-span-4 text-sm font-medium text-gray-900 pl-4">{selectedAlert.app1_details.applicant_name}</div>
                  <div className="col-span-1 flex justify-center">
                    <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle2 size={14} /></div>
                  </div>
                  <div className="col-span-4 text-sm font-medium text-gray-900 pl-4">{selectedAlert.app2_details.applicant_name}</div>
                </div>

                <div className="grid grid-cols-12 py-4 border-b border-gray-100 items-center">
                  <div className="col-span-3 text-sm font-bold text-gray-500">
                    Entity Name
                  </div>
                  <div className="col-span-4 text-sm font-medium text-gray-900 pl-4">{selectedAlert.app1_details.entity_name}</div>
                  <div className="col-span-1 flex justify-center">
                    <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center"><XCircle size={14} /></div>
                  </div>
                  <div className="col-span-4 text-sm font-medium text-gray-900 pl-4">{selectedAlert.app2_details.entity_name}</div>
                </div>

                <div className="grid grid-cols-12 py-4 border-b border-gray-100 items-center bg-red-50/50">
                  <div className="col-span-3 text-sm font-bold text-gray-500">
                    PAN Number
                  </div>
                  <div className="col-span-4 text-sm font-medium text-red-600 pl-4">{selectedAlert.app1_details.pan}</div>
                  <div className="col-span-1 flex justify-center">
                    <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><CheckCircle2 size={14} /></div>
                  </div>
                  <div className="col-span-4 text-sm font-medium text-red-600 pl-4">{selectedAlert.app2_details.pan}</div>
                </div>

                <div className="grid grid-cols-12 py-4 border-b border-gray-100 items-center">
                  <div className="col-span-3 text-sm font-bold text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Registered Address
                  </div>
                  <div className="col-span-4 text-sm font-medium text-gray-900 pl-4">{selectedAlert.app1_details.address}</div>
                  <div className="col-span-1 flex justify-center">
                    <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle2 size={14} /></div>
                  </div>
                  <div className="col-span-4 text-sm font-medium text-gray-900 pl-4">{selectedAlert.app2_details.address}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 p-8">
              Select a duplicate alert to review
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
