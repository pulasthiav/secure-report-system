"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { translations, type Language } from "../../translations";

function getStatusLabel(
  status: string | undefined,
  t: (typeof translations)[Language]["oversight"],
): string {
  switch (status) {
    case "Resolved":
      return t.statusResolved;
    case "Investigating":
      return t.statusInvestigating;
    default:
      return t.statusPending;
  }
}

export default function OversightDashboard() {
  const [language, setLanguage] = useState<Language>("si");
  const logs = useQuery(api.complaints.getAllComplaints);
  const isLoading = logs === undefined;

  const t = translations[language].oversight;

  useEffect(() => {
    if (localStorage.getItem("lang") === "en") {
      setLanguage("en");
    }
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    localStorage.setItem("lang", newLang);
    window.location.reload();
  };

  const dateLocale = language === "en" ? "en-LK" : "si-LK";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 relative">
      <LanguageSwitcher language={language} onChange={handleLanguageChange} />

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              🔍 {t.title}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
          </div>
          <Link
            href="/"
            className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            {t.back}
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                  {t.colCaseReference}
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                  {t.colReceivedDate}
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                  {t.colStatus}
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">
                  {t.colBlockchainProof}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-slate-400 animate-pulse"
                  >
                    {t.loading}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4 font-mono text-sm text-blue-600 font-bold">
                      {log.case_key
                        ? `${log.case_key.substring(0, 4)}****`
                        : "N/A"}
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(log._creationTime).toLocaleString(dateLocale)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          log.status === "Resolved"
                            ? "bg-green-100 text-green-700"
                            : log.status === "Investigating"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {getStatusLabel(log.status, t)}
                      </span>
                    </td>
                    <td className="p-4 text-center text-[18px]">✅</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!isLoading && logs.length === 0 && (
            <p className="p-8 text-center text-slate-400 italic">{t.empty}</p>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <div className="flex-1 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
            <h4 className="text-emerald-700 font-bold text-sm">
              {t.transparencyTitle}
            </h4>
            <p className="text-xs text-emerald-600 mt-1">{t.transparencyBody}</p>
          </div>
          <div className="flex-1 bg-blue-50 border border-blue-100 p-4 rounded-xl">
            <h4 className="text-blue-700 font-bold text-sm">
              {t.immutableTitle}
            </h4>
            <p className="text-xs text-blue-600 mt-1">{t.immutableBody}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
