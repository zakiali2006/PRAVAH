import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  LayoutDashboard, FileText, Users, Calculator,
  HelpCircle, AlertTriangle, MessageSquare, Search,
  Calendar as CalendarIcon, Filter, BellRing, Sparkles, ChevronRight, CheckCircle2,
  Clock, Flame
} from 'lucide-react';
import { C } from '../../../constants/theme';
import { useTranslation } from '../../../contexts/TranslationContext';
import { useNavigate } from 'react-router-dom';

const lineData = [
  { name: 'Jan', Applications: 1000, Disposed: 800, Services: 900 },
  { name: 'Feb', Applications: 2000, Disposed: 1500, Services: 1800 },
  { name: 'Mar', Applications: 1500, Disposed: 1200, Services: 1600 },
  { name: 'Apr', Applications: 2000, Disposed: 1800, Services: 2100 },
  { name: 'May', Applications: 18000, Disposed: 15000, Services: 17000 },
  { name: 'Jun', Applications: 35000, Disposed: 30000, Services: 31000 },
  { name: 'Jul', Applications: 38000, Disposed: 35000, Services: 36000 },
  { name: 'Aug', Applications: 42000, Disposed: 39000, Services: 40000 },
  { name: 'Sep', Applications: 15000, Disposed: 14000, Services: 14500 },
];

const grievancesData = [
  { name: 'Replied', value: 400 },
  { name: 'Closed', value: 300 },
  { name: 'Pending', value: 300 },
  { name: 'Total', value: 1000 },
];

const queriesData = [
  { name: 'Total', value: 800 },
  { name: 'Pending', value: 200 },
  { name: 'Closed', value: 400 },
  { name: 'Replied', value: 200 },
];

const feedbackData = [
  { name: 'Negative', value: 10 },
  { name: 'Neutral', value: 20 },
  { name: 'Positive', value: 70 },
];

const PIE_COLORS = {
  Grievances: ['#047857', '#1E3A8A', '#D97706', '#F59E0B'],
  Queries: ['#F97316', '#FACC15', '#0F766E', '#1D4ED8'],
  Feedback: ['#0369A1', '#0F766E', '#EA580C']
};

export const InvestorDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('count');

  return (
    <div className="flex-1 flex flex-col bg-slate-50 font-sans" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOP TABS */}
        <div className="bg-white border-b border-slate-200 px-6 flex items-end">
          <button
            onClick={() => setActiveTab('count')}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === 'count' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Application Count
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === 'summary' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Application Summary
          </button>
          <button
            onClick={() => setActiveTab('wise')}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === 'wise' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Application Wise Details
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col lg:flex-row gap-4">
          
          {/* Main Dashboard Area (Left) */}
          <div className="flex-1 space-y-4">
            
            {/* AI Next Best Action Banner (Phase 16 & 12) */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-4 shadow-lg border border-blue-700 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-700/50 flex items-center justify-center shrink-0 border border-blue-600">
                <Sparkles size={24} className="text-blue-300" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-white font-bold text-lg">AI Next-Best Action</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-500/20 text-red-200 border border-red-500/30">High Priority</span>
                </div>
                <p className="text-blue-200 text-sm leading-relaxed mb-3">
                  Your <strong className="text-white">Consent to Establish (MPCB)</strong> application is at 84% SLA risk due to a pending document query. Submit the required "Environmental Audit Report" within the next 48 hours to avoid an automatic breach.
                </p>
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate('/track')} className="px-4 py-1.5 bg-saffron text-white font-bold text-sm rounded shadow hover:bg-orange-500 transition-colors">
                    Resolve Query Now
                  </button>
                  <button className="px-4 py-1.5 bg-blue-800 text-blue-200 font-bold text-sm rounded border border-blue-700 hover:bg-blue-700 transition-colors">
                    View Risk Roadmap
                  </button>
                </div>
              </div>
            </div>

            {/* Header Row: Title & Filters combined */}
            <div className="flex flex-wrap lg:flex-nowrap items-end justify-between gap-4 mt-2">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{t.dash.title || "Dashboard Overview"}</h1>
                <p className="text-sm text-slate-500">{t.dash.sub || "Real-time insights and analytics"}</p>
              </div>

              {/* Filters Row */}
              <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-wrap sm:flex-nowrap items-end gap-3 shrink-0">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">From</label>
                  <div className="relative">
                    <CalendarIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" defaultValue="January 1st, 2016" className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">To</label>
                  <div className="relative">
                    <CalendarIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" defaultValue="September 11th, 2026" className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-700">Apply</button>
                </div>
              </div>
            </div>

            {/* 4 Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-4 text-white shadow-sm flex justify-between relative overflow-hidden">
                <div className="absolute -right-2 -bottom-2 opacity-10"><LayoutDashboard size={80} /></div>
                <div>
                  <p className="text-xs font-medium text-blue-100">{t.dash.totalServ}</p>
                  <h3 className="text-2xl font-black mt-1">179</h3>
                </div>
                <div className="bg-white/20 p-2 rounded-lg h-fit"><LayoutDashboard size={18} /></div>
              </div>
              <div className="bg-gradient-to-r from-purple-600 to-indigo-500 rounded-xl p-4 text-white shadow-sm flex justify-between relative overflow-hidden">
                <div className="absolute -right-2 -bottom-2 opacity-10"><FileText size={80} /></div>
                <div>
                  <p className="text-xs font-medium text-purple-100">{t.dash.apps}</p>
                  <h3 className="text-2xl font-black mt-1">5,67,805</h3>
                  <span className="inline-block mt-1 text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">26.3%</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-4 text-white shadow-sm flex justify-between relative overflow-hidden">
                <div className="absolute -right-2 -bottom-2 opacity-10"><AlertTriangle size={80} /></div>
                <div>
                  <p className="text-xs font-medium text-orange-100">{t.dash.grievances}</p>
                  <h3 className="text-2xl font-black mt-1">5,473</h3>
                </div>
              </div>
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 text-white shadow-sm flex justify-between relative overflow-hidden">
                <div className="absolute -right-2 -bottom-2 opacity-10"><HelpCircle size={80} /></div>
                <div>
                  <p className="text-xs font-medium text-emerald-100">{t.dash.queries}</p>
                  <h3 className="text-2xl font-black mt-1">4,858</h3>
                </div>
              </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-2 gap-4">
              {/* Main Line Chart */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm col-span-2 xl:col-span-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-800 text-sm">Services Performance Trend</h3>
                </div>
                <div className="flex-1 min-h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => val === 0 ? '0' : `${val / 1000}k`} />
                      <RechartsTooltip />
                      <Legend iconType="square" wrapperStyle={{ fontSize: '10px' }} />
                      <Line type="monotone" dataKey="Applications" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Disposed" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:col-span-1">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-800 text-sm">Grievances Status</h3>
                  </div>
                  <div className="flex-1 min-h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={grievancesData} innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                          {grievancesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS.Grievances[index % PIE_COLORS.Grievances.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend iconType="square" layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          
          {/* Right Sidebar Area (Phases 13 & 14) */}
          <div className="w-full lg:w-80 shrink-0 space-y-4">
            
            {/* Phase 13: Compliance Calendar */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-50 p-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <CalendarIcon size={16} className="text-blue-600" /> Compliance Calendar
                </div>
                <button className="text-[10px] text-blue-600 font-bold hover:underline">View All</button>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center justify-center bg-red-50 text-red-600 rounded-lg w-12 h-12 shrink-0 border border-red-100">
                    <span className="text-[10px] font-bold uppercase">Sep</span>
                    <span className="text-lg font-black leading-none">14</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Fire NOC Renewal</h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">Pune MIDC Factory Unit</p>
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                      <Clock size={10} /> 3 Days Left
                    </div>
                  </div>
                </div>
                <div className="w-full h-px bg-slate-100"></div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center justify-center bg-blue-50 text-blue-600 rounded-lg w-12 h-12 shrink-0 border border-blue-100">
                    <span className="text-[10px] font-bold uppercase">Oct</span>
                    <span className="text-lg font-black leading-none">01</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Env. Audit Report</h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">Nagpur Processing Plant</p>
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      <Clock size={10} /> Scheduled
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 14: Regulatory Watch */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-50 p-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <Flame size={16} className="text-orange-500" /> Regulatory Watch
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="relative pl-4 border-l-2 border-orange-500">
                  <span className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-white"></span>
                  <div className="text-[10px] text-slate-400 font-bold mb-1">Today, 10:00 AM</div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1">Revised MPCB D+ Zone Checklist</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-2">New mandatory water treatment regulations have been published for D+ zones.</p>
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md">
                    <AlertTriangle size={12} /> Matches your profile: 2 Units Affected
                  </div>
                </div>
                
                <div className="relative pl-4 border-l-2 border-slate-200">
                  <span className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white"></span>
                  <div className="text-[10px] text-slate-400 font-bold mb-1">Yesterday</div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1">Subsidized Solar Policy 2026</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">State government has introduced a 15% capital subsidy for captive solar plants.</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={() => navigate('/services')} className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700 border border-slate-100">
                  <span>Apply for New Service</span>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
                <button onClick={() => navigate('/drive')} className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700 border border-slate-100">
                  <span>Upload Documents</span>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
                <button onClick={() => navigate('/calc')} className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700 border border-slate-100">
                  <span>Incentive Calculator</span>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
