import React, { createContext, useContext, useState, useEffect } from 'react';
import { T } from '../constants/translations';

const TranslationContext = createContext();

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

// Build bidirectional maps once
const enToMr = { ...(T.mr.strings || {}) };
const enToHi = { ...(T.hi.strings || {}) };
const mrToEn = {};
const hiToEn = {};

for (const [enKey, mrVal] of Object.entries(enToMr)) {
  if (mrVal && typeof mrVal === 'string') mrToEn[mrVal.trim()] = enKey.trim();
}
for (const [enKey, hiVal] of Object.entries(enToHi)) {
  if (hiVal && typeof hiVal === 'string') hiToEn[hiVal.trim()] = enKey.trim();
}

// Add top-level fields (govt, dept, brand, brandFull, etc.) into bidirectional maps
const TOP_FIELDS = [
  'govt', 'dept', 'brand', 'brandFull', 'sidebarFooter', 
  'heroKicker', 'heroTitle', 'heroSub', 'searchPh', 'searchBtn', 
  'quick', 'videoCaption', 'statsLoading'
];

TOP_FIELDS.forEach(key => {
  const enStr = T.en[key];
  const mrStr = T.mr[key];
  const hiStr = T.hi[key];
  if (typeof enStr === 'string') {
    const enTrimmed = enStr.trim();
    if (mrStr && typeof mrStr === 'string') {
      const mrTrimmed = mrStr.trim();
      enToMr[enTrimmed] = mrTrimmed;
      mrToEn[mrTrimmed] = enTrimmed;
    }
    if (hiStr && typeof hiStr === 'string') {
      const hiTrimmed = hiStr.trim();
      enToHi[enTrimmed] = hiTrimmed;
      hiToEn[hiTrimmed] = enTrimmed;
    }
  }
});

// Normalized helper to find canonical English string
function getCanonical(str) {
  if (!str) return null;
  const s = str.trim();
  if (!s) return null;

  // 1. Direct exact match
  if (enToMr[s] || enToHi[s]) return s;
  if (mrToEn[s]) return mrToEn[s];
  if (hiToEn[s]) return hiToEn[s];

  // 2. Normalization (handling quotes, html entities, whitespace)
  const norm = s
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');

  if (enToMr[norm] || enToHi[norm]) return norm;
  if (mrToEn[norm]) return mrToEn[norm];
  if (hiToEn[norm]) return hiToEn[norm];

  return null;
}

// Dynamic pattern translator
function translateDynamic(text, targetLang) {
  if (!text) return null;

  // Pattern 1: "Showing X to Y of Z entries"
  const mShow = text.match(/Showing (\d+) to (\d+) of (\d+) entries/) ||
                text.match(/(\d+) पैकी (\d+) ते (\d+) नोंदी दर्शवित आहे/) ||
                text.match(/(\d+) में से (\d+) से (\d+) प्रविष्टियाँ दिखा रहा है/);
  if (mShow) {
    const x = mShow[1], y = mShow[2], z = mShow[3];
    if (targetLang === 'en') return `Showing ${x} to ${y} of ${z} entries`;
    if (targetLang === 'mr') return `${z} पैकी ${x} ते ${y} नोंदी दर्शवित आहे`;
    if (targetLang === 'hi') return `${z} में से ${x} से ${y} प्रविष्टियाँ दिखा रहा है`;
  }

  // Pattern 2: "Visitors: X · Last updated Y"
  if (text.includes('Visitors:') || text.includes('अभ्यागत:') || text.includes('आगंतुक:')) {
    if (targetLang === 'mr') return "अभ्यागत: ४,१८,२७,३३६ · शेवटचे अपडेट: ०८ सप्टेंबर २०२६";
    if (targetLang === 'hi') return "आगंतुक: 4,18,27,336 · अंतिम अद्यतन: 08 सितंबर 2026";
    return "Visitors: 4,18,27,336 · Last updated 08 September 2026";
  }

  // Pattern 3: Copyright note
  if (text.includes('Government of Maharashtra. Content owned') || text.includes('महाराष्ट्र शासन. सामग्री उद्योग') || text.includes('महाराष्ट्र सरकार। सामग्री उद्योग')) {
    if (targetLang === 'mr') return "© २०२६ महाराष्ट्र शासन. सामग्री उद्योग संचालनालयाच्या मालकीची आहे. हे प्रात्यक्षिक पोर्टल आहे.";
    if (targetLang === 'hi') return "© 2026 महाराष्ट्र सरकार। सामग्री उद्योग निदेशालय के स्वामित्व में है। यह एक प्रदर्शन पोर्टल है।";
    return "© 2026 Government of Maharashtra. Content owned by the Directorate of Industries. This is a demonstration build, not the official portal.";
  }

  // Pattern 4: "e.g. X" / "उदा. X"
  if (text.startsWith('e.g. ') || text.startsWith('उदा. ')) {
    const sub = text.replace(/^(e\.g\.\s*|उदा\.\s*)/, '');
    const canonSub = getCanonical(sub) || sub;
    const transSub = targetLang === 'en' 
      ? canonSub 
      : (targetLang === 'mr' ? enToMr[canonSub] || canonSub : enToHi[canonSub] || canonSub);
    return targetLang === 'en' ? `e.g. ${transSub}` : `उदा. ${transSub}`;
  }

  // Pattern 5: "Login (X)" / "लॉगिन (X)"
  const mLogin = text.match(/^Login \((.+)\)$/) || text.match(/^लॉगिन \((.+)\)$/);
  if (mLogin) {
    const role = mLogin[1];
    const canonRole = getCanonical(role) || role;
    const transRole = targetLang === 'en' 
      ? canonRole 
      : (targetLang === 'mr' ? enToMr[canonRole] || canonRole : enToHi[canonRole] || canonRole);
    return targetLang === 'en' ? `Login (${transRole})` : `लॉगिन (${transRole})`;
  }

  return null;
}

export function TranslationProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('pravah_lang');
      if (saved && (saved === 'en' || saved === 'mr' || saved === 'hi')) {
        return saved;
      }
    } catch (e) {
      // Ignore localStorage read errors
    }
    return 'en';
  });

  const setLang = (newLang) => {
    const valid = ['en', 'mr', 'hi'].includes(newLang) ? newLang : 'en';
    setLangState(valid);
    try {
      localStorage.setItem('pravah_lang', valid);
    } catch (e) {
      // Ignore localStorage write errors
    }
  };

  const toggleLanguage = () => {
    const cycle = { en: 'mr', mr: 'hi', hi: 'en' };
    setLang(cycle[lang] || 'en');
  };

  const dict = T[lang] || T['en'];

  // Global Bidirectional DOM Text & Placeholder Translation Pass
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const translateDOM = () => {
      // 1. Text nodes
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            if (!node || !node.parentElement) return NodeFilter.FILTER_REJECT;
            const tag = node.parentElement.tagName;
            if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'SELECT', 'OPTION'].includes(tag)) {
              return NodeFilter.FILTER_REJECT;
            }
            if (node.parentElement.isContentEditable) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      let node;
      while ((node = walker.nextNode())) {
        const currentVal = node.nodeValue;
        const trimmed = currentVal.trim();
        if (!trimmed) continue;

        // Skip pure punctuation/numbers
        if (/^[\d\s.,:;!?/\\()\-+|₹$%*]+$/.test(trimmed)) continue;

        let canonical = node._pravahCanonical;
        if (!canonical) {
          canonical = getCanonical(trimmed);
          if (!canonical) {
            const dyn = translateDynamic(trimmed, 'en');
            if (dyn) canonical = dyn;
          }
          if (canonical) {
            node._pravahCanonical = canonical;
          }
        }

        let targetText = null;
        if (canonical) {
          if (lang === 'en') {
            targetText = canonical;
          } else if (lang === 'mr') {
            targetText = enToMr[canonical] || translateDynamic(canonical, 'mr') || canonical;
          } else if (lang === 'hi') {
            targetText = enToHi[canonical] || translateDynamic(canonical, 'hi') || canonical;
          }
        } else {
          targetText = translateDynamic(trimmed, lang);
        }

        if (targetText && targetText !== trimmed) {
          const leading = currentVal.match(/^\s*/)[0];
          const trailing = currentVal.match(/\s*$/)[0];
          node.nodeValue = leading + targetText + trailing;
        }
      }

      // 2. Input and textarea placeholders
      const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
      inputs.forEach(input => {
        const currentPl = input.getAttribute('placeholder') || '';
        const trimmed = currentPl.trim();
        if (!trimmed) return;

        if (!input._pravahCanonical) {
          input._pravahCanonical = getCanonical(trimmed) || translateDynamic(trimmed, 'en');
        }

        const canonical = input._pravahCanonical;
        if (canonical) {
          let target = canonical;
          if (lang === 'mr') {
            target = enToMr[canonical] || translateDynamic(canonical, 'mr') || canonical;
          } else if (lang === 'hi') {
            target = enToHi[canonical] || translateDynamic(canonical, 'hi') || canonical;
          }

          if (input.getAttribute('placeholder') !== target) {
            input.setAttribute('placeholder', target);
          }
        }
      });
    };

    translateDOM();

    let timeout;
    const observer = new MutationObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(translateDOM, 25);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: false
    });

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [lang]);

  // Callable translation function that also exposes all dictionary fields directly
  const t = (key, fallback) => {
    if (!key) return '';
    const trimmed = typeof key === 'string' ? key.trim() : key;
    
    // Check current language dictionary
    if (dict.strings && dict.strings[trimmed]) return dict.strings[trimmed];
    if (typeof dict[key] === 'string') return dict[key];

    // Canonical English resolution
    const canon = mrToEn[trimmed] || hiToEn[trimmed] || trimmed;
    if (lang === 'en') return canon;
    if (lang === 'mr' && enToMr[canon]) return enToMr[canon];
    if (lang === 'hi' && enToHi[canon]) return enToHi[canon];

    const dyn = translateDynamic(trimmed, lang);
    if (dyn) return dyn;

    return fallback !== undefined ? fallback : key;
  };

  // Attach all dict properties (govt, dept, nav, dash, features, whyMaha, etc.) directly onto t
  Object.assign(t, dict);

  return (
    <TranslationContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}
