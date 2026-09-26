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
    <div className="w-full max-w-7xl mx-auto p-6 pb-32 font-sans flex flex-col xl:flex-row gap-6">
      
      {/* Main Dashboard Area (Left) */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        
        {/* AI Next Best Action Banner (Redesigned as Vertical Stack Alert) */}
        <div className="bg-white border-l-4 border-l-blue-600 border border-y-slate-200 border-r-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-slate-900 font-bold text-base flex items-center gap-2">
                  {t.dash?.aiBanner?.title || "AI Next-Best Action"}
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-600 text-white shadow-sm tracking-wide">
                    {t.dash?.aiBanner?.priority || "High Priority"}
                  </span>
                </h2>
              </div>
            </div>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed max-w-4xl pl-13">
            {t.dash?.aiBanner?.text || 'Your Consent to Establish (MPCB) application is at 84% SLA risk due to a pending document query. Submit the required "Environmental Audit Report" within the next 48 hours to avoid an automatic breach.'}
          </p>
          <div className="flex items-center gap-3 justify-end pt-2 border-t border-slate-100">
            <button className="px-4 py-2 bg-white text-slate-700 font-semibold text-sm rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
              {t.dash?.aiBanner?.roadmapBtn || "View Roadmap"}
            </button>
            <button onClick={() => navigate('/app/applications')} className="px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
              {t.dash?.aiBanner?.resolveBtn || "Resolve Query"}
            </button>
          </div>
        </div>

        {/* Dashboard Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t.dash.title || "Dashboard Overview"}</h1>
            <p className="text-sm text-slate-500 mt-1">{t.dash.sub || "Real-time insights and analytics for your organization"}</p>
          </div>

          {/* Filters */}
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 flex flex-wrap sm:flex-nowrap items-end gap-2 shrink-0">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wide px-1">
                {t.dash?.filters?.from || "From"}
              </label>
              <div className="relative">
                <CalendarIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" defaultValue="Jan 1, 2016" className="w-32 pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wide px-1">
                {t.dash?.filters?.to || "To"}
              </label>
              <div className="relative">
                <CalendarIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" defaultValue="Sep 11, 2026" className="w-32 pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <button className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-700 h-[30px]">
              {t.dash?.filters?.apply || "Apply"}
            </button>
          </div>
        </div>

            {/* 4 Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                    <LayoutDashboard size={20} />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">{t.dash.totalServ || "Total Services"}</p>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-800">179</h3>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600">
                    <FileText size={20} />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">{t.dash.apps || "Applications"}</p>
                </div>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-black text-slate-800">5,67,805</h3>
                  <span className="inline-block mb-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+26.3%</span>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 text-amber-600">
                    <AlertTriangle size={20} />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">{t.dash.grievances || "Grievances"}</p>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-800">5,473</h3>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 text-teal-600">
                    <HelpCircle size={20} />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">{t.dash.queries || "Queries"}</p>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-800">4,858</h3>
                </div>
              </div>
            </div>

            {/* Application Data Tabs */}
            <div className="bg-white border-b border-slate-200 px-2 flex items-end mt-4 rounded-t-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setActiveTab('count')}
                className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === 'count' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Application Count
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === 'summary' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Application Summary
              </button>
              <button
                onClick={() => setActiveTab('wise')}
                className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === 'wise' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Application Wise Details
              </button>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-2 gap-4">
              {/* Main Line Chart */}
              <div className="bg-white border border-slate-200 rounded-b-xl rounded-tr-xl p-4 shadow-sm col-span-2 xl:col-span-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-800 text-sm">{t.dash?.trend || "Services Performance Trend"}</h3>
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
          <div className="w-full xl:w-80 shrink-0 space-y-6">
            
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
  );
};
