import React from 'react';
import { SectionHead } from '../../../components/common/SectionHead';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { C } from '../../../constants/theme';

// ==========================================
// 1. Bottleneck Analytics
// ==========================================
export function BottleneckAnalytics() {
  const data = [
    { name: 'Document Verification', avgTime: 2.4, sla: 2.0 },
    { name: 'Department Scrutiny', avgTime: 5.1, sla: 3.0 },
    { name: 'Site Inspection', avgTime: 8.5, sla: 7.0 },
    { name: 'Final Approval', avgTime: 1.2, sla: 2.0 },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionHead
        eyebrow="Analytics"
        title="Bottleneck Analysis"
        sub="Identify which stages in the approval pipelines cause the most delays across the state."
      />
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Processing Time Deviations (Days) vs SLA</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
              <RechartsTooltip cursor={{fill: '#F1F5F9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend wrapperStyle={{paddingTop: '20px'}} />
              <Bar dataKey="avgTime" name="Actual Average Time (Days)" fill={C.saffron} radius={[4, 4, 0, 0]} />
              <Bar dataKey="sla" name="SLA Limit (Days)" fill={C.blue} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. District Analysis
// ==========================================
export function DistrictAnalysis() {
  const data = [
    { name: 'Mumbai City', applications: 4000, clearanceRate: 85 },
    { name: 'Pune', applications: 3200, clearanceRate: 78 },
    { name: 'Nagpur', applications: 1800, clearanceRate: 92 },
    { name: 'Nashik', applications: 1500, clearanceRate: 65 },
    { name: 'Aurangabad', applications: 1100, clearanceRate: 88 },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionHead
        eyebrow="Analytics"
        title="District-wise Analysis"
        sub="Compare application volumes and clearance rates across different districts."
      />
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Geospatial Performance: Volume vs Clearance %</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" dataKey="applications" name="Volume" unit=" Apps" stroke="#64748B" />
              <YAxis type="number" dataKey="clearanceRate" name="Clearance Rate" unit="%" stroke="#64748B" domain={[0, 100]} />
              <ZAxis type="category" dataKey="name" name="District" />
              <RechartsTooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{borderRadius: '8px'}} />
              <Scatter name="Districts" data={data} fill={C.blue}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.clearanceRate > 80 ? C.green : entry.clearanceRate < 70 ? '#EF4444' : C.saffron} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. Sector Analysis
// ==========================================
export function SectorAnalysis() {
  const data = [
    { name: 'Manufacturing', value: 45 },
    { name: 'IT / ITeS', value: 25 },
    { name: 'Pharmaceuticals', value: 15 },
    { name: 'Agriculture', value: 10 },
    { name: 'Logistics', value: 5 },
  ];
  const COLORS = [C.blue, C.saffron, C.green, '#8B5CF6', '#F43F5E'];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionHead
        eyebrow="Analytics"
        title="Sector-wise Analysis"
        sub="Analyze investment and application trends across industrial sectors."
      />
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-8 flex flex-col items-center">
        <h3 className="text-lg font-bold text-slate-800 mb-6 w-full text-left">Sector Investment Volumes (%)</h3>
        <div className="h-[400px] w-full max-w-2xl">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={140}
                paddingAngle={5}
                dataKey="value"
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{borderRadius: '8px'}} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. Department Analysis
// ==========================================
export function DepartmentAnalysis() {
  const data = [
    { name: 'Jan', slaMet: 400, slaBreached: 120 },
    { name: 'Feb', slaMet: 450, slaBreached: 100 },
    { name: 'Mar', slaMet: 520, slaBreached: 80 },
    { name: 'Apr', slaMet: 590, slaBreached: 60 },
    { name: 'May', slaMet: 650, slaBreached: 40 },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionHead
        eyebrow="Analytics"
        title="Department Performance"
        sub="Monitor SLA compliance and workload distribution across government departments."
      />
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6">SLA Compliance Trend (State Pollution Control Board)</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.green} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={C.green} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBreach" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <RechartsTooltip contentStyle={{borderRadius: '8px'}} />
              <Legend verticalAlign="top" height={36}/>
              <Area type="monotone" dataKey="slaMet" name="SLA Met" stroke={C.green} fillOpacity={1} fill="url(#colorMet)" />
              <Area type="monotone" dataKey="slaBreached" name="SLA Breached" stroke="#EF4444" fillOpacity={1} fill="url(#colorBreach)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. Regulatory Impact
// ==========================================
export function RegulatoryImpact() {
  const data = [
    { month: 'Jul 2025', avgDays: 45 },
    { month: 'Aug 2025', avgDays: 43 },
    { month: 'Sep 2025', avgDays: 44 },
    { month: 'Oct 2025', avgDays: 22 }, // Policy enacted here
    { month: 'Nov 2025', avgDays: 18 },
    { month: 'Dec 2025', avgDays: 15 },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionHead
        eyebrow="Policy Review"
        title="Regulatory Impact Assessment"
        sub="Measure how recent policy changes have impacted application processing times and volumes."
      />
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-8 relative">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Impact of "Auto-Scrutiny Policy" on Clearance Times</h3>
        
        {/* Annotation line for policy change */}
        <div className="absolute left-[58%] top-20 bottom-12 w-0.5 border-l-2 border-dashed border-purple-500 z-10 flex flex-col items-center">
          <div className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap -ml-24 mt-4 shadow-sm border border-purple-200">
            Policy Enacted: Oct 1st
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} name="Avg Days" unit=" days" />
              <RechartsTooltip contentStyle={{borderRadius: '8px'}} />
              <Line type="monotone" dataKey="avgDays" name="Average Processing Time" stroke={C.blue} strokeWidth={4} dot={{r: 6, fill: C.blue}} activeDot={{r: 8}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
