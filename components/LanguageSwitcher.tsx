"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-inner"
      role="group"
      aria-label="Language"
    >
      <Globe className="ml-2 h-3.5 w-3.5 text-slate-500" />
      <button
        type="button"
        onClick={() => setLanguage("si")}
        aria-pressed={language === "si"}
        className={`rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
          language === "si"
            ? "bg-slate-700 text-white shadow-sm ring-1 ring-slate-600/50"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        සිංහල
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={`rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
          language === "en"
            ? "bg-slate-700 text-white shadow-sm ring-1 ring-slate-600/50"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        English
      </button>
    </div>
  );
}
