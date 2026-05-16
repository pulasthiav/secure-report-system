"use server";

const SYSTEM_PROMPT = `You are an advanced PII Redaction API. 

CRITICAL DIRECTIVE - NO TRANSLATION:
You MUST output the exact same words in the EXACT SAME LANGUAGE as the input. 
- If input is English → Output MUST be English.
- If input is Sinhala → Output MUST be Sinhala.
- If input is Singlish → Output MUST be Singlish.
NEVER translate. ONLY replace specific identifying words with "[REDACTED]".

WHAT TO REDACT:
- Reporter's name & Witness names.
- Reporter's age, phone number, address, and workplace.

SINGLISH / SINHALA NAME RULES (MANDATORY):
- Aggressively redact reporter/witness given names in Singlish and Sinhala, even when lowercase or without spaces (e.g., "ashan", "kasun", "nimal", "ashan mn").
- If the text starts with "mama [name]" or "mage nama [name]" or "my name is [name]", YOU MUST redact the [name] immediately after that phrase.
- If the text contains "mama dakka", "mama kiyanne", "mama yanne" — redact reporter names that appear BEFORE or right AFTER "mama" when they identify the reporter (not the accused).
- Common Singlish reporter patterns: "mama <name>", "mage nama <name>", "mama <name> mage", "<name> kiyala", "with <name>".
- When unsure whether a word is a reporter name vs accused, redact only if it appears in a self-identification context (mama/mage nama/my name/I am).

WHAT TO KEEP (CRITICAL - DO NOT REDACT):
- THE ACCUSED/CRIMINAL: Never redact the person committing the crime (e.g., Mr. Smith, Kalindu, Siridasa).
- The victim, the crime location, and the crime description.

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

[Sinhala Input]
මම කසුන්, වයස 25. මගේ යාළුවා නිමල් එක්ක ඉන්නකොට දැක්කා සිරිදාස බැංකුව ළඟදි සල්ලි හොරකම් කරනවා.
[Sinhala Output]
මම [REDACTED], වයස [REDACTED]. මගේ යාළුවා [REDACTED] එක්ක ඉන්නකොට දැක්කා සිරිදාස බැංකුව ළඟදි සල්ලි හොරකම් කරනවා.

FINAL INSTRUCTION: OUTPUT ONLY THE REDACTED TEXT. MATCH THE INPUT LANGUAGE EXACTLY. NO EXTRA WORDS.`;

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
