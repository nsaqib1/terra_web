"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { usersApi } from "@/lib/api/users";
import type { Language, TranslationKey } from "@/i18n";
import { translate } from "@/i18n";

const STORAGE_KEY = "terramids-language";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isLanguageSaving: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return "EN";
  return window.localStorage.getItem(STORAGE_KEY) === "BN" ? "BN" : "EN";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, setUser } = useAuth();
  const [language, setLanguageState] = useState<Language>("EN");
  const [isLanguageSaving, setIsLanguageSaving] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    const nextLanguage = user?.preferredLanguage ?? readStoredLanguage();
    setLanguageState(nextLanguage);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    setHasInitialized(true);
  }, [isLoading, user?.id, user?.preferredLanguage]);

  useEffect(() => {
    if (!hasInitialized) return;
    document.documentElement.lang = language === "BN" ? "bn" : "en";
    document.documentElement.dataset.language = language.toLowerCase();
    document.body.dataset.language = language.toLowerCase();
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language, hasInitialized]);

  const setLanguage = useCallback(async (nextLanguage: Language) => {
    if (nextLanguage === language) return;
    setLanguageState(nextLanguage);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);

    if (!user) return;

    setIsLanguageSaving(true);
    try {
      const response = await usersApi.updateProfile({ preferredLanguage: nextLanguage });
      setUser((current) => current ? { ...current, preferredLanguage: response.user.preferredLanguage ?? nextLanguage } : current);
    } catch (error) {
      console.error("Failed to save language preference", error);
      setLanguageState(language);
      window.localStorage.setItem(STORAGE_KEY, language);
    } finally {
      setIsLanguageSaving(false);
    }
  }, [language, user, setUser]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key: TranslationKey, params?: Record<string, string | number>) => translate(language, key, params),
    isLanguageSaving,
  }), [language, setLanguage, isLanguageSaving]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
