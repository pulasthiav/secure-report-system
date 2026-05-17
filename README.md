# SecureReport System

**Anonymous, zero-account civic reporting with AI PII redaction, OpenPGP encryption, and judiciary-grade evidence custody.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Convex](https://img.shields.io/badge/Convex-1.39-FF6B6B?style=flat-square)](https://convex.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Security](https://img.shields.io/badge/Security-OpenPGP%20%7C%20PII%20Redaction-059669?style=flat-square&logo=shield)](https://github.com/pulasthiav/secure-report-system)
[![Cursor Buildathon](https://img.shields.io/badge/Cursor%20×%20TechTalk360-Submission-8B5CF6?style=flat-square)](https://github.com/pulasthiav/secure-report-system)

> **Cursor × TechTalk360 Buildathon** · [Repository](https://github.com/pulasthiav/secure-report-system)

---

## 📖 Overview

**SecureReport System** is a bilingual (English / Sinhala) web portal that lets whistleblowers and victims report corruption, fraud, and abuse **without creating an account**. Reports flow through a **privacy-by-design pipeline** before anything reaches the database:

1. **Localized AI redaction** — Server-side OpenAI (`gpt-4o-mini`) strips reporter/witness PII while preserving accused names and crime narrative (English, Sinhala, Singlish).
2. **OpenPGP encryption** — Redacted narratives are encrypted in the browser with an asymmetric public key; only key holders can read complaint bodies.
3. **Surgical media handling** — Evidence photos are re-rendered through **HTML5 Canvas** to strip device/EXIF tracking fingerprints from file bytes, while **incident GPS coordinates and capture date/time** are extracted and stored separately for legal validation and map visualization.
4. **Zero-logs IP posture** — The reporter’s public IP may be shown in the UI for transparency but is **never transmitted or stored** in Convex.
5. **Public oversight ledger** — Anyone can verify that a case was received (masked reference + status) without seeing confidential content.

The **Convex** backend holds encrypted complaints, stripped evidence files, and structured metadata. In production, the **Judiciary** retains legal and technical ownership of the database; law enforcement (e.g. CID) receives **decrypted read-only operational access** via issued private keys—not administrative rights to alter, delete, or suppress evidence.

---

## ✨ Key Features

| Capability | What it does |
|------------|----------------|
| **Application-level IP scrubbing** | Fetches public IP only for an on-screen Privacy Guard notice; IP is excluded from all Convex payloads. |
| **Localized AI PII redaction** | `app/actions/redact-pii.ts` — secure Server Action; reporter-only redaction; accused names preserved. |
| **HTML5 Canvas EXIF stripping** | Re-encodes images to JPEG without embedded hardware/device metadata in stored bytes. |
| **Preserved legal metadata** | Latitude, longitude, and `dateTime` saved in `complaints.metadata` for investigator maps (admin UI). |
| **OpenPGP vaulting** | Client-side encryption (`openpgp` v6) before `createComplaint`; CID-aligned test key pair for demos. |
| **Camera-only evidence** | Live capture only—no gallery upload—to reduce staged file abuse. |
| **PDF submission receipt** | Downloadable proof with case key, integrity hash, and PGP ciphertext block. |
| **Public oversight dashboard** | `/oversight` — masked case refs, dates, status; no complaint body. |
| **Case-key status tracking** | `/status` — anonymous follow-up and reporter replies. |
| **Investigator admin** | `/admin` — decrypt with private key, view evidence + GPS, update status. |
| **Judicial ownership model** | Architecture positions the Judiciary as DB custodian; LE decrypt-only in production design. |
| **Bilingual UI** | Full EN / SI via `translations.ts` and `LanguageContext`. |

### Application routes

| Route | Purpose |
|-------|---------|
| `/` | Landing & navigation |
| `/report` | Secure complaint submission |
| `/status` | Lookup by secret case key |
| `/admin` | Investigator dashboard (decrypt, evidence, status) |
| `/oversight` | Public transparency log |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/) |
| **Backend / DB** | [Convex](https://convex.dev/) — `complaints` table, file storage, real-time queries & mutations |
| **AI** | [OpenAI](https://openai.com/) `gpt-4o-mini` via Next.js Server Actions |
| **Cryptography** | [OpenPGP.js](https://openpgpjs.org/) 6.x |
| **Media / EXIF** | [exifr](https://github.com/MikeKovarik/exifr), HTML5 Canvas API |
| **PDF receipts** | [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) |
| **Hosting (target)** | Vercel + Convex Cloud |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **npm** (or pnpm / yarn)
- [Convex](https://convex.dev/) account (for cloud) or local Convex dev
- **OpenAI API key** (for PII redaction)

### 1. Clone & install

```bash
git clone https://github.com/pulasthiav/secure-report-system.git
cd secure-report-system
npm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```env
# Convex (from `npx convex dev` or Convex dashboard)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# OpenAI — server-only; never use NEXT_PUBLIC_ prefix
OPENAI_API_KEY=sk-your-key-here
```

### 3. Start Convex

In a separate terminal:

```bash
npx convex dev
```

Follow the prompts to link or create a project. Copy the printed `NEXT_PUBLIC_CONVEX_URL` into `.env.local`.

### 4. Run Next.js

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Submit a report:** [http://localhost:3000/report](http://localhost:3000/report)  
- **Admin (investigators):** [http://localhost:3000/admin](http://localhost:3000/admin)  
- **Public oversight:** [http://localhost:3000/oversight](http://localhost:3000/oversight)  
- **Check status:** [http://localhost:3000/status](http://localhost:3000/status)

> **Camera evidence** requires HTTPS or `localhost`. Grant camera (and optionally location) permissions when prompted.

### Production build

```bash
npm run build
npm start
```

Set `OPENAI_API_KEY` and `NEXT_PUBLIC_CONVEX_URL` in your Vercel (or host) environment settings.

---

## 👩‍⚖️ For Judges / Evaluators (Testing the Admin Dashboard)

In a production environment, the Private Key is strictly held by the Judiciary/CID and never shared. However, for the purpose of this hackathon evaluation, please use the following **Test Private Key** to act as an Investigator and test our decryption pipeline.

**Testing Steps:**
1. Submit a sample complaint with a photo on the `/report` page.
2. Navigate to the `/admin` dashboard.
3. You will see the complaint body is fully encrypted (OpenPGP Ciphertext) and the media is locked.
4. Copy and paste the entire Private Key block below into the Decrypt text box.
5. Click **Unlock/Decrypt** to reveal the AI-redacted plaintext and the preserved metadata matrix.

**Test Private Key:**
```text
-----BEGIN PGP PRIVATE KEY BLOCK-----

xVgEagbCVhYJKwYBBAHaRw8BAQdAG/Suu3AI5UB2QMM/ZMFxuQUvlfGBaG7p
Bh4sz8VsE4oAAP9U6sCZgc+J7tY747rUMXzhzGbCkk/xqhYZ7mw2NKHoihPj
zSBDSUQgSW52ZXN0aWdhdG9yIDxjaWRAcG9saWNlLmxrPsLAEwQTFgoAhQWC
agbCVgMLCQcJEG02XKYa6tDmRRQAAAAAABwAIHNhbHRAbm90YXRpb25zLm9w
ZW5wZ3Bqcy5vcmcrpl7AQ5NF32s64nrsg97pxjA37qP4QkWaJJlLIAOYhQUV
CggODAQWAAIBAhkBApsDAh4BFiEE74QHfq5Hd9fDKDbbbTZcphrq0OYAAAlX
AQDH2Rwl1kwFVSa5xqM8T+YR3KyUW/+IL/mj7jCNdqqB8wD+JcYZhtud+PfX
1r6AzVphg7ToOHktYn1Fk8/hQa+/HgvHXQRqBsJWEgorBgEEAZdVAQUBAQdA
gOIbkuLRXNjk2IoZOjGNqsDX/gF/UiHwk71sdRSYhjADAQgHAAD/dQ+s+X/a
35ZFOH38gFeGDsasWJ0R72UtyvPJD9WiucAS1cK+BBgWCgBwBYJqBsJWCRBt
NlymGurQ5kUUAAAAAAAcACBzYWx0QG5vdGF0aW9ucy5vcGVucGdwanMub3Jn
J4yP4J1xIgex3/tZQI94OgoZhI1qtGXDD33Ubx+Jrd0CmwwWIQTvhAd+rkd3
18MoNtttNlymGurQ5gAAQ8QBAJIS6I0G8mSf1D9SujpbvX2azscG19I0Z8Oi
CS4KwomuAQChmXQgYmUonlubr5uHEJPbRaZ58pSYbJcVk+rnrrJNCw==
=F+r+
-----END PGP PRIVATE KEY BLOCK-----
```

---

## Architecture snapshot

```text
Reporter (/report)
    │
    ├─► Server Action: AI PII redaction (OpenAI)
    ├─► exifr: extract GPS + date/time (before strip)
    ├─► Canvas: strip EXIF from image bytes
    ├─► Convex Storage: upload clean JPEG
    ├─► OpenPGP: encrypt description (browser)
    └─► Convex DB: case_key, ciphertext, metadata, status

Investigator (/admin)          Public (/oversight)
    │                               │
    └─► Decrypt with private key      └─► Masked logs only
        Unlock evidence + maps
```

**Core files**

| Area | Path |
|------|------|
| Report flow | `app/report/page.tsx` |
| PII redaction | `app/actions/redact-pii.ts` |
| Convex API | `convex/complaints.ts`, `convex/schema.ts` |
| Metadata schema | `convex/evidenceMetadata.ts` |
| Admin UI | `app/admin/page.tsx` |
| Oversight | `app/oversight/page.tsx` |
| i18n | `translations.ts` |

---

## Security notes (hackathon build)

- **Demo scope:** Convex mutations are not auth-guarded; production requires Convex Auth, RBAC, and judiciary-controlled deployment.
- **Fail-open redaction:** If OpenAI is unavailable, the server returns the original text (logged); configure `OPENAI_API_KEY` for demos.
- **Integrity hash on receipt:** Client-generated proof string for UX; not an on-chain anchor in this build.
- **Test keys:** The private key above is for evaluation only—rotate for any real deployment.

---

## License

Private / hackathon submission — see repository owner for usage terms.

---

**Built for Cursor × TechTalk360** · Secure, anonymous reporting for high-trust civic oversight.
