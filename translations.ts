export type Language = "en" | "si";

export const translations = {
  en: {
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
      searchPlaceholder: "Search complaints (e.g., bribery, theft)...",
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
      exifPanelTitle: "Photo metadata (EXIF)",
      metadataReadError: "Could not read metadata.",
      metadataNone: "No EXIF data could be extracted from the photo.",
      exifDate: "Date & time captured:",
      exifGps: "Location (GPS):",
      exifGpsMaps: "View on Maps",
      exifSoftware: "Device / software:",
    },
    home: {
      title: "Secure Reporting",
      subtitle:
        "AI automatically detects and redacts your personal information.",
      descriptionLabel: "Description:",
      descriptionPlaceholder: "Enter your description...",
      evidenceLabel: "Evidence (camera only):",
      cameraStarting: "Preparing camera...",
      capturePhoto: "Take photo",
      cancel: "Cancel",
      evidencePreviewAlt: "Evidence preview",
      photoReadyHint:
        "Photo ready — EXIF stripped from file; metadata stored separately in DB only",
      removePhotoRetake: "Remove photo and retake",
      startCamera: "Start camera",
      cameraHttpsRequired:
        "Camera only works on HTTPS or localhost. Use a secure connection.",
      cameraUnsupported: "This browser does not support camera access.",
      cameraStartFailed:
        "Could not start camera. Grant permission and try again.",
      cameraNotReady: "Camera not ready yet. Wait a moment and try again.",
      cameraCaptureFailed: "Could not process photo. Please try again.",
      galleryDisabled:
        "Gallery and file picker are disabled. Only your device camera is used.",
      photoDisclaimer:
        "Photo authenticity is manually verified by investigators.",
      submit: "Submit securely",
      submitting: "Submitting...",
      statusPiiRedacting: "AI is checking for personal data (PII)...",
      statusReadingExif: "Reading photo metadata...",
      statusGeolocationFallback:
        "GPS missing in photo, fetching live location fallback...",
      statusStrippingMetadata: "Stripping metadata from evidence file...",
      statusUploadingEvidence: "Securely storing evidence...",
      statusEncrypting: "Encrypting data with PGP...",
      statusSubmitting: "Sending to the system...",
      genericError: "An error occurred. Please try again.",
      successTitle: "Success!",
      photoVerifyTitle: "About photo authenticity",
      photoVerifyBody:
        "Evidence photos are manually verified by investigators. No AI tool can detect AI-generated images with 100% accuracy; human experts are responsible.",
      blockchainVerified: "Blockchain Audit Trail Verified",
      immutableHashLabel: "Immutable Hash (SHA-256 Proof):",
      blockchainNote:
        "*This complaint is recorded on the blockchain network so its contents cannot be altered.",
      caseKeyKeep: "Keep your secret Case Key safe:",
      downloadReceipt: "Download digital evidence receipt (.txt)",
      checkStatus: "Check complaint status",
      newReport: "Submit another report",
      linkOversight: "Public oversight dashboard",
      linkCheckStatus: "Check status of a previous complaint",
    },
    status: {
      title: "Complaint status",
      subtitle: "Enter your secret Case Key to view investigation status.",
      checkButton: "Check status",
      searching: "Searching...",
      notFound: "Invalid Case Key or no matching complaint found.",
      currentStatus: "Current status",
      investigatorMessage: "Investigator message",
      noInvestigatorMessage: "No message from investigators yet.",
      yourComplaint: "Your original complaint",
      encryptedNotice:
        "This data is protected with PGP encryption. Only investigators can read it.",
      replyLabel: "Reply to investigator:",
      replyPlaceholder: "Type your message here...",
      sendReply: "Send message",
      sending: "Sending...",
      lastReply: "Your last sent reply:",
      backHome: "Back to home",
      toastReplySuccess: "Your message was sent successfully!",
      toastReplyError: "Could not send message.",
      statusPendingReview: "Pending (under review)",
    },
  },
  si: {
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
      exifPanelTitle: "ඡායාරූපයේ තොරතුරු (EXIF Metadata)",
      metadataReadError: "Metadata කියවීමේ දෝෂයක් මතු විය.",
      metadataNone: "ඡායාරූපයේ EXIF තොරතුරු ලබාගත නොහැකි විය.",
      exifDate: "ලබාගත් දිනය හා වේලාව:",
      exifGps: "ස්ථානය (GPS):",
      exifGpsMaps: "Maps වලින් බලන්න",
      exifSoftware: "උපාංගය / මෘදුකාංගය:",
    },
    home: {
      title: "ආරක්ෂිත තොරතුරු වාර්තාකරණය",
      subtitle:
        "AI තාක්ෂණය මගින් ඔබගේ පෞද්ගලික තොරතුරු ස්වයංක්‍රීයව හඳුනාගෙන මකා දැමේ.",
      descriptionLabel: "විස්තරය (Description):",
      descriptionPlaceholder: "විස්තරය ඇතුළත් කරන්න...",
      evidenceLabel: "සාක්ෂි (ඡායාරූප — කැමරාව පමණි):",
      cameraStarting: "කැමරාව සූදානම් වෙමින් පවතී...",
      capturePhoto: "📷 ඡායාරූපය ගන්න",
      cancel: "අවලංගු",
      evidencePreviewAlt: "සාක්ෂි පෙරදසුන",
      photoReadyHint:
        "✓ ඡායාරූපය සූදානම් — ගොනුවෙන් EXIF මකා DB වෙනම තොරතුරු පමණක් යවනු ලැබේ",
      removePhotoRetake: "ඡායාරූපය ඉවත් කර නැවත ගන්න",
      startCamera: "කැමරාව ආරම්භ කරන්න",
      cameraHttpsRequired:
        "කැමරාව HTTPS හෝ localhost මත පමණක් ක්‍රියා කරයි. ආරක්ෂිත සම්බන්ධතාවක් භාවිතා කරන්න.",
      cameraUnsupported: "මෙම බ්‍රවුසරය කැමරා ප්‍රවේශයට සහය නොදක්වයි.",
      cameraStartFailed:
        "කැමරාව ආරම්භ කළ නොහැක. බ්‍රවුසරයේ කැමරා අවසරය ලබා දී නැවත උත්සාහ කරන්න.",
      cameraNotReady:
        "කැමරාව තවම සූදානම් නැත. ක්ෂණයක් රැඳී නැවත ඡායාරූපය ගන්න.",
      cameraCaptureFailed:
        "ඡායාරූපය සැකසීමට නොහැකි විය. නැවත උත්සාහ කරන්න.",
      galleryDisabled:
        "ගැලරිය හෝ ෆයල් පද්ධතියෙන් තෝරාගැනීම අවහිරයි. ඔබගේ උපාංගයේ කැමරාව පමණක් භාවිතා වේ.",
      photoDisclaimer:
        "⚠️ ඡායාරූප සත්‍යතාව investigators විසින් manually verify කෙරේ.",
      submit: "ආරක්ෂිතව යොමු කරන්න",
      submitting: "යොමු කරමින් පවතී...",
      statusPiiRedacting:
        "AI මගින් පෞද්ගලික දත්ත (PII) පරික්ෂා කරමින් පවතී...",
      statusReadingExif: "ඡායාරූපයේ Metadata කියවමින් පවතී...",
      statusGeolocationFallback:
        "ඡායාරූපයේ GPS නොමැත, සජීවී ස්ථානය ලබාගනිමින් පවතී...",
      statusStrippingMetadata:
        "සාක්ෂි ගොනුවේ Metadata මකා දමමින් පවතී...",
      statusUploadingEvidence: "ආරක්ෂිතව සාක්ෂි ගබඩා කරමින් පවතී...",
      statusEncrypting: "PGP තාක්ෂණයෙන් දත්ත Encrypt කරමින් පවතී...",
      statusSubmitting: "තොරතුරු පද්ධතියට යොමු කරමින් පවතී...",
      genericError: "දෝෂයක් මතු විය. නැවත උත්සාහ කරන්න.",
      successTitle: "සාර්ථකයි!",
      photoVerifyTitle: "📋 ඡායාරූප සත්‍යතාව පිළිබඳව",
      photoVerifyBody:
        "ඔබ ඉදිරිපත් කළ සාක්ෂි ඡායාරූප පරීක්ෂකවරුන් (Investigators) විසින් manually verify කෙරේ. කිසිම AI tool එකකට 100% නිරවද්‍යව AI-generated ඡායාරූප හඳුනාගත නොහැකි බැවින්, ඒ වගකීම මිනිස් විශේෂඥයන් සතුයි.",
      blockchainVerified: "Blockchain Audit Trail Verified",
      immutableHashLabel: "Immutable Hash (SHA-256 Proof):",
      blockchainNote:
        "*මෙම පැමිණිල්ලේ අන්තර්ගතය වෙනස් කළ නොහැකි ලෙස Blockchain ජාලය මත සටහන් විය.",
      caseKeyKeep: "ඔබගේ රහස්‍ය Case Key ආරක්ෂිතව තබා ගන්න:",
      downloadReceipt: "ඩිජිටල් සාක්ෂි රිසිට්පත Download කරගන්න (.txt)",
      checkStatus: "පැමිණිල්ලේ තත්ත්වය පරීක්ෂා කරන්න",
      newReport: "නව තොරතුරක් යොමු කරන්න",
      linkOversight: "🔍 මහජන නිරීක්ෂණ පුවරුව (Public Oversight)",
      linkCheckStatus: "කලින් පැමිණිල්ලක් තිබේ නම් එහි තත්ත්වය බලන්න",
    },
    status: {
      title: "පැමිණිල්ලේ තත්ත්වය",
      subtitle:
        "ඔබගේ රහස්‍ය Case Key අංකය ඇතුළත් කර විමර්ශන තත්ත්වය දැනගන්න.",
      checkButton: "තත්ත්වය පරීක්ෂා කරන්න",
      searching: "සොයමින් පවතී...",
      notFound:
        "ඔබ ඇතුළත් කළ Case Key අංකය වැරදියි හෝ පැමිණිල්ලක් සොයාගත නොහැක.",
      currentStatus: "වත්මන් තත්ත්වය",
      investigatorMessage: "විමර්ශකයන්ගේ පණිවිඩය",
      noInvestigatorMessage: "තවමත් විමර්ශකයන්ගෙන් පණිවිඩයක් ලැබී නොමැත.",
      yourComplaint: "ඔබගේ මුල් පැමිණිල්ල",
      encryptedNotice:
        "මෙම දත්ත PGP තාක්ෂණයෙන් ආරක්ෂිතව සංකේතනය (Encrypt) කර ඇත. මෙය කියවිය හැක්කේ විමර්ශකයින්ට පමණි.",
      replyLabel: "විමර්ශකයාට පිළිතුරක් යවන්න:",
      replyPlaceholder: "ඔබේ පණිවිඩය මෙතැන ටයිප් කරන්න...",
      sendReply: "පණිවිඩය යවන්න",
      sending: "යවමින් පවතී...",
      lastReply: "✓ ඔබ යැවූ අවසන් පිළිතුර:",
      backHome: "ආපසු ප්‍රධාන පිටුවට",
      toastReplySuccess: "ඔබේ පණිවිඩය සාර්ථකව යොමු කෙරුණා!",
      toastReplyError: "පණිවිඩය යැවීමට නොහැකි විය!",
      statusPendingReview: "Pending (සමාලෝචනය වෙමින් පවතී)",
    },
  },
} as const;

export function getStatusPageLabel(
  status: string | undefined,
  lang: Language,
): string {
  if (!status) return translations[lang].status.statusPendingReview;
  return getAdminStatusLabel(status, lang);
}

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
  return getStatusPageLabel(status, lang);
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