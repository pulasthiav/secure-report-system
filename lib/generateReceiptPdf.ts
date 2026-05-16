import { jsPDF } from "jspdf";
import {
  getLocalizedComplaintStatus,
  getLocalizedFraudCategory,
  translations,
  type Language,
} from "../translations";

export type ReceiptPdfData = {
  caseKey: string;
  hash: string;
  pgpText: string;
  category: string;
  status: string;
  submittedAt: Date;
};

let sinhalaFontBase64: string | null = null;

async function ensureSinhalaFont(doc: jsPDF): Promise<void> {
  if (!sinhalaFontBase64) {
    const res = await fetch("/fonts/NotoSansSinhala-Regular.ttf");
    if (!res.ok) {
      throw new Error("Failed to load Sinhala font for PDF receipt");
    }
    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    sinhalaFontBase64 = btoa(binary);
  }

  doc.addFileToVFS("NotoSansSinhala-Regular.ttf", sinhalaFontBase64);
  doc.addFont("NotoSansSinhala-Regular.ttf", "NotoSansSinhala", "normal");
  doc.setFont("NotoSansSinhala", "normal");
}

function formatSubmissionDate(date: Date, lang: Language): string {
  const locale = lang === "si" ? "si-LK" : "en-GB";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function splitLongText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      lines.push(remaining);
      break;
    }
    let breakAt = remaining.lastIndexOf(" ", maxChars);
    if (breakAt < maxChars * 0.5) breakAt = maxChars;
    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }
  return lines;
}

export async function generateReceiptPdf(
  data: ReceiptPdfData,
  currentLang: Language,
): Promise<Blob> {
  const t = translations[currentLang].receipt;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  if (currentLang === "si") {
    await ensureSinhalaFont(doc);
  } else {
    doc.setFont("helvetica", "normal");
  }

  const margin = 18;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addWrapped = (
    text: string,
    fontSize: number,
    emphasis = false,
  ) => {
    doc.setFontSize(fontSize);
    if (currentLang === "si") {
      doc.setFont("NotoSansSinhala", "normal");
    } else {
      doc.setFont("helvetica", emphasis ? "bold" : "normal");
    }
    const lines = doc.splitTextToSize(text, contentWidth) as string[];
    for (const line of lines) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += fontSize * 0.45;
    }
  };

  const addSection = (label: string, value: string, valueSize = 11) => {
    y += 4;
    addWrapped(label, 10, true);
    y += 1;
    addWrapped(value, valueSize);
  };

  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  addWrapped(t.receiptTitle, 14, true);
  y += 4;
  addWrapped(t.receiptIntro, 10);
  y += 4;

  addSection(
    t.receiptDate,
    formatSubmissionDate(data.submittedAt, currentLang),
  );
  addSection(t.caseKeyLabel, data.caseKey, 16);
  addSection(
    t.categoryLabel,
    getLocalizedFraudCategory(data.category, currentLang),
  );
  addSection(
    t.statusLabel,
    getLocalizedComplaintStatus(data.status, currentLang),
  );

  y += 2;
  addWrapped(t.securityNotice, 10, true);
  y += 4;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  addSection(t.blockchainHashLabel, data.hash, 8);

  y += 2;
  addWrapped(t.pgpEncryptedLabel, 10, true);
  y += 1;
  const pgpLines = splitLongText(data.pgpText, 72);
  for (const chunk of pgpLines) {
    addWrapped(chunk, 7);
  }

  y += 6;
  doc.setDrawColor(16, 185, 129);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  addWrapped(t.receiptFooterAuto, 9);
  y += 2;
  addWrapped(t.receiptFooterRights, 9);

  return doc.output("blob");
}
