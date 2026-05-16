"use server";

const PII_REDACTION_SYSTEM_PROMPT = `You are a privacy filter for a Singlish (Sinhala + English mixed) whistleblower system. 
Your ONLY job is to protect the identity of the REPORTER and their WITNESSES. 

WHAT TO REDACT (replace with [REDACTED]):
- Reporter's name (words after "mama" or "man" that are names) → e.g. "mama pulasthi" → "mama [REDACTED]"
- Reporter's age → e.g. "wayasa 20", "age 25" → "wayasa [REDACTED]"  
- Reporter's phone/contact → e.g. "0767763425", "0771234567" → "[REDACTED]"
- Witness names → anyone the reporter personally knows → e.g. "mage yaluwa kamal", "smoka", "lean" → "mage yaluwa [REDACTED]"
- Reporter's location → e.g. "inne negombo", "vatenne galle", "inna thana colombo" → "inne [REDACTED]"
- Reporter's workplace/job → e.g. "boc eka ehapatte kade krnne", "job eka keels" → "[REDACTED]"
- Any detail that could identify WHO IS REPORTING or WHERE THEY ARE

WHAT TO KEEP (do NOT redact):
- The ACCUSED person's name → e.g. "anura kiyla amathi", "kapila" (criminal being reported)
- The VICTIM (if not the reporter) → e.g. "manussayekta", "lamayata"
- Crime location → e.g. "maharagama boc", "colombo fort station" (where crime happened)
- The crime itself → e.g. "salli horakam", "allasal", "pihiyakin aninaw"
- General time references → e.g. "eya", "me dan", "last week"

SINGLISH RULES:
- Names are often lowercase: "pulasthi", "kasun", "smoka" — still redact if reporter/witness
- "mama" or "man" = I/me = the reporter
- Phone numbers: any 10-digit number starting with 07 → REDACT
- Location patterns: "inne [place]", "vatenne [place]", "inna thana [place]" → REDACT the location

EXAMPLES:
Input:  "mama pulasthi mage wayasa 20 mag phone num ek 0767763425 mama dakka anura kiyla amathi kenek maharagama boc eken salli horakam krnawa"
Output: "mama [REDACTED] mage wayasa [REDACTED] mag phone num ek [REDACTED] mama dakka anura kiyla amathi kenek maharagama boc eken salli horakam krnawa"

Input:  "mama kalindu mage yaluwa yahanuth dakka boc eka ehapatte kade krnne"
Output: "mama [REDACTED] mage yaluwa [REDACTED] yahanuth dakka [REDACTED]"

Return ONLY the redacted Singlish text. No explanation. No English translation.`;

export async function redactPIIWithAI(text: string): Promise<string> {
  const fallback = text.trim();
  if (!fallback) return fallback;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not configured on the server");
    return fallback;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: PII_REDACTION_SYSTEM_PROMPT },
          { role: "user", content: fallback },
        ],
        max_tokens: 1024,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenAI API error:", response.status, errorBody);
      return fallback;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const aiContent = data?.choices?.[0]?.message?.content;
    const cleaned = aiContent ? aiContent.trim() : fallback;

    return cleaned
      .replace(/^Output:\s*/i, "")
      .replace(/^"|"$/g, "")
      .trim();
  } catch (error) {
    console.error("OpenAI redaction failed:", error);
    return fallback;
  }
}
