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
    oversight: {
      oversightTitle: "Public Oversight Dashboard",
      oversightSubtitle:
        "Complaints received by the system and their progress are displayed here with full transparency.",
      backButton: "Back",
      colCaseRef: "CASE REFERENCE",
      colDate: "DATE RECEIVED",
      colStatus: "STATUS",
      colProof: "BLOCKCHAIN PROOF",
      card1Title: "Transparency",
      card1Desc:
        "Even though the content of the complaint is confidential, anyone can verify that it was successfully received by the system.",
      card2Title: "Immutable",
      card2Desc:
        "Investigators cannot delete complaints, and every action performed is fully logged.",
      loading: "Loading data...",
      empty: "No complaints have been reported yet.",
      statusPending: "Pending",
      statusInvestigating: "Investigating",
      statusResolved: "Resolved",
    },
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
    home: {
      headerTitle: "ආරක්ෂිත තොරතුරු වාර්තාකරණය",
      headerSubtitle:
        "කෘතිම බුද්ධි තාක්ෂණය මගින් ඔබගේ පෞද්ගලික තොරතුරු ස්වයංක්‍රීයව හඳුනාගෙන මකා දැමේ.",
      descriptionLabel: "විස්තරය:",
      evidenceLabel: "සාක්ෂි (ඡායාරූප/ගොනු):",
      descriptionPlaceholder: "විස්තරය ඇතුළත් කරන්න...",
      imageWarning:
        "ඡායාරූපවල සත්‍යතාවය විමර්ශකයන් විසින් අතින් පරීක්ෂා කර තහවුරු කරනු ලැබේ.",
      submitButton: "ආරක්ෂිතව යොමු කරන්න",
      submitSubmitting: "යොමු කරමින් පවතී...",
      badgePgpEncrypted: "සංකේතනය කළ",
      badgeAiPiiRedaction: "පෞද්ගලික දත්ත සැඟවීම",
      badgeExifStripped: "රූප යටි දත්ත ඉවත් කිරීම",
      bottomButtonOversight: "මහජන නිරීක්ෂණ පුවරුව",
      bottomButtonTrack: "පැමිණිල්ලේ ප්‍රගතිය සොයන්න",
      fileSelectedExif: "— රූප යටි දත්ත ඉවත් කර ආරක්ෂිතව යවනු ලැබේ",
      successTitle: "සාර්ථකයි!",
      successEvidenceTitle: "ඡායාරූප සත්‍යතාව පිළිබඳව",
      successEvidenceBody:
        "ඔබ ඉදිරිපත් කළ සාක්ෂි ඡායාරූප විමර්ශකයන් විසින් අතින් පරීක්ෂා කර තහවුරු කරනු ලැබේ. කිසිම කෘතීම බුද්ධි මෙවලමකට 100% නිරවද්‍යව කෘතීම බුද්ධියෙන් නිර්මාණය කළ ඡායාරූප හඳුනාගත නොහැකි බැවින්, ඒ වගකීම මිනිස් විශේෂඥයන් සතුයි.",
      blockchainVerified: "බ්ලොක්චේන් සටහන සත්‍යාපනය විය",
      immutableHashLabel: "වෙනස් කළ නොහැකි හැළි සාක්ෂිය (SHA-256):",
      blockchainNote:
        "*මෙම පැමිණිල්ලේ අන්තර්ගතය වෙනස් කළ නොහැකි ලෙස බ්ලොක්චේන් ජාලය මත සටහන් විය.",
      caseKeyKeep: "ඔබගේ රහස්‍ය පැමිණිලි අංකය ආරක්ෂිතව තබා ගන්න:",
      downloadReceipt: "පැමිණිලි රිසිට්පත බාගත කරන්න (PDF)",
      checkStatus: "පැමිණිල්ලේ තත්ත්වය පරීක්ෂා කරන්න",
      submitNew: "නව තොරතුරක් යොමු කරන්න",
      errorGeneric: "දෝෂයක් මතු විය. නැවත උත්සාහ කරන්න.",
      statusPiiCheck: "පෞද්ගලික දත්ත පරීක්ෂා කරමින් පවතී...",
      statusStripMetadata: "සාක්ෂි ගොනුවේ යටි දත්ත මකා දමමින් පවතී...",
      statusUploadEvidence: "ආරක්ෂිතව සාක්ෂි ගබඩා කරමින් පවතී...",
      statusEncrypt: "දත්ත සංකේතනය කරමින් පවතී...",
      statusSubmit: "තොරතුරු පද්ධතියට යොමු කරමින් පවතී...",
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
      pgpEncryptedLabel: "සංකේතනය කළ පණිවිඩය",
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
      statusPending: "සමාලෝචනය වෙමින් පවතී",
      statusInvestigating: "විමර්ශනය කරමින් පවතී",
      statusResolved: "විසඳා ඇත",
      investigatorMessage: "විමර්ශකයන්ගේ පණිවිඩය",
      noInvestigatorMessage: "තවමත් විමර්ශකයන්ගෙන් පණිවිඩයක් ලැබී නොමැත.",
      originalComplaint: "ඔබගේ මුල් පැමිණිල්ල",
      pgpEncryptedNotice:
        "මෙම දත්ත සංකේතන තාක්ෂණයෙන් ආරක්ෂිතව සංකේතනය කර ඇත. මෙය කියවිය හැක්කේ විමර්ශකයින්ට පමණි.",
      replyToInvestigator: "විමර්ශකයාට පිළිතුරක් යවන්න:",
      replyPlaceholder: "ඔබේ පණිවිඩය මෙතැන ටයිප් කරන්න...",
      sendReply: "පණිවිඩය යවන්න",
      sendingReply: "යවමින් පවතී...",
      lastReply: "ඔබ යැවූ අවසන් පිළිතුර:",
      toastReplySuccess: "ඔබේ පණිවිඩය සාර්ථකව යොමු කෙරුණා!",
      toastReplyError: "පණිවිඩය යැවීමට නොහැකි විය!",
    },
    oversight: {
      oversightTitle: "නිරීක්ෂණ පුවරුව",
      oversightSubtitle:
        "පද්ධතියට ලැබෙන පැමිණිලි සහ ඒවායේ ප්‍රගතිය විනිවිදභාවයෙන් යුතුව මෙහි දැක්වේ.",
      backButton: "ආපසු",
      colCaseRef: "CASE REFERENCE",
      colDate: "ලැබුණු දිනය",
      colStatus: "තත්ත්වය (STATUS)",
      colProof: "BLOCKCHAIN PROOF",
      card1Title: "විනිවිදභාවය (Transparency)",
      card1Desc:
        "පැමිණිල්ලේ අන්තර්ගතය රහසිගත වුවද, එය පද්ධතියට ලැබුණු බව ඕනෑම අයෙකුට තහවුරු කර ගත හැක.",
      card2Title: "මකා දැමිය නොහැක (Immutable)",
      card2Desc:
        "විමර්ශකයින්ට පැමිණිලි මකා දැමිය නොහැකි අතර, සෑම ක්‍රියාවක්ම ලොග් (Log) වේ.",
      loading: "දත්ත ලබාගනිමින් පවතී...",
      empty: "තවමත් පැමිණිලි කිසිවක් වාර්තා වී නොමැත.",
      statusPending: "පොරොත්තුවෙන්",
      statusInvestigating: "විමර්ශනය කරමින්",
      statusResolved: "විසඳා ඇත",
    },
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

export function getStatusPageComplaintLabel(
  status: string | undefined,
  lang: Language,
): string {
  const t = translations[lang].status;
  switch (status) {
    case "Resolved":
      return t.statusResolved;
    case "Investigating":
      return t.statusInvestigating;
    default:
      return t.statusPending;
  }
}

export function getOversightStatusLabel(
  status: string | undefined,
  lang: Language,
): string {
  const t = translations[lang].oversight;
  switch (status) {
    case "Resolved":
      return t.statusResolved;
    case "Investigating":
      return t.statusInvestigating;
    default:
      return t.statusPending;
  }
}

