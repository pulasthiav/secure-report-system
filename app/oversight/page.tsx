"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage, useTranslations } from "../../components/LanguageContext";
import { getOversightStatusLabel } from "../../translations";

export default function OversightDashboard() {
  const t = useTranslations().oversight;
  const { language } = useLanguage();
  const logs = useQuery(api.complaints.getAllComplaints);
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              🔍 {t.oversightTitle}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{t.oversightSubtitle}</p>
          </div>
          <Link
            href="/"
            className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            {t.backButton}
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                  {t.colCaseRef}
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                  {t.colDate}
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                  {t.colStatus}
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">
                  {t.colProof}
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
                      {formatDate(log._creationTime)}
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
                        {getOversightStatusLabel(log.status, language)}
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

        <div className="mt-6 flex gap-4 flex-col md:flex-row">
          <div className="flex-1 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
            <h4 className="text-emerald-700 font-bold text-sm">{t.card1Title}</h4>
            <p className="text-xs text-emerald-600 mt-1">{t.card1Desc}</p>
          </div>
          <div className="flex-1 bg-blue-50 border border-blue-100 p-4 rounded-xl">
            <h4 className="text-blue-700 font-bold text-sm">{t.card2Title}</h4>
            <p className="text-xs text-blue-600 mt-1">{t.card2Desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}