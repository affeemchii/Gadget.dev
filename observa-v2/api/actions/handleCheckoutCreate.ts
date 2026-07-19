export const run = async ({ params, logger, api }: any) => {
  const shopId = params?.shopId as string;
  const checkout = params?.checkout as Record<string, any>;

  if (!shopId || !checkout) {
    logger.error("Missing shopId or checkout payload");
    return { success: false };
  }

  logger.info({ shopId, checkoutId: checkout.id }, "Checkout created webhook received");

  await api.alertEvent.create({
    ruleName: "webhook-capture",
    metric: "checkout",
    message: `Checkout started - $${checkout.total_price}`,
    severity: "info",
    triggeredAt: new Date(checkout.created_at),
    resolved: false,
    shop: { _link: shopId },
  });

  return { success: true, checkoutId: checkout.id };
};

export const params = {
  shopId: { type: "string" },
  checkout: {
    type: "object",
    properties: {
      id: { type: "string" },
      total_price: { type: "string" },
      created_at: { type: "string" },
    },
  },
};
export const options = {
  triggers: {
    shopify: {
      triggerKey: "handleCheckoutCreate",
    },
  },
}