export type Language = "en" | "si";

export const translations = {
  en: {
    home: {
      headerTitle: "Secure Information Reporting",
      headerSubtitle:
        "AI technology automatically detects and redacts your personal information.",
      descriptionLabel: "Description:",
      evidenceLabel: "Evidence (Images):",
      descriptionPlaceholder: "Enter description...",
      imageWarning:
        "Image authenticity will be manually verified by investigators.",
      submitButton: "Submit Securely",
      submitSubmitting: "Submitting...",
      badgePgpEncrypted: "PGP Encrypted",
      badgeAiPiiRedaction: "AI PII Redaction",
      badgeExifStripped: "EXIF Stripped",
      bottomButtonOversight: "Public Oversight Dashboard",
      bottomButtonTrack: "Track Complaint Progress",
      fileSelectedExif:
        "— EXIF metadata will be removed and sent securely",
      successTitle: "Success!",
      successEvidenceTitle: "About image authenticity",
      successEvidenceBody:
        "The evidence photo you submitted will be manually verified by investigators. No AI tool can detect AI-generated photos with 100% accuracy; that responsibility belongs to human experts.",
      blockchainVerified: "Blockchain Audit Trail Verified",
      immutableHashLabel: "Immutable Hash (SHA-256 Proof):",
      blockchainNote:
        "*The contents of this complaint are recorded on the blockchain network so they cannot be altered.",
      caseKeyKeep: "Keep your secret Case Key safe:",
      downloadReceipt: "Download submission receipt (PDF)",
      checkStatus: "Check complaint status",
      submitNew: "Submit new report",
      errorGeneric: "An error occurred. Please try again.",
      statusPiiCheck: "AI is checking for personal data (PII)...",
      statusStripMetadata: "Removing metadata from evidence file...",
      statusUploadEvidence: "Securely storing evidence...",
      statusEncrypt: "Encrypting data with PGP...",
      statusSubmit: "Submitting to the system...",
    },
    oversight: {
      title: "Public Oversight Dashboard",
      subtitle:
        "Complaints received by the system and their progress are displayed here transparently.",
      back: "Back",
      colCaseReference: "Case Reference",
      colReceivedDate: "Received Date",
      colStatus: "Status",
      colBlockchainProof: "Blockchain Proof",
      loading: "Loading data...",
      empty: "No complaints have been reported yet.",
      transparencyTitle: "Transparency",
      transparencyBody:
        "While complaint contents remain confidential, anyone can verify that a report was received by the system.",
      immutableTitle: "Immutable",
      immutableBody:
        "Investigators cannot delete complaints; every action is logged.",
      statusPending: "Pending",
      statusInvestigating: "Investigating",
      statusResolved: "Resolved",
    },
    status: {
      statusTitle: "Complaint Status",
      statusSubtitle:
        "Enter your confidential Case Key to check the investigation status.",
      caseKeyPlaceholder: "CASE KEY",
      checkButton: "Check Status",
      backButton: "Back to Home Page",
      searching: "Searching...",
      notFound:
        "The Case Key you entered is invalid or no complaint could be found.",
      currentStatus: "Current Status",
      statusPending: "Pending (Under Review)",
      statusInvestigating: "Investigating",
      statusResolved: "Resolved",
      investigatorMessage: "Investigator Message",
      noInvestigatorMessage: "No message from investigators yet.",
      originalComplaint: "Your Original Complaint",
      pgpEncryptedNotice:
        "This data is securely encrypted with PGP technology. Only investigators can read it.",
      replyToInvestigator: "Send a reply to the investigator:",
      replyPlaceholder: "Type your message here...",
      sendReply: "Send Message",
      sendingReply: "Sending...",
      lastReply: "Your last reply:",
      toastReplySuccess: "Your message was sent successfully!",
      toastReplyError: "Could not send the message!",
    },
    receipt: {
      receiptTitle: "SECURE COMPLAINT SUBMISSION RECEIPT",
      receiptDate: "Submission Date",
      caseKeyLabel: "Confidential Case Key",
      categoryLabel: "Fraud Category",
      statusLabel: "Current Status",
      securityNotice:
        "IMPORTANT: Keep this Case Key secret. Lose it, and you cannot track your report.",
      blockchainHashLabel: "Blockchain Evidence (SHA-256 Hash)",
      pgpEncryptedLabel: "PGP Encrypted Message",
      receiptIntro:
        "This document is the digital proof of your complaint submission. Store it securely.",
      receiptFooterAuto:
        "* This receipt was generated automatically by the system.",
      receiptFooterRights:
        "* Even if the complaint is removed from the database, you may use this document to seek redress.",
      statusPendingValue: "Pending (Under Review)",
      statusInvestigatingValue: "Investigating",
      statusResolvedValue: "Resolved",
    },
  },
  si: {
    home: {
      headerTitle: "ආරක්ෂිත තොරතුරු වාර්තාකරණය",
      headerSubtitle:
        "AI තාක්ෂණය මගින් ඔබගේ පෞද්ගලික තොරතුරු ස්වයංක්‍රීයව හඳුනාගෙන මකා දැමේ.",
      descriptionLabel: "විස්තරය:",
      evidenceLabel: "සාක්ෂි (ඡායාරූප/ගොනු):",
      descriptionPlaceholder: "විස්තරය ඇතුළත් කරන්න...",
      imageWarning:
        "ඡායාරූපවල සත්‍යතාවය විමර්ශකයන් විසින් අතින් පරීක්ෂා කර තහවුරු කරනු ලැබේ.",
      submitButton: "ආරක්ෂිතව යොමු කරන්න",
      submitSubmitting: "යොමු කරමින් පවතී...",
      badgePgpEncrypted: "PGP Encrypted",
      badgeAiPiiRedaction: "AI PII Redaction",
      badgeExifStripped: "EXIF Stripped",
      bottomButtonOversight: "මහජන නිරීක්ෂණ පුවරුව (Public Oversight)",
      bottomButtonTrack: "පැමිණිල්ලේ ප්‍රගතිය සොයන්න",
      fileSelectedExif: "— EXIF metadata ඉවත් කර ආරක්ෂිතව යවනු ලැබේ",
      successTitle: "සාර්ථකයි!",
      successEvidenceTitle: "ඡායාරූප සත්‍යතාව පිළිබඳව",
      successEvidenceBody:
        "ඔබ ඉදිරිපත් කළ සාක්ෂි ඡායාරූප පරීක්ෂකවරුන් (Investigators) විසින් manually verify කෙරේ. කිසිම AI tool එකකට 100% නිරවද්‍යව AI-generated ඡායාරූප හඳුනාගත නොහැකි බැවින්, ඒ වගකීම මිනිස් විශේෂඥයන් සතුයි.",
      blockchainVerified: "Blockchain Audit Trail Verified",
      immutableHashLabel: "Immutable Hash (SHA-256 Proof):",
      blockchainNote:
        "*මෙම පැමිණිල්ලේ අන්තර්ගතය වෙනස් කළ නොහැකි ලෙස Blockchain ජාලය මත සටහන් විය.",
      caseKeyKeep: "ඔබගේ රහස්‍ය Case Key ආරක්ෂිතව තබා ගන්න:",
      downloadReceipt: "පැමිණිලි රිසිට්පත බාගත කරන්න (PDF)",
      checkStatus: "පැමිණිල්ලේ තත්ත්වය පරීක්ෂා කරන්න",
      submitNew: "නව තොරතුරක් යොමු කරන්න",
      errorGeneric: "දෝෂයක් මතු විය. නැවත උත්සාහ කරන්න.",
      statusPiiCheck: "AI මගින් පෞද්ගලික දත්ත (PII) පරික්ෂා කරමින් පවතී...",
      statusStripMetadata: "සාක්ෂි ගොනුවේ Metadata මකා දමමින් පවතී...",
      statusUploadEvidence: "ආරක්ෂිතව සාක්ෂි ගබඩා කරමින් පවතී...",
      statusEncrypt: "PGP තාක්ෂණයෙන් දත්ත Encrypt කරමින් පවතී...",
      statusSubmit: "තොරතුරු පද්ධතියට යොමු කරමින් පවතී...",
    },
    oversight: {
      title: "නිරීක්ෂණ පුවරුව (Public Oversight)",
      subtitle:
        "පද්ධතියට ලැබෙන පැමිණිලි සහ ඒවායේ ප්‍රගතිය විනිවිදභාවයෙන් යුතුව මෙහි දැක්වේ.",
      back: "ආපසු",
      colCaseReference: "Case Reference",
      colReceivedDate: "ලැබුණු දිනය",
      colStatus: "තත්ත්වය (Status)",
      colBlockchainProof: "Blockchain Proof",
      loading: "දත්ත ලබාගනිමින් පවතී...",
      empty: "තවමත් පැමිණිලි කිසිවක් වාර්තා වී නොමැත.",
      transparencyTitle: "විනිවිදභාවය (Transparency)",
      transparencyBody:
        "පැමිණිල්ලේ අන්තර්ගතය රහසිගත වුවද, එය පද්ධතියට ලැබුණු බව ඕනෑම අයෙකුට තහවුරු කර ගත හැක.",
      immutableTitle: "මකා දැමිය නොහැක (Immutable)",
      immutableBody:
        "විමර්ශකයින්ට පැමිණිලි මකා දැමිය නොහැකි අතර, සෑම ක්‍රියාවක්ම ලොග් (Log) වේ.",
      statusPending: "Pending",
      statusInvestigating: "Investigating",
      statusResolved: "Resolved",
    },
    status: {
      statusTitle: "පැමිණිල්ලේ තත්ත්වය",
      statusSubtitle:
        "ඔබගේ රහස්‍ය Case Key අංකය ඇතුළත් කර විමර්ශන තත්ත්වය දැනගන්න.",
      caseKeyPlaceholder: "CASE KEY",
      checkButton: "තත්ත්වය පරීක්ෂා කරන්න",
      backButton: "ආපසු ප්‍රධාන පිටුවට",
      searching: "සොයමින් පවතී...",
      notFound:
        "ඔබ ඇතුළත් කළ Case Key අංකය වැරදියි හෝ පැමිණිල්ලක් සොයාගත නොහැක.",
      currentStatus: "වත්මන් තත්ත්වය",
      statusPending: "Pending (සමාලෝචනය වෙමින් පවතී)",
      statusInvestigating: "Investigating (විමර්ශනය කරමින් පවතී)",
      statusResolved: "Resolved (විසඳා ඇත)",
      investigatorMessage: "විමර්ශකයන්ගේ පණිවිඩය",
      noInvestigatorMessage: "තවමත් විමර්ශකයන්ගෙන් පණිවිඩයක් ලැබී නොමැත.",
      originalComplaint: "ඔබගේ මුල් පැමිණිල්ල",
      pgpEncryptedNotice:
        "මෙම දත්ත PGP තාක්ෂණයෙන් ආරක්ෂිතව සංකේතනය (Encrypt) කර ඇත. මෙය කියවිය හැක්කේ විමර්ශකයින්ට පමණි.",
      replyToInvestigator: "විමර්ශකයාට පිළිතුරක් යවන්න:",
      replyPlaceholder: "ඔබේ පණිවිඩය මෙතැන ටයිප් කරන්න...",
      sendReply: "පණිවිඩය යවන්න",
      sendingReply: "යවමින් පවතී...",
      lastReply: "ඔබ යැවූ අවසන් පිළිතුර:",
      toastReplySuccess: "ඔබේ පණිවිඩය සාර්ථකව යොමු කෙරුණා!",
      toastReplyError: "පණිවිඩය යැවීමට නොහැකි විය!",
    },
    receipt: {
      receiptTitle: "ආරක්ෂිත පැමිණිලි ඉදිරිපත් කිරීමේ රිසිට්පත",
      receiptDate: "ඉදිරිපත් කළ දිනය",
      caseKeyLabel: "රහස්‍ය පැමිණිලි අංකය (Case Key)",
      categoryLabel: "වංචා වර්ගීකරණය",
      statusLabel: "වත්මන් තත්ත්වය",
      securityNotice:
        "වැදගත්: මෙම පැමිණිලි අංකය රහසිගතව තබා ගන්න. මෙය අස්ථානගත වුවහොත් ප්‍රගතිය බැලිය නොහැක.",
      blockchainHashLabel: "බ්ලොක්චේන් සාක්ෂිය (SHA-256 Hash)",
      pgpEncryptedLabel: "සංකේතනය කළ පණිවිඩය (PGP)",
      receiptIntro:
        "මෙම ලේඛනය ඔබගේ පැමිණිල්ලේ ඩිජිටල් සාක්ෂියයි. මෙය සුරක්ෂිතව තබා ගන්න.",
      receiptFooterAuto:
        "* මෙය පද්ධතියෙන් ස්වයංක්‍රීයව නිකුත් කරන ලද්දකි.",
      receiptFooterRights:
        "* දත්ත ගබඩාවෙන් මෙම පැමිණිල්ල මැකී ගියද, මෙම ලේඛනය හරහා ඔබට සාධාරණය ඉල්ලා සිටිය හැක.",
      statusPendingValue: "සමාලෝචනය වෙමින් පවතී",
      statusInvestigatingValue: "විමර්ශනය කරමින් පවතී",
      statusResolvedValue: "විසඳා ඇත",
    },
  },
} as const;

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

export function getLocalizedComplaintStatus(
  status: string | undefined,
  lang: Language,
): string {
  const t = translations[lang].receipt;
  switch (status) {
    case "Resolved":
      return t.statusResolvedValue;
    case "Investigating":
      return t.statusInvestigatingValue;
    default:
      return t.statusPendingValue;
  }
}
