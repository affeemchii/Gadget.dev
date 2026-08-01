import { applyParams, save, ActionOptions } from "gadget-server";
import { preventCrossShopDataAccess } from "gadget-server/shopify";
import { getPlanFromSubscription, getPlanFeatures } from "../../services/planFeatures";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);

  const conn = connections as any;

  // Auto-link shop
  if (conn.shopify?.currentShopId && !(record as any).shopId) {
    (record as any).shopId = conn.shopify.currentShopId;
  }

  // Check plan limits before saving
  const shopId = conn.shopify?.currentShopId;
  if (shopId) {
    let subscription = null;
    try {
      subscription = await api.getActiveShopSubscription({ shopId: shopId.toString() });
    } catch (e: any) {
      logger.warn({ error: e.message }, "Could not fetch subscription, defaulting to starter limits");
      subscription = { items: [{ description: "Starter" }] };
    }

    const plan = getPlanFromSubscription(subscription);
    const features = getPlanFeatures(plan);

    if (features.maxAlertRules !== Infinity) {
      const existingRules = await api.alertRule.findMany({
        filter: { shopId: { equals: shopId.toString() } },
        select: { id: true },
      });

      if (existingRules.length >= features.maxAlertRules) {
        throw new Error(
          `Your ${plan} plan allows a maximum of ${features.maxAlertRules} alert rules. Please upgrade to Pro for unlimited rules.`
        );
      }
    }
  }

  await save(record);
};

export const options: ActionOptions = {
  actionType: "create",
};