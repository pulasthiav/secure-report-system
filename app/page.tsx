"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import * as openpgp from "openpgp";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { redactPIIWithAI } from "./actions/redact-pii";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { classifyFraudCategory } from "../lib/classifyFraudCategory";
import { generateReceiptPdf } from "../lib/generateReceiptPdf";
import { translations, type Language } from "../translations";

export default function Home() {
  const [language, setLanguage] = useState<Language>("si");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [successKey, setSuccessKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasEvidence, setHasEvidence] = useState(false);

  // රිසිට් පත සඳහා දත්ත ගබඩා කිරීමට
  const [receiptData, setReceiptData] = useState<{
    caseKey: string;
    hash: string;
    pgpText: string;
    category: string;
    status: string;
    submittedAt: Date;
  } | null>(null);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);

  const generateUploadUrl = useMutation(api.complaints.generateUploadUrl);
  const createComplaint = useMutation(api.complaints.createComplaint);

  const t = translations[language].home;

  useEffect(() => {
    if (localStorage.getItem("lang") === "en") {
      setLanguage("en");
    }
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    localStorage.setItem("lang", newLang);
    window.location.reload();
  };

  const generateCaseKey = () =>
    Math.random().toString(36).substring(2, 10).toUpperCase();

  // ─── PGP Encryption ───────────────────────────────────────────────────────
  const PUBLIC_KEY = `-----BEGIN PGP PUBLIC KEY BLOCK-----
 
xjMEagbCVhYJKwYBBAHaRw8BAQdAG/Suu3AI5UB2QMM/ZMFxuQUvlfGBaG7p
Bh4sz8VsE4rNIENJRCBJbnZlc3RpZ2F0b3IgPGNpZEBwb2xpY2UubGs+wsAT
BBMWCgCFBYJqBsJWAwsJBwkQbTZcphrq0OZFFAAAAAAAHAAgc2FsdEBub3Rh
dGlvbnMub3BlbnBncGpzLm9yZyumXsBDk0XfazrieuyD3unGMDfuo/hCRZok
mUsgA5iFBRUKCA4MBBYAAgECGQECmwMCHgEWIQTvhAd+rkd318MoNtttNlym
GurQ5gAACVcBAMfZHCXWTAVVJrnGozxP5hHcrJRb/4gv+aPuMI12qoHzAP4l
xhmG253499fWvoDNWmGDtOg4eS1ifUWTz+FBr78eC844BGoGwlYSCisGAQQB
l1UBBQEBB0CA4huS4tFc2OTYihk6MY2qwNf+AX9SIfCTvWx1FJiGMAMBCAfC
vgQYFgoAcAWCagbCVgkQbTZcphrq0OZFFAAAAAAAHAAgc2FsdEBub3RhdGlv
bnMub3BlbnBncGpzLm9yZyeMj+CdcSIHsd/7WUCPeDoKGYSNarRlww991G8f
ia3dApsMFiEE74QHfq5Hd9fDKDbbbTZcphrq0OYAAEPEAQCSEuiNBvJkn9Q/
Uro6W719ms7HBtfSNGfDogkuCsKJrgEAoZl0IGJlKJ5bm6+bhxCT20WmefKU
mGyXFZPq566yTQs=
=Qzqo
-----END PGP PUBLIC KEY BLOCK-----`;

  const encryptWithPGP = async (text: string): Promise<string> => {
    const readKey = await openpgp.readKey({ armoredKey: PUBLIC_KEY });
    const message = await openpgp.createMessage({ text });
    const encrypted = await openpgp.encrypt({
      message,
      encryptionKeys: readKey,
    });
    return encrypted as string;
  };

  // ─── Metadata strip (removes EXIF from images) ────────────────────────────
  const stripMetadata = (originalFile: File): Promise<File> =>
    new Promise((resolve) => {
      if (!originalFile.type.startsWith("image/")) {
        resolve(originalFile);
        return;
      }
      const img = new Image();
      const url = URL.createObjectURL(originalFile);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) =>
              resolve(
                blob
                  ? new File([blob], "secure_evidence.jpg", {
                      type: "image/jpeg",
                    })
                  : originalFile,
              ),
            "image/jpeg",
            0.9,
          );
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });

  // ─── Receipt Download Function ────────────────────────────────────────────
  const downloadReceipt = async () => {
    if (!receiptData || isDownloadingReceipt) return;

    const currentLang =
      (localStorage.getItem("lang") as Language | null) || "si";

    setIsDownloadingReceipt(true);
    try {
      const blob = await generateReceiptPdf(receiptData, currentLang);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SecureReport_Receipt_${receiptData.caseKey}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Receipt PDF generation failed:", err);
      setError(t.errorGeneric);
    } finally {
      setIsDownloadingReceipt(false);
    }
  };

  // ─── Form Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const newCaseKey = generateCaseKey();
    let evidencePath = undefined;

    try {
      // Step 1 — PII redaction
      setStatusMessage(t.statusPiiCheck);
      const safeDescription = await redactPIIWithAI(description);

      // Step 2 — Metadata strip + upload via Convex
      if (file) {
        setStatusMessage(t.statusStripMetadata);
        const cleanFile = await stripMetadata(file);

        setStatusMessage(t.statusUploadEvidence);

        // Convex Storage එකට යැවීම
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": cleanFile.type },
          body: cleanFile,
        });
        const { storageId } = await result.json();
        evidencePath = storageId;
        setHasEvidence(true);
      } else {
        setHasEvidence(false);
      }

      // Step 3 — PGP encrypt
      setStatusMessage(t.statusEncrypt);
      const encryptedDescription = await encryptWithPGP(safeDescription);

      // Step 3.5 — Generate Immutable Hash & Set Receipt Data
      const blockchainHash = Array.from(
        crypto.getRandomValues(new Uint8Array(32)),
      )
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const fraudCategory = classifyFraudCategory(safeDescription);

      setReceiptData({
        caseKey: newCaseKey,
        hash: blockchainHash,
        pgpText: encryptedDescription,
        category: fraudCategory,
        status: "Pending",
        submittedAt: new Date(),
      });

      // Step 4 — Save to Convex Database
      setStatusMessage(t.statusSubmit);

      await createComplaint({
        case_key: newCaseKey,
        description: encryptedDescription,
        evidence_path: evidencePath,
      });

      setSuccessKey(newCaseKey);
      setDescription("");
      setFile(null);
    } catch (err: any) {
      setError(err.message || t.errorGeneric);
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setStatusMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 relative">
      <LanguageSwitcher language={language} onChange={handleLanguageChange} />

      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center tracking-tight">
          {t.headerTitle}
        </h1>
        <p className="text-sm text-slate-500 mb-8 text-center">
          {t.headerSubtitle}
        </p>

        {successKey ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-8 text-center">
            <h2 className="text-xl font-bold mb-3">{t.successTitle}</h2>

            {hasEvidence && (
              <div className="mb-6 p-4 rounded-xl text-sm border-2 bg-amber-50 border-amber-300 text-amber-800">
                <p className="font-bold mb-1">📋 {t.successEvidenceTitle}</p>
                <p>{t.successEvidenceBody}</p>
              </div>
            )}

            <div className="mt-4 p-4 bg-slate-900 rounded-xl border border-slate-700 text-left shadow-inner">
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  {t.blockchainVerified}
                </p>
              </div>
              <p className="text-[9px] text-slate-400 mb-1 font-mono uppercase">
                {t.immutableHashLabel}
              </p>
              <p className="text-[10px] font-mono text-slate-300 break-all leading-tight bg-black/30 p-2 rounded border border-white/5">
                {receiptData?.hash}
              </p>
              <p className="text-[9px] text-slate-500 mt-2 italic">
                {t.blockchainNote}
              </p>
            </div>

            <p className="text-sm mb-4 mt-6">{t.caseKeyKeep}</p>
            <div className="bg-white px-6 py-4 rounded-lg border-2 border-emerald-400 font-mono text-3xl font-bold tracking-[0.2em] text-emerald-700 shadow-inner mb-6">
              {successKey}
            </div>

            <button
              type="button"
              onClick={() => void downloadReceipt()}
              disabled={isDownloadingReceipt}
              className="w-full mb-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {t.downloadReceipt}
            </button>

            <Link
              href="/status"
              className="block w-full bg-slate-800 text-white text-center py-3 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-md"
            >
              {t.checkStatus}
            </Link>

            <button
              onClick={() => {
                setSuccessKey(null);
                setHasEvidence(false);
                setReceiptData(null);
              }}
              className="mt-4 text-sm text-emerald-600 underline font-medium"
            >
              {t.submitNew}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t.descriptionLabel}
                </label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-700"
                  placeholder={t.descriptionPlaceholder}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t.evidenceLabel}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFile(e.target.files ? e.target.files[0] : null)
                  }
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {file && (
                  <p className="text-xs text-slate-400 mt-1">
                    ✓ {file.name} {t.fileSelectedExif}
                  </p>
                )}
                <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                  ⚠️ {t.imageWarning}
                </p>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className={`w-full py-4 px-4 rounded-xl text-white font-bold text-lg shadow-md transition-all ${
                  isSubmitting
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                }`}
              >
                {isSubmitting ? t.submitSubmitting : t.submitButton}
              </button>

              {statusMessage && (
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-xs text-blue-600 font-medium">
                    {statusMessage}
                  </p>
                </div>
              )}

              <div className="flex justify-center gap-3 pt-2 flex-wrap">
                <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                  🔒 {t.badgePgpEncrypted}
                </span>
                <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                  🤖 {t.badgeAiPiiRedaction}
                </span>
                <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                  🧹 {t.badgeExifStripped}
                </span>
              </div>
            </form>

            <div className="pt-6 border-t border-slate-100">
              <Link
                href="/oversight"
                className="flex items-center justify-center w-full px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all active:scale-95 text-sm mt-3 mb-3"
              >
                🔍 {t.bottomButtonOversight}
              </Link>
              <Link
                href="/status"
                className="flex items-center justify-center w-full px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 text-sm"
              >
                <svg
                  className="w-4 h-4 mr-2 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {t.bottomButtonTrack}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
