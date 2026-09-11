import React, { useState } from 'react';
import { History, Shield, Search, Filter, Clock, UserCheck, Terminal } from 'lucide-react';
import { useMockApp } from '../../../contexts/MockAppContext';

export const AuditLogs = () => {
  const { auditLogs: logs } = useMockApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter((l) => {
    return l.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
           l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
           l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
           l.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <History size={16} />
            <span>Statutory RTS Act Audit & Transparency Log</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Right to Services (RTS) Audit Trail</h2>
          <p className="text-slate-600 text-xs mt-1">
            Tamper-evident, timestamped log of all officer scrutinies, AI orchestrations, applicant submissions, and statutory SLA updates under Maharashtra RTS Act, 2015.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl text-xs font-bold text-indigo-900">
          <Shield size={16} className="text-indigo-600" />
          <span>Statutory Compliance Certified</span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail by actor, action type, application ID, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="p-4">Log ID & Timestamp</th>
                <th className="p-4">Actor & Role</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Detailed Audit Record</th>
                <th className="p-4">Network IP / Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <p className="font-mono font-bold text-slate-900">{log.id}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{log.timestamp}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-extrabold text-slate-900">{log.actor}</p>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-600 mt-0.5 inline-block">
                      {log.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 font-medium max-w-md">
                    {log.details}
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-500">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
