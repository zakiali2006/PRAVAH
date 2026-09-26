import React from 'react';
import { SectionHead } from '../../../components/common/SectionHead';
import { C } from '../../../constants/theme';
import { Activity, ShieldCheck, FileText, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export function PolicyDashboard() {
  const stats = [
    { label: "Active Services", value: "24", icon: <FileText size={20} className="text-blue-600" />, trend: "+2 this month" },
    { label: "Pending Approvals", value: "142", icon: <Activity size={20} className="text-orange-600" />, trend: "-15% TAT" },
    { label: "High Risk Flags", value: "18", icon: <AlertTriangle size={20} className="text-red-600" />, trend: "Requires attention" },
    { label: "Policy Compliance", value: "98.2%", icon: <ShieldCheck size={20} className="text-emerald-600" />, trend: "+0.4% from last quarter" }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionHead
        eyebrow="Policy Administration"
        title="Command Center"
        sub="Monitor state-wide service delivery, identify bottlenecks, and configure government workflows."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 mb-10">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.label}</h3>
            <div className="text-3xl font-bold text-slate-800 mb-2">{stat.value}</div>
            <div className="text-xs font-semibold text-slate-400">{stat.trend}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity (Mocks for now) */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              Statewide Processing Volume
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { month: 'Jan', count: 1200 },
                  { month: 'Feb', count: 1900 },
                  { month: 'Mar', count: 1500 },
                  { month: 'Apr', count: 2200 },
                  { month: 'May', count: 2800 },
                  { month: 'Jun', count: 3500 },
                ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.blue} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={C.blue} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="count" stroke={C.blue} strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Policy Alerts</h3>
            <div className="space-y-4">
              {[
                { time: "2 hours ago", text: "Department of Environment SLA breached by 12%." },
                { time: "5 hours ago", text: "New service 'Green Clearance' published successfully." },
                { time: "1 day ago", text: "High anomaly detected in Nashik district processing times." },
              ].map((alert, idx) => (
                <div key={idx} className="flex gap-3 text-sm pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <p className="text-slate-700">{alert.text}</p>
                    <p className="text-xs text-slate-400 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
