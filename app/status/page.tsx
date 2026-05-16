"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { translations, type Language } from "../../translations";

function getComplaintStatusLabel(
  status: string | undefined,
  t: (typeof translations)["en"]["status"],
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

export default function CheckStatus() {
  const [language, setLanguage] = useState<Language>("si");
  const [caseKeyInput, setCaseKeyInput] = useState("");
  const [activeCaseKey, setActiveCaseKey] = useState<string | null>(null);
  const [newReply, setNewReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const t = translations[language].status;

  useEffect(() => {
    if (localStorage.getItem("lang") === "en") {
      setLanguage("en");
    }
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    localStorage.setItem("lang", newLang);
    window.location.reload();
  };

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
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 relative">
      <LanguageSwitcher language={language} onChange={handleLanguageChange} />

      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in transition-all duration-300">
          <div
            className={`px-6 py-4 rounded-xl shadow-2xl border text-sm font-bold flex items-center gap-3 ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
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

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">
          {t.statusTitle}
        </h1>
        <p className="text-sm text-slate-500 mb-6 text-center">
          {t.statusSubtitle}
        </p>

        <form onSubmit={handleCheckStatus} className="space-y-4">
          <div>
            <input
              type="text"
              required
              value={caseKeyInput}
              onChange={(e) => setCaseKeyInput(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-700 text-center font-mono text-xl uppercase tracking-widest"
              placeholder={t.caseKeyPlaceholder}
              maxLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={
              !caseKeyInput.trim() ||
              activeCaseKey === caseKeyInput.trim().toUpperCase()
            }
            className={`w-full py-3 px-4 rounded-xl text-white font-bold shadow-md transition-all ${
              !caseKeyInput.trim()
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-900 active:scale-95"
            }`}
          >
            {t.checkButton}
          </button>
        </form>

        {activeCaseKey && complaint === undefined && (
          <div className="mt-6 text-blue-600 text-sm bg-blue-50 p-4 rounded-lg border border-blue-100 text-center animate-pulse">
            {t.searching}
          </div>
        )}

        {activeCaseKey && complaint === null && (
          <div className="mt-6 text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-100 text-center">
            {t.notFound}
          </div>
        )}

        {complaint && (
          <div className="mt-8 space-y-4 animate-fade-in">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {t.currentStatus}
              </h3>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                  complaint.status === "Resolved"
                    ? "bg-green-100 text-green-700"
                    : complaint.status === "Investigating"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {getComplaintStatusLabel(complaint.status, t)}
              </span>
            </div>

            <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                {t.investigatorMessage}
              </h3>
              <p className="text-sm text-slate-700 font-medium">
                {complaint.investigator_reply || t.noInvestigatorMessage}
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {t.originalComplaint}
              </h3>
              <div className="text-sm text-slate-600 italic">
                {complaint.description.includes("BEGIN PGP MESSAGE") ? (
                  <span className="text-emerald-600 font-semibold flex items-start text-left">
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
                      />
                    </svg>
                    {t.pgpEncryptedNotice}
                  </span>
                ) : (
                  `"${complaint.description}"`
                )}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200">
              <p className="text-sm font-bold text-slate-600">
                {t.replyToInvestigator}
              </p>
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder={t.replyPlaceholder}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm h-24 focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendReply}
                disabled={isSending || !newReply.trim()}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-all disabled:bg-slate-400"
              >
                {isSending ? t.sendingReply : t.sendReply}
              </button>

              {complaint.reporter_reply && (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <p className="text-[11px] font-bold text-emerald-600 uppercase mb-1">
                    ✓ {t.lastReply}
                  </p>
                  <p className="text-sm text-emerald-800">
                    {complaint.reporter_reply}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
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
            {t.backButton}
          </Link>
        </div>
      </div>
    </div>
  );
}
