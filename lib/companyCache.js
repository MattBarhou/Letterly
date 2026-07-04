import { getRedis, isRedisConfigured } from "@/lib/redis";

const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const REQUIRED_FIELDS = [
  "overview",
  "culture",
  "techFocus",
  "whyEngineersJoin",
  "canadaNotes",
];

export function getCompanyCacheKey(company) {
  const slug = company
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `company-research:${slug || "unknown"}`;
}

function isValidResearch(research) {
  if (!research || typeof research !== "object") {
    return false;
  }

  return REQUIRED_FIELDS.every(
    (field) => typeof research[field] === "string" && research[field].trim()
  );
}

export async function getCachedCompanyResearch(company) {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  try {
    const cached = await redis.get(getCompanyCacheKey(company));
    if (!isValidResearch(cached)) {
      return null;
    }

    return cached;
  } catch (error) {
    console.error("Redis cache read error:", error);
    return null;
  }
}

export async function setCachedCompanyResearch(company, research) {
  const redis = getRedis();
  if (!redis || !isValidResearch(research)) {
    return false;
  }

  try {
    await redis.set(getCompanyCacheKey(company), research, {
      ex: TTL_SECONDS,
    });
    return true;
  } catch (error) {
    console.error("Redis cache write error:", error);
    return false;
  }
}

export function getCompanyCacheStatus() {
  return {
    enabled: isRedisConfigured(),
  };
}
