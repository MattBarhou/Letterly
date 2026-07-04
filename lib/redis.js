import { Redis } from "@upstash/redis";

let redis;

export function isRedisConfigured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

export function getRedis() {
  if (!isRedisConfigured()) {
    return null;
  }

  if (!redis) {
    redis = Redis.fromEnv();
  }

  return redis;
}
