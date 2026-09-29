import React, { createContext, useContext, useState } from 'react';
import { T } from '../constants/translations';

const TranslationContext = createContext();

export function useTranslation() {
  return useContext(TranslationContext);
}

export function TranslationProvider({ children }) {
  const [lang, setLang] = useState('en');

  // Fallback to English if translation is missing
  const t = T[lang] || T['en'];

  const toggleLanguage = () => {
    // For legacy usages if any
    setLang((prev) => (prev === 'en' ? 'mr' : 'en'));
  };

  return (
    <TranslationContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}
