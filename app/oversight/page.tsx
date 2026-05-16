"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../../components/LanguageContext";
import {
  getOversightStatusLabel,
  translations,
  type Language,
} from "../../translations";

type PublicComplaintLog = {
  _id: string;
  _creationTime: number;
  case_key?: string;
  status?: string;
};

const EN_OVERSIGHT = translations.en.oversight;
const CONVEX_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

function useSafeOversightTranslations(language: Language) {
  const localized = translations[language]?.oversight;
  return { ...EN_OVERSIGHT, ...(localized ?? {}) };
}

function normalizeLogs(raw: unknown): PublicComplaintLog[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .filter((entry): entry is Record<string, unknown> => {
      return entry != null && typeof entry === "object";
    })
    .map((entry, index) => {
      const idValue = entry._id;
      const timeValue = entry._creationTime;
      const caseKeyValue = entry.case_key;
      const statusValue = entry.status;

      const _id =
        typeof idValue === "string" && idValue.trim()
          ? idValue
          : `unknown-${index}`;

      const _creationTime =
        typeof timeValue === "number" && !Number.isNaN(timeValue)
          ? timeValue
          : typeof timeValue === "string"
            ? Number(timeValue) || 0
            : 0;

      return {
        _id,
        _creationTime,
        case_key: typeof caseKeyValue === "string" ? caseKeyValue : "",
        status: typeof statusValue === "string" ? statusValue : "",
      };
    });
}

function maskCaseReference(caseKey: string | undefined | null): string {
  const key = typeof caseKey === "string" ? caseKey.trim() : "";
  if (!key) {
    return "N/A";
  }
  if (key.length >= 4) {
    return `${key.slice(0, 4)}****`;
  }
  return "****";
}

function formatLogDate(
  timestamp: number | undefined | null,
  language: Language,
): string {
  if (timestamp == null || Number.isNaN(Number(timestamp))) {
    return "—";
  }

  const locales =
    language === "si" ? ["si-LK", "en-GB"] : ["en-GB", "en-US"];

  for (const locale of locales) {
    try {
      const formatted = new Date(timestamp).toLocaleString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      if (formatted) {
        return formatted;
      }
    } catch {
      continue;
    }
  }

  try {
    return new Date(timestamp).toISOString();
  } catch {
    return "—";
  }
}

function safeStatusLabel(
  status: string | undefined | null,
  language: Language,
): string {
  const normalized =
    typeof status === "string" && status.trim() ? status.trim() : undefined;
  try {
    return getOversightStatusLabel(normalized, language);
  } catch {
    try {
      return getOversightStatusLabel(normalized, "en");
    } catch {
      return EN_OVERSIGHT.statusPending;
    }
  }
}

function statusBadgeClass(status: string | undefined | null): string {
  const value = typeof status === "string" ? status : "";
  if (value === "Resolved") {
    return "bg-emerald-950/50 border border-emerald-800 text-emerald-400";
  }
  if (value === "Investigating") {
    return "bg-blue-950/50 border border-blue-800 text-blue-400";
  }
  return "bg-amber-950/50 border border-amber-800 text-amber-400";
}

function OversightErrorFallback() {
  return (
    <div className="min-h-screen bg-slate-950 p-4 pt-20 text-slate-300 md:p-8">
      <div className="mx-auto max-w-lg rounded-2xl border border-red-500/30 bg-red-950/20 p-8 text-center">
        <p className="text-lg font-bold text-red-300">Unable to load oversight data</p>
        <p className="mt-2 text-sm text-slate-400">
          The dashboard hit an unexpected error. Please reload or return home.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-slate-100 px-5 py-2 text-sm font-bold text-slate-900"
          >
            Reload
          </button>
          <Link
            href="/"
            className="rounded-full border border-slate-600 px-5 py-2 text-sm font-bold text-slate-200"
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  );
}

class OversightErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <OversightErrorFallback />;
    }
    return this.props.children;
  }
}

function OversightDashboardContent() {
  const { language } = useLanguage();
  const t = useSafeOversightTranslations(language);

  const logsQuery = useQuery(
    api.complaints.getPublicComplaintLogs,
    CONVEX_CONFIGURED ? {} : "skip",
  );

  const isLoading = CONVEX_CONFIGURED && logsQuery === undefined;
  const logs = normalizeLogs(logsQuery);
  const configError = !CONVEX_CONFIGURED;

  return (
    <div className="min-h-screen bg-slate-950 p-4 pt-20 text-slate-300 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/30">
          <div>
            <h1 className="text-2xl font-bold text-white">
              🔍 {t.oversightTitle ?? EN_OVERSIGHT.oversightTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {t.oversightSubtitle ?? EN_OVERSIGHT.oversightSubtitle}
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-bold text-slate-200 shadow-md transition-all hover:bg-slate-700 active:scale-95"
          >
            {t.backButton ?? EN_OVERSIGHT.backButton}
          </Link>
        </div>

        {configError ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-8 text-center text-amber-200">
            <p className="font-semibold">Database connection is not configured.</p>
            <p className="mt-2 text-sm text-amber-200/80">
              Set NEXT_PUBLIC_CONVEX_URL in the deployment environment.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40">
            <table className="w-full border-separate border-spacing-y-3 px-3 text-left">
              <thead>
                <tr>
                  <th className="px-4 pt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.colCaseRef ?? EN_OVERSIGHT.colCaseRef}
                  </th>
                  <th className="px-4 pt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.colDate ?? EN_OVERSIGHT.colDate}
                  </th>
                  <th className="px-4 pt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.colStatus ?? EN_OVERSIGHT.colStatus}
                  </th>
                  <th className="px-4 pt-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.colProof ?? EN_OVERSIGHT.colProof}
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
                      {t.loading ?? EN_OVERSIGHT.loading}
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="rounded-xl border border-slate-700 bg-slate-900 p-8 text-center text-slate-500 italic"
                    >
                      {t.empty ?? EN_OVERSIGHT.empty}
                    </td>
                  </tr>
                ) : (
                  logs.map((log, index) => (
                    <tr
                      key={log?._id ? `${log._id}-${index}` : `log-${index}`}
                      className="bg-slate-900 shadow-md transition-colors hover:bg-slate-800"
                    >
                      <td className="rounded-l-xl border-y border-l border-slate-700 p-4 font-mono text-sm font-bold text-blue-400">
                        {maskCaseReference(log?.case_key)}
                      </td>
                      <td className="border-y border-slate-700 p-4 text-sm text-slate-500">
                        {formatLogDate(log?._creationTime, language)}
                      </td>
                      <td className="border-y border-slate-700 p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(log?.status)}`}
                        >
                          {safeStatusLabel(log?.status, language)}
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
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4 md:flex-row">
          <div className="flex-1 rounded-xl border border-emerald-800/50 bg-emerald-950/30 p-4">
            <h4 className="text-sm font-bold text-emerald-400">
              {t.card1Title ?? EN_OVERSIGHT.card1Title}
            </h4>
            <p className="mt-1 text-xs text-emerald-200/80">
              {t.card1Desc ?? EN_OVERSIGHT.card1Desc}
            </p>
          </div>
          <div className="flex-1 rounded-xl border border-blue-800/50 bg-blue-950/30 p-4">
            <h4 className="text-sm font-bold text-blue-400">
              {t.card2Title ?? EN_OVERSIGHT.card2Title}
            </h4>
            <p className="mt-1 text-xs text-blue-200/80">
              {t.card2Desc ?? EN_OVERSIGHT.card2Desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OversightDashboard() {
  return (
    <OversightErrorBoundary>
      <OversightDashboardContent />
    </OversightErrorBoundary>
  );
}
