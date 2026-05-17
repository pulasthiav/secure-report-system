"use client";

import Link from "next/link";
import { Eye, LockKeyhole, Shield, ShieldCheck } from "lucide-react";
import { useLanguage } from "../components/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

const landingCopy = {
  en: {
    badge: "Government-grade encrypted reporting portal",
    heading: "SecureReport System",
    subheading: "Secure information reporting",
    description:
      "Submit sensitive reports through a protected channel using PGP encryption, automated AI identity redaction, metadata stripping, and public oversight safeguards designed for high-trust civic reporting.",
    submit: "Submit Report",
    status: "Check Case Status",
    oversight: "OVERSIGHT",
    secureChannel: "Secure Channel",
    vault: "PGP Vault",
    vaultText:
      "This is an official and secure channel for the Sri Lanka Digital Oversight Department. Every report is securely encrypted and verified before processing. Your data is safe.",
  },
  si: {
    badge: "රජයේ මට්ටමේ සංකේතනය කළ වාර්තාකරණ ද්වාරය",
    heading: "SecureReport System",
    subheading: "ආරක්ෂිත තොරතුරු වාර්තාකරණය",
    description:
      "PGP සංකේතනය, AI අනන්‍යතා ඉවත් කිරීම, metadata ඉවත් කිරීම සහ මහජන නිරීක්ෂණ ආරක්ෂාවන් සමඟ සංවේදී වාර්තා ආරක්ෂිත මාර්ගයකින් ඉදිරිපත් කරන්න.",
    submit: "වාර්තාවක් යොමු කරන්න",
    status: "තත්ත්වය පරීක්ෂා කරන්න",
    oversight: "නිරීක්ෂණය",
    secureChannel: "ආරක්ෂිත නාලිකාව",
    vault: "PGP Vault",
    vaultText:
      "මෙය ශ්‍රී ලංකා ඩිජිටල් නිරීක්ෂණ දෙපාර්තමේන්තුව සඳහා නිල සහ ආරක්ෂිත නාලිකාවකි. සෑම වාර්තාවක්ම සැකසීමට පෙර ආරක්ෂිතව සංකේතනය කර සත්‍යාපනය කෙරේ. ඔබගේ දත්ත ආරක්ෂිතයි.",
  },
} as const;

export default function Home() {
  const { language } = useLanguage();
  const copy = landingCopy[language];

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <div className="z-50 flex w-full flex-col items-end gap-3">
          <nav className="flex w-full items-center justify-between gap-6 rounded-full border border-slate-700 bg-slate-900/90 px-4 py-4 shadow-2xl shadow-black/30 backdrop-blur">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-sm">
                <Shield className="h-5 w-5" strokeWidth={2.4} />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-white">
                SecureReport
              </span>
            </Link>

            <Link
              href="/oversight"
              className="flex items-center gap-2 rounded-full border border-slate-600 bg-slate-800 px-6 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 shadow-md transition-all hover:bg-slate-700"
            >
              <Eye className="h-4 w-4" />
              {copy.oversight}
            </Link>
          </nav>
          <div className="mr-6">
            <LanguageSwitcher />
          </div>
        </div>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm font-bold text-blue-300 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              {copy.badge}
            </div>
            <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              {copy.heading}
            </h1>
            <p className="mt-4 text-2xl font-bold text-emerald-400 sm:text-3xl">
              {copy.subheading}
            </p>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              {copy.description}
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/report"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-4 text-base font-extrabold text-white shadow-lg shadow-blue-950/30 transition-colors hover:bg-blue-700"
              >
                {copy.submit}
              </Link>
              <Link
                href="/status"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-8 py-4 text-base font-bold text-slate-300 shadow-sm transition-colors hover:border-emerald-500 hover:text-emerald-400"
              >
                {copy.status}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -left-8 top-10 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl" />
            <div className="absolute -right-8 bottom-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-700 bg-[#1e293b] p-5 shadow-2xl shadow-black/30">
              <div className="rounded-[1.5rem] border border-slate-700 bg-slate-900 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                      {copy.secureChannel}
                    </p>
                    <p className="mt-2 text-2xl font-black">{copy.vault}</p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500">
                    <LockKeyhole className="h-7 w-7 text-slate-950" />
                  </div>
                </div>
                <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="h-3 w-3 rounded-full bg-blue-300" />
                    <span className="h-3 w-3 rounded-full bg-slate-500" />
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {copy.vaultText}
                  </p>
                  <div className="mt-8 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        PGP
                      </p>
                      <div className="mt-4 h-2 rounded-full bg-blue-300" />
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        AI
                      </p>
                      <div className="mt-4 h-2 rounded-full bg-emerald-300" />
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        EXIF
                      </p>
                      <div className="mt-4 h-2 rounded-full bg-white" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 rounded-full border border-slate-700 bg-slate-950 p-4 shadow-md sm:block">
                <ShieldCheck className="h-10 w-10 text-emerald-400" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
