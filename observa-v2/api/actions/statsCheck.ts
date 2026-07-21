export const run: ActionRun = async ({ params, logger, api }) => {
  try {
    const now = new Date();
    logger.info({ utcTime: now.toISOString() }, "Alert engine starting");

    // Fetch all active alert rules across all shops
    const activeRules = await api.alertRule.findMany({
      filter: {
        isActive: { equals: true },
      },
      select: {
        id: true,
        name: true,
        metric: true,
        condition: true,
        threshold: true,
        timeWindow: true,
        cooldown: true,
        notifyEmail: true,
        notifySlack: true,
        notifyWhatsapp: true,
        lastTriggeredAt: true,
        shopId: true,
      },
    });

    if (activeRules.length === 0) {
      logger.info("No active alert rules found");
      return { success: true, rulesChecked: 0 };
    }

    logger.info({ ruleCount: activeRules.length }, "Active rules found, evaluating");

    const results = await Promise.all(
      activeRules.map(async (rule: any) => {
        try {
          await api.processShopAlerts({
            ruleId: rule.id,
            ruleName: rule.name,
            metric: rule.metric,
            condition: rule.condition,
            threshold: rule.threshold,
            timeWindow: rule.timeWindow,
            cooldown: rule.cooldown,
            notifyEmail: rule.notifyEmail,
            notifySlack: rule.notifySlack,
            notifyWhatsapp: rule.notifyWhatsapp,
            lastTriggeredAt: rule.lastTriggeredAt
              ? rule.lastTriggeredAt.toISOString()
              : null,
            shopId: rule.shopId,
          });
          return { ruleId: rule.id, success: true };
        } catch (error: any) {
          logger.error(
            { ruleId: rule.id, error: error.message },
            "Error processing rule"
          );
          return { ruleId: rule.id, success: false };
        }
      })
    );

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    logger.info(
      { succeeded, failed, total: activeRules.length },
      "Alert engine completed"
    );

    return {
      success: true,
      rulesChecked: activeRules.length,
      succeeded,
      failed,
    };
  } catch (error: any) {
    logger.error({ error: error.message }, "Alert engine failed");
    throw error;
  }
};

export const options = {
  triggers: {
    scheduler: [{ cron: "*/5 * * * *" }],
  },
};