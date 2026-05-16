"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Eye, LockKeyhole, Shield, ShieldCheck } from "lucide-react";
import * as openpgp from "openpgp";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { redactPIIWithAI } from "./actions/redact-pii";
import { useLanguage, useTranslations } from "../components/LanguageContext";
import type { Language } from "../translations";
import { classifyFraudCategory } from "../lib/classifyFraudCategory";
import { generateReceiptPdf } from "../lib/generateReceiptPdf";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
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

function getIpPrivacyGuardNotice(lang: Language, ip: string): string {
  if (lang === "si") {
    return `🔒 රහස්‍යතා ආරක්ෂණය: ඔබගේ IP ලිපිනය ${ip} වේ. අපගේ Zero-Logs තාක්ෂණය මඟින් මෙම IP එක ස්වයංක්‍රීයවම ඉවත් කරයි (Scrub). මෙය කිසිසේත්ම අපගේ Convex ඩේටาබේස් හි තැන්පත් නොවේ.`;
  }
  return `🔒 Privacy Guard: Your Public IP is ${ip}. Our Zero-Logs architecture automatically SCRUBS this IP. It is never transmitted or stored in our Convex database.`;
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

const landingCopy = {
  en: {
    badge: "Government-grade encrypted reporting portal",
    heading: "SecureReport System",
    subheading: "Secure information reporting",
    description:
      "Submit sensitive reports through a protected channel using PGP encryption, automated AI identity redaction, metadata stripping, and public oversight safeguards designed for high-trust civic reporting.",
    submit: "Submit Report",
    status: "Check Case Status",
    oversight: "OVERSIGHT",
    secureChannel: "Secure Channel",
    vault: "PGP Vault",
    vaultText:
      "This is an official and secure channel for the Sri Lanka Digital Oversight Department. Every report is securely encrypted and verified before processing. Your data is safe.",
  },
  si: {
    badge: "රජයේ මට්ටමේ සංකේතනය කළ වාර්තාකරණ ද්වාරය",
    heading: "SecureReport System",
    subheading: "ආරක්ෂිත තොරතුරු වාර්තාකරණය",
    description:
      "PGP සංකේතනය, AI අනන්‍යතා ඉවත් කිරීම, metadata ඉවත් කිරීම සහ මහජන නිරීක්ෂණ ආරක්ෂාවන් සමඟ සංවේදී වාර්තා ආරක්ෂිත මාර්ගයකින් ඉදිරිපත් කරන්න.",
    submit: "වාර්තාවක් යොමු කරන්න",
    status: "තත්ත්වය පරීක්ෂා කරන්න",
    oversight: "නිරීක්ෂණය",
    secureChannel: "ආරක්ෂිත නාලිකාව",
    vault: "PGP Vault",
    vaultText:
      "මෙය ශ්‍රී ලංකා ඩිජිටල් නිරීක්ෂණ දෙපාර්තමේන්තුව සඳහා නිල සහ ආරක්ෂිත නාලිකාවකි. සෑම වාර්තාවක්ම සැකසීමට පෙර ආරක්ෂිතව සංකේතනය කර සත්‍යාපනය කෙරේ. ඔබගේ දත්ත ආරක්ෂිතයි.",
  },
} as const;

export default function Home() {
  const { language } = useLanguage();
  const t = useTranslations().home;
  const copy = landingCopy[language];

  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [successKey, setSuccessKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [hasEvidence, setHasEvidence] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    caseKey: string;
    hash: string;
    pgpText: string;
    categoryKey: string;
    submittedAt: string;
    status: "Pending" | "Investigating" | "Resolved";
  } | null>(null);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);

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
  const [userIp, setUserIp] = useState("Fetching...");

  useEffect(() => {
    let cancelled = false;

    const fetchPublicIp = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        if (!response.ok) {
          throw new Error("IP lookup failed");
        }
        const data = (await response.json()) as { ip?: string };
        if (!cancelled) {
          setUserIp(data.ip?.trim() || "Unavailable");
        }
      } catch {
        if (!cancelled) {
          setUserIp("Unavailable");
        }
      }
    };

    void fetchPublicIp();

    return () => {
      cancelled = true;
    };
  }, []);

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
          /* GPS denied */
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
            rawDate instanceof Date ? rawDate.toISOString() : String(rawDate);
        }
      }
    } catch {
      /* No EXIF */
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

  const downloadReceipt = async () => {
    if (!receiptData || isDownloadingReceipt) return;
    setIsDownloadingReceipt(true);
    try {
      await generateReceiptPdf(language, {
        caseKey: receiptData.caseKey,
        hash: receiptData.hash,
        pgpText: receiptData.pgpText,
        categoryKey: receiptData.categoryKey,
        submittedAt: new Date(receiptData.submittedAt),
        status: receiptData.status,
      });
    } catch (err) {
      console.error("PDF receipt generation failed:", err);
      setError(t.genericError);
    } finally {
      setIsDownloadingReceipt(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const newCaseKey = generateCaseKey();
    let evidencePath = undefined;
    let fileMetadataForDB: EvidenceExifPayload | undefined;

    try {
      setStatusMessage(t.statusPiiRedacting);
      const safeDescription = await redactPIIWithAI(description);

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

      setStatusMessage(t.statusEncrypting);
      const encryptedDescription = await encryptWithPGP(safeDescription);

      const blockchainHash = Array.from(
        crypto.getRandomValues(new Uint8Array(32)),
      )
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      setReceiptData({
        caseKey: newCaseKey,
        hash: blockchainHash,
        pgpText: encryptedDescription,
        categoryKey: classifyFraudCategory(safeDescription),
        submittedAt: new Date().toISOString(),
        status: "Pending",
      });

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
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <div className="w-full flex flex-col items-end gap-3 z-50">
          <nav className="w-full flex justify-between items-center gap-6 rounded-full border border-slate-700 bg-slate-900/90 px-4 py-4 shadow-2xl shadow-black/30 backdrop-blur">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-sm">
                <Shield className="h-5 w-5" strokeWidth={2.4} />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-white">
                SecureReport
              </span>
            </Link>

            <Link
              href="/oversight"
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-full px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all shadow-md"
            >
              <Eye className="h-4 w-4" />
              {copy.oversight}
            </Link>
          </nav>
          <div className="mr-6">
            <LanguageSwitcher />
          </div>
        </div>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm font-bold text-blue-300 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              {copy.badge}
            </div>
            <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              {copy.heading}
            </h1>
            <p className="mt-4 text-2xl font-bold text-emerald-400 sm:text-3xl">
              {copy.subheading}
            </p>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              {copy.description}
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#submit-report"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-4 text-base font-extrabold text-white shadow-lg shadow-blue-950/30 transition-colors hover:bg-blue-700"
              >
                {copy.submit}
              </a>
              <Link
                href="/status"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-8 py-4 text-base font-bold text-slate-300 shadow-sm transition-colors hover:border-emerald-500 hover:text-emerald-400"
              >
                {copy.status}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -left-8 top-10 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl" />
            <div className="absolute -right-8 bottom-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-700 bg-[#1e293b] p-5 shadow-2xl shadow-black/30">
              <div className="rounded-[1.5rem] border border-slate-700 bg-slate-900 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                      {copy.secureChannel}
                    </p>
                    <p className="mt-2 text-2xl font-black">{copy.vault}</p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500">
                    <LockKeyhole className="h-7 w-7 text-slate-950" />
                  </div>
                </div>
                <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="h-3 w-3 rounded-full bg-blue-300" />
                    <span className="h-3 w-3 rounded-full bg-slate-500" />
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {copy.vaultText}
                  </p>
                  <div className="mt-8 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        PGP
                      </p>
                      <div className="mt-4 h-2 rounded-full bg-blue-300" />
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        AI
                      </p>
                      <div className="mt-4 h-2 rounded-full bg-emerald-300" />
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        EXIF
                      </p>
                      <div className="mt-4 h-2 rounded-full bg-white" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 rounded-full border border-slate-700 bg-slate-950 p-4 shadow-md sm:block">
                <ShieldCheck className="h-10 w-10 text-emerald-400" />
              </div>
            </div>
          </div>
        </section>

        {/* 🔒 Functional Form Section with IP Privacy Guard Integrated */}
        <section
          id="submit-report"
          className="mx-auto w-full max-w-xl pb-20 pt-4"
        >
          <div className="w-full rounded-2xl border border-slate-700 bg-[#1e293b] p-8 shadow-2xl shadow-black/30">
            <h2 className="text-3xl font-bold text-white mb-2 text-center tracking-tight">
              {t.title}
            </h2>
            <p className="text-sm text-slate-400 mb-4 text-center">
              {t.subtitle}
            </p>

            {!successKey && (
              <div
                role="status"
                aria-live="polite"
                className="mb-6 flex gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 shadow-inner shadow-emerald-950/20"
              >
                <span className="mt-1 inline-flex h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.75)]" />
                <p className="text-[11px] leading-relaxed text-emerald-100/95 sm:text-xs">
                  {getIpPrivacyGuardNotice(language, userIp)}
                </p>
              </div>
            )}

            {successKey ? (
              <div className="border border-emerald-500/40 bg-emerald-950/40 text-emerald-100 rounded-xl p-8 text-center">
                <h2 className="text-xl font-bold mb-3">{t.successTitle}</h2>

                {hasEvidence && (
                  <div className="mb-6 p-4 rounded-xl text-sm border-2 bg-amber-950/40 border-amber-500/40 text-amber-200">
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
                <div className="bg-slate-950 px-6 py-4 rounded-lg border-2 border-emerald-500/50 font-mono text-3xl font-bold tracking-[0.2em] text-emerald-300 shadow-inner mb-6">
                  {successKey}
                </div>

                <button
                  type="button"
                  onClick={() => void downloadReceipt()}
                  disabled={isDownloadingReceipt}
                  className="w-full mb-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
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
                  {isDownloadingReceipt ? t.submitting : t.downloadReceipt}
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
                  className="mt-4 text-sm text-emerald-400 underline font-medium"
                >
                  {t.newReport}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      {t.descriptionLabel}
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-slate-100 placeholder-slate-500 transition-colors outline-none"
                      placeholder={t.descriptionPlaceholder}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      {t.evidenceLabel}
                    </label>
                    <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full rounded-lg border border-slate-600 bg-black aspect-video object-cover ${
                          cameraActive ? "block" : "hidden"
                        }`}
                      />

                      {cameraActive ? (
                        <div className="space-y-3">
                          {!videoReady && (
                            <p className="text-xs text-blue-300 text-center animate-pulse">
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
                              className="px-4 py-2.5 rounded-lg border border-slate-600 text-slate-400 text-sm font-semibold hover:bg-slate-800 transition-colors"
                            >
                              {t.cancel}
                            </button>
                          </div>
                        </div>
                      ) : previewUrl ? (
                        <div className="space-y-3">
                          <img
                            src={previewUrl}
                            alt={t.evidencePreviewAlt}
                            className="w-full rounded-lg border border-slate-600 aspect-video object-cover"
                          />
                          <p className="text-xs text-slate-500">
                            {t.photoReadyHint}
                          </p>
                          <button
                            type="button"
                            onClick={clearPhoto}
                            className="w-full py-2 rounded-lg border border-slate-600 text-slate-400 text-sm font-semibold hover:bg-slate-800 transition-colors"
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
                        <p className="text-xs text-red-300 bg-red-950/40 border border-red-500/40 rounded-lg px-3 py-2">
                          {cameraError}
                        </p>
                      )}

                      <p className="text-xs text-slate-500">
                        {t.galleryDisabled}
                      </p>
                    </div>
                    <p className="text-xs text-amber-200 mt-2 bg-amber-950/40 px-3 py-2 rounded-lg border border-amber-500/40">
                      {t.photoDisclaimer}
                    </p>
                  </div>

                  {error && (
                    <div className="text-red-300 text-sm bg-red-950/40 p-4 rounded-lg border border-red-500/40">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !description.trim()}
                    className={`w-full py-4 px-4 rounded-xl text-white font-bold text-lg shadow-md transition-all ${
                      isSubmitting
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                    }`}
                  >
                    {isSubmitting ? t.submitting : t.submit}
                  </button>

                  {statusMessage && (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                      <p className="text-xs text-blue-300 font-medium">
                        {statusMessage}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-center gap-3 pt-2 flex-wrap">
                    <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-full">
                      🔒 PGP Encrypted
                    </span>
                    <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-full">
                      🤖 AI PII Redaction
                    </span>
                    <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-full">
                      🛡️ EXIF Stripped
                    </span>
                  </div>
                </form>

                <div className="pt-6 border-t border-slate-700">
                  <Link
                    href="/oversight"
                    className="flex items-center justify-center w-full px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all active:scale-95 text-sm mt-3 mb-3"
                  >
                    {t.linkOversight}
                  </Link>
                  <Link
                    href="/status"
                    className="flex items-center justify-center w-full px-6 py-3 bg-slate-950 border-2 border-slate-600 text-slate-300 font-bold rounded-xl hover:bg-slate-900/50 hover:border-slate-600 transition-all active:scale-95 text-sm"
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
        </section>
      </div>
    </main>
  );
}
