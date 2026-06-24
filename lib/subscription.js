import { getRedis } from "@/lib/redis";

function subscriptionKey(userId) {
  return `letterly:subscription:${userId}`;
}

function customerKey(stripeCustomerId) {
  return `letterly:stripe-customer:${stripeCustomerId}`;
}

export async function getSubscription(userId) {
  const redis = getRedis();
  if (!redis) {
    return { tier: "free", status: "active" };
  }

  const data = await redis.get(subscriptionKey(userId));
  if (!data) {
    return { tier: "free", status: "active" };
  }

  return typeof data === "string" ? JSON.parse(data) : data;
}

export async function setSubscription(userId, subscription) {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  await redis.set(subscriptionKey(userId), subscription);

  if (subscription.stripeCustomerId) {
    await redis.set(customerKey(subscription.stripeCustomerId), userId);
  }
}

export async function getUserIdFromCustomer(stripeCustomerId) {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  return redis.get(customerKey(stripeCustomerId));
}

export async function clearSubscription(userId) {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  const existing = await getSubscription(userId);
  if (existing.stripeCustomerId) {
    await redis.del(customerKey(existing.stripeCustomerId));
  }

  await redis.del(subscriptionKey(userId));
}
