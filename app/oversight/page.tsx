"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage, useTranslations } from "../../components/LanguageContext";
import { getOversightStatusLabel } from "../../translations";

export default function OversightDashboard() {
  const t = useTranslations().oversight;
  const { language } = useLanguage();
  const logs = useQuery(api.complaints.getPublicComplaintLogs);
  const isLoading = logs === undefined;

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleString(language === "si" ? "si-LK" : "en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-slate-950 p-4 pt-20 text-slate-300 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/30">
          <div>
            <h1 className="text-2xl font-bold text-white">
              🔍 {t.oversightTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-400">{t.oversightSubtitle}</p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-bold text-slate-200 shadow-md transition-all hover:bg-slate-700 active:scale-95"
          >
            {t.backButton}
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40">
          <table className="w-full border-separate border-spacing-y-3 px-3 text-left">
            <thead>
              <tr>
                <th className="px-4 pt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.colCaseRef}
                </th>
                <th className="px-4 pt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.colDate}
                </th>
                <th className="px-4 pt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.colStatus}
                </th>
                <th className="px-4 pt-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.colProof}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="rounded-xl border border-slate-700 bg-slate-900 p-8 text-center text-slate-500 animate-pulse"
                  >
                    {t.loading}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log._id}
                    className="bg-slate-900 shadow-md transition-colors hover:bg-slate-800"
                  >
                    <td className="rounded-l-xl border-y border-l border-slate-700 p-4 font-mono text-sm font-bold text-blue-400">
                      {log.case_key
                        ? `${log.case_key.substring(0, 4)}****`
                        : "N/A"}
                    </td>
                    <td className="border-y border-slate-700 p-4 text-sm text-slate-500">
                      {formatDate(log._creationTime)}
                    </td>
                    <td className="border-y border-slate-700 p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          log.status === "Resolved"
                            ? "bg-emerald-950/50 border border-emerald-800 text-emerald-400"
                            : log.status === "Investigating"
                              ? "bg-blue-950/50 border border-blue-800 text-blue-400"
                              : "bg-amber-950/50 border border-amber-800 text-amber-400"
                        }`}
                      >
                        {getOversightStatusLabel(log.status, language)}
                      </span>
                    </td>
                    <td className="rounded-r-xl border-y border-r border-slate-700 p-4 text-center text-[18px] text-emerald-400">
                      ✅
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!isLoading && logs.length === 0 && (
            <p className="p-8 text-center text-slate-500 italic">{t.empty}</p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4 md:flex-row">
          <div className="flex-1 rounded-xl border border-emerald-800/50 bg-emerald-950/30 p-4">
            <h4 className="text-sm font-bold text-emerald-400">{t.card1Title}</h4>
            <p className="mt-1 text-xs text-emerald-200/80">{t.card1Desc}</p>
          </div>
          <div className="flex-1 rounded-xl border border-blue-800/50 bg-blue-950/30 p-4">
            <h4 className="text-sm font-bold text-blue-400">{t.card2Title}</h4>
            <p className="mt-1 text-xs text-blue-200/80">{t.card2Desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}