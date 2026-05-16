export type Language = "en" | "si";

export const translations = {
  en: {
    admin: {
      title: "Investigator Admin Dashboard",
      searchPlaceholder:
        "Search complaints (e.g., bribery, theft)...",
      colComplaintId: "Complaint ID",
      colDescription: "Description",
      colCategory: "Category",
      colStatus: "Current Status",
      colActions: "Actions",
      statusPending: "Pending",
      statusInReview: "In Review",
      statusResolved: "Resolved",
      auditLogTitle: "System Audit Logs",
      keyGeneratorTitle: "Secure Key Generator",
      keyGeneratorDesc:
        "Generate a new Public and Private key pair for the system when required.",
      generateKeysButton: "Generate New Keys",
      publicKeyLabel: "Public Key (add to website):",
      privateKeyLabel: "Private Key (keep secure):",
      decryptTitle: "Read Complaints (Decryption)",
      decryptDesc:
        "Enter your Private Key below to unlock and read encrypted complaints.",
      privateKeyPlaceholder: "Paste your Private Key here...",
      decryptButton: "Unlock & Decrypt Complaints",
      evidenceLinkLoading: "Preparing link...",
      evidenceLinkText: "View evidence file",
      complaintsSectionTitle: "Received Complaints",
      noComplaints: "No complaints received yet.",
      noSearchResults: "No complaints match your search.",
      complaintDescriptionLabel: "Complaint details:",
      reporterReplyLabel: "Reporter's latest reply:",
      updateStatusTitle: "Update status",
      replyPlaceholder: "Message to reporter (optional)",
      updateButton: "Save update",
      lockedMessage:
        "Unlock complaints with your Private Key above before sending messages or updating status.",
      caseKeyPrefix: "Key:",
      viewDetails: "View",
      auditLogEmpty: "No audit entries recorded yet.",
      toastKeysGenerated: "New key pair generated successfully!",
      toastDecryptSuccess: "Complaints decrypted successfully!",
      toastUpdateSuccess: "Update saved successfully!",
      toastUpdateError: "Update failed.",
      errorWrongKeyNoMatch:
        "Key is valid, but no complaints can be unlocked with this key.",
      errorPrivateKeyInvalid:
        "Private Key error. Paste the full key without missing characters.",
      errorDecryptOldKey: "Locked with an older key (cannot decrypt with this key).",
    },
  },
  si: {
    admin: {
      title: "විමර්ශක පාලන පුවරුව",
      searchPlaceholder: "පැමිණිලි සොයන්න (උදා: හොරකම්, අල්ලස්)...",
      colComplaintId: "පැමිණිලි අංකය",
      colDescription: "විස්තරය",
      colCategory: "කාණ්ඩය",
      colStatus: "වත්මන් තත්ත්වය",
      colActions: "ක්‍රියාමාර්ග",
      statusPending: "පොරොත්තුවෙන්",
      statusInReview: "පරීක්ෂණ මට්ටමේ",
      statusResolved: "විසඳා ඇත",
      auditLogTitle: "පද්ධති පරීක්ෂණ සටහන්",
      keyGeneratorTitle: "ආරක්ෂිත යතුරු නිර්මාණය",
      keyGeneratorDesc:
        "පද්ධතියට අවශ්‍ය වූ විට මෙතැනින් පොදු සහ පෞද්ගලික යතුරු යුගලයක් සාදාගන්න.",
      generateKeysButton: "නව යතුරු නිර්මාණය කරන්න",
      publicKeyLabel: "පොදු යතුර (වෙබ් අඩවියට එක් කරන්න):",
      privateKeyLabel: "පෞද්ගලික යතුර (ඔබ ළඟ තබාගන්න):",
      decryptTitle: "පැමිණිලි කියවීම",
      decryptDesc:
        "සංකේතනය කළ පැමිණිලි කියවීමට ඔබගේ පෞද්ගලික යතුර පහත ඇතුළත් කරන්න.",
      privateKeyPlaceholder: "ඔබගේ පෞද්ගලික යතුර මෙතැන අලවන්න...",
      decryptButton: "අගුළු හරිමින් පැමිණිලි විසඳන්න",
      evidenceLinkLoading: "සබැඳිය සූදානම් කරමින්...",
      evidenceLinkText: "සාක්ෂි ගොනුව බලන්න",
      complaintsSectionTitle: "ලැබී ඇති පැමිණිලි",
      noComplaints: "තාමත් පැමිණිලි කිසිවක් ලැබී නොමැත.",
      noSearchResults: "ඔබගේ සෙවුමට ගැලපෙන පැමිණිලි නැත.",
      complaintDescriptionLabel: "පැමිණිල්ලේ විස්තරය:",
      reporterReplyLabel: "පැමිණිලිකරුගේ නව පිළිතුර:",
      updateStatusTitle: "තත්ත්වය යාවත්කාලීන කිරීම",
      replyPlaceholder: "පැමිණිලිකරුට පණිවිඩයක් (විකල්ප)",
      updateButton: "යාවත්කාලීන කරන්න",
      lockedMessage:
        "පණිවිඩ යැවීමට සහ තත්ත්වය යාවත්කාලීන කිරීමට ප්‍රථම, ඉහළින් පෞද්ගලික යතුර ලබාදී පැමිණිල්ල අගුළු හරින්න.",
      caseKeyPrefix: "අංකය:",
      viewDetails: "බලන්න",
      auditLogEmpty: "තවම පරීක්ෂණ සටහන් කිසිවක් නොමැත.",
      toastKeysGenerated: "නව යතුරු යුගලයක් සාර්ථකව නිර්මාණය විය!",
      toastDecryptSuccess: "පැමිණිලි සාර්ථකව විසඳන ලදී!",
      toastUpdateSuccess: "යාවත්කාලීන කිරීම සාර්ථකයි!",
      toastUpdateError: "යාවත්කාලීන කිරීම අසාර්ථක විය.",
      errorWrongKeyNoMatch:
        "යතුර නිවැරදියි, නමුත් මෙම යතුරෙන් අගුළු හැරිය හැකි පැමිණිලි නොමැත.",
      errorPrivateKeyInvalid:
        "පෞද්ගලික යතුරේ දෝෂයක්! අකුරු අඩුවක් නොමැතිව සම්පූර්ණ යතුර ඇතුළත් කරන්න.",
      errorDecryptOldKey:
        "පරණ යතුරකින් අගුළු දමා ඇත (මෙම යතුරෙන් විසඳිය නොහැක).",
    },
  },
} as const;

export function getAdminStatusLabel(
  status: string | undefined,
  lang: Language,
): string {
  const t = translations[lang].admin;
  switch (status) {
    case "Resolved":
      return t.statusResolved;
    case "Investigating":
      return t.statusInReview;
    default:
      return t.statusPending;
  }
}

/** Canonical fraud category keys stored / classified in English */
export const FRAUD_CATEGORIES = [
  "Bribery",
  "Cyber Crime",
  "Embezzlement",
  "Corruption",
  "Fraud",
  "Harassment",
  "General",
] as const;

export type FraudCategory = (typeof FRAUD_CATEGORIES)[number];

const fraudCategoryLabels: Record<
  FraudCategory,
  { en: string; si: string }
> = {
  Bribery: { en: "Bribery", si: "දූෂණය / ලණ්ඩම්" },
  "Cyber Crime": { en: "Cyber Crime", si: "සයිබර් අපරාධ" },
  Embezzlement: { en: "Embezzlement", si: "භත්ස්‍යාපහරණය" },
  Corruption: { en: "Corruption", si: "දූෂණය" },
  Fraud: { en: "Fraud", si: "වංචාව" },
  Harassment: { en: "Harassment", si: "හිංසනය / අතිභෝගනය" },
  General: { en: "General Complaint", si: "සාමාන්‍ය පැමිණිල්ල" },
};

export function getLocalizedFraudCategory(
  category: string,
  lang: Language,
): string {
  const entry = fraudCategoryLabels[category as FraudCategory];
  if (entry) return entry[lang];
  return category;
}

