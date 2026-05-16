"use client";

import { useLanguage } from "./LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-xl shadow-slate-900/40 ring-1 ring-emerald-500/20"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLanguage("si")}
        className={`px-4 py-2.5 text-sm font-semibold transition-all ${
          language === "si"
            ? "bg-emerald-500 text-slate-900 shadow-inner"
            : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
        }`}
      >
        සිංහල
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-4 py-2.5 text-sm font-semibold transition-all border-l border-slate-700 ${
          language === "en"
            ? "bg-emerald-500 text-slate-900 shadow-inner"
            : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
        }`}
      >
        English
      </button>
    </div>
  );
}
