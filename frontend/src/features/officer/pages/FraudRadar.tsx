import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, Search } from 'lucide-react';
export const FraudRadar = ({ alerts, onResolveAlert, onRunAuditScan }) => {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [isScanning, setIsScanning] = useState(false);

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      onRunAuditScan();
      setIsScanning(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldAlert size={16} />
            <span>Cross-Department Fraud & Duplicate Radar (UdyogSetu Feature #11)</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Cadastral & Application Integrity Scanner</h2>
          <p className="text-slate-600 text-xs mt-1">
            Real-time cross-departmental AI verification detecting duplicate clearance filings, conflicting survey boundary claims, and altered professional digital seals.
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning}
          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow flex items-center space-x-2 self-start md:self-auto"
        >
          {isScanning ? (
            <span>Cross-Checking GIS & Revenue Portals...</span>
          ) : (
            <>
              <Search size={14} />
              <span>Run Deep Cadastral Audit Scan</span>
            </>
          )}
        </button>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 text-xs font-bold">
        {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-4 py-2 rounded-xl transition-all ${
              filterSeverity === sev ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {sev === 'ALL' ? 'All Alerts' : `${sev} Severity`}
          </button>
        ))}
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAlerts.map((alert) => {
          const isHigh = alert.severity === 'HIGH';
          const isResolved = alert.status === 'Resolved';

          return (
            <div
              key={alert.id}
              className={`p-6 rounded-2xl border transition-all ${
                isResolved
                  ? 'bg-slate-50 border-slate-200 opacity-80'
                  : isHigh
                  ? 'bg-rose-50/40 border-rose-300 shadow-sm'
                  : 'bg-amber-50/40 border-amber-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    isHigh ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {alert.severity} Risk
                  </span>
                  <span className="text-xs font-bold text-slate-500">{alert.category}</span>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                  isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-800'
                }`}>
                  {alert.status}
                </span>
              </div>

              <div className="pt-3 space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900">{alert.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>

                <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80 text-[11px] space-y-1 font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Related Application:</span>
                    <span className="font-mono font-bold text-blue-700">{alert.appId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Entity Flagged:</span>
                    <span className="font-bold text-slate-800">{alert.applicant}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Detected On:</span>
                    <span className="text-slate-600">{alert.detectedAt}</span>
                  </div>
                </div>

                {!isResolved && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
                    >
                      <CheckCircle size={14} />
                      <span>Verify & Clear Flag</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
