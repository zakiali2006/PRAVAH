import React, { useState, useEffect, useRef } from "react";
import {
  Search, Menu, X, Globe, Type, Eye, Link2, Building2, MapPin, Phone, Mail,
  FileCheck, Clock, Calculator, MessageSquare, Headphones, ShieldCheck,
  ChevronRight, Check, Bot, Send, TrendingUp, Users, FileText, Landmark,
  Factory, Zap, Percent, IndianRupee, CircleAlert, Loader2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/* ------------------------------------------------------------------ */
const C = {
  navy: "#0B3C6E",
  navyDeep: "#062A4F",
  navySoft: "#12508F",
  saffron: "#E87722",
  saffronLight: "#FFF1E4",
  green: "#137A46",
  greenLight: "#E8F4EE",
  ink: "#152230",
  slate: "#5C6B7A",
  bg: "#F3F6F9",
  line: "#D9E1E9",
  white: "#FFFFFF",
};

const FONT = `"Segoe UI", "Noto Sans", "Noto Sans Devanagari", system-ui, -apple-system, Arial, sans-serif`;

/* ------------------------------------------------------------------ */
/*  Bilingual strings                                                  */
/* ------------------------------------------------------------------ */
const T = {
  en: {
    govt: "Government of Maharashtra",
    dept: "Industries, Energy, Labour & Mining Department",
    brand: "MAITRI",
    brandFull: "Maharashtra Industry, Trade and Investment Facilitation Cell",
    nav: {
      home: "Home", about: "About Us", services: "Services", track: "Track Application",
      calc: "Incentive Calculator", grievance: "Grievance", dashboard: "Dashboard", contact: "Contact Us",
    },
    login: "Login", register: "New investor registration",
    heroKicker: "Single Window Clearance System",
    heroTitle: "Every approval your project needs, on one portal.",
    heroSub: "Apply for licences, permissions and registrations across 16 departments, track each file to the officer's desk, and claim the incentives you qualify for.",
    searchPh: "Search a service — factory licence, fire NOC, consent to establish…",
    searchBtn: "Search services",
    quick: "Frequently used",
  },
  mr: {
    govt: "महाराष्ट्र शासन",
    dept: "उद्योग, ऊर्जा, कामगार व खनिकर्म विभाग",
    brand: "मैत्री",
    brandFull: "महाराष्ट्र उद्योग, व्यापार व गुंतवणूक सुविधा कक्ष",
    nav: {
      home: "मुख्यपृष्ठ", about: "आमच्याविषयी", services: "सेवा", track: "अर्ज स्थिती",
      calc: "प्रोत्साहन गणक", grievance: "तक्रार", dashboard: "डॅशबोर्ड", contact: "संपर्क",
    },
    login: "लॉगिन", register: "नवीन गुंतवणूकदार नोंदणी",
    heroKicker: "एक खिडकी मंजुरी प्रणाली",
    heroTitle: "प्रकल्पासाठी लागणाऱ्या सर्व मंजुऱ्या, एकाच पोर्टलवर.",
    heroSub: "१६ विभागांच्या परवानग्या व नोंदणीसाठी अर्ज करा, प्रत्येक फाईल अधिकाऱ्याच्या टेबलपर्यंत ट्रॅक करा आणि पात्र प्रोत्साहन मिळवा.",
    searchPh: "सेवा शोधा — कारखाना परवाना, अग्निशमन ना-हरकत…",
    searchBtn: "सेवा शोधा",
    quick: "वारंवार वापरल्या जाणाऱ्या",
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const STATS = [
  { value: 119, suffix: "", label: "Services integrated", icon: FileCheck },
  { value: 16, suffix: "", label: "Departments onboarded", icon: Landmark },
  { value: 368219, suffix: "", label: "Applications received", icon: FileText },
  { value: 352297, suffix: "", label: "Applications disposed", icon: Check },
];

const FEATURES = [
  { icon: FileCheck, title: "Single-window approvals", body: "One application, one set of documents. The portal routes your file to every department that has to sign off on it." },
  { icon: Clock, title: "Desk-level tracking", body: "See which officer is holding your file, for how long, and what the statutory timeline says it should take." },
  { icon: Calculator, title: "Incentive calculator", body: "Enter your investment and location to see the capital subsidy, SGST refund and duty exemptions you qualify for." },
  { icon: MessageSquare, title: "Grievance redressal", body: "Raise an issue against any department. Unresolved cases escalate automatically up the chain." },
  { icon: Bot, title: "AI assistant", body: "Ask about eligibility, documents or timelines at any hour and get an answer in plain language." },
  { icon: Headphones, title: "Investor handholding", body: "A relationship manager from first enquiry through land, power, water and commissioning." },
];

const SERVICE_GROUPS = [
  { dept: "Directorate of Industries", count: 14, items: ["Udyog Aadhaar acknowledgement", "Entrepreneurs Memorandum Part-II", "Incentive eligibility certificate", "Registration under PSI 2019"] },
  { dept: "MIDC", count: 12, items: ["Plot allotment", "Building plan approval", "Water connection", "Transfer of lease"] },
  { dept: "Maharashtra Pollution Control Board", count: 9, items: ["Consent to establish", "Consent to operate", "Hazardous waste authorisation", "Renewal of consent"] },
  { dept: "Directorate of Fire Services", count: 6, items: ["Provisional fire NOC", "Final fire NOC", "Renewal of fire NOC"] },
  { dept: "Labour Department", count: 15, items: ["Factory plan approval", "Factory licence", "Contract labour licence", "Shops & establishment registration"] },
  { dept: "MSEDCL", count: 8, items: ["New HT connection", "Load enhancement", "Electricity duty exemption"] },
  { dept: "Revenue Department", count: 11, items: ["NA permission", "Land use conversion", "Tenure conversion"] },
  { dept: "Urban Development", count: 10, items: ["Development permission", "Commencement certificate", "Occupancy certificate"] },
];

const TALUKA_CAT = [
  { code: "A", label: "A — Developed (Mumbai, Thane belt)", ceiling: 0, years: 0 },
  { code: "B", label: "B — Less developed", ceiling: 30, years: 7 },
  { code: "C", label: "C — Less developed", ceiling: 40, years: 7 },
  { code: "D", label: "D — Least developed", ceiling: 50, years: 10 },
  { code: "D+", label: "D+ — Least developed", ceiling: 70, years: 10 },
  { code: "NID", label: "No-industry district", ceiling: 80, years: 10 },
  { code: "NAX", label: "Naxalism affected area", ceiling: 100, years: 10 },
];

const SECTORS = [
  { key: "msme", label: "MSME manufacturing", bump: 0 },
  { key: "large", label: "Large scale unit", bump: -5 },
  { key: "mega", label: "Mega / Ultra-mega project", bump: 10 },
  { key: "textile", label: "Textile & apparel", bump: 5 },
  { key: "agro", label: "Agro & food processing", bump: 5 },
  { key: "ev", label: "Electric vehicles & components", bump: 10 },
  { key: "gh2", label: "Green hydrogen & renewables", bump: 15 },
  { key: "electronics", label: "Electronics & semiconductors", bump: 10 },
];

const TRACK_STAGES = [
  { name: "Application submitted", desc: "Common application form received and fee paid", days: 0 },
  { name: "Scrutiny at nodal desk", desc: "MAITRI nodal officer checks completeness", days: 2 },
  { name: "Department processing", desc: "Forwarded to Labour Dept — Joint Director (Industrial Safety)", days: 7 },
  { name: "Site inspection", desc: "Inspection scheduled and report uploaded", days: 12 },
  { name: "Approval issued", desc: "Digitally signed certificate available for download", days: 21 },
];

const SECTOR_INVEST = [
  { name: "Engineering", value: 82400 },
  { name: "Chemicals", value: 61200 },
  { name: "Textiles", value: 38900 },
  { name: "Food proc.", value: 34100 },
  { name: "Electronics", value: 29600 },
  { name: "Auto & EV", value: 71800 },
];

const MONTHLY = [
  { m: "Apr", received: 24100, disposed: 22600 },
  { m: "May", received: 26800, disposed: 25400 },
  { m: "Jun", received: 29300, disposed: 27900 },
  { m: "Jul", received: 31200, disposed: 30100 },
  { m: "Aug", received: 33600, disposed: 32200 },
  { m: "Sep", received: 35900, disposed: 34800 },
];

const REGION_SPLIT = [
  { name: "Pune division", value: 31 },
  { name: "Konkan division", value: 26 },
  { name: "Nashik division", value: 17 },
  { name: "Nagpur division", value: 14 },
  { name: "Aurangabad division", value: 12 },
];

const PIE_COLORS = ["#0B3C6E", "#12508F", "#E87722", "#137A46", "#7A8CA0"];

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */
const inr = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);

function useCountUp(target, run) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf, start;
    const dur = 1400;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return n;
}

function SectionHead({ eyebrow, title, sub }) {
  return (
    <div className="mb-8 max-w-3xl">
      {eyebrow && (
        <div
          className="inline-block mb-3 px-3 py-1 rounded text-sm font-semibold"
          style={{ background: C.saffronLight, color: C.saffron }}
        >
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl font-bold leading-tight" style={{ color: C.navyDeep }}>
        {title}
      </h2>
      {sub && (
        <p className="mt-3 text-base leading-relaxed" style={{ color: C.slate }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", className = "", type }) {
  const styles = {
    primary: { background: C.saffron, color: C.white, border: `1px solid ${C.saffron}` },
    navy: { background: C.navy, color: C.white, border: `1px solid ${C.navy}` },
    outline: { background: "transparent", color: C.navy, border: `1px solid ${C.navy}` },
    ghost: { background: C.white, color: C.navy, border: `1px solid ${C.line}` },
  }[variant];
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded font-semibold text-sm transition-opacity hover:opacity-85 focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
      style={{ ...styles, outlineColor: C.navy }}
    >
      {children}
    </button>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-semibold mb-1.5" style={{ color: C.ink }}>
        {label}
      </span>
      {children}
      {hint && (
        <span className="block text-xs mt-1" style={{ color: C.slate }}>
          {hint}
        </span>
      )}
    </label>
  );
}

const inputCls =
  "w-full px-3 py-2.5 rounded text-sm focus:outline-none focus:ring-2";
const inputStyle = { border: `1px solid ${C.line}`, background: C.white, color: C.ink };

/* ------------------------------------------------------------------ */
/*  Accessibility panel                                                */
/* ------------------------------------------------------------------ */
function A11yBar({ a11y, setA11y, lang, setLang }) {
  const cycleFont = () => setA11y({ ...a11y, font: a11y.font >= 2 ? 0 : a11y.font + 1 });
  const item = "flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white hover:bg-opacity-15";
  return (
    <div className="flex items-center gap-1 text-xs" style={{ color: "#DCE7F2" }}>
      <button className={item} onClick={cycleFont} title="Change text size">
        <Type size={14} /> A{a11y.font === 0 ? "" : a11y.font === 1 ? "+" : "++"}
      </button>
      <button
        className={item}
        onClick={() => setA11y({ ...a11y, invert: !a11y.invert })}
        title="High contrast"
      >
        <Eye size={14} /> Contrast
      </button>
      <button
        className={item}
        onClick={() => setA11y({ ...a11y, links: !a11y.links })}
        title="Highlight links"
      >
        <Link2 size={14} /> Links
      </button>
      <span style={{ opacity: 0.4 }}>|</span>
      <button
        className={item}
        onClick={() => setLang(lang === "en" ? "mr" : "en")}
      >
        <Globe size={14} /> {lang === "en" ? "मराठी" : "English"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */
function Header({ page, setPage, lang, setLang, a11y, setA11y }) {
  const [open, setOpen] = useState(false);
  const t = T[lang];
  const links = [
    ["home", t.nav.home], ["about", t.nav.about], ["services", t.nav.services],
    ["track", t.nav.track], ["calc", t.nav.calc], ["grievance", t.nav.grievance],
    ["dashboard", t.nav.dashboard], ["contact", t.nav.contact],
  ];
  const go = (k) => { setPage(k); setOpen(false); window.scrollTo(0, 0); };

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
            <A11yBar a11y={a11y} setA11y={setA11y} lang={lang} setLang={setLang} />
          </div>
        </div>
      </div>

      {/* brand row */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.line}` }} className="px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button onClick={() => go("home")} className="flex items-center gap-3 text-left">
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
            <Btn variant="ghost" onClick={() => go("track")}>{t.login}</Btn>
            <Btn onClick={() => go("services")}>{t.register}</Btn>
          </div>

          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={22} color={C.navy} /> : <Menu size={22} color={C.navy} />}
          </button>
        </div>
      </div>

      {/* nav */}
      <nav style={{ background: C.navy }} className="hidden lg:block">
        <div className="max-w-7xl mx-auto flex px-4">
          {links.map(([k, label]) => (
            <button
              key={k}
              onClick={() => go(k)}
              className="px-4 py-3 text-sm font-medium transition-colors"
              style={{
                color: page === k ? C.white : "#BFD4E8",
                background: page === k ? C.navySoft : "transparent",
                borderBottom: page === k ? `3px solid ${C.saffron}` : "3px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* mobile drawer */}
      {open && (
        <div className="lg:hidden" style={{ background: C.navy }}>
          <div className="px-4 py-2">
            <A11yBar a11y={a11y} setA11y={setA11y} lang={lang} setLang={setLang} />
          </div>
          {links.map(([k, label]) => (
            <button
              key={k}
              onClick={() => go(k)}
              className="w-full text-left px-5 py-3 text-sm font-medium flex items-center justify-between"
              style={{
                color: page === k ? C.saffron : "#D6E4F0",
                borderTop: `1px solid ${C.navySoft}`,
              }}
            >
              {label} <ChevronRight size={16} />
            </button>
          ))}
          <div className="p-4 flex gap-2" style={{ borderTop: `1px solid ${C.navySoft}` }}>
            <Btn variant="ghost" onClick={() => go("track")} className="flex-1">{t.login}</Btn>
            <Btn onClick={() => go("services")} className="flex-1">{t.register}</Btn>
          </div>
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Home                                                               */
/* ------------------------------------------------------------------ */
function Hero({ lang, setPage }) {
  const t = T[lang];
  const [q, setQ] = useState("");
  return (
    <section
      style={{
        background: `linear-gradient(115deg, ${C.navyDeep} 0%, ${C.navy} 55%, ${C.navySoft} 100%)`,
      }}
      className="px-4 py-14"
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded mb-4 text-xs font-semibold"
            style={{ background: "rgba(232,119,34,0.18)", color: "#FFB877" }}
          >
            <ShieldCheck size={14} /> {t.heroKicker}
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold leading-tight mb-4"
            style={{ color: C.white }}
          >
            {t.heroTitle}
          </h1>
          <p className="text-base md:text-lg leading-relaxed mb-7" style={{ color: "#C6DAEC", maxWidth: "34rem" }}>
            {t.heroSub}
          </p>

          <div
            className="flex flex-col sm:flex-row gap-2 p-2 rounded"
            style={{ background: C.white }}
          >
            <div className="flex items-center gap-2 flex-1 px-2">
              <Search size={18} color={C.slate} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.searchPh}
                className="w-full py-2.5 text-sm focus:outline-none"
                style={{ color: C.ink }}
              />
            </div>
            <Btn onClick={() => setPage("services")}>{t.searchBtn}</Btn>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs" style={{ color: "#9FBBD4" }}>{t.quick}:</span>
            {["Factory licence", "Consent to establish", "Fire NOC", "NA permission"].map((s) => (
              <button
                key={s}
                onClick={() => setPage("services")}
                className="text-xs px-2.5 py-1 rounded"
                style={{ background: "rgba(255,255,255,0.12)", color: "#DCE9F5" }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded p-6" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <h3 className="font-bold mb-1" style={{ color: C.white }}>Start here</h3>
            <p className="text-sm mb-5" style={{ color: "#A9C5DC" }}>
              Three things most investors do first.
            </p>
            {[
              { icon: Factory, title: "Register your project", body: "One profile covers every department.", go: "services" },
              { icon: Calculator, title: "Check your incentives", body: "Subsidy, SGST refund, duty exemptions.", go: "calc" },
              { icon: Clock, title: "Track a pending file", body: "See the officer and the days elapsed.", go: "track" },
            ].map((x) => (
              <button
                key={x.title}
                onClick={() => { setPage(x.go); window.scrollTo(0, 0); }}
                className="w-full flex items-start gap-3 p-3 mb-2 rounded text-left transition-colors hover:bg-white hover:bg-opacity-10"
                style={{ border: "1px solid rgba(255,255,255,0.13)" }}
              >
                <div className="p-2 rounded shrink-0" style={{ background: C.saffron }}>
                  <x.icon size={16} color={C.white} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold" style={{ color: C.white }}>{x.title}</div>
                  <div className="text-xs" style={{ color: "#A9C5DC" }}>{x.body}</div>
                </div>
                <ChevronRight size={16} color="#7FA3C4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBand() {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setSeen(true),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section ref={ref} className="px-4 py-10" style={{ background: C.white, borderBottom: `1px solid ${C.line}` }}>
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((s) => <Stat key={s.label} {...s} run={seen} />)}
      </div>
    </section>
  );
}

function Stat({ value, label, icon: Icon, run }) {
  const n = useCountUp(value, run);
  return (
    <div className="flex items-start gap-3">
      <div className="p-2.5 rounded shrink-0" style={{ background: C.greenLight }}>
        <Icon size={20} color={C.green} />
      </div>
      <div>
        <div className="text-2xl md:text-3xl font-bold tabular-nums" style={{ color: C.navyDeep }}>
          {inr(n)}
        </div>
        <div className="text-sm" style={{ color: C.slate }}>{label}</div>
      </div>
    </div>
  );
}

function Features() {
  return (
    <section className="px-4 py-14">
      <div className="max-w-7xl mx-auto">
        <SectionHead
          eyebrow="What the portal does"
          title="Built to remove the trips to the department office"
          sub="MAITRI 2.0 replaces counter visits with an online file that departments act on within statutory timelines."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded"
              style={{ background: C.white, border: `1px solid ${C.line}` }}
            >
              <div className="w-10 h-10 rounded flex items-center justify-center mb-4" style={{ background: C.navy }}>
                <f.icon size={19} color={C.white} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: C.navyDeep }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: C.slate }}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyMaharashtra() {
  const points = [
    { icon: TrendingUp, k: "₹32.4 lakh crore", v: "Gross state domestic product, the largest of any Indian state" },
    { icon: Factory, k: "289 industrial areas", v: "MIDC estates with plug-and-play plots and common infrastructure" },
    { icon: Users, k: "1.2 crore workforce", v: "Skilled manufacturing and engineering talent pool" },
    { icon: Zap, k: "Surplus power", v: "Reliable industrial supply with duty exemptions in backward talukas" },
  ];
  return (
    <section className="px-4 py-14" style={{ background: C.navyDeep }}>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: C.white }}>
            Why investors choose Maharashtra
          </h2>
          <p className="text-base leading-relaxed mb-6" style={{ color: "#B7CFE4", maxWidth: "32rem" }}>
            The state contributes the largest share of India's industrial output and manufacturing exports.
            MAITRI exists to make the regulatory side of setting up here as fast as the commercial side.
          </p>
          <Btn variant="primary">Download the investment handbook</Btn>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {points.map((p) => (
            <div key={p.k} className="p-5 rounded" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <p.icon size={20} color={C.saffron} />
              <div className="text-lg font-bold mt-3" style={{ color: C.white }}>{p.k}</div>
              <div className="text-sm mt-1" style={{ color: "#A9C5DC" }}>{p.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Notices() {
  const items = [
    { tag: "Circular", date: "02 Sep 2026", text: "Extension of PSI 2019 registration window for units in D+ talukas" },
    { tag: "Notification", date: "28 Aug 2026", text: "Consent to Operate renewal moved fully online under MPCB" },
    { tag: "Update", date: "19 Aug 2026", text: "Eleven additional services from Urban Development integrated" },
    { tag: "Advisory", date: "11 Aug 2026", text: "MAITRI 1.0 registrations closed; migrate existing profiles to 2.0" },
  ];
  return (
    <section className="px-4 py-14">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionHead title="Notices and circulars" />
          <div style={{ border: `1px solid ${C.line}`, background: C.white }} className="rounded overflow-hidden">
            {items.map((i, idx) => (
              <div
                key={i.text}
                className="flex flex-col sm:flex-row sm:items-center gap-2 p-4"
                style={{ borderTop: idx ? `1px solid ${C.line}` : "none" }}
              >
                <span
                  className="text-xs font-semibold px-2 py-1 rounded self-start"
                  style={{ background: C.greenLight, color: C.green, minWidth: "6.5rem", textAlign: "center" }}
                >
                  {i.tag}
                </span>
                <span className="text-sm flex-1" style={{ color: C.ink }}>{i.text}</span>
                <span className="text-xs shrink-0" style={{ color: C.slate }}>{i.date}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionHead title="Helpdesk" />
          <div className="p-6 rounded" style={{ background: C.white, border: `1px solid ${C.line}` }}>
            <div className="flex items-center gap-3 mb-4">
              <Phone size={18} color={C.navy} />
              <div>
                <div className="text-sm font-semibold" style={{ color: C.ink }}>1800 120 8040</div>
                <div className="text-xs" style={{ color: C.slate }}>Mon–Sat, 9:45 am to 6:15 pm</div>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-5">
              <Mail size={18} color={C.navy} />
              <div>
                <div className="text-sm font-semibold" style={{ color: C.ink }}>helpdesk.maitri@maharashtra.gov.in</div>
                <div className="text-xs" style={{ color: C.slate }}>Replies within two working days</div>
              </div>
            </div>
            <Btn variant="outline" className="w-full">Raise a ticket</Btn>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Services page                                                      */
/* ------------------------------------------------------------------ */
function ServicesPage() {
  const [q, setQ] = useState("");
  const groups = SERVICE_GROUPS.filter(
    (g) =>
      g.dept.toLowerCase().includes(q.toLowerCase()) ||
      g.items.some((i) => i.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <div className="px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <SectionHead
          eyebrow="119 services · 16 departments"
          title="Services you can apply for"
          sub="Every service below is filed, tracked and delivered through MAITRI. Nothing here needs a visit to the department."
        />
        <div className="flex items-center gap-2 mb-8 p-2 rounded max-w-xl" style={{ background: C.white, border: `1px solid ${C.line}` }}>
          <Search size={18} color={C.slate} className="ml-2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by department or service name"
            className="w-full py-2 text-sm focus:outline-none"
            style={{ color: C.ink }}
          />
        </div>

        {groups.length === 0 ? (
          <div className="p-10 rounded text-center" style={{ background: C.white, border: `1px solid ${C.line}` }}>
            <CircleAlert size={28} color={C.slate} className="mx-auto mb-3" />
            <p className="text-sm" style={{ color: C.slate }}>
              No service matches that term. Try the department name, or call the helpdesk on 1800 120 8040.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {groups.map((g) => (
              <div key={g.dept} className="rounded overflow-hidden" style={{ background: C.white, border: `1px solid ${C.line}` }}>
                <div className="flex items-center justify-between px-5 py-3" style={{ background: C.navy }}>
                  <span className="font-semibold text-sm" style={{ color: C.white }}>{g.dept}</span>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: C.saffron, color: C.white }}>
                    {g.count} services
                  </span>
                </div>
                <div className="p-5">
                  {g.items.map((i) => (
                    <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${C.bg}` }}>
                      <span className="text-sm" style={{ color: C.ink }}>{i}</span>
                      <button className="text-xs font-semibold" style={{ color: C.saffron }}>Apply</button>
                    </div>
                  ))}
                  <button className="mt-3 text-xs font-semibold flex items-center gap-1" style={{ color: C.navy }}>
                    View all {g.count} <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Incentive calculator                                               */
/* ------------------------------------------------------------------ */
function CalcPage() {
  const [invest, setInvest] = useState("50");
  const [sector, setSector] = useState("msme");
  const [cat, setCat] = useState("D");
  const [jobs, setJobs] = useState("120");
  const [result, setResult] = useState(null);

  const compute = () => {
    const cr = parseFloat(invest) || 0;
    const emp = parseInt(jobs) || 0;
    const catRow = TALUKA_CAT.find((c) => c.code === cat);
    const sec = SECTORS.find((s) => s.key === sector);
    if (cr <= 0) { setResult({ error: "Enter the eligible fixed capital investment to continue." }); return; }

    const ceilingPct = Math.max(0, Math.min(120, catRow.ceiling + sec.bump));
    const ceiling = (cr * ceilingPct) / 100;
    const capital = Math.min(ceiling * 0.35, cr * 0.2);
    const sgst = ceiling * 0.4;
    const interest = Math.min(cr * 0.05, ceiling * 0.15);
    const power = emp * 0.005;
    const stamp = cr * 0.006;
    const total = capital + sgst + interest + power + stamp;

    setResult({
      ceilingPct, ceiling, capital, sgst, interest, power, stamp, total,
      years: catRow.years, catLabel: catRow.label, secLabel: sec.label, cr, emp,
    });
  };

  const rows = result && !result.error ? [
    { k: "Capital subsidy on fixed assets", v: result.capital },
    { k: "SGST refund on local sales", v: result.sgst },
    { k: "Interest subsidy on term loan", v: result.interest },
    { k: "Electricity duty exemption", v: result.power },
    { k: "Stamp duty exemption", v: result.stamp },
  ] : [];

  return (
    <div className="px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <SectionHead
          eyebrow="Package Scheme of Incentives"
          title="Estimate what your project qualifies for"
          sub="An indicative working based on eligible fixed capital investment and taluka classification. The eligibility certificate issued by the Directorate of Industries is what finally governs your entitlement."
        />

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 p-6 rounded" style={{ background: C.white, border: `1px solid ${C.line}` }}>
            <Field label="Eligible fixed capital investment (₹ crore)" hint="Land, building, plant and machinery">
              <input
                type="number" value={invest} onChange={(e) => setInvest(e.target.value)}
                className={inputCls} style={inputStyle} min="0"
              />
            </Field>
            <Field label="Sector">
              <select value={sector} onChange={(e) => setSector(e.target.value)} className={inputCls} style={inputStyle}>
                {SECTORS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Taluka classification" hint="As notified under PSI 2019">
              <select value={cat} onChange={(e) => setCat(e.target.value)} className={inputCls} style={inputStyle}>
                {TALUKA_CAT.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Direct employment generated">
              <input
                type="number" value={jobs} onChange={(e) => setJobs(e.target.value)}
                className={inputCls} style={inputStyle} min="0"
              />
            </Field>
            <Btn variant="navy" onClick={compute} className="w-full mt-2">Calculate incentives</Btn>
          </div>

          <div className="lg:col-span-3">
            {!result && (
              <div className="h-full flex flex-col items-center justify-center p-12 rounded text-center" style={{ background: C.white, border: `1px dashed ${C.line}` }}>
                <Calculator size={30} color={C.slate} />
                <p className="mt-4 text-sm max-w-xs" style={{ color: C.slate }}>
                  Fill in the project details on the left and the estimate appears here.
                </p>
              </div>
            )}

            {result?.error && (
              <div className="p-5 rounded flex items-start gap-3" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5" }}>
                <CircleAlert size={18} color="#B91C1C" className="mt-0.5 shrink-0" />
                <p className="text-sm" style={{ color: "#7F1D1D" }}>{result.error}</p>
              </div>
            )}

            {result && !result.error && (
              <div className="rounded overflow-hidden" style={{ background: C.white, border: `1px solid ${C.line}` }}>
                <div className="p-6" style={{ background: C.navyDeep }}>
                  <div className="text-sm" style={{ color: "#A9C5DC" }}>Indicative incentive over {result.years} years</div>
                  <div className="text-4xl font-bold mt-1" style={{ color: C.white }}>
                    ₹ {inr(result.total.toFixed(2))} cr
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 text-xs" style={{ color: "#A9C5DC" }}>
                    <span className="flex items-center gap-1.5"><Percent size={13} /> Ceiling {result.ceilingPct}% of investment</span>
                    <span className="flex items-center gap-1.5"><IndianRupee size={13} /> Cap ₹ {inr(result.ceiling.toFixed(2))} cr</span>
                    <span className="flex items-center gap-1.5"><MapPin size={13} /> {result.catLabel.split("—")[0].trim()} taluka</span>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="text-sm font-bold mb-3" style={{ color: C.navyDeep }}>Break-up</h4>
                  {rows.map((r) => (
                    <div key={r.k} className="mb-3">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-sm" style={{ color: C.ink }}>{r.k}</span>
                        <span className="text-sm font-semibold tabular-nums" style={{ color: C.navyDeep }}>
                          ₹ {inr(r.v.toFixed(2))} cr
                        </span>
                      </div>
                      <div className="h-1.5 rounded" style={{ background: C.bg }}>
                        <div
                          className="h-1.5 rounded"
                          style={{ width: `${Math.min(100, (r.v / result.total) * 100)}%`, background: C.saffron }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="mt-5 p-3 rounded text-xs leading-relaxed" style={{ background: C.bg, color: C.slate }}>
                    This is an estimate for planning only. Final entitlement depends on the eligibility certificate,
                    the date of commercial production and compliance with employment conditions under PSI 2019.
                  </div>
                  <Btn variant="primary" className="w-full mt-4">Start incentive application</Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Track application                                                  */
/* ------------------------------------------------------------------ */
function TrackPage() {
  const [id, setId] = useState("");
  const [state, setState] = useState("idle"); // idle | loading | found | notfound
  const [stage, setStage] = useState(2);

  const search = () => {
    const v = id.trim();
    if (!v) return;
    setState("loading");
    setTimeout(() => {
      if (v.length < 6) { setState("notfound"); return; }
      setStage((v.charCodeAt(v.length - 1) % 4) + 1);
      setState("found");
    }, 700);
  };

  return (
    <div className="px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <SectionHead
          eyebrow="Real-time status"
          title="Track your application to the officer's desk"
          sub="Enter the acknowledgement number printed on your submission receipt. Any ID of six characters or more will show a sample file."
        />

        <div className="flex flex-col sm:flex-row gap-2 p-2 rounded mb-8" style={{ background: C.white, border: `1px solid ${C.line}` }}>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="e.g. MTR/2026/LAB/0084213"
            className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
            style={{ color: C.ink }}
          />
          <Btn variant="navy" onClick={search}>Track application</Btn>
        </div>

        {state === "loading" && (
          <div className="p-10 rounded flex items-center justify-center gap-3" style={{ background: C.white, border: `1px solid ${C.line}` }}>
            <Loader2 size={18} color={C.navy} className="animate-spin" />
            <span className="text-sm" style={{ color: C.slate }}>Fetching status from the department server…</span>
          </div>
        )}

        {state === "notfound" && (
          <div className="p-5 rounded flex items-start gap-3" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5" }}>
            <CircleAlert size={18} color="#B91C1C" className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#7F1D1D" }}>No application found for that number.</p>
              <p className="text-sm mt-1" style={{ color: "#991B1B" }}>
                Check the acknowledgement receipt — the number starts with MTR and is at least six characters.
              </p>
            </div>
          </div>
        )}

        {state === "found" && (
          <div className="rounded overflow-hidden" style={{ background: C.white, border: `1px solid ${C.line}` }}>
            <div className="p-6 grid sm:grid-cols-3 gap-4" style={{ borderBottom: `1px solid ${C.line}` }}>
              {[
                ["Service", "Factory licence (Section 6)"],
                ["Applicant", "Sahyadri Precision Components Pvt. Ltd."],
                ["Submitted on", "18 August 2026"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-xs mb-1" style={{ color: C.slate }}>{k}</div>
                  <div className="text-sm font-semibold" style={{ color: C.ink }}>{v}</div>
                </div>
              ))}
            </div>

            <div className="p-6">
              {TRACK_STAGES.map((s, i) => {
                const done = i < stage;
                const active = i === stage;
                const color = done ? C.green : active ? C.saffron : C.line;
                return (
                  <div key={s.name} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: done || active ? color : C.white, border: `2px solid ${color}` }}
                      >
                        {done
                          ? <Check size={15} color={C.white} />
                          : <span className="text-xs font-bold" style={{ color: active ? C.white : C.slate }}>{i + 1}</span>}
                      </div>
                      {i < TRACK_STAGES.length - 1 && (
                        <div className="w-0.5 flex-1 my-1" style={{ background: done ? C.green : C.line, minHeight: "2.25rem" }} />
                      )}
                    </div>
                    <div className="pb-6 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: done || active ? C.ink : C.slate }}>
                          {s.name}
                        </span>
                        {active && (
                          <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: C.saffronLight, color: C.saffron }}>
                            In progress
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-0.5" style={{ color: C.slate }}>{s.desc}</p>
                      {(done || active) && (
                        <p className="text-xs mt-1" style={{ color: C.slate }}>
                          Day {s.days} · statutory limit {s.days + 7} days
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="p-4 rounded flex items-start gap-3" style={{ background: C.bg }}>
                <Clock size={17} color={C.navy} className="mt-0.5 shrink-0" />
                <p className="text-sm" style={{ color: C.slate }}>
                  If a stage exceeds its statutory limit, the file escalates automatically to the next authority
                  and you can raise a grievance against the delay from this screen.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */
function DashboardPage() {
  const [tab, setTab] = useState("maitri");
  return (
    <div className="px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <SectionHead
          eyebrow="Open data"
          title="Public dashboards"
          sub="Application volumes, disposal rates and investment flows, published so anyone can see how departments are performing."
        />

        <div className="flex gap-1 mb-6" style={{ borderBottom: `1px solid ${C.line}` }}>
          {[["maitri", "MAITRI applications"], ["invest", "Investment inflow"]].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className="px-4 py-2.5 text-sm font-semibold"
              style={{
                color: tab === k ? C.navy : C.slate,
                borderBottom: tab === k ? `3px solid ${C.saffron}` : "3px solid transparent",
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {tab === "maitri" ? (
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 p-5 rounded" style={{ background: C.white, border: `1px solid ${C.line}` }}>
              <h3 className="font-bold mb-4 text-sm" style={{ color: C.navyDeep }}>
                Applications received and disposed, monthly
              </h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MONTHLY} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
                    <XAxis dataKey="m" tick={{ fontSize: 12, fill: C.slate }} axisLine={{ stroke: C.line }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: C.slate }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${C.line}` }} />
                    <Line type="monotone" dataKey="received" stroke={C.navy} strokeWidth={2.5} dot={{ r: 3 }} name="Received" />
                    <Line type="monotone" dataKey="disposed" stroke={C.saffron} strokeWidth={2.5} dot={{ r: 3 }} name="Disposed" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-5 mt-3 text-xs" style={{ color: C.slate }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 inline-block" style={{ background: C.navy }} /> Received
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 inline-block" style={{ background: C.saffron }} /> Disposed
                </span>
              </div>
            </div>

            <div className="p-5 rounded" style={{ background: C.white, border: `1px solid ${C.line}` }}>
              <h3 className="font-bold mb-4 text-sm" style={{ color: C.navyDeep }}>
                Share of applications by division
              </h3>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={REGION_SPLIT} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                      {REGION_SPLIT.map((e, i) => <Cell key={e.name} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4 }} formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2">
                {REGION_SPLIT.map((r, i) => (
                  <div key={r.name} className="flex items-center justify-between py-1 text-xs">
                    <span className="flex items-center gap-2" style={{ color: C.slate }}>
                      <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: PIE_COLORS[i] }} />
                      {r.name}
                    </span>
                    <span className="font-semibold tabular-nums" style={{ color: C.ink }}>{r.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded" style={{ background: C.white, border: `1px solid ${C.line}` }}>
            <h3 className="font-bold mb-4 text-sm" style={{ color: C.navyDeep }}>
              Proposed investment by sector (₹ crore)
            </h3>
            <div style={{ height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SECTOR_INVEST} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: C.slate }} axisLine={{ stroke: C.line }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: C.slate }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4 }} formatter={(v) => `₹ ${inr(v)} cr`} />
                  <Bar dataKey="value" fill={C.navy} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  About / Grievance / Contact                                        */
/* ------------------------------------------------------------------ */
function AboutPage() {
  return (
    <div className="px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <SectionHead
          eyebrow="About MAITRI"
          title="From regulator to facilitator"
          sub="MAITRI is the state's investment promotion and business facilitation agency, set up under the Maharashtra Industrial Policy and given statutory backing by the Maharashtra Trade and Investment Facilitation Act."
        />
        <div className="p-6 rounded mb-6" style={{ background: C.white, border: `1px solid ${C.line}` }}>
          <p className="text-sm leading-relaxed mb-4" style={{ color: C.slate }}>
            The cell was created to answer a simple complaint from industry: approvals were scattered across
            departments, timelines were opaque, and there was nobody to escalate to. MAITRI holds binding
            authority over permission processes, which means a department cannot sit on a file indefinitely
            without it surfacing on a public dashboard.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: C.slate }}>
            MAITRI 2.0, launched in February 2025, consolidates the notified services of sixteen departments
            into one application flow with real-time tracking, an incentive calculator and an assistant that
            answers eligibility questions.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {[
            { icon: TrendingUp, t: "Investment promotion", b: "Connecting domestic and international businesses with opportunities across the state's industrial corridors." },
            { icon: FileCheck, t: "Single-window approvals", b: "One digital portal for government services, regulatory information and permissions." },
            { icon: MessageSquare, t: "Grievance redressal", b: "A dedicated escalation route for investment-related issues, with over 3,000 cases resolved." },
            { icon: Headphones, t: "Aftercare", b: "Support past commissioning — operational problem-solving, policy advocacy and expansion facilitation." },
          ].map((x) => (
            <div key={x.t} className="p-5 rounded" style={{ background: C.white, border: `1px solid ${C.line}` }}>
              <x.icon size={20} color={C.saffron} />
              <h3 className="font-bold mt-3 mb-1.5" style={{ color: C.navyDeep }}>{x.t}</h3>
              <p className="text-sm leading-relaxed" style={{ color: C.slate }}>{x.b}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GrievancePage() {
  const [f, setF] = useState({ name: "", email: "", dept: "", appId: "", detail: "" });
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (sent) {
    return (
      <div className="px-4 py-20">
        <div className="max-w-lg mx-auto p-8 rounded text-center" style={{ background: C.white, border: `1px solid ${C.line}` }}>
          <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: C.greenLight }}>
            <Check size={24} color={C.green} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: C.navyDeep }}>Grievance registered</h2>
          <p className="text-sm mb-1" style={{ color: C.slate }}>
            Reference number <strong style={{ color: C.ink }}>MTR/GRV/2026/07741</strong>
          </p>
          <p className="text-sm mb-6" style={{ color: C.slate }}>
            The nodal officer has seven working days to respond. If that lapses, it escalates to the Development
            Commissioner (Industries).
          </p>
          <Btn variant="outline" onClick={() => { setSent(false); setF({ name: "", email: "", dept: "", appId: "", detail: "" }); }}>
            Register another grievance
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <SectionHead
          eyebrow="Grievance redressal"
          title="Raise an issue against a department"
          sub="Use this for delays past the statutory timeline, repeated queries on the same document, or a rejection you believe is unfounded."
        />
        <div className="p-6 rounded" style={{ background: C.white, border: `1px solid ${C.line}` }}>
          <div className="grid sm:grid-cols-2 gap-x-5">
            <Field label="Your name">
              <input value={f.name} onChange={set("name")} className={inputCls} style={inputStyle} />
            </Field>
            <Field label="Email">
              <input type="email" value={f.email} onChange={set("email")} className={inputCls} style={inputStyle} />
            </Field>
            <Field label="Department concerned">
              <select value={f.dept} onChange={set("dept")} className={inputCls} style={inputStyle}>
                <option value="">Select a department</option>
                {SERVICE_GROUPS.map((g) => <option key={g.dept} value={g.dept}>{g.dept}</option>)}
              </select>
            </Field>
            <Field label="Application number" hint="Optional">
              <input value={f.appId} onChange={set("appId")} className={inputCls} style={inputStyle} placeholder="MTR/2026/…" />
            </Field>
          </div>
          <Field label="What happened" hint="Dates, officer designation and what you were told help resolve it faster.">
            <textarea value={f.detail} onChange={set("detail")} rows={5} className={inputCls} style={inputStyle} />
          </Field>
          <Btn variant="navy" onClick={() => setSent(true)} className="w-full">Submit grievance</Btn>
        </div>
      </div>
    </div>
  );
}

function ContactPage() {
  return (
    <div className="px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <SectionHead eyebrow="Get in touch" title="Contact MAITRI" />
        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2 p-6 rounded" style={{ background: C.white, border: `1px solid ${C.line}` }}>
            <div className="flex items-start gap-3 mb-5">
              <Building2 size={19} color={C.navy} className="mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-sm mb-1" style={{ color: C.navyDeep }}>MAITRI Cell</div>
                <p className="text-sm leading-relaxed" style={{ color: C.slate }}>
                  Directorate of Industries, 2nd Floor, New Administrative Building,<br />
                  Opposite Mantralaya, Madam Cama Road, Mumbai 400 032
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="flex items-start gap-3">
                <Phone size={18} color={C.navy} className="mt-0.5" />
                <div>
                  <div className="text-sm font-semibold" style={{ color: C.ink }}>1800 120 8040</div>
                  <div className="text-xs" style={{ color: C.slate }}>Toll free, Mon–Sat</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={18} color={C.navy} className="mt-0.5" />
                <div>
                  <div className="text-sm font-semibold break-all" style={{ color: C.ink }}>
                    helpdesk.maitri@maharashtra.gov.in
                  </div>
                  <div className="text-xs" style={{ color: C.slate }}>Two working days</div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 rounded" style={{ background: C.navyDeep }}>
            <h3 className="font-bold mb-2" style={{ color: C.white }}>Regional offices</h3>
            <p className="text-sm mb-4" style={{ color: "#A9C5DC" }}>
              District Industries Centres in all 36 districts accept walk-in queries.
            </p>
            {["Pune", "Nagpur", "Nashik", "Chhatrapati Sambhajinagar", "Amravati"].map((d) => (
              <div key={d} className="flex items-center justify-between py-2 text-sm" style={{ color: "#DCE9F5", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                {d} <ChevronRight size={14} color="#7FA3C4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chatbot                                                            */
/* ------------------------------------------------------------------ */
function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: "assistant", text: "Namaskar. I can help with services, eligibility, documents and timelines on MAITRI. What are you setting up?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...msgs, { role: "user", text }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system:
            "You are the MAITRI 2.0 helpdesk assistant for the Government of Maharashtra's single-window investment portal. Answer questions about industrial approvals, PSI 2019 incentives, taluka classifications, MIDC plots, pollution consent, factory licences and application tracking. Be brief (under 90 words), plain-spoken and practical. If something needs a real officer, say so and give the helpline 1800 120 8040. Do not invent specific case numbers.",
          messages: next.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text })),
        }),
      });
      const data = await res.json();
      const reply = data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
      setMsgs([...next, { role: "assistant", text: reply || "I could not fetch that. Please call 1800 120 8040." }]);
    } catch (e) {
      setMsgs([...next, {
        role: "assistant",
        text: "The assistant is unreachable right now. For anything urgent, the helpdesk is on 1800 120 8040, Monday to Saturday.",
      }]);
    }
    setBusy(false);
  };

  return (
    <>
      {open && (
        <div
          className="fixed z-50 rounded overflow-hidden flex flex-col"
          style={{
            right: "1rem", bottom: "5rem", width: "min(22rem, calc(100vw - 2rem))",
            height: "min(28rem, calc(100vh - 8rem))", background: C.white,
            border: `1px solid ${C.line}`, boxShadow: "0 12px 32px rgba(6,42,79,0.22)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ background: C.navyDeep }}>
            <div className="flex items-center gap-2">
              <Bot size={18} color={C.saffron} />
              <div>
                <div className="text-sm font-bold" style={{ color: C.white }}>MAITRI assistant</div>
                <div className="text-xs" style={{ color: "#8FB4D4" }}>Available round the clock</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} color="#8FB4D4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3" style={{ background: C.bg }}>
            {msgs.map((m, i) => (
              <div key={i} className={`mb-2.5 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="px-3 py-2 rounded text-sm leading-relaxed"
                  style={{
                    maxWidth: "85%",
                    background: m.role === "user" ? C.navy : C.white,
                    color: m.role === "user" ? C.white : C.ink,
                    border: m.role === "user" ? "none" : `1px solid ${C.line}`,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-xs px-1" style={{ color: C.slate }}>
                <Loader2 size={13} className="animate-spin" /> Typing…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="flex items-center gap-2 p-2" style={{ borderTop: `1px solid ${C.line}` }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about eligibility or documents"
              className="flex-1 px-3 py-2 text-sm focus:outline-none"
              style={{ color: C.ink }}
            />
            <button
              onClick={send}
              disabled={busy}
              className="p-2 rounded"
              style={{ background: C.saffron, opacity: busy ? 0.6 : 1 }}
              aria-label="Send message"
            >
              <Send size={16} color={C.white} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="fixed z-50 flex items-center gap-2 px-4 py-3 rounded-full font-semibold text-sm"
        style={{
          right: "1rem", bottom: "1.25rem", background: C.saffron, color: C.white,
          boxShadow: "0 8px 20px rgba(232,119,34,0.4)",
        }}
      >
        {open ? <X size={18} /> : <Bot size={18} />}
        {!open && <span className="hidden sm:inline">Ask MAITRI</span>}
      </button>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */
function Footer({ setPage }) {
  const cols = [
    { h: "Quick links", items: ["Government resolutions", "Acts and rules", "Circulars", "Annual activity report", "Right to Information"] },
    { h: "Departments", items: ["Directorate of Industries", "MIDC", "MPCB", "Labour Department", "MSEDCL"] },
    { h: "Policies", items: ["Industrial Policy 2019", "Package Scheme of Incentives", "EV Policy", "Textile Policy", "Logistics Policy"] },
  ];
  return (
    <footer style={{ background: C.navyDeep }} className="px-4 pt-12 pb-6 mt-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded flex items-center justify-center" style={{ background: C.saffron }}>
              <Landmark size={18} color={C.white} />
            </div>
            <span className="text-lg font-bold" style={{ color: C.white }}>MAITRI</span>
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "#93B4D0" }}>
            Maharashtra Industry, Trade and Investment Facilitation Cell, Directorate of Industries,
            Government of Maharashtra.
          </p>
          <button
            onClick={() => { setPage("contact"); window.scrollTo(0, 0); }}
            className="text-sm font-semibold"
            style={{ color: C.saffron }}
          >
            Contact the helpdesk
          </button>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <h4 className="font-bold text-sm mb-3" style={{ color: C.white }}>{c.h}</h4>
            {c.items.map((i) => (
              <div key={i} className="text-sm py-1 cursor-pointer hover:underline" style={{ color: "#93B4D0" }}>
                {i}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div
        className="max-w-7xl mx-auto mt-8 pt-5 flex flex-col md:flex-row items-center justify-between gap-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.13)" }}
      >
        <p className="text-xs text-center md:text-left" style={{ color: "#7FA3C4" }}>
          © 2026 Government of Maharashtra. Content owned by the Directorate of Industries.
          This is a demonstration build, not the official portal.
        </p>
        <p className="text-xs" style={{ color: "#7FA3C4" }}>
          Visitors: 4,18,27,336 · Last updated 08 September 2026
        </p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Root                                                               */
/* ------------------------------------------------------------------ */
export default function App() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("en");
  const [a11y, setA11y] = useState({ font: 0, invert: false, links: false });

  useEffect(() => {
    const sizes = ["16px", "18px", "20px"];
    document.documentElement.style.fontSize = sizes[a11y.font];
    return () => { document.documentElement.style.fontSize = ""; };
  }, [a11y.font]);

  return (
    <div
      style={{
        fontFamily: FONT,
        background: C.bg,
        minHeight: "100vh",
        filter: a11y.invert ? "invert(1) hue-rotate(180deg)" : "none",
      }}
    >
      {a11y.links && (
        <style>{`a, button { text-decoration: underline !important; text-underline-offset: 2px; }`}</style>
      )}

      <Header page={page} setPage={setPage} lang={lang} setLang={setLang} a11y={a11y} setA11y={setA11y} />

      <main>
        {page === "home" && (
          <>
            <Hero lang={lang} setPage={setPage} />
            <StatsBand />
            <Features />
            <WhyMaharashtra />
            <Notices />
          </>
        )}
        {page === "about" && <AboutPage />}
        {page === "services" && <ServicesPage />}
        {page === "track" && <TrackPage />}
        {page === "calc" && <CalcPage />}
        {page === "grievance" && <GrievancePage />}
        {page === "dashboard" && <DashboardPage />}
        {page === "contact" && <ContactPage />}
      </main>

      <Footer setPage={setPage} />
      <ChatBot />
    </div>
  );
}
