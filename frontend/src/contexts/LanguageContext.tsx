import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translations, getCurrentLanguage, saveLanguage, getTranslations, getLanguageDirection } from '@/i18n';

interface LanguageContextType {
  language: Language;
  translations: Translations;
  direction: 'ltr' | 'rtl';
  changeLanguage: (newLanguage: Language) => void;
  t: (key: string, defaultValue?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(getCurrentLanguage());
  const [translations, setTranslations] = useState<Translations>(getTranslations(language));
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(getLanguageDirection(language));

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setTranslations(getTranslations(newLanguage));
    setDirection(getLanguageDirection(newLanguage));
    saveLanguage(newLanguage);
  };

  // Translation function with nested key support and default value
  // Converts kebab-case to camelCase for object property access
  const t = (key: string, defaultValue?: string): string => {
    // Convert kebab-case to camelCase
    const toCamelCase = (str: string) => str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    
    const keys = key.split('.').map(k => toCamelCase(k));
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue || key;
      }
    }
    
    return typeof value === 'string' ? value : (defaultValue || key);
  };

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [direction, language]);

  const value: LanguageContextType = {
    language,
    translations,
    direction,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};