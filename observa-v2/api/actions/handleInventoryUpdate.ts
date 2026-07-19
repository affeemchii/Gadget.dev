export const run = async ({ params, logger, api }: any) => {
  const shopId = params?.shopId as string;
  const inventoryLevel = params?.inventoryLevel as Record<string, any>;

  if (!shopId || !inventoryLevel) {
    logger.error("Missing shopId or inventoryLevel payload");
    return { success: false };
  }

  logger.info({ shopId, inventoryItemId: inventoryLevel.inventory_item_id }, "Inventory update webhook received");

  await api.alertEvent.create({
    ruleName: "webhook-capture",
    metric: "inventory",
    message: `Inventory updated - item ${inventoryLevel.inventory_item_id} now has ${inventoryLevel.available} units available`,
    severity: "info",
    triggeredAt: new Date(inventoryLevel.updated_at),
    resolved: false,
    shop: { _link: shopId },
  });

  return { success: true, inventoryItemId: inventoryLevel.inventory_item_id };
};

export const params = {
  shopId: { type: "string" },
  inventoryLevel: {
    type: "object",
    properties: {
      inventory_item_id: { type: "string" },
      location_id: { type: "string" },
      available: { type: "number" },
      updated_at: { type: "string" },
    },
  },
};
export const options = {
  triggers: {
    shopify: {
      triggerKey: "andleInventoryUpdate",
    },
  },
}