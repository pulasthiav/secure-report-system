"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTranslations, useLanguage } from "../../components/LanguageContext";
import { getStatusPageLabel } from "../../translations";

export default function CheckStatus() {
  const t = useTranslations().status;
  const { language } = useLanguage();
  const [caseKeyInput, setCaseKeyInput] = useState("");
  const [activeCaseKey, setActiveCaseKey] = useState<string | null>(null);
  const [newReply, setNewReply] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const complaint = useQuery(
    api.complaints.getComplaintByCaseKey,
    activeCaseKey ? { case_key: activeCaseKey } : "skip",
  );

  const updateReporterReply = useMutation(api.complaints.updateReporterReply);

  const sendReply = async () => {
    if (!newReply.trim() || !complaint) return;
    setIsSending(true);

    try {
      await updateReporterReply({
        id: complaint._id,
        reporter_reply: newReply,
      });

      showToast(t.toastReplySuccess, "success");
      setNewReply("");
    } catch (err: unknown) {
      showToast(t.toastReplyError, "error");
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCheckStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (caseKeyInput.trim()) {
      setActiveCaseKey(caseKeyInput.trim().toUpperCase());
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 p-4 pt-20 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600" />
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-fade-in transition-all duration-300">
          <div
            className={`px-6 py-4 rounded-xl shadow-2xl border text-sm font-bold flex items-center gap-3 ${
              toast.type === "success"
                ? "bg-slate-900 border-emerald-500 text-emerald-300"
                : "bg-slate-900 border-red-500 text-red-300"
            }`}
          >
            {toast.type === "success" ? (
              <span className="flex items-center justify-center w-6 h-6 bg-emerald-500 rounded-full text-white">
                ✓
              </span>
            ) : (
              <span className="flex items-center justify-center w-6 h-6 bg-red-500 rounded-full text-white">
                ✕
              </span>
            )}
            {toast.message}
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-black/30 backdrop-blur">
        <h1 className="mb-2 text-center text-2xl font-bold text-white">
          {t.title}
        </h1>
        <p className="mb-6 text-center text-sm text-slate-400">{t.subtitle}</p>

        <form onSubmit={handleCheckStatus} className="space-y-4">
          <div>
            <input
              type="text"
              required
              value={caseKeyInput}
              onChange={(e) => setCaseKeyInput(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-center font-mono text-xl uppercase tracking-widest text-white placeholder:text-slate-600 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="CASE KEY"
              maxLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={
              !caseKeyInput.trim() ||
              activeCaseKey === caseKeyInput.trim().toUpperCase()
            }
            className={`w-full rounded-xl px-4 py-3 font-bold text-white shadow-md transition-all ${
              !caseKeyInput.trim()
                ? "cursor-not-allowed bg-slate-700 text-slate-400"
                : "bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700"
            }`}
          >
            {t.checkButton}
          </button>
        </form>

        {activeCaseKey && complaint === undefined && (
          <div className="mt-6 animate-pulse rounded-lg border border-blue-500/30 bg-blue-950/30 p-4 text-center text-sm text-blue-300">
            {t.searching}
          </div>
        )}

        {activeCaseKey && complaint === null && (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-950/30 p-4 text-center text-sm text-red-300">
            {t.notFound}
          </div>
        )}

        {complaint && (
          <div className="mt-8 space-y-4 animate-fade-in">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
              <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                {t.currentStatus}
              </h3>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                  complaint.status === "Resolved"
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    : complaint.status === "Investigating"
                      ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                      : "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30"
                }`}
              >
                {getStatusPageLabel(complaint.status, language)}
              </span>
            </div>

            <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-5">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-300">
                {t.investigatorMessage}
              </h3>
              <p className="text-sm font-medium text-slate-300">
                {complaint.investigator_reply || t.noInvestigatorMessage}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                {t.yourComplaint}
              </h3>
              <div className="text-sm italic text-slate-300">
                {complaint.description.includes("BEGIN PGP MESSAGE") ? (
                  <span className="flex items-start text-left font-semibold text-emerald-300">
                    <svg
                      className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      ></path>
                    </svg>
                    {t.encryptedNotice}
                  </span>
                ) : (
                  `"${complaint.description}"`
                )}
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-800 pt-4">
              <p className="text-sm font-bold text-slate-300">{t.replyLabel}</p>
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder={t.replyPlaceholder}
                className="h-24 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                onClick={sendReply}
                disabled={isSending || !newReply.trim()}
                className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-md transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {isSending ? t.sending : t.sendReply}
              </button>

              {complaint.reporter_reply && (
                <div className="mt-2 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3">
                  <p className="mb-1 text-[11px] font-bold uppercase text-emerald-300">
                    {t.lastReply}
                  </p>
                  <p className="text-sm text-emerald-100">
                    {complaint.reporter_reply}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-slate-800 pt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {t.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
