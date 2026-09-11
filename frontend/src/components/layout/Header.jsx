import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Landmark, Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import { C } from "../../constants/theme";
import { T } from "../../constants/translations";
import { Btn } from "../common/Btn";
import { AccessibilityBar } from "../accessibility/AccessibilityBar";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "../../contexts/TranslationContext";

export function Header({ a11y, setA11y }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { t } = useTranslation();
  
  const handleSignOut = () => {
    logout();
    navigate('/');
  };
  
  const publicLinks = [
    { label: t.nav.home, path: "" },
    { label: t.nav.about, path: "about" },
    { label: t.nav.services, path: "services" },
    { label: t.nav.contact, path: "contact" },
  ];

  const privateLinks = [
    { label: t.nav.dashboard, path: "dashboard" },
    {
      label: t.nav.applications,
      subLinks: [
        { label: t.nav.wizard, path: "wizard" },
        { label: t.nav.track, path: "track" },
        { label: t.nav.calc, path: "calc" },
        { label: t.nav.consultation, path: "consultations" },
      ]
    },
    {
      label: t.nav.business,
      subLinks: [
        { label: t.nav.businessDetails, path: "business" },
        { label: t.nav.factory, path: "factory" },
        { label: t.nav.docs, path: "drive" },
        { label: t.nav.payments, path: "payments" },
        { label: t.nav.audit, path: "audit" },
      ]
    },
    {
      label: t.nav.helpdesk,
      subLinks: [
        { label: t.nav.queries, path: "queries" },
        { label: t.nav.grievance, path: "grievance" },
        { label: t.nav.feedback, path: "feedback" },
      ]
    }
  ];

  const navItems = currentUser ? [...publicLinks, ...privateLinks] : publicLinks;

  const go = (path) => { 
    navigate(`/${path}`); 
    setOpen(false); 
    window.scrollTo(0, 0); 
  };

  const currentPath = location.pathname.substring(1);

  return (
    <header className="sticky top-0 z-40">
      {/* tricolour hairline */}
      <div className="flex h-1">
        <div className="flex-1" style={{ background: C.saffron }} />
        <div className="flex-1" style={{ background: C.white }} />
        <div className="flex-1" style={{ background: C.green }} />
      </div>

      {/* govt strip */}
      <div style={{ background: C.navyDeep }} className="px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <span className="text-xs font-medium" style={{ color: "#C9DBEC" }}>
            {t.govt} &nbsp;·&nbsp; {t.dept}
          </span>
          <div className="hidden md:block">
            <AccessibilityBar a11y={a11y} setA11y={setA11y} />
          </div>
        </div>
      </div>

      {/* brand row */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.line}` }} className="px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button onClick={() => go("")} className="flex items-center gap-3 text-left is-link">
            <div
              className="w-11 h-11 rounded flex items-center justify-center shrink-0"
              style={{ background: C.navy }}
            >
              <Landmark size={22} color={C.white} />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold tracking-tight" style={{ color: C.navyDeep }}>
                  {t.brand}
                </span>
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{ background: C.saffronLight, color: C.saffron }}
                >
                  2.0
                </span>
              </div>
              <div className="text-xs leading-tight" style={{ color: C.slate }}>
                {t.brandFull}
              </div>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-2">
            {currentUser ? (
              <>
                <div className="text-sm font-semibold mr-2" style={{ color: C.navyDeep }}>
                  {currentUser.email}
                </div>
                <Btn variant="ghost" onClick={() => go("dashboard")} className="is-link">{t.nav.dashboard}</Btn>
                <Btn onClick={handleSignOut} className="is-link">Sign Out</Btn>
              </>
            ) : (
              <>
                <Btn variant="ghost" onClick={() => go("login")} className="is-link">{t.login}</Btn>
                <Btn onClick={() => go("register")} className="is-link">{t.register}</Btn>
              </>
            )}
          </div>

          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={22} color={C.navy} /> : <Menu size={22} color={C.navy} />}
          </button>
        </div>
      </div>

      {/* nav */}
      <nav style={{ background: C.navy }} className="hidden lg:block border-t border-blue-900 relative">
        <div className="max-w-7xl mx-auto flex px-4">
          {navItems.map((item, idx) => {
            if (item.subLinks) {
              const isActive = item.subLinks.some(sub => currentPath === sub.path);
              return (
                <div key={idx} className="relative group">
                  <button
                    className="is-link px-4 py-3 text-sm font-medium transition-colors flex items-center gap-1"
                    style={{
                      color: isActive ? C.white : "#BFD4E8",
                      background: isActive ? C.navySoft : "transparent",
                      borderBottom: isActive ? `3px solid ${C.saffron}` : "3px solid transparent",
                    }}
                  >
                    {item.label} <ChevronDown size={14} />
                  </button>
                  <div className="absolute left-0 top-full hidden group-hover:block w-48 bg-white shadow-xl border border-slate-200 z-50 rounded-b overflow-hidden">
                    {item.subLinks.map(sub => (
                      <button
                        key={sub.path}
                        onClick={() => go(sub.path)}
                        className="is-link block w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-50"
                        style={{
                          color: currentPath === sub.path ? C.navy : C.slate,
                          fontWeight: currentPath === sub.path ? '600' : '400',
                          borderLeft: currentPath === sub.path ? `3px solid ${C.saffron}` : '3px solid transparent'
                        }}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className="is-link px-4 py-3 text-sm font-medium transition-all hover:bg-white/5 hover:text-white"
                style={{
                  color: currentPath === item.path ? C.white : "#BFD4E8",
                  background: currentPath === item.path ? C.navySoft : "transparent",
                  borderBottom: currentPath === item.path ? `3px solid ${C.saffron}` : "3px solid transparent",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* mobile drawer */}
      {open && (
        <div className="lg:hidden" style={{ background: C.navy }}>
          <div className="px-4 py-2">
            <AccessibilityBar a11y={a11y} setA11y={setA11y} />
          </div>
          {navItems.flatMap(item => item.subLinks ? [{label: item.label, isHeader: true}, ...item.subLinks.map(s => ({...s, isSub: true}))] : [item]).map((link, i) => {
            if (link.isHeader) {
              return (
                <div key={i} className="px-5 pt-4 pb-1 text-xs font-bold uppercase tracking-wider" style={{ color: '#88a4c3', borderTop: i !== 0 ? `1px solid ${C.navySoft}` : 'none' }}>
                  {link.label}
                </div>
              )
            }
            return (
              <button
                key={i}
                onClick={() => go(link.path)}
                className={`w-full text-left px-5 py-3 text-sm font-medium flex items-center justify-between ${link.isSub ? 'pl-8' : ''}`}
                style={{
                  color: currentPath === link.path ? C.saffron : "#D6E4F0",
                  borderTop: !link.isSub && i !== 0 ? `1px solid ${C.navySoft}` : 'none',
                }}
              >
                {link.label} <ChevronRight size={16} />
              </button>
            )
          })}
          <div className="p-4 flex flex-col gap-2" style={{ borderTop: `1px solid ${C.navySoft}` }}>
            {currentUser ? (
              <>
                <div className="text-sm font-semibold mb-2" style={{ color: C.saffronLight }}>
                  {currentUser.email}
                </div>
                <Btn variant="ghost" onClick={() => go("dashboard")} className="w-full">{t.nav.dashboard}</Btn>
                <Btn onClick={handleSignOut} className="w-full">Sign Out</Btn>
              </>
            ) : (
              <>
                <Btn variant="ghost" onClick={() => go("login")} className="w-full">{t.login}</Btn>
                <Btn onClick={() => go("register")} className="w-full">{t.register}</Btn>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
