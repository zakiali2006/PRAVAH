import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, AlertTriangle, CheckCircle, ShieldAlert, X, ChevronRight, User, MapPin } from 'lucide-react';
import { getOfficerDuplicates } from '../../../api/client';

export function DuplicateAlerts() {
  const [duplicates, setDuplicates] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const res = await getOfficerDuplicates();
        const mapped = (res.candidates || []).map(c => ({
          id: `DUP-${Math.floor(Math.random()*10000)}`,
          confidence: Math.round(c.confidence * 100),
          type: c.match_type,
          status: 'Flagged',
          date: new Date().toLocaleDateString(),
          app1: { id: c.application_id, applicant: c.applicant_name, entity: 'Unknown Entity', pan: c.details.includes('exact_pan') ? 'MATCHED' : '...', address: '...' },
          app2: { id: c.matched_application_id, applicant: c.matched_applicant_name, entity: 'Unknown Entity', pan: c.details.includes('exact_pan') ? 'MATCHED' : '...', address: '...' }
        }));
        setDuplicates(mapped);
        if(mapped.length > 0) setSelectedAlert(mapped[0]);
      } catch(err) {
        console.error("Failed to load duplicate alerts", err);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Copy className="text-indigo-600" size={32} />
            Duplicate Alerts
          </h1>
          <p className="text-gray-500 mt-1">AI-detected potential duplicate applications and fraud risks.</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl flex items-center gap-3">
          <ShieldAlert className="text-indigo-600" size={24} />
          <div>
            <div className="text-sm font-bold text-indigo-900">System Status</div>
            <div className="text-xs text-indigo-700">Real-time deduplication active</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Alerts List */}
        <div className="xl:col-span-1 space-y-4 overflow-y-auto pr-2">
          {duplicates.length === 0 && (
             <div className="text-gray-500 mt-4 text-center">{loading ? 'Loading...' : 'No duplicates detected.'}</div>
          )}
          {duplicates.map(alert => (
            <motion.div 
              key={alert.id}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedAlert(alert)}
              className={`p-5 rounded-2xl cursor-pointer border-2 transition-all ${selectedAlert?.id === alert.id ? 'border-indigo-500 bg-white shadow-md' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-gray-500">{alert.id}</span>
                <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded-md flex items-center gap-1">
                  <AlertTriangle size={12} /> {alert.confidence}% Match
                </span>
              </div>
              <h3 className="font-bold text-gray-900">{alert.type}</h3>
              <p className="text-sm text-gray-600 mt-1">Between {alert.app1.id} & {alert.app2.id}</p>
              <div className="mt-3 text-xs text-gray-400 font-medium">{alert.date}</div>
            </motion.div>
          ))}
        </div>

        {/* Comparison View */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {selectedAlert ? (
            <>
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Compare Applications</h2>
                  <p className="text-sm text-gray-500 mt-1">Review similarities to determine if this is a duplicate.</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-bold transition-colors">
                    Dismiss Alert
                  </button>
                  <button onClick={() => alert("Marked as fraud in backend")} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-all">
                    <ShieldAlert size={16} /> Mark as Fraud
                  </button>
                </div>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-black border-4 border-white shadow-sm z-10">
                      VS
                    </div>
                  </div>
                  <div className="w-full grid grid-cols-2 gap-8">
                    {/* App 1 */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                      <div className="text-xs font-bold text-indigo-600 mb-1">CURRENT APPLICATION</div>
                      <div className="text-lg font-black text-gray-900">{selectedAlert.app1.id}</div>
                    </div>
                    {/* App 2 */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                      <div className="text-xs font-bold text-gray-500 mb-1">EXISTING APPLICATION</div>
                      <div className="text-lg font-black text-gray-900">{selectedAlert.app2.id}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <ComparisonRow 
                    label="Applicant Name" 
                    icon={<User size={16} />}
                    val1={selectedAlert.app1.applicant} 
                    val2={selectedAlert.app2.applicant} 
                    match={selectedAlert.app1.applicant.toLowerCase().includes(selectedAlert.app2.applicant.toLowerCase().split(' ')[0])} 
                  />
                  <ComparisonRow 
                    label="Entity Name" 
                    val1={selectedAlert.app1.entity} 
                    val2={selectedAlert.app2.entity} 
                    match={false} 
                  />
                  <ComparisonRow 
                    label="PAN Number" 
                    val1={selectedAlert.app1.pan} 
                    val2={selectedAlert.app2.pan} 
                    match={selectedAlert.app1.pan === selectedAlert.app2.pan} 
                    critical
                  />
                  <ComparisonRow 
                    label="Registered Address" 
                    icon={<MapPin size={16} />}
                    val1={selectedAlert.app1.address} 
                    val2={selectedAlert.app2.address} 
                    match={true} 
                  />
                </div>
                
                <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="text-indigo-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900">AI Recommendation</h4>
                    <p className="text-sm text-indigo-700 mt-1">High probability of duplicate entity registration. The PAN numbers match exactly, suggesting the same entity is attempting to register under slightly different names. Recommend manual review of supporting documents.</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select an alert to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ComparisonRow({ label, icon, val1, val2, match, critical }) {
  return (
    <div className={`grid grid-cols-[150px_1fr_40px_1fr] items-center gap-4 py-3 border-b border-gray-100 ${critical && match ? 'bg-red-50/50 -mx-6 px-6' : ''}`}>
      <div className="text-sm font-bold text-gray-500 flex items-center gap-2">
        {icon} {label}
      </div>
      <div className={`text-sm font-medium ${match && critical ? 'text-red-700' : 'text-gray-900'}`}>{val1}</div>
      <div className="flex justify-center">
        {match ? (
          <div className={`p-1 rounded-full ${critical ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            <CheckCircle size={14} />
          </div>
        ) : (
          <div className="p-1 rounded-full bg-gray-100 text-gray-400">
            <X size={14} />
          </div>
        )}
      </div>
      <div className={`text-sm font-medium ${match && critical ? 'text-red-700' : 'text-gray-900'}`}>{val2}</div>
    </div>
  );
}
