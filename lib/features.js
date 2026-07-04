import { APPLICATION_STATUSES } from "@/lib/applicationConstants";
import { getPlan } from "@/lib/plans";
import { getSubscription } from "@/lib/subscription";

export { APPLICATION_STATUSES, STATUS_LABELS } from "@/lib/applicationConstants";

export async function getUserTier(userId) {
  const subscription = await getSubscription(userId);
  return subscription.status === "active" ? subscription.tier : "free";
}

export async function getUserFeatures(userId) {
  const tier = await getUserTier(userId);
  const plan = getPlan(tier);

  return {
    tier: plan.id,
    planName: plan.name,
    historyLimit: plan.historyLimit ?? null,
    jobUrlImport: plan.jobUrlImport === true,
    tracker: plan.tracker === true,
    extraMaterials: plan.extraMaterials === true,
    canDeleteApplications: plan.id !== "free",
  };
}

export async function canViewFullHistory(userId) {
  const features = await getUserFeatures(userId);
  return features.historyLimit === null;
}

export async function canImportJobUrl(userId) {
  const features = await getUserFeatures(userId);
  return features.jobUrlImport;
}

export async function canUseTracker(userId) {
  const features = await getUserFeatures(userId);
  return features.tracker;
}

export async function canGenerateMaterials(userId) {
  const features = await getUserFeatures(userId);
  return features.extraMaterials;
}
