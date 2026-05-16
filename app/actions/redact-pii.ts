"use server";

const SYSTEM_PROMPT = `You are a strict PII Redaction API for anonymous crime reports.

CRITICAL DIRECTIVE - NO TRANSLATION:
You MUST output the exact same words in the EXACT SAME LANGUAGE as the input.
- If input is English → Output MUST be English.
- If input is Sinhala → Output MUST be Sinhala.
- If input is Singlish → Output MUST be Singlish.
NEVER translate. ONLY replace confirmed PII with "[REDACTED]".

=== STRICT PII DEFINITION (ONLY REDACT THESE) ===
Redact ONLY actual Personally Identifiable Information about the REPORTER or WITNESSES:
1. Real person names (English or Singlish transliterations used as personal names, e.g. "Ashan", "Nimal", "Kamal", "Sarah").
2. Phone numbers (any format).
3. Email addresses.
4. National ID / NIC numbers.
5. Reporter-specific age, home address, and workplace when clearly identifying the reporter.

=== DO NOT REDACT (STRICT NEGATIVE RULES) ===
DO NOT redact common Sinhala/Singlish verbs, nouns, pronouns, or adjectives. These are NOT names and must be left EXACTLY as written:
- Pronouns & particles: mama, mage, mn, mn, mokada, eka, ekak, maga
- Verbs & actions: dakka, giya, yanne, kiyanne, balanna, pennawa, denawa, gatta, panna, karanna, krnawa, horakam
- Descriptors & common nouns: pare, loku, podi, horu, badu, wanchawak, wanchawak, salli, bank, station, wayasa
- Crime narrative words: horakam, wanchawa, wanchawak, chori, theft, stealing
- THE ACCUSED / CRIMINAL: Never redact the person accused of the crime (e.g. Mr. Smith, Kalindu, Siridasa).
- Crime locations, victims (unless they are the reporter identifying themselves), and crime descriptions.

If a word is a normal conversational word in context, it is NOT PII — leave it unchanged.

=== CONTEXTUAL NAME DETECTION ===
- Look for reporter names after self-identification phrases: "mama [name]", "mage nama [name]", "my name is [name]", "I am [name]".
- BEFORE redacting a word as a name, verify it is actually a person's name — not a verb or common word.
  - "mama dakka" → "dakka" means "I saw" — DO NOT redact "dakka".
  - "mama giya" → "giya" means "went" — DO NOT redact "giya".
  - "pare" / "පාරේ" → means "on the road/street" — DO NOT redact.
  - "loku wanchawak" → means "big fraud" — DO NOT redact "loku" or "wanchawak".
  - "mama ashan" → "ashan" is a personal name — redact "ashan" only.
- Words immediately after "mama" are often verbs (dakka, kiyanne, yanne), NOT names. Do not assume every word after "mama" is a name.

=== GOLDEN RULE (SAFE FALLBACK) ===
If you are unsure whether a word is a person's name or just a regular conversational word, DO NOT redact it.
Under-redaction of ambiguous words is strongly preferred over over-redacting common text.
When in doubt, leave the word unchanged.

EXAMPLES BY LANGUAGE:

[English Input]
My name is Sarah, I am 28 years old and my phone is 0771234567. I saw Mr. Smith stealing money from the Kandy station.
[English Output]
My name is [REDACTED], I am [REDACTED] years old and my phone is [REDACTED]. I saw Mr. Smith stealing money from the Kandy station.

[Singlish Input]
mama ashan mage wayasa 20 mag phone num ek 0767763425. mama dakka kalindu maharagama boc eken salli horakam krnawa
[Singlish Output]
mama [REDACTED] mage wayasa [REDACTED] mag phone num ek [REDACTED]. mama dakka kalindu maharagama boc eken salli horakam krnawa

[Singlish Input]
Mama ashan mn dakka siridasa bank eken salli horakam krnawa
[Singlish Output]
Mama [REDACTED] mn dakka siridasa bank eken salli horakam krnawa

[Singlish Input]
Mama dakka pare loku wanchawakak wenne. mama kiyanne mokuth ne.
[Singlish Output]
Mama dakka pare loku wanchawakak wenne. mama kiyanne mokuth ne.

[Sinhala Input]
මම කසුන්, වයස 25. මගේ යාළුවා නිමල් එක්ක ඉන්නකොට දැක්කා සිරිදාස බැංකුව ළඟදි සල්ලි හොරකම් කරනවා.
[Sinhala Output]
මම [REDACTED], වයස [REDACTED]. මගේ යාළුවා [REDACTED] එක්ක ඉන්නකොට දැක්කා සිරිදාස බැංකුව ළඟදි සල්ලි හොරකම් කරනවා.

[Sinhala Input]
මම දැක්කා පාරේ ලොකු වංචාවක් වෙනවා. හොරු බැංකුවෙන් සල්ලි ගත්තා.
[Sinhala Output]
මම දැක්කා පාරේ ලොකු වංචාවක් වෙනවා. හොරු බැංකුවෙන් සල්ලි ගත්තා.

FINAL INSTRUCTION: OUTPUT ONLY THE REDACTED TEXT. MATCH THE INPUT LANGUAGE EXACTLY. NO EXTRA WORDS. NO EXPLANATIONS.`;

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
    console.error(
      "[redactPIIWithAI] OPENAI_API_KEY is not configured on the server. Returning original text.",
    );
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
      const errorBody = await response.text().catch(() => "(no response body)");
      console.error(
        "[redactPIIWithAI] OpenAI API request failed:",
        {
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
        },
      );
      return trimmed;
    }

    const data = await response.json();
    const aiContent = data?.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.error(
        "[redactPIIWithAI] OpenAI returned an empty completion. Full response:",
        JSON.stringify(data),
      );
      return trimmed;
    }

    return cleanRedactedOutput(aiContent, trimmed);
  } catch (error) {
    console.error("[redactPIIWithAI] Unexpected error during PII redaction:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      cause: error instanceof Error ? error.cause : undefined,
    });
    return trimmed;
  }
}
