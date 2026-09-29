import React, { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Landmark, Menu, X, ChevronDown, ChevronRight, Search, LogOut, Bell, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "../../contexts/TranslationContext";
import { NAVIGATION } from "../../config/navigation";
import { C } from "../../constants/theme";
import { AccessibilityBar } from "../accessibility/AccessibilityBar";

export function AuthenticatedLayout({ a11y, setA11y }) {
  const { currentUser, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  const navItems = currentUser && NAVIGATION[currentUser.role] ? NAVIGATION[currentUser.role] : [];
  const currentPath = location.pathname.substring(1);

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  const translateNav = (label) => {
    const map = {
      "Dashboard": t.nav.dashboard,
      "Applications": t.nav.applications,
      "Clearance Roadmap": t.nav.clearance,
      "Apply for Services": t.nav.applyServices,
      "My Applications": t.nav.myApps,
      "My Business": t.nav.business,
      "Business Profile": t.nav.bizProfile,
      "Factory Units": t.nav.factory,
      "Document Drive": t.nav.docs,
      "Payments History": t.nav.payments,
      "Compliance & Tools": t.nav.compliance,
      "Risk Alerts": t.nav.riskAlerts,
      "Incentive Calculator": t.nav.calc,
      "Audit Logs": t.nav.audit,
      "Helpdesk": t.nav.helpdesk,
      "Grievances": t.nav.grievance,
      "Department Queries": t.nav.queries,
      "Public Consultations": t.nav.consultations,
      "Feedback": t.nav.feedback,
    };
    return map[label] || label;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    let results = [];
    
    // Search top-level nav items
    navItems.forEach(item => {
      if (item.label.toLowerCase().includes(query)) {
        results.push({ ...item, type: 'Navigation' });
      }
      // Search sub-items
      if (item.subItems) {
        item.subItems.forEach(sub => {
          if (sub.label.toLowerCase().includes(query)) {
            results.push({ ...sub, type: 'Navigation Link' });
          }
        });
      }
    });
    
    // Adding some contextual mock results for demo
    if (query.includes('doc') || query.includes('pan') || query.includes('aadhar')) {
       results.push({ label: 'Document Drive', path: 'app/documents', type: 'Feature' });
    }
    if (query.includes('clearance') || query.includes('apply')) {
       results.push({ label: 'Apply for Services', path: 'app/apply', type: 'Feature' });
    }
    if (query.includes('dup') || query.includes('alert')) {
       results.push({ label: 'Duplicate Alerts', path: 'officer/duplicates', type: 'Feature' });
    }

    return results.slice(0, 5); // Limit to 5 results
  }, [searchQuery, navItems]);


  const go = (path) => {
    navigate(`/${path}`);
    setMobileMenuOpen(false);
  };

  const toggleMenu = (idx) => {
    setExpandedMenus(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Helper to check if a menu contains the active path
  const isMenuActive = (subLinks) => {
    return subLinks?.some(sub => currentPath === sub.path);
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-50 font-sans text-slate-900">
      
      {/* LEFT SIDEBAR - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 shadow-xl shrink-0 z-20">
        
        {/* Brand Area */}
        <div className="h-16 px-6 flex items-center gap-3 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shrink-0">
            <Landmark size={18} color="white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight tracking-tight">PRAVAH <span className="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded text-white ml-1 align-middle">2.0</span></div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item, idx) => {
            const hasSub = !!item.subLinks;
            const activeSub = isMenuActive(item.subLinks);
            const isRootActive = !hasSub && currentPath === item.path;
            
            // Auto-expand if active
            const isOpen = expandedMenus[idx] || activeSub;

            if (hasSub) {
              return (
                <div key={idx} className="mb-2">
                  <button
                    onClick={() => toggleMenu(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeSub ? "bg-slate-800 text-white" : "hover:bg-slate-800 hover:text-white text-slate-400"
                    }`}
                  >
                    <span>{translateNav(item.label)}</span>
                    <ChevronRight size={14} className={`transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-1 ml-2 pl-2 border-l border-slate-800 space-y-1 py-1">
                          {item.subLinks.map(sub => {
                            const isSubActive = currentPath === sub.path;
                            return (
                              <button
                                key={sub.path}
                                onClick={() => go(sub.path)}
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                                  isSubActive ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                }`}
                              >
                                {translateNav(sub.label)}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isRootActive ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {translateNav(item.label)}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-500">
          Govt of Maharashtra &copy; 2026
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        
        {/* TOP BAR */}
        <header className="relative h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-50">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-3">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Gov" className="h-9 opacity-90" />
              <div className="flex flex-col border-l-2 border-slate-200 pl-3 py-0.5">
                <span className="text-sm font-bold text-slate-800 leading-tight">{t.govt}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{t.dept}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex relative" ref={searchRef}>
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-20 peer-focus:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder={t.search?.placeholder || "Search resources..."} 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="peer pl-10 pr-4 py-2 bg-slate-100/50 hover:bg-slate-100 border border-slate-200/60 rounded-full text-sm w-56 focus:w-72 transition-all duration-300 focus:outline-none focus:bg-white focus:ring-[3px] focus:ring-blue-500/10 focus:border-blue-500 relative z-10 placeholder:text-slate-400 text-slate-700"
                />
                
                {/* Keyboard Shortcut Hint */}
                {!isSearchOpen && !searchQuery && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-20 hidden lg:flex items-center gap-1">
                    <kbd className="font-sans text-[10px] font-semibold text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded">Ctrl</kbd>
                    <kbd className="font-sans text-[10px] font-semibold text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded">K</kbd>
                  </div>
                )}
              </div>
              
              {/* Dropdown Results */}
              <AnimatePresence>
                {isSearchOpen && searchQuery && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 origin-top-left"
                  >
                    <div className="px-4 py-2.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                      <span>{t.search?.results || "Search Results"}</span>
                      {searchResults.length > 0 && <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{searchResults.length}</span>}
                    </div>
                    
                    {searchResults.length > 0 ? (
                      <div className="max-h-[320px] overflow-y-auto p-1.5">
                        {searchResults.map((res, i) => (
                          <button
                            key={i}
                            className="w-full text-left p-3 hover:bg-slate-50 flex items-start gap-3.5 transition-colors rounded-lg group"
                            onClick={() => {
                              if (res.path) {
                                navigate(res.path.startsWith('/') ? res.path : `/${res.path}`);
                              }
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              {res.icon ? <res.icon size={16} className="text-slate-500 group-hover:text-blue-600 transition-colors" /> : <Search size={16} className="text-slate-500 group-hover:text-blue-600 transition-colors" />}
                            </div>
                            <div className="min-w-0 flex-1 pt-0.5">
                              <div className="text-[13px] font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">{res.label}</div>
                              <div className="text-[11px] font-medium text-slate-500 mt-0.5">{res.type}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-6 py-8 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                          <Search size={20} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">{t.search?.noResults || "No results found"}</p>
                        <p className="text-xs text-slate-500 mt-1">{t.search?.adjust || "Try adjusting your search query."}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

            {/* A11y */}
            <div className="hidden sm:block">
              <AccessibilityBar a11y={a11y} setA11y={setA11y} darkText={true} />
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full relative">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              
              <div className="h-8 flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-sm font-semibold text-slate-700">
                  {currentUser?.email?.split('@')[0]}
                </div>
                <button 
                  onClick={handleSignOut}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto relative bg-slate-50 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="w-72 bg-slate-900 h-full flex flex-col relative z-10 shadow-2xl">
            <div className="h-16 px-4 flex items-center justify-between bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Landmark size={20} className="text-blue-500" />
                <span className="text-white font-bold tracking-tight">PRAVAH 2.0</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white p-2">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map((item, idx) => {
                const hasSub = !!item.subLinks;
                const activeSub = isMenuActive(item.subLinks);
                const isRootActive = !hasSub && currentPath === item.path;
                const isOpen = expandedMenus[idx] || activeSub;

                if (hasSub) {
                  return (
                    <div key={idx} className="mb-2">
                      <button
                        onClick={() => toggleMenu(idx)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          activeSub ? "bg-slate-800 text-white" : "text-slate-300"
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronRight size={14} className={`transition-transform ${isOpen ? "rotate-90" : ""}`} />
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-1 ml-2 pl-2 border-l border-slate-800 space-y-1 py-1">
                              {item.subLinks.map(sub => {
                                const isSubActive = currentPath === sub.path;
                                return (
                                  <button
                                    key={sub.path}
                                    onClick={() => go(sub.path)}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                                      isSubActive ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-white"
                                    }`}
                                  >
                                    {sub.label}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.path}
                    onClick={() => go(item.path)}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isRootActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
