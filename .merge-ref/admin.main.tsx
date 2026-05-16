"use client";

import { useState, useEffect, useMemo } from "react";
import * as openpgp from "openpgp";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useLanguage } from "../../components/LanguageContext";
import { classifyFraudCategory } from "../../lib/classifyFraudCategory";
import {
  getAdminStatusLabel,
  getLocalizedFraudCategory,
  translations,
} from "../../translations";

type EvidenceExifMetadata = {
  latitude?: number;
  longitude?: number;
  dateTime?: string;
};

function EvidenceMetadataPanel({
  metadata,
}: {
  metadata: EvidenceExifMetadata | string;
}) {
  const { language } = useLanguage();
  const t = translations[language].admin;

  let meta: EvidenceExifMetadata;
  if (typeof metadata === "string") {
    try {
      meta = JSON.parse(metadata) as EvidenceExifMetadata;
    } catch {
      return (
        <p className="text-xs text-red-400">{t.metadataReadError}</p>
      );
    }
  } else {
    meta = metadata;
  }

  const hasGps = meta.latitude != null && meta.longitude != null;
  const hasDate = Boolean(meta.dateTime);

  if (!hasGps && !hasDate) {
    return <p className="text-xs text-slate-500">{t.metadataNone}</p>;
  }

  return (
    <ul className="text-sm text-slate-300 space-y-2 ml-6 list-disc">
      {hasDate && (
        <li>
          <strong>{t.exifDate}</strong>{" "}
          <span className="text-slate-400 ml-1">
            {new Date(meta.dateTime!).toLocaleString()}
          </span>
        </li>
      )}
      {hasGps && (
        <li>
          <strong>{t.exifGps}</strong>{" "}
          <a
            href={`https://www.google.com/maps?q=${meta.latitude},${meta.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline ml-1"
          >
            {meta.latitude}, {meta.longitude} ({t.exifGpsMaps})
          </a>
        </li>
      )}
    </ul>
  );
}

function isComplaintUnlocked(
  complaintId: string,
  decryptedTexts: Record<string, string>,
): boolean {
  const decrypted = decryptedTexts[complaintId];
  if (!decrypted) return false;
  if (decrypted.includes("ΓÜá∩╕Å")) return false;
  if (decrypted.includes("BEGIN PGP MESSAGE")) return false;
  return true;
}

function LockedEvidencePlaceholder({ message }: { message: string }) {
  return (
    <div
      className="bg-red-950/40 p-6 rounded-lg border border-red-900/60 text-center"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm text-red-300 font-medium">≡ƒöÆ {message}</p>
    </div>
  );
}

function EvidenceImage({
  storageId,
  enabled,
  loadingText,
  linkText,
}: {
  storageId: string;
  enabled: boolean;
  loadingText: string;
  linkText: string;
}) {
  const url = useQuery(
    api.complaints.getImageUrl,
    enabled ? { storageId: storageId as Id<"_storage"> } : "skip",
  );

  if (!enabled) {
    return null;
  }

  if (!url) {
    return <span className="text-slate-500 text-sm">{loadingText}</span>;
  }

  return (
    <div className="space-y-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={linkText}
        className="max-h-80 w-full rounded-lg border border-slate-600 object-contain bg-black"
      />
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-blue-400 hover:underline text-sm inline-flex items-center gap-1"
      >
        ≡ƒôÄ {linkText}
      </a>
    </div>
  );
}

function statusBadgeClass(status: string | undefined): string {
  switch (status) {
    case "Resolved":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    case "Investigating":
      return "bg-amber-500/20 text-amber-400 border-amber-500/40";
    default:
      return "bg-slate-500/20 text-slate-300 border-slate-500/40";
  }
}

export default function AdminDashboard() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaintId, setSelectedComplaintId] =
    useState<Id<"complaints"> | null>(null);

  const complaints = useQuery(api.complaints.getAllComplaints) || [];
  const updateComplaintStatus = useMutation(
    api.complaints.updateComplaintStatus,
  );

  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [decryptedTexts, setDecryptedTexts] = useState<Record<string, string>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const [generatedPubKey, setGeneratedPubKey] = useState("");
  const [generatedPrivKey, setGeneratedPrivKey] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const t = translations[language].admin;

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getComplaintCategory = (compId: string, fallbackText: string) => {
    const decrypted = decryptedTexts[compId];
    if (decrypted && !decrypted.includes("ΓÜá∩╕Å")) {
      return classifyFraudCategory(decrypted);
    }
    return classifyFraudCategory(fallbackText);
  };

  const getDescriptionPreview = (compId: string, encrypted: string) => {
    const decrypted = decryptedTexts[compId];
    if (decrypted && !decrypted.includes("ΓÜá∩╕Å")) {
      return decrypted.length > 80 ? `${decrypted.slice(0, 80)}ΓÇª` : decrypted;
    }
    return encrypted.length > 48 ? `${encrypted.slice(0, 48)}ΓÇª` : encrypted;
  };

  const selectedComplaint = useMemo(
    () => complaints.find((c) => c._id === selectedComplaintId) ?? null,
    [complaints, selectedComplaintId],
  );

  useEffect(() => {
    if (!selectedComplaintId) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedComplaintId(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedComplaintId]);

  const filteredComplaints = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return complaints;

    return complaints.filter((comp) => {
      const decrypted = decryptedTexts[comp._id]?.toLowerCase() ?? "";
      const category = getLocalizedFraudCategory(
        getComplaintCategory(comp._id, comp.description),
        language,
      ).toLowerCase();
      return (
        comp.case_key.toLowerCase().includes(q) ||
        decrypted.includes(q) ||
        category.includes(q) ||
        (comp.status ?? "pending").toLowerCase().includes(q)
      );
    });
  }, [complaints, searchQuery, decryptedTexts, language]);

  const generateKeys = async () => {
    const { privateKey, publicKey } = await openpgp.generateKey({
      type: "ecc",
      curve: "ed25519" as any,
      userIDs: [{ name: "CID Investigator", email: "cid@police.lk" }],
    });
    setGeneratedPubKey(publicKey);
    setGeneratedPrivKey(privateKey);
    showToast(t.toastKeysGenerated, "success");
  };

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

      const newDecrypted: Record<string, string> = {};
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
            newDecrypted[comp._id] = decrypted as string;
            successCount++;
          } catch {
            newDecrypted[comp._id] = `ΓÜá∩╕Å ${t.errorDecryptOldKey}`;
          }
        } else {
          newDecrypted[comp._id] = comp.description;
        }
      }

      setDecryptedTexts(newDecrypted);

      if (successCount === 0 && complaints.length > 0) {
        setError(t.errorWrongKeyNoMatch);
      } else {
        showToast(t.toastDecryptSuccess, "success");
      }
    } catch (err) {
      console.error("Key Error:", err);
      setError(t.errorPrivateKeyInvalid);
    }
  };

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
      showToast(t.toastUpdateSuccess, "success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      showToast(`${t.toastUpdateError} ${message}`, "error");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8 relative pt-20">
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

      <div className="max-w-6xl mx-auto space-y-8 pt-12">
        <h1 className="text-3xl font-bold text-white border-b border-slate-700 pb-4">
          ≡ƒ¢í∩╕Å {t.title}
        </h1>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold text-blue-400 mb-2">
            {t.keyGeneratorTitle}
          </h2>
          <p className="text-sm text-slate-400 mb-4">{t.keyGeneratorDesc}</p>
          <button
            type="button"
            onClick={() => void generateKeys()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold transition-colors"
          >
            {t.generateKeysButton}
          </button>

          {generatedPubKey && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-green-400 font-bold mb-1">
                  {t.publicKeyLabel}
                </label>
                <textarea
                  readOnly
                  value={generatedPubKey}
                  className="w-full h-32 bg-slate-950 text-xs text-green-300 p-2 rounded border border-slate-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-red-400 font-bold mb-1">
                  {t.privateKeyLabel}
                </label>
                <textarea
                  readOnly
                  value={generatedPrivKey}
                  className="w-full h-32 bg-slate-950 text-xs text-red-300 p-2 rounded border border-slate-700 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold text-emerald-400 mb-2">
            {t.decryptTitle}
          </h2>
          <p className="text-sm text-slate-400 mb-4">{t.decryptDesc}</p>
          <textarea
            value={privateKeyInput}
            onChange={(e) => setPrivateKeyInput(e.target.value)}
            className="w-full h-24 bg-slate-950 border border-slate-600 text-slate-300 p-3 rounded mb-4 font-mono text-xs focus:border-emerald-500 focus:outline-none"
            placeholder={t.privateKeyPlaceholder}
          />
          <button
            type="button"
            onClick={() => void handleDecrypt()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded font-bold w-full transition-colors"
          >
            ≡ƒöô {t.decryptButton}
          </button>
          {error && (
            <p className="text-red-400 mt-3 text-sm font-bold">{error}</p>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">{t.complaintsSectionTitle}</h2>

          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-slate-950 border border-slate-600 text-slate-200 px-4 py-3 rounded-xl text-sm focus:border-emerald-500 focus:outline-none placeholder:text-slate-500"
          />

          {complaints.length === 0 && (
            <p className="text-slate-500">{t.noComplaints}</p>
          )}

          {complaints.length > 0 && filteredComplaints.length === 0 && (
            <p className="text-slate-500">{t.noSearchResults}</p>
          )}

          {filteredComplaints.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-800 text-slate-300 uppercase text-xs tracking-wide">
                  <tr>
                    <th className="px-4 py-3 font-bold">{t.colComplaintId}</th>
                    <th className="px-4 py-3 font-bold">{t.colDescription}</th>
                    <th className="px-4 py-3 font-bold">{t.colCategory}</th>
                    <th className="px-4 py-3 font-bold">{t.colStatus}</th>
                    <th className="px-4 py-3 font-bold text-center">
                      {t.colActions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 bg-slate-900/50">
                  {filteredComplaints.map((comp) => {
                    const categoryKey = getComplaintCategory(
                      comp._id,
                      comp.description,
                    );
                    return (
                      <tr
                        key={comp._id}
                        className="hover:bg-slate-800/60 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-emerald-400 font-bold">
                          {comp.case_key}
                        </td>
                        <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                          {getDescriptionPreview(comp._id, comp.description)}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {getLocalizedFraudCategory(categoryKey, language)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadgeClass(comp.status)}`}
                          >
                            {getAdminStatusLabel(comp.status, language)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedComplaintId(comp._id)}
                            className="text-emerald-400 hover:text-emerald-300 font-semibold text-xs px-3 py-1.5 rounded-lg border border-emerald-500/40 hover:bg-emerald-500/10 transition-colors"
                          >
                            {t.viewDetails}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        {selectedComplaint && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            role="dialog"
            aria-modal="true"
            aria-labelledby="complaint-detail-title"
            onClick={() => setSelectedComplaintId(null)}
          >
            <div
              className="bg-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-emerald-500/40 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex justify-between items-center gap-4 border-b border-slate-700 bg-slate-800 px-6 py-4">
                <h2
                  id="complaint-detail-title"
                  className="font-mono text-emerald-400 font-bold text-lg"
                >
                  {t.caseKeyPrefix} {selectedComplaint.case_key}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedComplaintId(null)}
                  className="text-slate-400 hover:text-white text-2xl leading-none px-2"
                  aria-label="Close"
                >
                  ├ù
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-400">
                  {new Date(selectedComplaint._creationTime).toLocaleString(
                    language === "si" ? "si-LK" : "en-GB",
                  )}
                </p>

                <div>
                  <h3 className="text-sm font-bold text-slate-400 mb-1">
                    {t.complaintDescriptionLabel}
                  </h3>
                  {decryptedTexts[selectedComplaint._id] ? (
                    <div
                      className={`p-4 rounded font-medium whitespace-pre-wrap ${
                        decryptedTexts[selectedComplaint._id].includes("ΓÜá∩╕Å")
                          ? "bg-red-950/50 text-red-400 border border-red-900"
                          : "bg-slate-900 text-green-400 border border-slate-700"
                      }`}
                    >
                      {decryptedTexts[selectedComplaint._id]}
                    </div>
                  ) : (
                    <div className="bg-slate-950 p-4 rounded text-slate-500 font-mono text-xs break-all border border-slate-700">
                      {selectedComplaint.description}
                    </div>
                  )}
                </div>

                {(() => {
                  const complaintUnlocked = isComplaintUnlocked(
                    selectedComplaint._id,
                    decryptedTexts,
                  );
                  const hasSensitiveEvidence = Boolean(
                    selectedComplaint.evidence_path ||
                      selectedComplaint.metadata,
                  );

                  if (!hasSensitiveEvidence) {
                    return null;
                  }

                  if (!complaintUnlocked) {
                    return (
                      <LockedEvidencePlaceholder
                        message={t.lockedEvidenceMessage}
                      />
                    );
                  }

                  return (
                    <>
                      {selectedComplaint.evidence_path ? (
                        <div>
                          <h3 className="text-sm font-bold text-slate-400 mb-2">
                            {t.evidenceLinkText}
                          </h3>
                          <EvidenceImage
                            enabled
                            storageId={selectedComplaint.evidence_path}
                            loadingText={t.evidenceLinkLoading}
                            linkText={t.evidenceLinkText}
                          />
                        </div>
                      ) : null}

                      {selectedComplaint.metadata ? (
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                          <h3 className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-2">
                            <span>≡ƒôì</span> {t.exifPanelTitle}
                          </h3>
                          <EvidenceMetadataPanel
                            metadata={selectedComplaint.metadata}
                          />
                        </div>
                      ) : null}
                    </>
                  );
                })()}

                {selectedComplaint.reporter_reply && (
                  <div className="bg-emerald-900/30 p-4 rounded-lg border border-emerald-800/50">
                    <h3 className="text-xs font-bold text-emerald-400 mb-1 uppercase">
                      {t.reporterReplyLabel}
                    </h3>
                    <p className="text-emerald-100 text-sm">
                      {selectedComplaint.reporter_reply}
                    </p>
                  </div>
                )}

                {decryptedTexts[selectedComplaint._id] &&
                !decryptedTexts[selectedComplaint._id].includes("ΓÜá∩╕Å") &&
                !decryptedTexts[selectedComplaint._id].includes(
                  "BEGIN PGP MESSAGE",
                ) ? (
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2">
                      <span className="text-blue-500">Γ£ì∩╕Å</span>{" "}
                      {t.updateStatusTitle}
                    </h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        void handleUpdate(
                          selectedComplaint._id,
                          (form.elements.namedItem("status") as HTMLSelectElement)
                            .value,
                          (form.elements.namedItem("reply") as HTMLTextAreaElement)
                            .value,
                        );
                      }}
                      className="space-y-3"
                    >
                      <select
                        name="status"
                        defaultValue={selectedComplaint.status ?? "Pending"}
                        className="bg-slate-800 text-white p-2 rounded w-full border border-slate-600 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="Pending">{t.statusPending}</option>
                        <option value="Investigating">{t.statusInReview}</option>
                        <option value="Resolved">{t.statusResolved}</option>
                      </select>
                      <textarea
                        name="reply"
                        defaultValue={selectedComplaint.investigator_reply || ""}
                        placeholder={t.replyPlaceholder}
                        className="w-full bg-slate-800 text-white p-2 rounded border border-slate-600 text-sm focus:border-blue-500 focus:outline-none"
                        rows={2}
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold transition-colors w-full"
                      >
                        {t.updateButton}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-red-950/30 p-4 rounded-lg border border-red-900/50 text-center">
                    <p className="text-xs text-red-400 font-medium">
                      ≡ƒöÆ {t.lockedMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">{t.auditLogTitle}</h2>
          <p className="text-slate-500 text-sm">{t.auditLogEmpty}</p>
        </div>
      </div>
    </div>
  );
}
