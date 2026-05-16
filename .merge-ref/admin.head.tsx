"use client";

import { useState } from "react";
import * as openpgp from "openpgp";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// α╖âα╖Åα╢Üα╖èα╖éα╖Æ (Evidence) α╖Çα╢╜ URL α╢æα╢Ü α╢£α╢▒α╖èα╢▒ α╖äα╢»α╢┤α╖ö α╢┤α╖£α╢⌐α╖Æ Component α╢æα╢Üα╢Üα╖è
function EvidenceLink({ storageId }: { storageId: string }) {
  const url = useQuery(api.complaints.getImageUrl, {
    storageId: storageId as Id<"_storage">,
  });

  if (!url)
    return (
      <span className="text-sm text-slate-400">α╢╜α╖Æα╢éα╢Üα╖è α╢æα╢Ü α╖âα╖ûα╢»α╖Åα╢▒α╢╕α╖è α╢Üα╢╗α╢╕α╖Æα╢▒α╖è...</span>
    );

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300 hover:underline"
    >
      ≡ƒôÄ α╖âα╖Åα╢Üα╖èα╖éα╖Æ α╢£α╖£α╢▒α╖öα╖Ç (Evidence) α╢╢α╢╜α╢▒α╖èα╢▒
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

  // α╢║α╢¡α╖öα╢╗α╖ö α╢▒α╖Æα╢╗α╖èα╢╕α╖Åα╢½α╢║ α╖âα╢│α╖äα╖Å
  const [generatedPubKey, setGeneratedPubKey] = useState("");
  const [generatedPrivKey, setGeneratedPrivKey] = useState("");

  // Toast Notification α╖âα╢│α╖äα╖Å
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

  // α╢║α╢¡α╖öα╢╗α╖ö α╢║α╖öα╢£α╢╜α╢║α╢Üα╖è α╢▒α╖Æα╢╗α╖èα╢╕α╖Åα╢½α╢║ α╢Üα╖Æα╢╗α╖ôα╢╕
  const generateKeys = async () => {
    const { privateKey, publicKey } = await openpgp.generateKey({
      type: "ecc",
      curve: "ed25519" as any,
      userIDs: [{ name: "CID Investigator", email: "cid@police.lk" }],
    });
    setGeneratedPubKey(publicKey);
    setGeneratedPrivKey(privateKey);
    showToast("α╢▒α╖Ç α╢║α╢¡α╖öα╢╗α╖ö α╢║α╖öα╢£α╢╜α╢║α╢Üα╖è α╖âα╖Åα╢╗α╖èα╢«α╢Üα╖Ç α╢▒α╖Æα╢╗α╖èα╢╕α╖Åα╢½α╢║ α╖Çα╖Æα╢║!", "success");
  };

  // Private Key α╢æα╢Ü α╢╖α╖Åα╖Çα╖Æα╢¡α╢║α╖Öα╢▒α╖è Decrypt α╢Üα╖Æα╢╗α╖ôα╢╕
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
              "ΓÜá∩╕Å α╢┤α╢╗α╢½ α╢║α╢¡α╖öα╢╗α╢Üα╖Æα╢▒α╖è α╢╜α╖£α╢Üα╖è α╢Üα╢╗ α╢çα╢¡ (α╢╕α╖Öα╢╕ α╢║α╢¡α╖öα╢╗α╖Öα╢▒α╖è α╢àα╢╗α╖Æα╢▒α╖èα╢▒ α╢╢α╖Éα╖äα╖É)";
          }
        } else {
          newDecrypted[comp._id] = comp.description;
        }
      }

      setDecryptedTexts(newDecrypted);

      if (successCount === 0 && complaints.length > 0) {
        setError(
          "α╢║α╢¡α╖öα╢╗ α╖äα╢╗α╖Æ! α╖äα╖Éα╢╢α╖Éα╢║α╖Æ α╢╕α╖Ü α╢║α╢¡α╖öα╢╗α╖Öα╢▒α╖è α╢àα╢╗α╖Æα╢▒α╖èα╢▒ α╢┤α╖öα╖àα╖öα╖Çα╢▒α╖è α╢àα╢╜α╖öα╢¡α╖è α╢┤α╖Éα╢╕α╖Æα╢½α╖Æα╢╜α╖Æ α╢╕α╖öα╢Üα╖öα╢¡α╖è α╢▒α╖æ.",
        );
      } else {
        showToast("α╢┤α╖Éα╢╕α╖Æα╢½α╖Æα╢╜α╖Æ α╖âα╖Åα╢╗α╖èα╢«α╢Üα╖Ç Decrypt α╢Üα╢╗α╢▒ α╢╜α╢»α╖ô!", "success");
      }
    } catch (err) {
      console.error("Key Error:", err);
      setError(
        "Private Key α╢æα╢Üα╖Ü α╢àα╖Çα╖öα╢╜α╢Üα╖è! α╢Üα╢╗α╖öα╢½α╖Åα╢Üα╢╗ α╢àα╢Üα╖öα╢╗α╖ö α╢àα╢⌐α╖öα╖Çα╢Üα╖è α╢▒α╖Éα╢¡α╖öα╖Ç α╖äα╢╗α╖Æα╢║α╢ºα╢╕ α╢»α╖Åα╢▒α╖èα╢▒.",
      );
    }
  };

  // α╢¡α╢¡α╖èα╢¡α╖èα╖Çα╢║ α╖âα╖ä α╢╗α╖Æα╢┤α╖èα╢╜α╢║α╖Æ α╢æα╢Ü α╢║α╖Åα╖Çα╢¡α╖èα╢Üα╖Åα╢╜α╖ôα╢▒ α╢Üα╖Æα╢╗α╖ôα╢╕ (Convex Mutation)
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
      showToast("α╢║α╖Åα╖Çα╢¡α╖èα╢Üα╖Åα╢╜α╖ôα╢▒ α╢Üα╖Æα╢╗α╖ôα╢╕ α╖âα╖Åα╢╗α╖èα╢«α╢Üα╢║α╖Æ!", "success");
    } catch (err: any) {
      showToast("Update α╖Çα╖öα╢½α╖Ü α╢▒α╖Éα╖äα╖É! Error: " + err.message, "error");
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
                Γ£ô
              </span>
            ) : (
              <span className="flex items-center justify-center w-6 h-6 bg-red-500/20 rounded-full text-red-400">
                Γ£ò
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
              ≡ƒ¢í∩╕Å α╖Çα╖Æα╢╕α╢╗α╖èα╖üα╢Ü α╢┤α╖öα╖Çα╢╗α╖öα╖Ç (CID Dashboard)
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Investigator Admin Dashboard
            </p>
          </div>

          <div className="inline-flex w-fit rounded-full border border-slate-700 bg-slate-900 p-1 shadow-sm">
            <span className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-900">
              α╖âα╖Æα╢éα╖äα╢╜
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
                1. α╢åα╢╗α╢Üα╖èα╖éα╖Æα╢¡ α╢║α╢¡α╖öα╢╗α╖ö α╢▒α╖Æα╢╗α╖èα╢╕α╖Åα╢½α╢║ (Key Generator)
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                α╢┤α╢»α╖èα╢░α╢¡α╖Æα╢║α╢º α╢àα╢╜α╖öα╢¡α╖è α╢▒α╢╕α╖è α╢┤α╢╕α╢½α╢Üα╖è α╢╕α╖Öα╢¡α╖Éα╢▒α╖Æα╢▒α╖è Public α╖âα╖ä Private α╢║α╢¡α╖öα╢╗α╖ö α╖âα╖Åα╢»α╖Åα╢£α╢▒α╖èα╢▒.
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
            α╢▒α╖Ç α╢║α╢¡α╖öα╢╗α╖ö α╢▒α╖Æα╢╗α╖èα╢╕α╖Åα╢½α╢║ α╢Üα╢╗α╢▒α╖èα╢▒
          </button>

          {generatedPubKey && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-green-400">
                  Public Key (Website α╢æα╢Üα╢º α╢»α╖Åα╢▒α╖èα╢▒):
                </label>
                <textarea
                  readOnly
                  value={generatedPubKey}
                  className="h-36 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-green-300 shadow-inner focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-red-400">
                  Private Key (α╢öα╢╢ α╖àα╢ƒ α╢¡α╢╢α╖Åα╢£α╢▒α╖èα╢▒):
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
                2. α╢┤α╖Éα╢╕α╖Æα╢½α╖Æα╢╜α╖Æ α╢Üα╖Æα╢║α╖Çα╖ôα╢╕ (Decryption)
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                α╢╜α╖£α╢Üα╖è α╢Üα╢╗ α╢çα╢¡α╖Æ α╢┤α╖Éα╢╕α╖Æα╢½α╖Æα╢╜α╖Æ α╢Üα╖Æα╢║α╖Çα╖ôα╢╕ α╖âα╢│α╖äα╖Å α╢öα╢╢α╢£α╖Ü Private Key α╢æα╢Ü α╢┤α╖äα╢¡α╖Æα╢▒α╖è α╢çα╢¡α╖öα╖àα╢¡α╖è
                α╢Üα╢╗α╢▒α╖èα╢▒.
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
            placeholder="α╢öα╢╢α╢£α╖Ü Private Key α╢æα╢Ü α╢╕α╖Öα╢¡α╖Éα╢▒ α╢àα╢╜α╖Çα╢▒α╖èα╢▒..."
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
            <h2 className="text-xl font-bold text-white">α╢╜α╖Éα╢╢α╖ô α╢çα╢¡α╖Æ α╢┤α╖Éα╢╕α╖Æα╢½α╖Æα╢╜α╖Æ</h2>
            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-bold text-slate-400">
              {complaints.length} Records
            </span>
          </div>
          {complaints.length === 0 && (
            <p className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              α╢¡α╖Åα╢╕α╢¡α╖è α╢┤α╖Éα╢╕α╖Æα╢½α╖Æα╢╜α╖Æ α╢Üα╖Æα╖âα╖Æα╖Çα╢Üα╖è α╢╜α╖Éα╢╢α╖ô α╢▒α╖£α╢╕α╖Éα╢¡.
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
                  α╢┤α╖Éα╢╕α╖Æα╢½α╖Æα╢╜α╖èα╢╜α╖Ü α╖Çα╖Æα╖âα╖èα╢¡α╢╗α╢║:
                </h3>
                {decryptedTexts[comp._id] ? (
                  <div
                    className={`whitespace-pre-wrap rounded-lg p-4 font-medium ${
                      decryptedTexts[comp._id].includes("ΓÜá∩╕Å")
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
                    α╢┤α╖Éα╢╕α╖Æα╢½α╖Æα╢╜α╖Æα╢Üα╢╗α╖öα╢£α╖Ü α╢▒α╖Ç α╢┤α╖Æα╖àα╖Æα╢¡α╖öα╢╗:
                  </h3>
                  <p className="text-emerald-100 text-sm">
                    {comp.reporter_reply}
                  </p>
                </div>
              )}

              {/* Status Update Form - Condition α╢æα╢Üα╢Üα╖è α╖âα╖äα╖Æα╢¡α╖Ç */}
              {decryptedTexts[comp._id] &&
              !decryptedTexts[comp._id].includes("ΓÜá∩╕Å") &&
              !decryptedTexts[comp._id].includes("BEGIN PGP MESSAGE") ? (
                <div className="animate-fade-in mt-4 rounded-lg border border-slate-700 bg-slate-900 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-300">
                    <span className="text-blue-500">Γ£ì∩╕Å</span> α╢¡α╢¡α╖èα╢¡α╖èα╖Çα╢║ α╢║α╖Åα╖Çα╢¡α╖èα╢Üα╖Åα╢╜α╖ôα╢▒
                    α╢Üα╖Æα╢╗α╖ôα╢╕ (Update Status)
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
                        Pending (α╖âα╢╕α╖Åα╢╜α╖¥α╢áα╢▒α╢║ α╖Çα╖Öα╢╕α╖Æα╢▒α╖è α╢┤α╖Çα╢¡α╖ô)
                      </option>
                      <option value="Investigating">
                        Investigating (α╖Çα╖Æα╢╕α╢╗α╖èα╖üα╢▒α╢║ α╢Üα╢╗α╢╕α╖Æα╢▒α╖è α╢┤α╖Çα╢¡α╖ô)
                      </option>
                      <option value="Resolved">Resolved (α╖Çα╖Æα╖âα╢│α╖Å α╢çα╢¡)</option>
                    </select>
                    <textarea
                      name="reply"
                      defaultValue={comp.investigator_reply || ""}
                      placeholder="α╢┤α╖Éα╢╕α╖Æα╢½α╖Æα╢╜α╖Æα╢Üα╢╗α╖öα╢º α╢┤α╢½α╖Æα╖Çα╖Æα╢⌐α╢║α╢Üα╖è (Optional)"
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      rows={2}
                    />
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
                    >
                      Update (α╢║α╖Åα╖Çα╢¡α╖èα╢Üα╖Åα╢╜α╖ôα╢▒ α╢Üα╢╗α╢▒α╖èα╢▒)
                    </button>
                  </form>
                </div>
              ) : (
                /* Decrypt α╢Üα╢╗α╢╜α╖Å α╢▒α╖Éα╢¡α╖èα╢▒α╢╕α╖è α╢┤α╖Öα╢▒α╖èα╖Çα╢▒ α╢Üα╖£α╢ºα╖â */
                <div className="mt-4 rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-center">
                  <p className="text-xs font-medium text-red-400">
                    ≡ƒöÆ α╢┤α╢½α╖Æα╖Çα╖Æα╢⌐α╢║ α╢║α╖Éα╖Çα╖ôα╢╕α╢º α╖âα╖ä α╢¡α╢¡α╖èα╢¡α╖èα╖Çα╢║ α╢║α╖Åα╖Çα╢¡α╖èα╢Üα╖Åα╢╜α╖ôα╢▒ α╢Üα╖Æα╢╗α╖ôα╢╕α╢º α╢┤α╖èΓÇìα╢╗α╢«α╢╕,
                    α╢ëα╖äα╖àα╖Æα╢▒α╖è α╢öα╢╢α╢£α╖Ü Private Key α╢æα╢Ü α╢╜α╢╢α╖Åα╢»α╖ô α╢┤α╖Éα╢╕α╖Æα╢½α╖Æα╢╜α╖èα╢╜ Unlock α╢Üα╢╗α╢▒α╖èα╢▒.
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
