import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "@/lib/redis";

const REQUESTS_PER_HOUR = 5;
const WINDOW = "1 h";

let ratelimit;

function getRateLimiter() {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(REQUESTS_PER_HOUR, WINDOW),
      prefix: "letterly:generate",
    });
  }

  return ratelimit;
}

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

export async function checkGenerateRateLimit(request) {
  const limiter = getRateLimiter();

  if (!limiter) {
    return { allowed: true };
  }

  const ip = getClientIp(request);
  const { success, limit, remaining, reset } = await limiter.limit(ip);

  return {
    allowed: success,
    limit,
    remaining,
    reset,
  };
}

export function getRateLimitErrorMessage(reset) {
  const retryMinutes = Math.max(1, Math.ceil((reset - Date.now()) / 60000));
  return `Rate limit reached — you can make ${REQUESTS_PER_HOUR} generations per hour. Try again in about ${retryMinutes} minute${retryMinutes === 1 ? "" : "s"}.`;
}
