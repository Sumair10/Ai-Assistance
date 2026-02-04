import en from './en.json';
import ar from './ar.json';

type Language = 'en' | 'ar';
type Dictionary = Record<string, string>;

const translations: Record<Language, Dictionary> = {
  en,
  ar,
};

let currentLanguage: Language = 'en';
const listeners = new Set<() => void>();

export const setLanguage = (lang: string): void => {
  const nextLanguage = lang === 'ar' ? 'ar' : 'en';
  if (nextLanguage === currentLanguage) {
    return;
  }
  currentLanguage = nextLanguage;
  listeners.forEach(listener => listener());
};

export const getCurrentLanguage = (): Language => currentLanguage;

export const subscribeLanguage = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getString = (key: string): string => {
  return translations[currentLanguage][key] ?? translations.en[key] ?? key;
};
