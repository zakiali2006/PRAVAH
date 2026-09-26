import React from "react";
import { Type, Eye, Link2, Globe } from "lucide-react";
import { useTranslation } from "../../contexts/TranslationContext";

export function AccessibilityBar({ a11y, setA11y, darkText = false }) {
  const { lang, setLang, toggleLanguage, t } = useTranslation();
  
  const cycleFont = () => {
    if (setA11y && a11y) {
      setA11y({ ...a11y, font: a11y.font >= 2 ? 0 : a11y.font + 1 });
    }
  };

  const color = darkText ? "#475569" : "#DCE7F2";
  const hoverClass = darkText ? "hover:bg-gray-100 text-gray-600 hover:text-gray-900" : "hover:bg-white/10";
  const itemClass = `flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-colors ${hoverClass}`;

  const currentFont = a11y?.font || 0;

  return (
    <div className="flex items-center gap-1.5 text-xs" style={{ color }}>
      <button className={itemClass} onClick={cycleFont} title="Change text size / मजकूर आकार">
        <Type size={14} /> A{currentFont === 0 ? "" : currentFont === 1 ? "+" : "++"}
      </button>
      <button
        className={itemClass}
        onClick={() => setA11y && setA11y({ ...a11y, invert: !a11y?.invert })}
        title="High contrast / हाय कॉन्ट्रास्ट"
      >
        <Eye size={14} /> {lang === "mr" ? "कॉन्ट्रास्ट" : lang === "hi" ? "कंट्रास्ट" : "Contrast"}
      </button>
      <button
        className={itemClass}
        onClick={() => setA11y && setA11y({ ...a11y, links: !a11y?.links })}
        title="Highlight links / दुवे हायलाइट करा"
      >
        <Link2 size={14} /> {lang === "mr" ? "दुवे" : lang === "hi" ? "लिंक्स" : "Links"}
      </button>
      <span style={{ opacity: 0.3, margin: '0 4px' }}>|</span>
      
      {/* TRILINGUAL LANGUAGE SELECTOR */}
      <div 
        className={`flex items-center gap-1 px-2 py-1 rounded-md font-semibold transition-colors ${
          darkText 
            ? "bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200" 
            : "bg-white/10 border border-white/20 text-[#DCE7F2] hover:bg-white/15"
        }`}
        title="Change Language / भाषा निवडा / भाषा चुनें"
      >
        <Globe size={14} className="shrink-0" />
        <select
          id="language-select"
          aria-label="Select Language"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="bg-transparent text-xs font-bold cursor-pointer outline-none border-none pr-1 py-0.5"
          style={{ color: "inherit" }}
        >
          <option value="en" className="text-slate-900 bg-white">English</option>
          <option value="mr" className="text-slate-900 bg-white">मराठी (Marathi)</option>
          <option value="hi" className="text-slate-900 bg-white">हिंदी (Hindi)</option>
        </select>
      </div>
    </div>
  );
}
