"use client";

import { useState } from "react";
import * as openpgp from "openpgp";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// සාක්ෂි (Evidence) වල URL එක ගන්න හදපු පොඩි Component එකක්
function EvidenceLink({ storageId }: { storageId: string }) {
  const url = useQuery(api.complaints.getImageUrl, {
    storageId: storageId as Id<"_storage">,
  });

  if (!url)
    return (
      <span className="text-sm text-slate-400">ලිංක් එක සූදානම් කරමින්...</span>
    );

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300 hover:underline"
    >
      📎 සාක්ෂි ගොනුව (Evidence) බලන්න
    </a>
  );
}

export default function AdminDashboard() {
  const complaints = useQuery(api.complaints.getAllComplaints) || [];
  const updateComplaintStatus = useMutation(
    api.complaints.updateComplaintStatus,
  );

  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [decryptedTexts, setDecryptedTexts] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  // යතුරු නිර්මාණය සඳහා
  const [generatedPubKey, setGeneratedPubKey] = useState("");
  const [generatedPrivKey, setGeneratedPrivKey] = useState("");

  // Toast Notification සඳහා
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

  // යතුරු යුගලයක් නිර්මාණය කිරීම
  const generateKeys = async () => {
    const { privateKey, publicKey } = await openpgp.generateKey({
      type: "ecc",
      curve: "ed25519" as any,
      userIDs: [{ name: "CID Investigator", email: "cid@police.lk" }],
    });
    setGeneratedPubKey(publicKey);
    setGeneratedPrivKey(privateKey);
    showToast("නව යතුරු යුගලයක් සාර්ථකව නිර්මාණය විය!", "success");
  };

  // Private Key එක භාවිතයෙන් Decrypt කිරීම
  const handleDecrypt = async () => {
    setError(null);
    try {
      let keyString = privateKeyInput.trim();

      if (!keyString.includes("-----BEGIN PGP PRIVATE KEY BLOCK-----")) {
        keyString = `-----BEGIN PGP PRIVATE KEY BLOCK-----\n\n${keyString}\n-----END PGP PRIVATE KEY BLOCK-----`;
      }

      const privKey = await openpgp.readPrivateKey({
        armoredKey: keyString,
      });

      const newDecrypted: any = {};
      let successCount = 0;

      for (const comp of complaints) {
        if (comp.description.includes("BEGIN PGP MESSAGE")) {
          try {
            const message = await openpgp.readMessage({
              armoredMessage: comp.description,
            });
            const { data: decrypted } = await openpgp.decrypt({
              message,
              decryptionKeys: privKey,
            });
            newDecrypted[comp._id] = decrypted;
            successCount++;
          } catch (innerErr) {
            newDecrypted[comp._id] =
              "⚠️ පරණ යතුරකින් ලොක් කර ඇත (මෙම යතුරෙන් අරින්න බැහැ)";
          }
        } else {
          newDecrypted[comp._id] = comp.description;
        }
      }

      setDecryptedTexts(newDecrypted);

      if (successCount === 0 && complaints.length > 0) {
        setError(
          "යතුර හරි! හැබැයි මේ යතුරෙන් අරින්න පුළුවන් අලුත් පැමිණිලි මුකුත් නෑ.",
        );
      } else {
        showToast("පැමිණිලි සාර්ථකව Decrypt කරන ලදී!", "success");
      }
    } catch (err) {
      console.error("Key Error:", err);
      setError(
        "Private Key එකේ අවුලක්! කරුණාකර අකුරු අඩුවක් නැතුව හරියටම දාන්න.",
      );
    }
  };

  // තත්ත්වය සහ රිප්ලයි එක යාවත්කාලීන කිරීම (Convex Mutation)
  const handleUpdate = async (
    id: Id<"complaints">,
    status: string,
    reply: string,
  ) => {
    try {
      await updateComplaintStatus({
        id,
        status,
        investigator_reply: reply,
      });
      showToast("යාවත්කාලීන කිරීම සාර්ථකයි!", "success");
    } catch (err: any) {
      showToast("Update වුණේ නැහැ! Error: " + err.message, "error");
      console.error(err);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 p-4 text-slate-200 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600" />
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in transition-all duration-300">
          <div
            className={`px-6 py-4 rounded-xl shadow-2xl border text-sm font-bold flex items-center gap-3 ${
              toast.type === "success"
                ? "bg-slate-800 border-emerald-500 text-emerald-400"
                : "bg-slate-800 border-red-500 text-red-400"
            }`}
          >
            {toast.type === "success" ? (
              <span className="flex items-center justify-center w-6 h-6 bg-emerald-500/20 rounded-full text-emerald-400">
                ✓
              </span>
            ) : (
              <span className="flex items-center justify-center w-6 h-6 bg-red-500/20 rounded-full text-red-400">
                ✕
              </span>
            )}
            {toast.message}
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-6xl space-y-8">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-blue-400">
              SecureReport System
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              🛡️ විමර්ශක පුවරුව (CID Dashboard)
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Investigator Admin Dashboard
            </p>
          </div>

          <div className="inline-flex w-fit rounded-full border border-slate-700 bg-slate-900 p-1 shadow-sm">
            <span className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-900">
              සිංහල
            </span>
            <span className="rounded-full px-4 py-2 text-sm font-bold text-slate-300">
              English
            </span>
          </div>
          </div>
        </div>

        {/* --- Key Generator Section --- */}
        <div className="rounded-2xl border border-slate-700 bg-[#1e293b] p-6 shadow-2xl shadow-black/30">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-blue-400">
                1. ආරක්ෂිත යතුරු නිර්මාණය (Key Generator)
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                පද්ධතියට අලුත් නම් පමණක් මෙතැනින් Public සහ Private යතුරු සාදාගන්න.
              </p>
            </div>
            <span className="w-fit rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300">
              Secure Key Generator
            </span>
          </div>
          <button
            onClick={generateKeys}
            className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white shadow-lg shadow-blue-950/30 transition-colors hover:bg-blue-700"
          >
            නව යතුරු නිර්මාණය කරන්න
          </button>

          {generatedPubKey && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-green-400">
                  Public Key (Website එකට දාන්න):
                </label>
                <textarea
                  readOnly
                  value={generatedPubKey}
                  className="h-36 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-green-300 shadow-inner focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-red-400">
                  Private Key (ඔබ ළඟ තබාගන්න):
                </label>
                <textarea
                  readOnly
                  value={generatedPrivKey}
                  className="h-36 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-red-300 shadow-inner focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* --- Decryption Section --- */}
        <div className="rounded-2xl border border-slate-700 bg-[#1e293b] p-6 shadow-2xl shadow-black/30">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-emerald-400">
                2. පැමිණිලි කියවීම (Decryption)
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                ලොක් කර ඇති පැමිණිලි කියවීම සඳහා ඔබගේ Private Key එක පහතින් ඇතුළත්
                කරන්න.
              </p>
            </div>
            <span className="w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
              Read Complaints
            </span>
          </div>
          <textarea
            value={privateKeyInput}
            onChange={(e) => setPrivateKeyInput(e.target.value)}
            className="mb-4 h-28 w-full rounded-lg border border-slate-700 bg-slate-950 p-4 font-mono text-xs text-slate-300 shadow-inner placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="ඔබගේ Private Key එක මෙතැන අලවන්න..."
          />
          <button
            onClick={handleDecrypt}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 font-bold text-white shadow-lg shadow-emerald-950/30 transition-colors hover:bg-emerald-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V7a4 4 0 10-8 0v3m-1 0h12a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2v-7a2 2 0 012-2zm12 0h4m0 0l-2-2m2 2l-2 2"
              />
            </svg>
            Unlock & Decrypt Complaints
          </button>
          {error && (
            <p className="mt-3 rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-sm font-bold text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* --- Complaints List --- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">ලැබී ඇති පැමිණිලි</h2>
            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-bold text-slate-400">
              {complaints.length} Records
            </span>
          </div>
          {complaints.length === 0 && (
            <p className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              තාමත් පැමිණිලි කිසිවක් ලැබී නොමැත.
            </p>
          )}
          {complaints.map((comp) => (
            <div
              key={comp._id}
              className="rounded-2xl border border-slate-700 bg-[#1e293b] p-6 shadow-xl shadow-black/30"
            >
              <div className="mb-4 flex flex-col justify-between gap-2 border-b border-slate-700 pb-3 sm:flex-row sm:items-center">
                <span className="font-mono text-lg font-bold text-emerald-400">
                  Key: {comp.case_key}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(comp._creationTime).toLocaleString()}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="mb-2 text-sm font-bold text-slate-300">
                  පැමිණිල්ලේ විස්තරය:
                </h3>
                {decryptedTexts[comp._id] ? (
                  <div
                    className={`whitespace-pre-wrap rounded-lg p-4 font-medium ${
                      decryptedTexts[comp._id].includes("⚠️")
                        ? "bg-red-950/50 text-red-400 border border-red-900"
                        : "bg-slate-900 text-green-400 border border-slate-700"
                    }`}
                  >
                    {decryptedTexts[comp._id]}
                  </div>
                ) : (
                  <div className="break-all rounded-lg border border-slate-700 bg-slate-950 p-4 font-mono text-xs text-slate-500">
                    {comp.description}
                  </div>
                )}
              </div>

              {comp.evidence_path && (
                <div className="mb-4 text-sm">
                  <EvidenceLink storageId={comp.evidence_path} />
                </div>
              )}

              {comp.reporter_reply && (
                <div className="mb-4 rounded-lg border border-emerald-800/50 bg-emerald-900/30 p-4">
                  <h3 className="mb-1 text-xs font-bold uppercase text-emerald-400">
                    පැමිණිලිකරුගේ නව පිළිතුර:
                  </h3>
                  <p className="text-emerald-100 text-sm">
                    {comp.reporter_reply}
                  </p>
                </div>
              )}

              {/* Status Update Form - Condition එකක් සහිතව */}
              {decryptedTexts[comp._id] &&
              !decryptedTexts[comp._id].includes("⚠️") &&
              !decryptedTexts[comp._id].includes("BEGIN PGP MESSAGE") ? (
                <div className="animate-fade-in mt-4 rounded-lg border border-slate-700 bg-slate-900 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-300">
                    <span className="text-blue-500">✍️</span> තත්ත්වය යාවත්කාලීන
                    කිරීම (Update Status)
                  </h3>
                  <form
                    onSubmit={(e: any) => {
                      e.preventDefault();
                      handleUpdate(
                        comp._id,
                        e.target.status.value,
                        e.target.reply.value,
                      );
                    }}
                    className="space-y-3"
                  >
                    <select
                      name="status"
                      defaultValue={comp.status}
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 p-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Pending">
                        Pending (සමාලෝචනය වෙමින් පවතී)
                      </option>
                      <option value="Investigating">
                        Investigating (විමර්ශනය කරමින් පවතී)
                      </option>
                      <option value="Resolved">Resolved (විසඳා ඇත)</option>
                    </select>
                    <textarea
                      name="reply"
                      defaultValue={comp.investigator_reply || ""}
                      placeholder="පැමිණිලිකරුට පණිවිඩයක් (Optional)"
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      rows={2}
                    />
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
                    >
                      Update (යාවත්කාලීන කරන්න)
                    </button>
                  </form>
                </div>
              ) : (
                /* Decrypt කරලා නැත්නම් පෙන්වන කොටස */
                <div className="mt-4 rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-center">
                  <p className="text-xs font-medium text-red-400">
                    🔒 පණිවිඩය යැවීමට සහ තත්ත්වය යාවත්කාලීන කිරීමට ප්‍රථම,
                    ඉහළින් ඔබගේ Private Key එක ලබාදී පැමිණිල්ල Unlock කරන්න.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
