import { getRedis, isRedisConfigured } from "@/lib/redis";

const GUEST_PREFIX = "letterly:guest-generate";
const TEASER_MAX_CHARS = 160;
const GUEST_TTL_SECONDS = 60 * 60 * 26;

export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

function guestDayKey(request) {
  const ip = getClientIp(request);
  const dayKey = new Date().toISOString().slice(0, 10);
  return `${GUEST_PREFIX}:used:${ip}:${dayKey}`;
}

/**
 * Check whether a guest may generate. Does not consume quota.
 * Call consumeGuestGenerateQuota after a successful OpenAI response.
 */
export async function canGuestGenerate(request) {
  if (!isRedisConfigured()) {
    return {
      allowed: false,
      code: "GUEST_UNAVAILABLE",
      error:
        "Guest previews are temporarily unavailable. Sign up free to generate application materials.",
    };
  }

  const redis = getRedis();
  const key = guestDayKey(request);
  const used = await redis.get(key);

  if (used) {
    return {
      allowed: false,
      code: "GUEST_LIMIT",
      error: getGuestLimitErrorMessage(),
    };
  }

  return { allowed: true };
}

/**
 * Mark guest quota as used for today after a successful generation.
 */
export async function consumeGuestGenerateQuota(request) {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  await redis.set(guestDayKey(request), "1", { ex: GUEST_TTL_SECONDS });
}

export function teaserText(text, maxChars = TEASER_MAX_CHARS) {
  const trimmed = String(text || "").trim();
  if (trimmed.length <= maxChars) {
    return trimmed;
  }

  const slice = trimmed.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > 40 ? slice.slice(0, lastSpace) : slice;
  return `${cut}…`;
}

export function toGuestPreviewOutputs(outputs) {
  return {
    guestPreview: true,
    coverLetterDetailed: outputs.coverLetterDetailed,
    coverLetterBasic: teaserText(outputs.coverLetterBasic),
    recruiterEmail: teaserText(outputs.recruiterEmail),
    linkedinMessage: teaserText(outputs.linkedinMessage),
    atsVersion: teaserText(outputs.atsVersion),
  };
}

export function getGuestLimitErrorMessage() {
  return "You've used today's free preview. Sign up free to unlock all documents and get 3 full packages.";
}
