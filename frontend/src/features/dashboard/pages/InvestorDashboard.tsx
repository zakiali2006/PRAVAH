import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { LayoutDashboard, Package, CheckSquare, FileText, CheckCircle2, PieChart as PieChartIcon, ArrowRight, User, File, Factory, Zap, Award, Check, Clock } from 'lucide-react';
import { useApplications, useApplicationTracking } from '../../../hooks/useApplications';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
  
  const recentApp = applications.length > 0 ? [...applications].sort((a, b) => new Date(b.created_at || b.submitted_at).getTime() - new Date(a.created_at || a.submitted_at).getTime())[0] : null;
  const { application: trackedApp } = useApplicationTracking(recentApp?.id);

  const totalApps = applications.length;
  const approved = applications.filter(a => a.status?.toLowerCase() === 'approved').length;
  const inProgress = applications.filter(a => ['scrutiny', 'final_approval', 'clarification'].includes(a.status?.toLowerCase())).length;
  const underReview = applications.filter(a => a.status?.toLowerCase() === 'document verification').length;
  const pending = applications.filter(a => ['submitted', 'pending', 'draft'].includes(a.status?.toLowerCase())).length;

  const pieData = [
    { name: 'Approved', value: approved, color: '#10b981' },
    { name: 'In Progress', value: inProgress, color: '#3b82f6' },
    { name: 'Under Review', value: underReview, color: '#f59e0b' },
    { name: 'Pending', value: pending, color: '#ef4444' },
  ].filter(d => d.value > 0);

  if (pieData.length === 0) {
    pieData.push({ name: 'No Apps', value: 1, color: '#e2e8f0' });
  }

  // Timeline stages
  const defaultStages = [
    { name: "Application Submitted", status: "completed", icon: <Check size={18} className="stroke-[3]" /> },
    { name: "Document Verification", status: "in-progress", icon: <File size={18} /> },
    { name: "Department Scrutiny", status: "pending", icon: <User size={18} /> },
    { name: "Final Approval", status: "pending", icon: <Award size={18} /> }
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
    <div className="w-full h-full flex flex-col p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 max-w-[1400px] mx-auto overflow-y-auto overflow-x-hidden">
      
      {/* Banner */}
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50/50 to-indigo-50 border border-blue-100/80 rounded-[2rem] p-6 md:p-8 lg:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between shrink-0 overflow-hidden">
        
        {/* Subtle decorative background blur */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="z-10 w-full md:max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-slate-600 font-bold mb-2 text-sm md:text-base"
          >
            <span className="text-xl">👋</span> Welcome to PRAVAH
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] mb-3 tracking-tight"
          >
            Simpler Approvals.<br className="hidden sm:block"/>Stronger Businesses.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 text-sm md:text-base font-medium leading-relaxed max-w-md"
          >
            Your single platform for government services, approvals and compliance in Maharashtra.
          </motion.p>
        </div>
        
        {/* Premium Abstract Graphic on Right */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="hidden lg:flex absolute right-12 top-0 bottom-0 items-center justify-center pointer-events-none"
        >
          <div className="relative w-80 h-full flex items-end justify-center pb-8">
            <div className="w-12 h-24 bg-white/60 backdrop-blur-sm rounded-t-xl mx-1.5 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"></div>
            <div className="w-16 h-40 bg-slate-200/80 backdrop-blur-md rounded-t-xl mx-1.5 relative shadow-[0_8px_30px_rgb(0,0,0,0.08)] z-10 border border-white/90"></div>
            <div className="w-14 h-32 bg-indigo-100/80 backdrop-blur-sm rounded-t-xl mx-1.5 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"></div>
            
            <div className="absolute top-1/2 right-0 translate-x-4 -translate-y-12 z-20">
              <div className="bg-white/95 backdrop-blur-xl border border-slate-100 p-5 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transform rotate-2">
                <p className="font-bold text-slate-800 text-base leading-snug tracking-tight">
                  "Enabling<br/>Businesses,<br/>Strengthening<br/>Maharashtra"
                </p>
                <div className="w-10 h-1.5 bg-orange-500 rounded-full mt-3"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 shrink-0">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-white border border-slate-200 rounded-[2rem] p-5 lg:p-6 flex flex-col justify-center shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] shrink-0">
              <LayoutDashboard size={20} />
            </div>
            <h3 className="font-bold text-slate-800 text-sm lg:text-base leading-tight">Dashboard<br className="hidden lg:block"/> Overview</h3>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">Key numbers for your business journey</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-[#f8faff] border border-blue-100 rounded-[2rem] p-5 lg:p-6 flex items-center justify-between hover:shadow-md transition-all duration-300 group">
          <div>
            <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1">TOTAL SERVICES</p>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900">179</h2>
          </div>
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
            <Package size={24} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="bg-[#f5fcf7] border border-green-100 rounded-[2rem] p-5 lg:p-6 flex items-center justify-between hover:shadow-md transition-all duration-300 group">
          <div>
            <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1">APPROVALS</p>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900">48</h2>
          </div>
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-green-100/80 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
            <CheckSquare size={24} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} className="bg-[#fcfaff] border border-purple-100 rounded-[2rem] p-5 lg:p-6 flex items-center justify-between hover:shadow-md transition-all duration-300 group">
          <div>
            <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1">APPLICATIONS</p>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900">{totalApps}</h2>
          </div>
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-purple-100/80 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
            <FileText size={24} />
          </div>
        </motion.div>

      </div>

      {/* Main Bottom Section */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 shrink-0 min-h-[300px]">
        
        {/* Premium Roadmap (Left) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex-[2] bg-white border border-slate-200 rounded-[2rem] p-6 lg:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg lg:text-xl tracking-tight">Your Approval Roadmap</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Track your journey from application to approval</p>
              </div>
            </div>
            <button onClick={() => navigate('/app/applications')} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors bg-blue-50/80 hover:bg-blue-100 px-4 py-2 rounded-full shrink-0">
              <span className="hidden sm:inline">View Full</span> Roadmap <ArrowRight size={14} />
            </button>
          </div>

          {/* Premium Timeline Nodes */}
          <div className="relative w-full flex justify-between items-start flex-1 mt-6 lg:mt-8 pb-4">
            
            {/* Background Track Line */}
            <div className="absolute top-[22px] lg:top-[26px] left-[10%] right-[10%] h-1.5 bg-slate-100 rounded-full z-0 overflow-hidden">
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
              const statusLabel = isCompleted ? 'Completed' : (isCurrent ? 'In Progress' : 'Pending');

              return (
                <div key={idx} className="relative z-10 flex flex-col items-center flex-1 text-center group">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 + (idx * 0.1) }}
                    className={`w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center mb-3 md:mb-4 transition-all duration-300 shrink-0 relative
                    ${isCompleted ? 'bg-emerald-500 text-white shadow-[0_0_0_6px_rgba(255,255,255,1),0_0_0_8px_rgba(16,185,129,0.15)]' : 
                      isCurrent ? 'bg-blue-600 text-white shadow-[0_0_0_6px_rgba(255,255,255,1),0_0_0_8px_rgba(37,99,235,0.2)]' : 
                      'bg-white text-slate-300 border-[3px] border-slate-100'}`}
                  >
                    {/* Pulse effect for active node */}
                    {isCurrent && (
                      <span className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20"></span>
                    )}
                    
                    {stage.icon || getStageIcon(stage.name)}
                  </motion.div>
                  
                  <h4 className={`text-[11px] lg:text-xs font-bold leading-tight px-2 h-8 lg:h-10 flex items-center justify-center w-full max-w-[100px] lg:max-w-[120px] transition-colors duration-300
                    ${isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                    {stage.name || stage.title}
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="flex-[1] bg-white border border-slate-200 rounded-[2rem] p-6 lg:p-8 shadow-sm flex flex-col justify-between overflow-hidden relative">
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] shrink-0">
                <PieChartIcon size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg lg:text-xl tracking-tight">Application Status</h3>
            </div>
            <button onClick={() => navigate('/app/applications')} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors shrink-0">
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div className="flex flex-row items-center justify-between flex-1 mt-4">
            
            {/* Chart Side */}
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }} className="relative w-[140px] h-[140px] lg:w-[160px] lg:h-[160px] shrink-0">
              <div className="absolute inset-0 flex items-center justify-center flex-col z-0">
                <span className="text-4xl font-black text-slate-900 leading-none tracking-tighter">{totalApps}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">TOTAL</span>
              </div>
              <ResponsiveContainer width="100%" height="100%" className="z-10">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={55}
                    outerRadius={70}
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
                    <span className="text-xs font-bold text-slate-600">{item.name}</span>
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
