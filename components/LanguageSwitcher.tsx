"use client";

import { useLanguage } from "./LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="fixed right-4 top-4 z-[100] inline-flex overflow-hidden rounded-full border border-slate-700 bg-slate-900/95 p-1 shadow-xl shadow-slate-950/50 ring-1 ring-emerald-500/20 backdrop-blur"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLanguage("si")}
        aria-pressed={language === "si"}
        className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
          language === "si"
            ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-950/30"
            : "bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
        }`}
      >
        සිංහල
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
          language === "en"
            ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-950/30"
            : "bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
        }`}
      >
        English
      </button>
    </div>
  );
}
