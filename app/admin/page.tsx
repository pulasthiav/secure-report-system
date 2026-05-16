"use client";

import { useState } from "react";
import * as openpgp from "openpgp";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type EvidenceExifMetadata = {
  latitude?: number;
  longitude?: number;
  dateTime?: string;
  software?: string;
};

function EvidenceMetadataPanel({ metadataJson }: { metadataJson: string }) {
  let meta: EvidenceExifMetadata;
  try {
    meta = JSON.parse(metadataJson) as EvidenceExifMetadata;
  } catch {
    return (
      <p className="text-xs text-red-400">
        Metadata කියවීමේ දෝෂයක් මතු විය.
      </p>
    );
  }

  const hasGps = meta.latitude != null && meta.longitude != null;
  const hasDate = Boolean(meta.dateTime);
  const hasSoftware = Boolean(meta.software);

  if (!hasGps && !hasDate && !hasSoftware) {
    return (
      <p className="text-xs text-slate-500">
        ඡායාරූපයේ EXIF තොරතුරු ලබාගත නොහැකි විය.
      </p>
    );
  }

  return (
    <ul className="text-sm text-slate-300 space-y-2 ml-6 list-disc">
      {hasDate && (
        <li>
          <strong>ලබාගත් දිනය හා වේලාව:</strong>{" "}
          <span className="text-slate-400 ml-1">
            {new Date(meta.dateTime!).toLocaleString()}
          </span>
        </li>
      )}
      {hasGps && (
        <li>
          <strong>ස්ථානය (GPS):</strong>{" "}
          <a
            href={`https://www.google.com/maps?q=${meta.latitude},${meta.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline ml-1"
          >
            {meta.latitude}, {meta.longitude} (Maps වලින් බලන්න)
          </a>
        </li>
      )}
      {hasSoftware && (
        <li>
          <strong>උපාංගය / මෘදුකාංගය:</strong>{" "}
          <span className="text-slate-400 ml-1">{meta.software}</span>
        </li>
      )}
    </ul>
  );
}

// සාක්ෂි (Evidence) වල URL එක ගන්න හදපු පොඩි Component එකක්
function EvidenceLink({ storageId }: { storageId: string }) {
  const url = useQuery(api.complaints.getImageUrl, {
    storageId: storageId as Id<"_storage">,
  });

  if (!url)
    return (
      <span className="text-slate-500 text-sm">ලිංක් එක සූදානම් කරමින්...</span>
    );

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-blue-400 hover:underline flex items-center"
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

  // key create
  const [generatedPubKey, setGeneratedPubKey] = useState("");
  const [generatedPrivKey, setGeneratedPrivKey] = useState("");

  // Toast Notification 
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

  // key
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
      let keyString = privateKeyInput.replace(/\r\n/g, "\n").trim();

      if (!keyString) {
        setError(
          "Private Key එක හිස්ය. කරුණාකර යතුරු නිර්මාණය කර ලැබූ Private Key එක මුළුමනින්ම අලවන්න.",
        );
        return;
      }

      if (keyString.includes("-----BEGIN PGP PUBLIC KEY BLOCK-----")) {
        setError(
          "මෙය Public Key එකකි. Decrypt කිරීමට Private Key (රතු පෙට්ටියේ ඇති යතුර) භාවිතා කරන්න.",
        );
        return;
      }

      if (!keyString.includes("-----BEGIN PGP PRIVATE KEY BLOCK-----")) {
        keyString = `-----BEGIN PGP PRIVATE KEY BLOCK-----\n\n${keyString}\n-----END PGP PRIVATE KEY BLOCK-----`;
      }

      const key = await openpgp.readKey({ armoredKey: keyString });
      if (!key.isPrivate()) {
        setError(
          "මෙම යතුර Private Key එකක් නොවේ. කරුණාකර Private Key එක නැවත පිටපත් කර අලවන්න.",
        );
        return;
      }
      const privKey = key;

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
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8 relative">
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

      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white border-b border-slate-700 pb-4">
          🛡️ විමර්ශක පුවරුව (CID Dashboard)
        </h1>

        {/* --- Key Generator Section --- */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold text-blue-400 mb-2">
            1. ආරක්ෂිත යතුරු නිර්මාණය (Key Generator)
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            පද්ධතියට අලුත් නම් පමණක් මෙතැනින් Public සහ Private යතුරු සාදාගන්න.
          </p>
          <button
            onClick={generateKeys}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold transition-colors"
          >
            නව යතුරු නිර්මාණය කරන්න
          </button>

          {generatedPubKey && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-green-400 font-bold mb-1">
                  Public Key (Website එකට දාන්න):
                </label>
                <textarea
                  readOnly
                  value={generatedPubKey}
                  className="w-full h-32 bg-slate-950 text-xs text-green-300 p-2 rounded border border-slate-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-red-400 font-bold mb-1">
                  Private Key (ඔබ ළඟ තබාගන්න):
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

        {/* --- Decryption Section --- */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold text-emerald-400 mb-2">
            2. පැමිණිලි කියවීම (Decryption)
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            ලොක් කර ඇති පැමිණිලි කියවීම සඳහා ඔබගේ Private Key එක පහතින් ඇතුළත්
            කරන්න.
          </p>
          <textarea
            value={privateKeyInput}
            onChange={(e) => setPrivateKeyInput(e.target.value)}
            className="w-full h-24 bg-slate-950 border border-slate-600 text-slate-300 p-3 rounded mb-4 font-mono text-xs focus:border-emerald-500 focus:outline-none"
            placeholder="ඔබගේ Private Key එක මෙතැන අලවන්න..."
          />
          <button
            onClick={handleDecrypt}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded font-bold w-full transition-colors"
          >
            🔓 Unlock & Decrypt Complaints
          </button>
          {error && (
            <p className="text-red-400 mt-3 text-sm font-bold">{error}</p>
          )}
        </div>

        {/* --- Complaints List --- */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">
            ලැබී ඇති පැමිණිලි
          </h2>
          {complaints.length === 0 && (
            <p className="text-slate-500">තාමත් පැමිණිලි කිසිවක් ලැබී නොමැත.</p>
          )}
          {complaints.map((comp) => (
            <div
              key={comp._id}
              className="bg-slate-800 p-6 rounded-xl border border-slate-700"
            >
              <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                <span className="font-mono text-emerald-400 font-bold text-lg">
                  Key: {comp.case_key}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(comp._creationTime).toLocaleString()}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-400 mb-1">
                  පැමිණිල්ලේ විස්තරය:
                </h3>
                {decryptedTexts[comp._id] ? (
                  <div
                    className={`p-4 rounded font-medium whitespace-pre-wrap ${
                      decryptedTexts[comp._id].includes("⚠️")
                        ? "bg-red-950/50 text-red-400 border border-red-900"
                        : "bg-slate-900 text-green-400 border border-slate-700"
                    }`}
                  >
                    {decryptedTexts[comp._id]}
                  </div>
                ) : (
                  <div className="bg-slate-950 p-4 rounded text-slate-500 font-mono text-xs break-all border border-slate-700">
                    {comp.description}
                  </div>
                )}
              </div>

              {comp.evidence_path && (
                <div className="mb-4 text-sm">
                  <EvidenceLink storageId={comp.evidence_path} />
                </div>
              )}

              {/* 💡 අලුතින් එකතු කළ Metadata පෙන්වන කොටස */}
              {comp.metadata && (
                <div className="mb-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                  <h3 className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-2">
                    <span>📍</span> ඡායාරූපයේ තොරතුරු (EXIF Metadata)
                  </h3>
                  <EvidenceMetadataPanel metadataJson={comp.metadata} />
                </div>
              )}

              {comp.reporter_reply && (
                <div className="mb-4 bg-emerald-900/30 p-4 rounded-lg border border-emerald-800/50">
                  <h3 className="text-xs font-bold text-emerald-400 mb-1 uppercase">
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
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 animate-fade-in mt-4">
                  <h3 className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2">
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
                      className="bg-slate-800 text-white p-2 rounded w-full border border-slate-600 focus:border-blue-500 focus:outline-none"
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
                      className="w-full bg-slate-800 text-white p-2 rounded border border-slate-600 text-sm focus:border-blue-500 focus:outline-none"
                      rows={2}
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold transition-colors w-full"
                    >
                      Update (යාවත්කාලීන කරන්න)
                    </button>
                  </form>
                </div>
              ) : (
                /* Decrypt කරලා නැත්නම් පෙන්වන කොටස */
                <div className="bg-red-950/30 p-4 rounded-lg border border-red-900/50 text-center mt-4">
                  <p className="text-xs text-red-400 font-medium">
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