export const run = async ({ params, logger, api }: any) => {
  const shopId = params?.shopId as string;
  const order = params?.order as Record<string, any>;

  if (!shopId || !order) {
    logger.error("Missing shopId or order payload");
    return { success: false };
  }

  logger.info({ shopId, orderId: order.id }, "Order updated webhook received");

  // Only create an alert event for payment failures
  const failedStatuses = ["voided", "refunded", "partially_refunded"];
  if (failedStatuses.includes(order.financial_status)) {
    await api.alertEvent.create({
      ruleName: "webhook-capture",
      metric: "payment",
      message: `Order #${order.order_number} payment status: ${order.financial_status}`,
      severity: "warning",
      triggeredAt: new Date(order.updated_at),
      resolved: false,
      shop: { _link: shopId },
    });
  }

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
      updated_at: { type: "string" },
    },
  },
};
export const options = {
  triggers: {
    shopify: {
      triggerKey: "handleOrderUpdated",
    },
  },
}