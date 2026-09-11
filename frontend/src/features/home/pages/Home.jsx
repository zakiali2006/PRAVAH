import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Play, Check, Bell, FileText, ChevronRight, Landmark, FileCheck, Calculator, MessageSquare, Bot, Headphones } from "lucide-react";
import { SectionHead } from "../../../components/common/SectionHead";
import { Btn } from "../../../components/common/Btn";
import { C, inputCls, inputStyle } from "../../../constants/theme";
import { T } from "../../../constants/translations";
import { useCountUp } from "../../../hooks/useCountUp";
import { useTranslation } from "../../../contexts/TranslationContext";
import { useAuth } from "../../../contexts/AuthContext";
const FEATURES = [
  { icon: FileCheck, title: "Single-window approvals", body: "One application, one set of documents. The portal routes your file to every department that has to sign off on it." },
  { icon: Clock, title: "Desk-level tracking", body: "See which officer is holding your file, for how long, and what the statutory timeline says it should take." },
  { icon: Calculator, title: "Incentive calculator", body: "Enter your investment and location to see the capital subsidy, SGST refund and duty exemptions you qualify for." },
  { icon: MessageSquare, title: "Grievance redressal", body: "Raise an issue against any department. Unresolved cases escalate automatically up the chain." },
  { icon: Bot, title: "AI assistant", body: "Ask about eligibility, documents or timelines at any hour and get an answer in plain language." },
  { icon: Headphones, title: "Investor handholding", body: "A relationship manager from first enquiry through land, power, water and commissioning." },
];

import { Clock, Smartphone, Download } from "lucide-react"; // moved up

function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div style={{ background: C.navyDeep }} className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none"
           style={{ background: `linear-gradient(45deg, transparent 40%, ${C.white} 40%, ${C.white} 60%, transparent 60%)`, backgroundSize: "20px 20px" }} />
      
      <div className="max-w-7xl mx-auto px-4 py-20 lg:py-28 relative z-10 flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-3/5">
          <div className="inline-block mb-4 px-3 py-1 rounded text-sm font-bold" style={{ background: C.saffron, color: C.white }}>
            {t.heroKicker}
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6" style={{ color: C.white }}>{t.heroTitle}</h1>
          <p className="text-lg leading-relaxed mb-8 max-w-xl" style={{ color: "#A9C5DC" }}>{t.heroSub}</p>

          <div className="p-2 rounded-lg flex items-center gap-2 max-w-xl shadow-lg" style={{ background: C.white }}>
            <Search size={20} color={C.slate} className="ml-2" />
            <input type="text" placeholder={t.searchPh} className={inputCls} style={{ ...inputStyle, border: "none" }} />
            <Btn variant="navy" className="shrink-0" onClick={() => { navigate("/services"); window.scrollTo(0,0); }}>{t.searchBtn}</Btn>
          </div>
          
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span style={{ color: "#8FB4D4" }}>{t.quick}:</span>
            {["Factory plan approval", "Consent to establish", "Fire NOC"].map((q) => (
              <button key={q} onClick={() => { navigate("/services"); window.scrollTo(0,0); }} className="px-3 py-1 rounded-full transition-colors" style={{ background: "rgba(255,255,255,0.1)", color: C.white }}>
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:w-2/5 w-full">
          <div className="rounded-xl overflow-hidden shadow-2xl relative group cursor-pointer aspect-video bg-black">
            <div className="absolute inset-0 opacity-40 bg-center bg-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&q=80')" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: C.saffron }}>
                <Play fill={C.white} color={C.white} className="ml-1" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-white text-sm font-semibold text-shadow">
              See how PRAVAH accelerated the mega EV facility in Pune.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ s, run }) {
  const n = useCountUp(s.value, run);
  const Icon = s.icon;
  return (
    <div className="text-center">
      <div className="flex justify-center mb-2 opacity-90"><Icon size={24} color={C.navyDeep} /></div>
      <div className="text-3xl font-black tabular-nums" style={{ color: C.navyDeep }}>
        {n}{s.suffix}
      </div>
      <div className="text-sm font-bold mt-1" style={{ color: C.white }}>{s.label}</div>
    </div>
  );
}

const STAT_ICONS = [FileCheck, Landmark, FileText, Check];

function StatsBand() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    // Simulate network delay for dashboard stats
    setTimeout(() => {
      const mockStats = [
        { value: 168, label: "Services integrated", suffix: "+" },
        { value: 42, label: "Departments onboarded", suffix: "" },
        { value: 1.2, label: "Files cleared this year", suffix: "M" },
        { value: 94, label: "Applications within SLA", suffix: "%" }
      ];
      const mappedStats = mockStats.map((s, i) => ({
        ...s,
        icon: STAT_ICONS[i] || FileCheck
      }));
      setStats(mappedStats);
    }, 800);
  }, []);

  return (
    <div style={{ background: C.saffron, borderBottom: `4px solid ${C.navy}` }} className="px-4 py-8 relative z-20 shadow-lg">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 min-h-[100px]">
        {stats.length > 0 ? stats.map((s, i) => (
          <Stat key={i} s={s} run={true} />
        )) : (
          <div className="col-span-4 text-center text-white/50 text-sm flex justify-center items-center h-full">
            Loading statistics...
          </div>
        )}
      </div>
    </div>
  );
}

function Features() {
  return (
    <div className="px-4 py-20" style={{ background: C.bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center flex flex-col items-center mb-12">
          <SectionHead
            eyebrow="Portal features"
            title="Everything an investor needs"
            sub="We've rebuilt the clearance process around the applicant, not the departments."
          />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="p-6 rounded-lg transition-transform hover:-translate-y-1 shadow-sm" style={{ background: C.white, border: `1px solid ${C.line}` }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: C.navySoft }}>
                <f.icon size={22} color={C.white} />
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: C.navyDeep }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: C.slate }}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WhyMaharashtra() {
  const points = [
    { title: "$400B Economy", desc: "India's largest state economy, contributing 15% to national GDP." },
    { title: "Power Surplus", desc: "Uninterrupted industrial power supply with a growing green energy mix." },
    { title: "Connectivity", desc: "Four international airports and the nation's premier container port at JNPT." },
    { title: "Talent Pool", desc: "Highest number of technical and vocational graduates in the country." }
  ];
  return (
    <div className="px-4 py-20">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2">
          <div className="aspect-square rounded-2xl overflow-hidden relative shadow-xl">
            <img src="https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80" alt="Mumbai skyline" className="object-cover w-full h-full" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${C.navyDeep}, transparent)` }} />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="text-xl font-bold text-white mb-2">Magnetic Maharashtra</div>
              <div className="text-sm text-white opacity-80">The engine of India's growth story.</div>
            </div>
          </div>
        </div>
        <div className="lg:w-1/2">
          <SectionHead
            eyebrow="The ecosystem"
            title="Why set up in Maharashtra?"
            sub="Beyond ease of doing business, the state offers mature industrial infrastructure and an unmatched domestic market."
          />
          <div className="grid sm:grid-cols-2 gap-6 mt-8">
            {points.map((p, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: C.greenLight }}>
                    <Check size={12} color={C.green} strokeWidth={3} />
                  </div>
                  <h4 className="font-bold text-sm" style={{ color: C.navyDeep }}>{p.title}</h4>
                </div>
                <p className="text-sm leading-relaxed pl-7" style={{ color: C.slate }}>{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 pl-7">
            <Btn variant="outline" className="flex items-center gap-2">Read the Industrial Policy 2019 <ChevronRight size={16} /></Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppDownload() {
  return (
    <div className="px-4 py-16" style={{ background: C.white, borderTop: `1px solid ${C.line}` }}>
      <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-xl" style={{ background: C.navyDeep, color: C.white }}>
        <div className="flex flex-col md:flex-row items-stretch">
          <div className="p-8 md:p-12 lg:p-16 md:w-2/3 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 self-start" style={{ background: "rgba(255,255,255,0.1)", color: C.saffron }}>
              <Smartphone size={16} /> <span className="text-sm font-bold tracking-wider uppercase">Mobile Experience</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Download the PRAVAH App</h2>
            <p className="text-lg opacity-80 leading-relaxed mb-8 max-w-xl">
              Take your business approvals on the go. Track applications, respond to queries, and receive instant push notifications from the palm of your hand.
            </p>
            <a href="https://drive.google.com/drive/folders/1qe27m8CwFfpyJY3UWpmwOdo4HrDWKCFc?usp=sharing" target="_blank" rel="noopener noreferrer" className="self-start">
              <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold shadow-lg transition-transform hover:-translate-y-1" style={{ background: C.saffron, color: C.white }}>
                <Download size={20} /> Download APK
              </div>
            </a>
          </div>
          <div className="md:w-1/3 p-8 flex items-center justify-center bg-black/20 min-h-[300px]">
             <div className="w-40 h-[320px] border-8 border-gray-400 rounded-[2rem] p-3 relative shadow-2xl bg-black">
               <div className="absolute top-0 inset-x-0 h-4 flex justify-center">
                 <div className="w-16 h-3 bg-gray-400 rounded-b-xl"></div>
               </div>
               <div className="w-full h-full rounded-xl flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ background: C.navyDeep }}>
                 <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${C.saffron} 0%, transparent 100%)` }}></div>
                 <Landmark size={48} color={C.white} className="mb-4 relative z-10" />
                 <div className="text-white font-black text-xl tracking-tight relative z-10">PRAVAH <span style={{ color: C.saffron }}>2.0</span></div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Notices() {
  const notices = [
    "Extension of deadline for filing PSI 2019 claims for FY 25-26",
    "Revised checklist for MPCB Consent to Establish in D+ zones",
    "Scheduled maintenance: MSEDCL integration offline on 12 Sep, 2 AM - 4 AM"
  ];
  return (
    <div style={{ background: C.navyDeep, borderTop: `1px solid ${C.navySoft}` }} className="px-4 py-12 text-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="flex items-center gap-2 mb-4 text-saffron">
            <Bell size={20} color={C.saffron} />
            <h3 className="font-bold text-lg">Notifications & Circulars</h3>
          </div>
          <p className="text-sm leading-relaxed opacity-80 mb-6">Stay updated with the latest policy changes, system updates and departmental orders.</p>
          <Btn variant="primary">View all circulars</Btn>
        </div>
        <div className="md:w-2/3 grid gap-3">
          {notices.map((n, i) => (
            <a key={i} href="#" className="flex items-center gap-3 p-4 rounded bg-white bg-opacity-5 hover:bg-opacity-10 transition-colors">
              <FileText size={18} className="shrink-0 opacity-60" />
              <span className="text-sm flex-1">{n}</span>
              <ChevronRight size={16} className="shrink-0 opacity-40" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Home() {
  return (
    <>
      <Hero />
      <StatsBand />
      <Features />
      <WhyMaharashtra />
      <AppDownload />
      <Notices />
    </>
  );
}
