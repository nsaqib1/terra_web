"use client";

import { useLanguage } from "@/context/LanguageContext";

export function GuestLanguageSelector() {
  const { language, setLanguage, isLanguageSaving } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Choose language"
      aria-busy={isLanguageSaving}
      className="inline-flex shrink-0 items-center rounded-full border border-brand-sand-dark bg-white/80 p-1 text-xs font-bold shadow-sm backdrop-blur"
    >
      <button
        type="button"
        onClick={() => void setLanguage("EN")}
        aria-pressed={language === "EN"}
        className={`rounded-full px-3 py-1.5 transition-colors ${language === "EN" ? "bg-brand-brown-950 text-white" : "text-brand-brown-700 hover:bg-brand-sand"}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => void setLanguage("BN")}
        aria-pressed={language === "BN"}
        className={`rounded-full px-3 py-1.5 transition-colors ${language === "BN" ? "bg-brand-brown-950 text-white" : "text-brand-brown-700 hover:bg-brand-sand"}`}
      >
        বাংলা
      </button>
    </div>
  );
}
