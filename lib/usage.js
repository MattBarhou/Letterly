import { getPlan } from "@/lib/plans";
import { getRedis } from "@/lib/redis";
import { getSubscription } from "@/lib/subscription";

function lifetimeUsageKey(userId) {
  return `letterly:usage:${userId}:lifetime`;
}

function lifetimeExportUsageKey(userId) {
  return `letterly:export:${userId}:lifetime`;
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

async function getExportUsageCount(userId) {
  const redis = getRedis();
  if (!redis) {
    return 0;
  }

  const count = await redis.get(lifetimeExportUsageKey(userId));
  return Number(count) || 0;
}

function getExportInfo(tier, subscription, plan, exportUsed) {
  const isPremium = tier === "premium" && subscription.status === "active";

  if (isPremium) {
    return {
      exportLimit: null,
      exportUsed: 0,
      exportRemaining: null,
      canExportZip: true,
    };
  }

  if (tier === "free") {
    const exportLimit = plan.exportLimit ?? 3;
    const exportRemaining = Math.max(0, exportLimit - exportUsed);

    return {
      exportLimit,
      exportUsed,
      exportRemaining,
      canExportZip: exportRemaining > 0,
    };
  }

  return {
    exportLimit: 0,
    exportUsed: 0,
    exportRemaining: 0,
    canExportZip: false,
  };
}

export async function getUsageInfo(userId) {
  const subscription = await getSubscription(userId);
  const tier =
    subscription.status === "active" ? subscription.tier : "free";
  const plan = getPlan(tier);
  const used = await getUsageCount(userId, plan);
  const remaining = Math.max(0, plan.limit - used);
  const exportUsed = tier === "free" ? await getExportUsageCount(userId) : 0;
  const exportInfo = getExportInfo(tier, subscription, plan, exportUsed);

  return {
    tier: plan.id,
    planName: plan.name,
    limit: plan.limit,
    used,
    remaining,
    lifetime: plan.lifetime,
    isActive: subscription.status === "active" || tier === "free",
    ...exportInfo,
  };
}

export async function canGenerate(userId) {
  const info = await getUsageInfo(userId);
  return {
    allowed: info.remaining > 0,
    ...info,
  };
}

export async function canExportZip(userId) {
  const info = await getUsageInfo(userId);
  return {
    allowed: info.canExportZip,
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

export async function incrementExportUsage(userId) {
  const subscription = await getSubscription(userId);
  const tier =
    subscription.status === "active" ? subscription.tier : "free";

  if (tier !== "free") {
    return;
  }

  const redis = getRedis();
  if (!redis) {
    return;
  }

  await redis.incr(lifetimeExportUsageKey(userId));
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

export function getExportLimitMessage(info) {
  if (info.tier === "free") {
    return `You've used all ${info.exportLimit} free ZIP exports. Upgrade to Premium for unlimited exports.`;
  }

  return "ZIP export is available on the Premium plan.";
}
