import React, { useState } from 'react';
import { Shield, LayoutDashboard, Briefcase, FileWarning, Search, Menu, X, LogOut, Settings } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { C } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { auth } from '../../../firebase';
import { signOut } from 'firebase/auth';

export function OfficerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { currentUser } = useAuth();

  const NAV = [
    { label: "AI Workload Balancer", icon: <LayoutDashboard size={20} />, path: "/officer" },
    { label: "SLA Risk Radar", icon: <FileWarning size={20} />, path: "/officer/risks" },
    { label: "Fraud Detection", icon: <Shield size={20} />, path: "/officer/fraud" },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: C.bg }}>
      
      {/* Officer Sidebar (Dark Theme) */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: C.navyDeep, color: C.white }}>
        
        <div className="h-16 flex items-center px-6" style={{ borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded bg-red-600 text-white shadow-lg">
              <Shield size={18} strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-black text-lg tracking-tight leading-none text-white">PRAVAH <span className="text-red-400">OPS</span></div>
              <div className="text-[10px] tracking-widest text-gray-300 font-semibold uppercase mt-0.5">Government Officer</div>
            </div>
          </div>
          <button className="lg:hidden ml-auto text-white opacity-80" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {NAV.map(n => {
            const active = location.pathname === n.path;
            return (
              <Link key={n.path} to={n.path} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${active ? 'bg-red-600 text-white shadow-md' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
                {n.icon} {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4" style={{ borderTop: `1px solid rgba(255,255,255,0.1)` }}>
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <Shield size={18} className="text-gray-200" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{currentUser?.email || 'officer@gov.in'}</p>
              <p className="text-xs text-red-300">Level 3 Approver</p>
            </div>
          </div>
          
          <button onClick={() => signOut(auth)} className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <LogOut size={18} /> Secure Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Officer Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-white border-b border-gray-200 z-30 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center max-w-md bg-gray-100 rounded-lg px-3 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent">
              <Search size={18} className="text-gray-400" />
              <input type="text" placeholder="Search application IDs (e.g. MTR/...)" className="bg-transparent border-none outline-none ml-2 text-sm w-64 text-gray-800 placeholder-gray-500" />
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6" style={{ background: C.bg }}>
          <motion.div 
            key={location.pathname}
            initial={{ opacity: 0.4, scale: 0.99, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="p-4 sm:p-6 lg:p-8 bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[calc(100vh-8rem)]"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
