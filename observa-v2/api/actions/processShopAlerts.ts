import * as nodemailer from "nodemailer";

export const run: ActionRun = async ({ params, logger, api }) => {
  const {
    ruleId,
    ruleName,
    metric,
    condition,
    threshold,
    timeWindow,
    cooldown,
    notifyEmail,
    notifySlack,
    notifyWhatsapp,
    lastTriggeredAt,
    shopId,
    shopDomain,
  } = params as any;

  try {
    if (!shopId || !ruleId) {
      logger.error({ shopId, ruleId }, "Missing required parameters");
      return { success: false, error: "Missing required parameters" };
    }

    // Check cooldown — don't re-alert if cooldown hasn't passed
    if (lastTriggeredAt && cooldown) {
      const lastTriggered = new Date(lastTriggeredAt);
      const minutesSinceLastAlert =
        (Date.now() - lastTriggered.getTime()) / 1000 / 60;
      if (minutesSinceLastAlert < cooldown) {
        logger.info(
          { ruleId, minutesSinceLastAlert, cooldown },
          "Rule in cooldown, skipping"
        );
        return { success: true, skipped: true, reason: "cooldown" };
      }
    }

    // Calculate the time window start
    const windowStart = new Date(Date.now() - timeWindow * 60 * 1000);

    // Fetch recent alert events for this shop and metric within the time window
    const recentEvents = await api.alertEvent.findMany({
      filter: {
        shopId: { equals: shopId },
        metric: { equals: metric },
        triggeredAt: { greaterThan: windowStart },
      },
      select: {
        id: true,
        metric: true,
        message: true,
        triggeredAt: true,
      },
    });

    logger.info(
      { ruleId, metric, eventCount: recentEvents.length, timeWindow },
      "Evaluating rule"
    );

    // Evaluate the condition
    let breached = false;
    let alertMessage = "";

    if (condition === "no_activity") {
      // No events in the time window = no activity
      breached = recentEvents.length === 0;
      alertMessage = `No ${metric} activity in the last ${timeWindow} minutes`;
    } else if (condition === "below_threshold") {
      breached = recentEvents.length < threshold;
      alertMessage = `${metric} count (${recentEvents.length}) is below threshold (${threshold}) in the last ${timeWindow} minutes`;
    } else if (condition === "above_threshold") {
      breached = recentEvents.length > threshold;
      alertMessage = `${metric} count (${recentEvents.length}) is above threshold (${threshold}) in the last ${timeWindow} minutes`;
    } else if (condition === "drops_by_percent") {
      // Compare current window to previous window of same length
      const previousWindowStart = new Date(
        windowStart.getTime() - timeWindow * 60 * 1000
      );
      const previousEvents = await api.alertEvent.findMany({
        filter: {
          shopId: { equals: shopId },
          metric: { equals: metric },
          triggeredAt: {
            greaterThan: previousWindowStart,
            lessThan: windowStart,
          },
        },
        select: { id: true },
      });

      if (previousEvents.length > 0) {
        const dropPercent =
          ((previousEvents.length - recentEvents.length) /
            previousEvents.length) *
          100;
        breached = dropPercent >= threshold;
        alertMessage = `${metric} dropped ${dropPercent.toFixed(1)}% in the last ${timeWindow} minutes (threshold: ${threshold}%)`;
      }
    }

    if (!breached) {
      logger.info({ ruleId, condition }, "Rule not breached, no alert needed");
      return { success: true, breached: false };
    }

    logger.info({ ruleId, alertMessage }, "Rule breached, sending alert");

    // Record the alert event
    await api.alertEvent.create({
      ruleName: ruleName,
      metric: metric,
      message: alertMessage,
      severity: "warning",
      triggeredAt: new Date(),
      resolved: false,
      shop: { _link: shopId },
    });

    // Update lastTriggeredAt on the rule
    await api.alertRule.update(ruleId, {
      lastTriggeredAt: new Date(),
    });

    // Send notifications
    const notificationChannel = await api.notificationChannel.findFirst({
      filter: { shopId: { equals: shopId } },
      select: {
        emailRecipients: true,
        slackWebhook: true,
        whatsappNumber: true,
      },
    });

    if (notifyEmail && notificationChannel?.emailRecipients) {
      await sendEmailAlert({
        shopDomain: shopDomain || "",
        recipients: notificationChannel.emailRecipients,
        ruleName,
        alertMessage,
        logger,
      });
    }

    if (notifySlack && notificationChannel?.slackWebhook) {
      await sendSlackAlert({
        webhookUrl: notificationChannel.slackWebhook,
        ruleName,
        alertMessage,
        shopDomain: shopDomain || "",
        logger,
      });
    }

    return { success: true, breached: true, alertMessage };
  } catch (error: any) {
    logger.error({ error: error.message, ruleId }, "Error processing alert rule");
    throw error;
  }
};

// Email notification
async function sendEmailAlert({
  shopDomain,
  recipients,
  ruleName,
  alertMessage,
  logger,
}: any) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port: parseInt(process.env.EMAIL_SMTP_PORT || "465"),
    secure: true,
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e53e3e;">⚠️ Observa Alert: ${ruleName}</h2>
      <p style="font-size: 16px; color: #333;">${alertMessage}</p>
      <p style="color: #666;">Store: <strong>${shopDomain}</strong></p>
      <a href="https://${shopDomain}/admin" 
         style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;margin-top:16px;">
        View Store →
      </a>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">Sent by Observa</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Observa Alerts" <${process.env.EMAIL_ID}>`,
      to: recipients,
      subject: `⚠️ Alert: ${ruleName} — ${shopDomain}`,
      html: htmlContent,
    });
    logger.info({ recipients }, "Email alert sent");
  } catch (error: any) {
    logger.error({ error: error.message }, "Failed to send email alert");
  }
}

// Slack notification
async function sendSlackAlert({
  webhookUrl,
  ruleName,
  alertMessage,
  shopDomain,
  logger,
}: any) {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `⚠️ *Observa Alert: ${ruleName}*\n${alertMessage}\nStore: ${shopDomain}`,
      }),
    });
    logger.info("Slack alert sent");
  } catch (error: any) {
    logger.error({ error: error.message }, "Failed to send Slack alert");
  }
}

export const params = {
  ruleId: { type: "string" },
  ruleName: { type: "string" },
  metric: { type: "string" },
  condition: { type: "string" },
  threshold: { type: "number" },
  timeWindow: { type: "number" },
  cooldown: { type: "number" },
  notifyEmail: { type: "boolean" },
  notifySlack: { type: "boolean" },
  notifyWhatsapp: { type: "boolean" },
  lastTriggeredAt: { type: "string" },
  shopId: { type: "string" },
  shopDomain: { type: "string" },
};