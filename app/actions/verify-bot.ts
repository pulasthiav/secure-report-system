"use server";
import { headers } from "next/headers";

const rateLimitMap = new Map<string, number[]>();
const MAX_REQUESTS_PER_MINUTE = 5;

export async function verifyBotProtection(token: string) {
  if (!token) {
    return { success: false, error: "Missing captcha token" };
  }

  // 1. Server-Side In-Memory Rate Limiting
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "anonymous_client";
  const now = Date.now();

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const timestamps = rateLimitMap.get(ip) || [];
  const activeTimestamps = timestamps.filter((time) => now - time < 60_000);

  if (activeTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    return {
      success: false,
      error:
        "Rate limit exceeded. Too many submissions from this connection. Please wait a minute.",
    };
  }

  activeTimestamps.push(now);
  rateLimitMap.set(ip, activeTimestamps);

  // 2. Cloudflare Turnstile Universal Test Verification
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=1x000000000000000000000000000000AA&response=${encodeURIComponent(token)}`,
      },
    );

    const data = (await res.json()) as { success: boolean };
    return { success: !!data.success };
  } catch (err) {
    console.error("Turnstile verification failed:", err);
    return { success: false, error: "Internal security verification failed" };
  }
}
