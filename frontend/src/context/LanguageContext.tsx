import { createContext, useContext, useState, ReactNode } from "react";

export type AppLanguage = "en" | "hi" | "mr";

interface LanguageConfig {
  code: AppLanguage;
  speechLang: string;
  label: string;
}

export const LANGUAGES: Record<AppLanguage, LanguageConfig> = {
  en: { code: "en", speechLang: "en-US", label: "English" },
  hi: { code: "hi", speechLang: "hi-IN", label: "Hindi" },
  mr: { code: "mr", speechLang: "mr-IN", label: "Marathi" },
};

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  speechLang: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const stored = localStorage.getItem("beyondsight_language");
    return (stored as AppLanguage) || "en";
  });

  function setLanguage(lang: AppLanguage) {
    localStorage.setItem("beyondsight_language", lang);
    setLanguageState(lang);
  }

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, speechLang: LANGUAGES[language].speechLang }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}