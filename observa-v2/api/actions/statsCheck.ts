export const run: ActionRun = async ({ params, logger, api, connections }) => {
  try {
    // Use UTC time to ensure consistency across serverless executions
    const now = new Date();
    const totalMinutesSinceMidnightUTC = (now.getUTCHours() * 60) + now.getUTCMinutes();
    
    // Early exit: Determine which frequencies match (most efficient - check smallest first)
    const matchingFrequencies: string[] = [];
    
    // Check 5min first (most frequent)
    if (totalMinutesSinceMidnightUTC % 5 === 0) matchingFrequencies.push("5");
    // Only check 15min if it's a 15min interval
    if (totalMinutesSinceMidnightUTC % 15 === 0) matchingFrequencies.push("15");
    // Only check 30min if it's a 30min interval
    if (totalMinutesSinceMidnightUTC % 30 === 0) matchingFrequencies.push("30");
    // Only check 60min if it's a 60min interval
    if (totalMinutesSinceMidnightUTC % 60 === 0) matchingFrequencies.push("60");
    // Only check 2hr if it's a 2hr interval
    if (totalMinutesSinceMidnightUTC % 120 === 0) matchingFrequencies.push("120");
    // Only check 3hr if it's a 3hr interval
    if (totalMinutesSinceMidnightUTC % 180 === 0) matchingFrequencies.push("180");
    // Only check 6hr if it's a 6hr interval
    if (totalMinutesSinceMidnightUTC % 360 === 0) matchingFrequencies.push("360");
    // Only check 12hr if it's a 12hr interval
    if (totalMinutesSinceMidnightUTC % 720 === 0) matchingFrequencies.push("720");
    // Only check 24hr if it's midnight
    if (totalMinutesSinceMidnightUTC % 1440 === 0) matchingFrequencies.push("1440");
    
    // Early exit if no matches
    if (matchingFrequencies.length === 0) {
      return { success: true, message: "No checks needed at this time" };
    }
    
    // Fetch only alert settings with at least one alert channel enabled
    const alertSettings = await api.alertSettings.findMany({
      filter: {
        checkingFrequency: { in: matchingFrequencies },
        OR: [
          { emailAlerts: { equals: true } },
          { slackALerts: { equals: true } },
          { whatsappAlerts: { equals: true } }
        ]
      },
      select: {
        id: true,
        checkingFrequency: true,
        emailAlerts: true,
        slackALerts: true,
        whatsappAlerts: true,
        alertEmails: true,
        alertSlacks: true,
        alertWhatsapps: true,
        conversionRate: true,
        shop: {
          id: true,
          domain: true,
          mantleApiToken: true
        }
      }
    });
    
    const processingTasks = alertSettings.map(async (settings) => {
      const shop = settings.shop;
      if (!shop) return;

      try {
        const result = await api.validateSubscription({
          mantleApiToken: shop.mantleApiToken || "",
        });
        const hasValidSubscription = result.isValid;
        const planCheckingFrequency = result.checkingFrequency;

        if (!hasValidSubscription) {
          await api.alertSettings.update(settings.id, {
            emailAlerts: false,
            slackALerts: false,
            whatsappAlerts: false,
          });
          logger.info({ shopId: shop.id }, "Disabled alerts for shop with invalid subscription.");
          return; // Skip to the next shop
        }

        // Enforce plan's maximum allowed frequency
        if (planCheckingFrequency && parseInt(settings.checkingFrequency) < parseInt(planCheckingFrequency.toString())) {
          // Store's frequency is faster than plan allows, cap it to plan's limit
          await api.alertSettings.update(settings.id, {
            checkingFrequency: planCheckingFrequency.toString(),
          });
          logger.info({ shopId: shop.id, currentFrequency: settings.checkingFrequency, planFrequency: planCheckingFrequency }, "Updated checking frequency to plan limit.");
        }

        // Process shop alerts
        await api.processShopAlerts({
          settingsId: settings.id,
          shopId: shop.id,
          shopDomain: shop.domain || "",
          mantleApiToken: shop.mantleApiToken || "",
          alertEmails: (settings.alertEmails as Array<string>) || [],
          alertSlacks: (settings.alertSlacks as Array<string>) || [],
          alertWhatsapps: (settings.alertWhatsapps as Array<string>) || [],
          conversionRate: (settings.conversionRate as any) || {},
        });

      } catch (error: any) {
        logger.error({ error: error.message, shopId: shop.id }, "Error processing shop");
      }
    });

    await Promise.all(processingTasks);
    
    logger.info(
      { 
        utcTime: now.toISOString(),
        shopCount: alertSettings.length,
        frequencies: matchingFrequencies
      }, 
      "Stats check completed"
    );
    
    return {
      success: true,
      shopsChecked: alertSettings.length,
      frequencies: matchingFrequencies
    };
    
  } catch (error: any) {
    logger.error({ error: error.message }, "Error in stats check");
    throw error;
  }
};

export const options = {
  triggers: {
    scheduler: [
      { cron: "*/5 * * * *" } // Every 5 minutes
    ],
  },
}