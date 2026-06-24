import { getPlan } from "@/lib/plans";
import { getRedis } from "@/lib/redis";
import { getSubscription } from "@/lib/subscription";

function lifetimeUsageKey(userId) {
  return `letterly:usage:${userId}:lifetime`;
}

function monthlyUsageKey(userId) {
  const month = new Date().toISOString().slice(0, 7);
  return `letterly:usage:${userId}:${month}`;
}

async function getUsageCount(userId, plan) {
  const redis = getRedis();
  if (!redis) {
    return 0;
  }

  const key = plan.lifetime ? lifetimeUsageKey(userId) : monthlyUsageKey(userId);
  const count = await redis.get(key);
  return Number(count) || 0;
}

export async function getUsageInfo(userId) {
  const subscription = await getSubscription(userId);
  const tier =
    subscription.status === "active" ? subscription.tier : "free";
  const plan = getPlan(tier);
  const used = await getUsageCount(userId, plan);
  const remaining = Math.max(0, plan.limit - used);

  return {
    tier: plan.id,
    planName: plan.name,
    limit: plan.limit,
    used,
    remaining,
    lifetime: plan.lifetime,
    isActive: subscription.status === "active" || tier === "free",
    canExportZip: tier === "premium" && subscription.status === "active",
  };
}

export async function canGenerate(userId) {
  const info = await getUsageInfo(userId);
  return {
    allowed: info.remaining > 0,
    ...info,
  };
}

export async function incrementUsage(userId) {
  const subscription = await getSubscription(userId);
  const tier =
    subscription.status === "active" ? subscription.tier : "free";
  const plan = getPlan(tier);

  const redis = getRedis();
  if (!redis) {
    return;
  }

  const key = plan.lifetime ? lifetimeUsageKey(userId) : monthlyUsageKey(userId);
  await redis.incr(key);

  if (!plan.lifetime) {
    const secondsUntilMonthEnd = getSecondsUntilMonthEnd();
    await redis.expire(key, secondsUntilMonthEnd);
  }
}

function getSecondsUntilMonthEnd() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return Math.ceil((nextMonth.getTime() - now.getTime()) / 1000);
}

export function getUsageLimitMessage(info) {
  if (info.lifetime) {
    return `You've used all ${info.limit} free generations. Upgrade to Starter or Premium to keep applying.`;
  }

  return `You've used all ${info.limit} generations this month on the ${info.planName} plan. Upgrade or wait until next month.`;
}
