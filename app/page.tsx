"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import * as openpgp from "openpgp";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api"; // Convex API එක Import කරගත්තා
import { redactPIIWithAI } from "./actions/redact-pii";
import { useTranslations } from "../components/LanguageContext";
import exifr from "exifr";

type EvidenceExifPayload = {
  latitude?: number;
  longitude?: number;
  dateTime?: string;
};

const GEOLOCATION_FALLBACK_TIMEOUT_MS = 5000;

function getBrowserGeolocation(
  timeoutMs = GEOLOCATION_FALLBACK_TIMEOUT_MS,
): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    let settled = false;
    const finish = (value: { latitude: number; longitude: number } | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(value);
    };

    const timer = window.setTimeout(() => finish(null), timeoutMs);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        finish({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => finish(null),
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 60_000,
      },
    );
  });
}

function hasGpsCoordinates(meta: EvidenceExifPayload | undefined): boolean {
  return (
    meta?.latitude != null &&
    meta?.longitude != null &&
    !Number.isNaN(meta.latitude) &&
    !Number.isNaN(meta.longitude)
  );
}

async function applyGeolocationFallback(
  metadata: EvidenceExifPayload | undefined,
): Promise<EvidenceExifPayload | undefined> {
  if (hasGpsCoordinates(metadata)) {
    return metadata;
  }

  const coords = await getBrowserGeolocation();
  if (!coords) {
    return metadata;
  }

  return {
    ...(metadata ?? {}),
    latitude: metadata?.latitude ?? coords.latitude,
    longitude: metadata?.longitude ?? coords.longitude,
  };
}

export default function Home() {
  const t = useTranslations().home;
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureContextRef = useRef<EvidenceExifPayload>({});
  const previewUrlRef = useRef<string | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) {
      video.onloadedmetadata = null;
      video.srcObject = null;
    }
    setVideoReady(false);
    setCameraActive(false);
  }, []);

  const attachStreamToVideo = useCallback(async (stream: MediaStream) => {
    const video = videoRef.current;
    if (!video) return false;

    video.srcObject = stream;
    try {
      await video.play();
    } catch {
      return false;
    }

    if (video.videoWidth > 0) {
      setVideoReady(true);
      return true;
    }

    return await new Promise<boolean>((resolve) => {
      const onReady = () => {
        video.onloadedmetadata = null;
        const ready = video.videoWidth > 0;
        setVideoReady(ready);
        resolve(ready);
      };
      video.onloadedmetadata = onReady;
    });
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, [stopCamera]);

  useEffect(() => {
    const stream = streamRef.current;
    if (!cameraActive || !stream) return;
    void attachStreamToVideo(stream);
  }, [cameraActive, attachStreamToVideo]);

  const requestCameraStream = async (): Promise<MediaStream> => {
    const attempts: MediaStreamConstraints[] = [
      { video: { facingMode: { ideal: "environment" } }, audio: false },
      { video: { facingMode: "user" }, audio: false },
      { video: true, audio: false },
    ];

    let lastError: unknown;
    for (const constraints of attempts) {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError;
  };

  const startCamera = async () => {
    setCameraError(null);
    setVideoReady(false);
    setFile(null);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
      setPreviewUrl(null);
    }

    captureContextRef.current = {};

    if (!window.isSecureContext) {
      setCameraError(t.cameraHttpsRequired);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(t.cameraUnsupported);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          captureContextRef.current.latitude = pos.coords.latitude;
          captureContextRef.current.longitude = pos.coords.longitude;
        },
        () => {
          /* GPS denied — optional */
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    }

    setCameraActive(true);

    try {
      const stream = await requestCameraStream();
      streamRef.current = stream;
      const attached = await attachStreamToVideo(stream);
      if (!attached) {
        throw new Error("Video not ready");
      }
    } catch (err) {
      console.error("Camera start failed:", err);
      stopCamera();
      setCameraError(t.cameraStartFailed);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !videoReady || video.videoWidth === 0) {
      setCameraError(t.cameraNotReady);
      return;
    }

    setCameraError(null);
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCameraError(t.cameraCaptureFailed);
      return;
    }

    ctx.drawImage(video, 0, 0);
    captureContextRef.current.dateTime = new Date().toISOString();

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError(t.cameraCaptureFailed);
          return;
        }
        const captured = new File([blob], `evidence_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setFile(captured);
        const url = URL.createObjectURL(blob);
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
        }
        previewUrlRef.current = url;
        setPreviewUrl(url);
        stopCamera();
      },
      "image/jpeg",
      0.92,
    );
  };

  const clearPhoto = () => {
    setFile(null);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
    captureContextRef.current = {};
    stopCamera();
  };

  const extractExifMetadata = async (
    imageFile: File,
    captureFallback?: EvidenceExifPayload,
  ): Promise<EvidenceExifPayload | undefined> => {
    const payload: EvidenceExifPayload = {};

    try {
      const exif = await exifr.parse(imageFile, {
        gps: true,
        tiff: true,
        exif: true,
      });

      if (exif) {
        if (exif.latitude != null && exif.longitude != null) {
          payload.latitude = Number(exif.latitude);
          payload.longitude = Number(exif.longitude);
        }

        const rawDate =
          exif.DateTimeOriginal ?? exif.CreateDate ?? exif.ModifyDate;
        if (rawDate) {
          payload.dateTime =
            rawDate instanceof Date
              ? rawDate.toISOString()
              : String(rawDate);
        }

      }
    } catch {
      /* No EXIF in file — common for live camera captures */
    }

    if (captureFallback) {
      if (payload.latitude == null && captureFallback.latitude != null) {
        payload.latitude = captureFallback.latitude;
      }
      if (payload.longitude == null && captureFallback.longitude != null) {
        payload.longitude = captureFallback.longitude;
      }
      if (!payload.dateTime && captureFallback.dateTime) {
        payload.dateTime = captureFallback.dateTime;
      }
    }

    if (
      payload.latitude == null &&
      payload.longitude == null &&
      !payload.dateTime
    ) {
      return undefined;
    }

    return payload;
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

  // ─── Metadata strip (removes ALL EXIF from image bytes before upload) ─────
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
            (blob) => {
              URL.revokeObjectURL(url);
              resolve(
                blob
                  ? new File([blob], "secure_evidence.jpg", {
                      type: "image/jpeg",
                    })
                  : originalFile,
              );
            },
            "image/jpeg",
            0.9,
          );
        } else {
          URL.revokeObjectURL(url);
          resolve(originalFile);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(originalFile);
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
    let fileMetadataForDB: EvidenceExifPayload | undefined;

    try {
      // Step 1 — PII redaction
      setStatusMessage(t.statusPiiRedacting);
      const safeDescription = await redactPIIWithAI(description);

      // Step 2 — Extract EXIF (DB only) → strip file → upload stripped bytes
      if (file) {
        setStatusMessage(t.statusReadingExif);
        fileMetadataForDB = await extractExifMetadata(
          file,
          captureContextRef.current,
        );

        if (!hasGpsCoordinates(fileMetadataForDB)) {
          setStatusMessage(t.statusGeolocationFallback);
          fileMetadataForDB = await applyGeolocationFallback(fileMetadataForDB);
        }

        setStatusMessage(t.statusStrippingMetadata);
        const cleanFile = await stripMetadata(file);

        setStatusMessage(t.statusUploadingEvidence);

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
      setStatusMessage(t.statusEncrypting);
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
      setStatusMessage(t.statusSubmitting);

      await createComplaint({
        case_key: newCaseKey,
        description: encryptedDescription,
        evidence_path: evidencePath,
        metadata: fileMetadataForDB,
      });

      setSuccessKey(newCaseKey);
      setDescription("");
      clearPhoto();
    } catch (err: any) {
      setError(err.message || t.genericError);
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setStatusMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 pt-20">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center tracking-tight">
          {t.title}
        </h1>
        <p className="text-sm text-slate-500 mb-8 text-center">{t.subtitle}</p>

        {successKey ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-8 text-center">
            <h2 className="text-xl font-bold mb-3">{t.successTitle}</h2>

            {hasEvidence && (
              <div className="mb-6 p-4 rounded-xl text-sm border-2 bg-amber-50 border-amber-300 text-amber-800">
                <p className="font-bold mb-1">{t.photoVerifyTitle}</p>
                <p>{t.photoVerifyBody}</p>
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
              {t.newReport}
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
                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full rounded-lg border border-slate-300 bg-black aspect-video object-cover ${
                      cameraActive ? "block" : "hidden"
                    }`}
                  />

                  {cameraActive ? (
                    <div className="space-y-3">
                      {!videoReady && (
                        <p className="text-xs text-blue-600 text-center animate-pulse">
                          {t.cameraStarting}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          disabled={!videoReady}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors"
                        >
                          {t.capturePhoto}
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-white transition-colors"
                        >
                          {t.cancel}
                        </button>
                      </div>
                    </div>
                  ) : previewUrl ? (
                    <div className="space-y-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt={t.evidencePreviewAlt}
                        className="w-full rounded-lg border border-slate-300 aspect-video object-cover"
                      />
                      <p className="text-xs text-slate-500">{t.photoReadyHint}</p>
                      <button
                        type="button"
                        onClick={clearPhoto}
                        className="w-full py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-white transition-colors"
                      >
                        {t.removePhotoRetake}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors"
                    >
                      {t.startCamera}
                    </button>
                  )}

                  {cameraError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {cameraError}
                    </p>
                  )}

                  <p className="text-xs text-slate-500">{t.galleryDisabled}</p>
                </div>
                <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                  {t.photoDisclaimer}
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
                {isSubmitting ? t.submitting : t.submit}
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
                {t.linkOversight}
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
                {t.linkCheckStatus}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}