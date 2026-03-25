import { createContext, useContext, useState } from 'react';
import { T } from '../i18n/translations.js';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState('es');
  const t = T[lang];
  const toggle = () => setLang(l => l === 'es' ? 'en' : 'es');
  return (
    <LangContext.Provider value={{ lang, t, toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
