"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import enProducts from "@/src/i18n/products.en.json";
import deProducts from "@/src/i18n/products.de.json";
import frProducts from "@/src/i18n/products.fr.json";

type Language = "en" | "de" | "fr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  translateCategory: (category: string) => string;
  translateProductName: (id: string, fallback: string) => string;
}

const STORAGE_KEY = "commodities-lang";

const translations = {
  en: {
    home: "Home",
    dashboard: "Dashboard",
    commodities: "Commodities",
    orders: "Orders",
    settings: "Settings",
    profile: "Profile",
    signOut: "Sign out",
    admin: "Admin",
    logout: "Logout",
    groupByCategory: "Group by category",
    results: "results",
  },
  de: {
    home: "Startseite",
    dashboard: "Dashboard",
    commodities: "Rohstoffe",
    orders: "Bestellungen",
    settings: "Einstellungen",
    profile: "Profil",
    signOut: "Abmelden",
    admin: "Admin",
    logout: "Abmelden",
    groupByCategory: "Nach Kategorie gruppieren",
    results: "Ergebnisse",
  },
  fr: {
    home: "Accueil",
    dashboard: "Tableau de bord",
    commodities: "Marchandises",
    orders: "Commandes",
    settings: "Paramètres",
    profile: "Profil",
    signOut: "Se déconnecter",
    admin: "Admin",
    logout: "Déconnexion",
    groupByCategory: "Grouper par catégorie",
    results: "résultats",
  },
} as const;

type TranslationKey = keyof (typeof translations)["en"];

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const productTranslations = {
  en: enProducts,
  de: deProducts,
  fr: frProducts,
} as const;

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored === "en" || stored === "de" || stored === "fr") {
        setLanguageState(stored);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setMounted(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey) => {
      return translations[language][key] ?? translations.en[key];
    },
    [language]
  );

  const translateCategory = useCallback(
    (category: string) => {
      const langPack = productTranslations[language];
      return (
        langPack.categories[category as keyof typeof langPack.categories] ??
        category
      );
    },
    [language]
  );

  const translateProductName = useCallback(
    (id: string, fallback: string) => {
      const langPack = productTranslations[language];
      return (
        langPack.products[id as keyof typeof langPack.products] ?? fallback
      );
    },
    [language]
  );

  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, translateCategory, translateProductName }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a <LanguageProvider>");
  }
  return ctx;
}

