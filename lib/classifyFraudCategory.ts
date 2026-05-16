import type { FraudCategory } from "../translations";

/** Classify complaint text into a canonical English fraud category key. */
export function classifyFraudCategory(text: string): FraudCategory {
  const lower = text.toLowerCase();

  if (
    /\b(bribe|bribery|rishwat|lakshan|laksha|loku sevaya|loku une|දූෂණ|ලණ්ඩම්)\b/i.test(
      lower,
    )
  ) {
    return "Bribery";
  }
  if (
    /\b(cyber|hack|phish|scam|online fraud|identity theft|සයිබර්|අන්තර්ජාල)\b/i.test(
      lower,
    )
  ) {
    return "Cyber Crime";
  }
  if (
    /\b(embezzle|misappropriat|හොරකම|භත්ස්‍යා|salli horakam|horakam)\b/i.test(
      lower,
    )
  ) {
    return "Embezzlement";
  }
  if (/\b(corrupt|corruption|දූෂිත|rishwat)\b/i.test(lower)) {
    return "Corruption";
  }
  if (/\b(fraud|වංචා|වංචාව|allasa|allasal)\b/i.test(lower)) {
    return "Fraud";
  }
  if (
    /\b(harass|abuse|bully|හිංසන|අතිභෝග|piadinawa|piadin)\b/i.test(lower)
  ) {
    return "Harassment";
  }

  return "General";
}
