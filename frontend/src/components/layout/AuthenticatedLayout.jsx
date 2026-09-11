import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Building2, Factory, FileText, FileBadge, FolderOpen, Wallet, LifeBuoy, History, User, LogOut, Bell } from 'lucide-react';
import { C } from '../../constants/theme';
import { useTranslation } from '../../contexts/TranslationContext';
import { AccessibilityBar } from '../accessibility/AccessibilityBar';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { id: 'business', icon: Building2, label: 'My Business', path: '/business' },
  { id: 'factory', icon: Factory, label: 'Factory Units', path: '/factory' },
  { id: 'wizard', icon: FileText, label: 'Investor Wizard', path: '/wizard' },
  { id: 'apply', icon: FileBadge, label: 'Applications', path: '/apply' },
  { id: 'drive', icon: FolderOpen, label: 'Document Drive', path: '/drive' },
  { id: 'payments', icon: Wallet, label: 'Payments', path: '/payments' },
  { id: 'support', icon: LifeBuoy, label: 'Support & Grievances', path: '/grievance' },
  { id: 'audit', icon: History, label: 'Audit Logs', path: '/audit' },
];

export function AuthenticatedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  const handleSignOut = () => {
    signOut(auth);
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: C.bg }}>
      
      {/* Sidebar */}
      <aside className="w-72 flex flex-col shadow-2xl z-20" style={{ background: C.navyDeep, color: C.white }}>
        
        {/* Logo Area */}
        <div className="h-20 flex items-center px-8 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="text-2xl font-black tracking-tight flex items-baseline gap-1.5">
            PRAVAH
            <span className="text-xs font-bold px-2 py-0.5 rounded shadow-sm" style={{ background: C.saffron, color: C.white }}>
              2.0
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-2 px-4">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`group relative w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 overflow-hidden ${
                    isActive ? 'shadow-md' : 'hover:bg-white/5'
                  }`}
                  style={{
                    background: isActive ? C.navySoft : 'transparent',
                    color: isActive ? C.white : '#94A3B8'
                  }}
                >
                  {/* Subtle active left border inside the button */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: C.saffron }} />
                  )}
                  
                  <Icon 
                    size={20} 
                    style={{ color: isActive ? C.saffron : 'currentColor' }}
                    className="transition-transform duration-200 group-hover:scale-110"
                  />
                  <span className="tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t" style={{ borderColor: C.navySoft }}>
          <button 
            onClick={handleSignOut} 
            className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors border"
            style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#FCA5A5', background: 'rgba(239, 68, 68, 0.1)' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b shadow-sm z-10" style={{ borderColor: C.line }}>
          <div className="flex items-center gap-4">
            {/* Phase 16: Next-Best-Action Banner Hook */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-800 border border-amber-200">
              <Bell size={16} />
              <span>Urgent: Fire NOC Signature Missing</span>
              <button className="ml-2 underline text-amber-900" onClick={() => navigate('/apply')}>Resolve</button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <AccessibilityBar a11y={{}} setA11y={() => {}} darkText={true} />
            
            <button className="flex items-center gap-3 border-l pl-4 md:pl-6 group transition-opacity hover:opacity-80" style={{ borderColor: C.line }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                <User size={16} className="opacity-80" />
              </div>
              <div className="flex flex-col items-start hidden sm:flex">
                <span className="text-sm font-bold text-gray-800 leading-tight">{currentUser?.email || 'demo@gmail.com'}</span>
                <span className="text-xs font-medium text-gray-500">Applicant</span>
              </div>
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6" style={{ background: C.bg }}>
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[calc(100vh-8rem)]">
              <Outlet />
            </div>
          </div>
        </main>
        
      </div>
    </div>
  );
}
