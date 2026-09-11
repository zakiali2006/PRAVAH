import React from "react";
import { Type, Eye, Link2, Globe } from "lucide-react";
import { useTranslation } from "../../contexts/TranslationContext";

export function AccessibilityBar({ a11y, setA11y, darkText = false }) {
  const { lang, toggleLanguage } = useTranslation();
  
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
      <button
        className={itemClass}
        onClick={toggleLanguage}
      >
        <Globe size={14} /> {lang === "en" ? "मराठी" : "English"}
      </button>
    </div>
  );
}
