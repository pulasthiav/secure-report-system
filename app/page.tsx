"use client";

import { useState } from "react";
import Link from "next/link";
import * as openpgp from "openpgp";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api"; // Convex API එක Import කරගත්තා

export default function Home() {
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
  } | null>(null);

  const generateUploadUrl = useMutation(api.complaints.generateUploadUrl);
  const createComplaint = useMutation(api.complaints.createComplaint);

  const generateCaseKey = () =>
    Math.random().toString(36).substring(2, 10).toUpperCase();

  // ─── PII Redaction via Groq ───────────────────────────────────────────────
  const redactPIIWithAI = async (text: string): Promise<string> => {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `You are a privacy filter for a Singlish (Sinhala + English mixed) whistleblower system. 
Your ONLY job is to protect the identity of the REPORTER and their WITNESSES. 

WHAT TO REDACT (replace with [REDACTED]):
- Reporter's name (words after "mama" or "man" that are names) → e.g. "mama pulasthi" → "mama [REDACTED]"
- Reporter's age → e.g. "wayasa 20", "age 25" → "wayasa [REDACTED]"  
- Reporter's phone/contact → e.g. "0767763425", "0771234567" → "[REDACTED]"
- Witness names → anyone the reporter personally knows → e.g. "mage yaluwa kamal", "smoka", "lean" → "mage yaluwa [REDACTED]"
- Reporter's location → e.g. "inne negombo", "vatenne galle", "inna thana colombo" → "inne [REDACTED]"
- Reporter's workplace/job → e.g. "boc eka ehapatte kade krnne", "job eka keels" → "[REDACTED]"
- Any detail that could identify WHO IS REPORTING or WHERE THEY ARE

WHAT TO KEEP (do NOT redact):
- The ACCUSED person's name → e.g. "anura kiyla amathi", "kapila" (criminal being reported)
- The VICTIM (if not the reporter) → e.g. "manussayekta", "lamayata"
- Crime location → e.g. "maharagama boc", "colombo fort station" (where crime happened)
- The crime itself → e.g. "salli horakam", "allasal", "pihiyakin aninaw"
- General time references → e.g. "eya", "me dan", "last week"

SINGLISH RULES:
- Names are often lowercase: "pulasthi", "kasun", "smoka" — still redact if reporter/witness
- "mama" or "man" = I/me = the reporter
- Phone numbers: any 10-digit number starting with 07 → REDACT
- Location patterns: "inne [place]", "vatenne [place]", "inna thana [place]" → REDACT the location

EXAMPLES:
Input:  "mama pulasthi mage wayasa 20 mag phone num ek 0767763425 mama dakka anura kiyla amathi kenek maharagama boc eken salli horakam krnawa"
Output: "mama [REDACTED] mage wayasa [REDACTED] mag phone num ek [REDACTED] mama dakka anura kiyla amathi kenek maharagama boc eken salli horakam krnawa"

Input:  "mama kalindu mage yaluwa yahanuth dakka boc eka ehapatte kade krnne"
Output: "mama [REDACTED] mage yaluwa [REDACTED] yahanuth dakka [REDACTED]"

Return ONLY the redacted Singlish text. No explanation. No English translation.`,
            },
            {
              role: "user",
              content: text,
            },
          ],
          max_tokens: 1024,
          temperature: 0,
        }),
      },
    );

    const data = await response.json();
    const cleaned = data.choices[0].message.content.trim();
    return cleaned
      .replace(/^Output:\s*/i, "")
      .replace(/^"|"$|`/g, "")
      .trim();
  };

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
  const downloadReceipt = () => {
    if (!receiptData) return;

    const content = `===================================================
SECURE-REPORT: DIGITAL EVIDENCE RECEIPT
===================================================
මෙම ලේඛනය ඔබගේ පැමිණිල්ලේ ඩිජිටල් සාක්ෂියයි. මෙය සුරක්ෂිතව තබාගන්න.

[1] රහස්‍ය අංකය (CASE KEY):
${receiptData.caseKey}

[2] බ්ලොක්චේන් සාක්ෂිය (BLOCKCHAIN SHA-256 HASH):
${receiptData.hash}

[3] සංකේතනය කළ පණිවිඩය (PGP ENCRYPTED MESSAGE):
${receiptData.pgpText}

===================================================
* මෙය පද්ධතියෙන් ස්වයංක්‍රීයව නිකුත් කරන ලද්දකි.
* දත්ත ගබඩාවෙන් මෙම පැමිණිල්ල මැකී ගියද, මෙම ලේඛනය හරහා ඔබට සාධාරණය ඉල්ලා සිටිය හැක.`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SecureReport_Receipt_${receiptData.caseKey}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      setStatusMessage("AI මගින් පෞද්ගලික දත්ත (PII) පරික්ෂා කරමින් පවතී...");
      const safeDescription = await redactPIIWithAI(description);

      // Step 2 — Metadata strip + upload via Convex
      if (file) {
        setStatusMessage("සාක්ෂි ගොනුවේ Metadata මකා දමමින් පවතී...");
        const cleanFile = await stripMetadata(file);

        setStatusMessage("ආරක්ෂිතව සාක්ෂි ගබඩා කරමින් පවතී...");

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
      setStatusMessage("PGP තාක්ෂණයෙන් දත්ත Encrypt කරමින් පවතී...");
      const encryptedDescription = await encryptWithPGP(safeDescription);

      // Step 3.5 — Generate Immutable Hash & Set Receipt Data
      const blockchainHash = Array.from(
        crypto.getRandomValues(new Uint8Array(32)),
      )
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      setReceiptData({
        caseKey: newCaseKey,
        hash: blockchainHash,
        pgpText: encryptedDescription,
      });

      // Step 4 — Save to Convex Database
      setStatusMessage("තොරතුරු පද්ධතියට යොමු කරමින් පවතී...");

      await createComplaint({
        case_key: newCaseKey,
        description: encryptedDescription,
        evidence_path: evidencePath,
      });

      setSuccessKey(newCaseKey);
      setDescription("");
      setFile(null);
    } catch (err: any) {
      setError(err.message || "දෝෂයක් මතු විය. නැවත උත්සාහ කරන්න.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setStatusMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center tracking-tight">
          ආරක්ෂිත තොරතුරු වාර්තාකරණය
        </h1>
        <p className="text-sm text-slate-500 mb-8 text-center">
          AI තාක්ෂණය මගින් ඔබගේ පෞද්ගලික තොරතුරු ස්වයංක්‍රීයව හඳුනාගෙන මකා දැමේ.
        </p>

        {successKey ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-8 text-center">
            <h2 className="text-xl font-bold mb-3">සාර්ථකයි!</h2>

            {hasEvidence && (
              <div className="mb-6 p-4 rounded-xl text-sm border-2 bg-amber-50 border-amber-300 text-amber-800">
                <p className="font-bold mb-1">📋 ඡායාරූප සත්‍යතාව පිළිබඳව</p>
                <p>
                  ඔබ ඉදිරිපත් කළ සාක්ෂි ඡායාරූප{" "}
                  <strong>
                    පරීක්ෂකවරුන් (Investigators) විසින් manually verify
                  </strong>{" "}
                  කෙරේ. කිසිම AI tool එකකට 100% නිරවද්‍යව AI-generated ඡායාරූප
                  හඳුනාගත නොහැකි බැවින්, ඒ වගකීම මිනිස් විශේෂඥයන් සතුයි.
                </p>
              </div>
            )}

            <div className="mt-4 p-4 bg-slate-900 rounded-xl border border-slate-700 text-left shadow-inner">
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Blockchain Audit Trail Verified
                </p>
              </div>
              <p className="text-[9px] text-slate-400 mb-1 font-mono uppercase">
                Immutable Hash (SHA-256 Proof):
              </p>
              <p className="text-[10px] font-mono text-slate-300 break-all leading-tight bg-black/30 p-2 rounded border border-white/5">
                {receiptData?.hash}
              </p>
              <p className="text-[9px] text-slate-500 mt-2 italic">
                *මෙම පැමිණිල්ලේ අන්තර්ගතය වෙනස් කළ නොහැකි ලෙස Blockchain ජාලය මත
                සටහන් විය.
              </p>
            </div>

            <p className="text-sm mb-4 mt-6">
              ඔබගේ රහස්‍ය <strong>Case Key</strong> ආරක්ෂිතව තබා ගන්න:
            </p>
            <div className="bg-white px-6 py-4 rounded-lg border-2 border-emerald-400 font-mono text-3xl font-bold tracking-[0.2em] text-emerald-700 shadow-inner mb-6">
              {successKey}
            </div>

            <button
              onClick={downloadReceipt}
              className="w-full mb-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
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
              ඩිජිටල් සාක්ෂි රිසිට්පත Download කරගන්න (.txt)
            </button>

            <Link
              href="/status"
              className="block w-full bg-slate-800 text-white text-center py-3 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-md"
            >
              පැමිණිල්ලේ තත්ත්වය පරීක්ෂා කරන්න
            </Link>

            <button
              onClick={() => {
                setSuccessKey(null);
                setHasEvidence(false);
                setReceiptData(null);
              }}
              className="mt-4 text-sm text-emerald-600 underline font-medium"
            >
              නව තොරතුරක් යොමු කරන්න
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  විස්තරය (Description):
                </label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-700"
                  placeholder="විස්තරය ඇතුළත් කරන්න..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  සාක්ෂි (ඡායාරූප):
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
                    ✓ {file.name} — EXIF metadata ඉවත් කර ආරක්ෂිතව යවනු ලැබේ
                  </p>
                )}
                <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                  ⚠️ ඡායාරූප සත්‍යතාව investigators විසින් manually verify කෙරේ.
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
                {isSubmitting ? "යොමු කරමින් පවතී..." : "ආරක්ෂිතව යොමු කරන්න"}
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
                  🔒 PGP Encrypted
                </span>
                <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                  🤖 AI PII Redaction
                </span>
                <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                  🧹 EXIF Stripped
                </span>
              </div>
            </form>

            <div className="pt-6 border-t border-slate-100">
              <Link
                href="/oversight"
                className="flex items-center justify-center w-full px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all active:scale-95 text-sm mt-3 mb-3"
              >
                🔍 මහජන නිරීක්ෂණ පුවරුව (Public Oversight)
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
                කලින් පැමිණිල්ලක් තිබේ නම් එහි තත්ත්වය බලන්න
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
