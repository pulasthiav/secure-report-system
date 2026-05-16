import type { Language } from "../translations";
import {
  getLocalizedFraudCategory,
  translations,
} from "../translations";

export type ReceiptPdfData = {
  caseKey: string;
  hash: string;
  pgpText: string;
  categoryKey: string;
  submittedAt: Date;
  status?: "Pending" | "Investigating" | "Resolved";
};

function getReceiptStatusLabel(
  lang: Language,
  status: ReceiptPdfData["status"],
): string {
  const r = translations[lang].receipt;
  switch (status) {
    case "Investigating":
      return r.statusInvestigatingValue;
    case "Resolved":
      return r.statusResolvedValue;
    default:
      return r.statusPendingValue;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapPgpText(text: string, maxCharsPerLine = 88): string {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let remaining = paragraph;
    while (remaining.length > maxCharsPerLine) {
      lines.push(remaining.slice(0, maxCharsPerLine));
      remaining = remaining.slice(maxCharsPerLine);
    }
    lines.push(remaining);
  }
  return lines.join("\n");
}

export async function generateReceiptPdf(
  lang: Language,
  data: ReceiptPdfData,
): Promise<void> {
  const r = translations[lang].receipt;
  const category = getLocalizedFraudCategory(data.categoryKey, lang);
  const statusLabel = getReceiptStatusLabel(lang, data.status ?? "Pending");
  const submittedAt = data.submittedAt.toLocaleString(
    lang === "si" ? "si-LK" : "en-GB",
    { dateStyle: "long", timeStyle: "short" },
  );

  const container = document.createElement("div");
  container.setAttribute("data-receipt-pdf", "true");
  container.style.cssText =
    "position:fixed;left:-10000px;top:0;width:794px;min-height:1123px;padding:48px 56px;box-sizing:border-box;font-family:'Segoe UI',system-ui,sans-serif;background:#ffffff;color:#0f172a;";

  container.innerHTML = `
    <div style="border-bottom:3px solid #059669;padding-bottom:20px;margin-bottom:28px;">
      <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#059669;font-weight:700;">Secure Report System</p>
      <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#0f172a;line-height:1.3;">${escapeHtml(r.receiptTitle)}</h1>
      <p style="margin:10px 0 0;font-size:13px;color:#475569;line-height:1.5;">${escapeHtml(r.receiptIntro)}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px;">
      <tr>
        <td style="padding:12px 16px;background:#f8fafc;border:1px solid #e2e8f0;width:38%;font-weight:600;color:#334155;">${escapeHtml(r.receiptDate)}</td>
        <td style="padding:12px 16px;border:1px solid #e2e8f0;color:#0f172a;">${escapeHtml(submittedAt)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#f8fafc;border:1px solid #e2e8f0;font-weight:600;color:#334155;">${escapeHtml(r.caseKeyLabel)}</td>
        <td style="padding:12px 16px;border:1px solid #e2e8f0;font-family:ui-monospace,monospace;font-size:18px;font-weight:700;letter-spacing:0.15em;color:#047857;">${escapeHtml(data.caseKey)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#f8fafc;border:1px solid #e2e8f0;font-weight:600;color:#334155;">${escapeHtml(r.categoryLabel)}</td>
        <td style="padding:12px 16px;border:1px solid #e2e8f0;color:#0f172a;">${escapeHtml(category)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#f8fafc;border:1px solid #e2e8f0;font-weight:600;color:#334155;">${escapeHtml(r.statusLabel)}</td>
        <td style="padding:12px 16px;border:1px solid #e2e8f0;color:#0f172a;">${escapeHtml(statusLabel)}</td>
      </tr>
    </table>

    <div style="margin-bottom:20px;padding:16px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;">
      <p style="margin:0;font-size:12px;font-weight:700;color:#047857;line-height:1.5;">${escapeHtml(r.securityNotice)}</p>
    </div>

    <div style="margin-bottom:20px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#334155;text-transform:uppercase;letter-spacing:0.05em;">${escapeHtml(r.blockchainHashLabel)}</p>
      <pre style="margin:0;padding:14px;background:#0f172a;color:#e2e8f0;border-radius:8px;font-size:9px;line-height:1.45;white-space:pre-wrap;word-break:break-all;font-family:ui-monospace,monospace;">${escapeHtml(data.hash)}</pre>
    </div>

    <div style="margin-bottom:28px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#334155;text-transform:uppercase;letter-spacing:0.05em;">${escapeHtml(r.pgpEncryptedLabel)}</p>
      <pre style="margin:0;padding:14px;background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:8px;font-size:8px;line-height:1.4;white-space:pre-wrap;word-break:break-all;font-family:ui-monospace,monospace;max-height:320px;overflow:hidden;">${escapeHtml(wrapPgpText(data.pgpText))}</pre>
    </div>

    <div style="border-top:1px solid #e2e8f0;padding-top:16px;font-size:10px;color:#64748b;line-height:1.5;">
      <p style="margin:0 0 6px;">${escapeHtml(r.receiptFooterAuto)}</p>
      <p style="margin:0;">${escapeHtml(r.receiptFooterRights)}</p>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const html2pdf = (await import("html2pdf.js")).default;
    await html2pdf()
      .set({
        margin: [12, 12, 12, 12],
        filename: `SecureReport_Receipt_${data.caseKey}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(container)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}
