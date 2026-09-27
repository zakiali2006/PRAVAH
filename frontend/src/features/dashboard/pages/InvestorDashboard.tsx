import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { LayoutDashboard, Package, CheckSquare, FileText, CheckCircle2, PieChart as PieChartIcon, ArrowRight, User, File, Factory, Zap, Award, Check, Clock } from 'lucide-react';
import { useApplications, useApplicationTracking } from '../../../hooks/useApplications';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../contexts/TranslationContext';

const getStageIcon = (title) => {
  const t = title.toLowerCase();
  if (t.includes('document')) return <File size={16} />;
  if (t.includes('scrutiny')) return <User size={16} />;
  if (t.includes('approval')) return <Award size={16} />;
  return <Check size={16} />;
};

export const InvestorDashboard = () => {
  const { applications = [] } = useApplications();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const recentApp = applications.length > 0 ? [...applications].sort((a, b) => new Date(b.created_at || b.submitted_at).getTime() - new Date(a.created_at || a.submitted_at).getTime())[0] : null;
  const { application: trackedApp } = useApplicationTracking(recentApp?.id);

  const totalApps = applications.length;
  const approved = applications.filter(a => a.status?.toLowerCase() === 'approved').length;
  const inProgress = applications.filter(a => ['scrutiny', 'final_approval', 'clarification'].includes(a.status?.toLowerCase())).length;
  const underReview = applications.filter(a => a.status?.toLowerCase() === 'document verification').length;
  const pending = applications.filter(a => ['submitted', 'pending', 'draft'].includes(a.status?.toLowerCase())).length;

  const pieData = [
    { name: t.dash.pieApproved, value: approved, color: '#10b981' },
    { name: t.dash.pieInProgress, value: inProgress, color: '#3b82f6' },
    { name: t.dash.pieUnderReview, value: underReview, color: '#f59e0b' },
    { name: t.dash.piePending, value: pending, color: '#ef4444' },
  ].filter(d => d.value > 0);

  if (pieData.length === 0) {
    pieData.push({ name: t.dash.pieNoApps, value: 1, color: '#e2e8f0' });
  }

  const getTranslatedStageName = (titleOrName) => {
    if (!titleOrName) return "";
    const lower = titleOrName.toLowerCase();
    if (lower.includes('submit')) return t.timeline.submitted;
    if (lower.includes('verif')) return t.timeline.verification;
    if (lower.includes('scrutiny')) return t.timeline.scrutiny;
    if (lower.includes('approv')) return t.timeline.approval;
    return titleOrName;
  };

  // Timeline stages
  const defaultStages = [
    { name: t.timeline.submitted, status: "completed", icon: <Check size={18} className="stroke-[3]" /> },
    { name: t.timeline.verification, status: "in-progress", icon: <File size={18} /> },
    { name: t.timeline.scrutiny, status: "pending", icon: <User size={18} /> },
    { name: t.timeline.approval, status: "pending", icon: <Award size={18} /> }
  ];

  const stages = trackedApp?.stages || defaultStages;
  const displayStages = stages.slice(0, 4); // Limit to 4 to fit all screens perfectly without squishing.
  
  // Find current active step index for the progress bar calculation
  const currentStepIdx = displayStages.findIndex(st => {
    const stat = st.status ? st.status.toLowerCase() : 'pending';
    return stat !== 'completed' && stat !== 'approved';
  });
  
  const activeIndex = currentStepIdx === -1 ? displayStages.length : currentStepIdx;
  const progressPercentage = displayStages.length > 1 ? (activeIndex / (displayStages.length - 1)) * 100 : 0;

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-5 lg:p-6 pb-20 md:pb-20 lg:pb-20 space-y-4 md:space-y-5 max-w-[1400px] mx-auto overflow-y-auto overflow-x-hidden">

      <div className="pt-1 mb-1">
        <h2 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight">{t.dash.title}</h2>
        <p className="text-xs text-slate-500 font-medium">{t.dash.sub}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 shrink-0 mb-2 md:mb-4">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-white border border-slate-200 rounded-[1.5rem] p-5 flex flex-col hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Package size={20} />
            </div>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-0.5">179</h2>
          <p className="text-xs font-bold text-slate-500">{t.dash.totalServ}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-white border border-slate-200 rounded-[1.5rem] p-5 flex flex-col hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <CheckSquare size={20} />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+4%</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-0.5">48</h2>
          <p className="text-xs font-bold text-slate-500">{t.dash.approvals}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="bg-white border border-slate-200 rounded-[1.5rem] p-5 flex flex-col hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FileText size={20} />
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Live</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-0.5">{totalApps}</h2>
          <p className="text-xs font-bold text-slate-500">{t.dash.apps}</p>
        </motion.div>

      </div>

      {/* Main Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 shrink-0 min-h-[250px]">
        
        {/* Premium Roadmap (Left) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="lg:col-span-2 bg-white border border-slate-200 rounded-[1.5rem] p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg lg:text-xl tracking-tight">{t.investorHero.roadmap}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{t.investorHero.roadmapSub}</p>
              </div>
            </div>
            <button onClick={() => navigate('/app/applications')} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors bg-blue-50/80 hover:bg-blue-100 px-4 py-2 rounded-full shrink-0">
              {t.investorHero.viewRoadmap} <ArrowRight size={14} />
            </button>
          </div>

          {/* Premium Timeline Nodes */}
          <div className="relative w-full flex justify-between items-start flex-1 mt-4 lg:mt-6 pb-2">
            
            {/* Background Track Line */}
            <div className="absolute top-[20px] left-[10%] right-[10%] h-1.5 bg-slate-100 rounded-full z-0 overflow-hidden">
               {/* Animated Progress Line */}
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: `${progressPercentage}%` }} 
                 transition={{ duration: 1.2, ease: "easeOut" }}
                 className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
               ></motion.div>
            </div>

            {displayStages.map((stage, idx) => {
              const s = stage.status ? stage.status.toLowerCase() : 'pending';
              const isCompleted = s === 'completed' || s === 'approved';
              const isCurrent = idx === currentStepIdx;
              const statusLabel = isCompleted ? t.timeline.completed : (isCurrent ? t.timeline.inProgress : t.timeline.pendingStatus);

              return (
                <div key={idx} className="relative z-10 flex flex-col items-center flex-1 text-center group">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 + (idx * 0.1) }}
                    className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center mb-2 md:mb-3 transition-all duration-300 shrink-0 relative
                    ${isCompleted ? 'bg-emerald-500 text-white shadow-[0_0_0_4px_rgba(255,255,255,1),0_0_0_6px_rgba(16,185,129,0.15)]' : 
                      isCurrent ? 'bg-blue-600 text-white shadow-[0_0_0_4px_rgba(255,255,255,1),0_0_0_6px_rgba(37,99,235,0.2)]' : 
                      'bg-white text-slate-300 border-2 border-slate-100'}`}
                  >
                    {/* Pulse effect for active node */}
                    {isCurrent && (
                      <span className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20"></span>
                    )}
                    
                    {stage.icon || getStageIcon(stage.name)}
                  </motion.div>
                  
                  <h4 className={`text-[11px] lg:text-xs font-bold leading-tight px-2 h-8 lg:h-10 flex items-center justify-center text-center w-full max-w-[100px] lg:max-w-[120px] transition-colors duration-300
                    ${isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                    {getTranslatedStageName(stage.name || stage.title)}
                  </h4>
                  
                  <div className="mt-2">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider transition-colors duration-300
                      ${isCompleted ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 
                        isCurrent ? 'bg-blue-50 text-blue-600 border border-blue-100/50' : 
                        'text-slate-400'}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Premium Application Status (Right) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="lg:col-span-1 bg-white border border-slate-200 rounded-[1.5rem] p-5 shadow-sm flex flex-col justify-between overflow-hidden relative">
          
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] shrink-0">
                <PieChartIcon size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg lg:text-xl tracking-tight">{t.investorHero.appStatus}</h3>
            </div>
            <button onClick={() => navigate('/app/applications')} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors shrink-0">
              {t.dash.viewAll} <ArrowRight size={14} />
            </button>
          </div>

          <div className="flex flex-row items-center justify-between flex-1 mt-2">
            
            {/* Chart Side */}
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }} className="relative w-[120px] h-[120px] lg:w-[140px] lg:h-[140px] shrink-0">
              <div className="absolute inset-0 flex items-center justify-center flex-col z-0">
                <span className="text-3xl font-black text-slate-900 leading-none tracking-tighter">{totalApps}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{t.dash.totalLabel}</span>
              </div>
              <ResponsiveContainer width="100%" height="100%" className="z-10">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={8}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '12px', fontSize: '12px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    cursor={false}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Legend Side */}
            <div className="flex flex-col justify-center gap-3 w-full pl-6">
              {pieData.filter(d => d.name !== 'No Apps').map((item, index) => (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3, delay: 0.7 + (index * 0.1) }} key={index} className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs font-bold text-slate-600">
                      {item.name === 'Approved' ? t.dash.approvedLabel :
                       item.name === 'In Progress' ? t.timeline.inProgress :
                       item.name === 'Under Review' ? t.timeline.verification :
                       item.name === 'Pending' ? t.timeline.pendingStatus : item.name}
                    </span>
                  </div>
                  <span className="font-black text-slate-900 text-sm ml-2">{item.value}</span>
                </motion.div>
              ))}
              {totalApps === 0 && (
                <div className="text-center text-xs text-slate-500 font-medium">No apps.</div>
              )}
            </div>

          </div>
        </motion.div>

      </div>

    </div>
  );
};
