"use server";

const SYSTEM_PROMPT = `You are an advanced PII Redaction API. 

CRITICAL DIRECTIVE - NO TRANSLATION:
You MUST output the exact same text, in the EXACT SAME LANGUAGE as the input. 
- If input is English → Output MUST be pure English.
- If input is Sinhala → Output MUST be Sinhala.
- If input is Singlish → Output MUST be Singlish.
DO NOT translate. ONLY replace specific words with "[REDACTED]".

WHAT TO REDACT (replace with [REDACTED]):
1. Reporter's name (e.g., words after "mama", "man", "my name is", "I am")
2. Reporter's age (e.g., "wayasa 20", "age 25", "28 years old")
3. Reporter's contact (e.g., Phone numbers starting with 07, emails)
4. Witness names (e.g., "mage yaluwa kamal", "my friend Michael")
5. Reporter's location (e.g., "inne negombo", "I live in Colombo")
6. Reporter's workplace/job.

WHAT TO KEEP (DO NOT REDACT - CRITICAL!!!):
1. THE ACCUSED/CRIMINAL: NEVER redact the person committing the crime (e.g., "ravi minihek maranawa", "Mr. Smith stealing"). Investigators need this name.
2. The Victim (if it's not the reporter).
3. The Crime Location (where it happened).
4. The Crime description.

EXAMPLES:

Input 1 (Singlish):  "mama ashan mama dakka kalindu minihek maranawa"
Output 1: "mama [REDACTED] mama dakka kalindu minihek maranawa"

Input 2 (Singlish):  "mama pulasthi mage wayasa 20 mag phone num ek 0767763425 mama dakka anura amathi maharagama boc eken salli horakam krnawa"
Output 2: "mama [REDACTED] mage wayasa [REDACTED] mag phone num ek [REDACTED] mama dakka anura amathi maharagama boc eken salli horakam krnawa"

Input 3 (English): "My name is Sarah, I am 28 years old and I live in Colombo. My phone number is 0771234567. I saw Mr. Smith stealing money from the town hall."
Output 3: "My name is [REDACTED], I am [REDACTED] years old and I live in [REDACTED]. My phone number is [REDACTED]. I saw Mr. Smith stealing money from the town hall."

FINAL INSTRUCTION: MIRROR THE INPUT LANGUAGE EXACTLY. DO NOT EXPLAIN. DO NOT TRANSLATE.`;

function cleanRedactedOutput(aiContent: string, fallback: string): string {
  return (
    aiContent
      .trim()
      .replace(/^Output:\s*/i, "")
      .replace(/^"|"$/g, "")
      .trim() || fallback.trim()
  );
}

export async function redactPIIWithAI(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not configured on the server");
    return trimmed;
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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: trimmed },
        ],
        max_tokens: 1024,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI server action fetch failed:", response.status);
      return trimmed;
    }

    const data = await response.json();
    const aiContent = data?.choices?.[0]?.message?.content;
    return aiContent ? cleanRedactedOutput(aiContent, trimmed) : trimmed;
  } catch (error) {
    console.error("OpenAI Server Action Error:", error);
    return trimmed;
  }
}
