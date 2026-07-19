export const run = async ({ params, logger, api }: any) => {
  const shopId = params?.shopId as string;
  const order = params?.order as Record<string, any>;

  if (!shopId || !order) {
    logger.error("Missing shopId or order payload");
    return { success: false };
  }

  logger.info({ shopId, orderId: order.id }, "Order created webhook received");

  await api.alertEvent.create({
    ruleName: "webhook-capture",
    metric: "orders",
    message: `Order #${order.order_number} created - $${order.total_price}`,
    severity: "info",
    triggeredAt: new Date(order.created_at),
    resolved: false,
    shop: { _link: shopId },
  });

  return { success: true, orderId: order.id };
};

export const params = {
  shopId: { type: "string" },
  order: {
    type: "object",
    properties: {
      id: { type: "string" },
      order_number: { type: "number" },
      total_price: { type: "string" },
      financial_status: { type: "string" },
      created_at: { type: "string" },
    },
  },
};
export const options = {
  triggers: {
    shopify: {
      triggerKey: "handleOrderCreate",
    },
  },
}