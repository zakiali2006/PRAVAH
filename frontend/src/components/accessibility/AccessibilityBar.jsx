import React, { useState, useRef, useEffect } from "react";
import { Type, Eye, Link2, Globe, ChevronDown } from "lucide-react";
import { useTranslation } from "../../contexts/TranslationContext";

export function AccessibilityBar({ a11y, setA11y, darkText = false }) {
  const { lang, setLang } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const cycleFont = () => {
    if (setA11y && a11y) {
      setA11y({ ...a11y, font: a11y.font >= 2 ? 0 : a11y.font + 1 });
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const color = darkText ? "#475569" : "#DCE7F2";
  const hoverClass = darkText ? "hover:bg-gray-100 text-gray-600 hover:text-gray-900" : "hover:bg-white/10";
  const itemClass = `flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-colors ${hoverClass}`;

  const currentFont = a11y?.font || 0;

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'mr', label: 'मराठी' },
    { code: 'hi', label: 'हिंदी' }
  ];
  const activeLangLabel = languages.find(l => l.code === lang)?.label || 'English';

  return (
    <div className="flex items-center gap-1 text-xs" style={{ color }}>
      <button className={itemClass} onClick={cycleFont} title="Change text size">
        <Type size={14} /> A{currentFont === 0 ? "" : currentFont === 1 ? "+" : "++"}
      </button>
      <button
        className={itemClass}
        onClick={() => setA11y && setA11y({ ...a11y, invert: !a11y?.invert })}
        title="High contrast"
      >
        <Eye size={14} /> Contrast
      </button>
      <button
        className={itemClass}
        onClick={() => setA11y && setA11y({ ...a11y, links: !a11y?.links })}
        title="Highlight links"
      >
        <Link2 size={14} /> Links
      </button>
      <span style={{ opacity: 0.3, margin: '0 4px' }}>|</span>
      
      <div className="relative" ref={dropdownRef}>
        <button
          className={itemClass}
          onClick={() => setLangOpen(!langOpen)}
        >
          <Globe size={14} /> 
          <span className="min-w-[40px] text-left">{activeLangLabel}</span>
          <ChevronDown size={14} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {langOpen && (
          <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg border border-slate-200 overflow-hidden z-50 text-slate-700">
            {languages.map(l => (
              <button
                key={l.code}
                className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors ${lang === l.code ? 'bg-blue-50 text-blue-700 font-semibold' : ''}`}
                onClick={() => {
                  setLang(l.code);
                  setLangOpen(false);
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
