import * as nodemailer from "nodemailer";

export const run: ActionRun = async ({ params, logger, api, connections }) => {
  const {
    settingsId,
    shopId,
    shopDomain,
    mantleApiToken,
    alertEmails,
    alertSlacks,
    alertWhatsapps,
    conversionRate,
  } = params;

  try {
    // Validate required parameters
    if (!shopId || !shopDomain || !alertEmails || !settingsId) {
      logger.error({ shopId, shopDomain }, "Missing required parameters");
      return { success: false, error: "Missing required parameters" };
    }

    logger.info({ shopId, shopDomain }, "Processing shop alerts");

    // Determine which alerts are enabled and what data we need to fetch
    const needsConversionData = conversionRate?.enabled === true;

    if (!needsConversionData) {
      logger.debug({ shopId }, "No alerts enabled, skipping");
      return { success: true, alertsSent: 0 };
    }

    // Get Shopify connection for this shop
    const shopify = await connections.shopify.forShopId(shopId);

    // Fetch analytics data - only if we have enabled alerts
    const dateRange = conversionRate?.dateRange || "today";
    
    // Build ShopifyQL query for conversion data
    let timePeriod: string;
    let timeseriesType: string;
    let orderByField: string;

    switch (dateRange) {
      case 'last_7_days':
        timePeriod = 'SINCE startOfDay(-7d) UNTIL today';
        timeseriesType = 'day';
        orderByField = 'day';
        break;
      case 'last_30_days':
        timePeriod = 'SINCE startOfDay(-30d) UNTIL today';
        timeseriesType = 'day';
        orderByField = 'day';
        break;
      case 'today':
      default:
        timePeriod = 'DURING today';
        timeseriesType = 'hour';
        orderByField = 'hour';
        break;
    }

    // ShopifyQL query for conversion metrics
    const conversionQuery = `
      FROM sessions
      SHOW sessions, sessions_that_completed_checkout, conversion_rate
      TIMESERIES ${timeseriesType} WITH TOTALS, PERCENT_CHANGE
      ${timePeriod}
      COMPARE TO previous_period
      ORDER BY ${orderByField} ASC
      LIMIT 1000
    `;

    // Execute ShopifyQL query
    let analyticsRows: any[] = [];
    try {
      const graphqlQuery = `
        query($query: String!) {
          shopifyqlQuery(query: $query) {
            tableData {
              columns { name }
              rows
            }
            parseErrors
          }
        }
      `;

      const response = await shopify.graphql(graphqlQuery, { query: conversionQuery });
      analyticsRows = response?.shopifyqlQuery?.tableData?.rows || [];

      if (!analyticsRows.length) {
        logger.debug({ shopId }, "No analytics data found for date range");
        return { success: true, alertsSent: 0 };
      }
    } catch (error: any) {
      logger.error({ shopId, error: error.message }, "Failed to fetch analytics from Shopify");
      return { success: false, error: "Failed to fetch analytics" };
    }

    // Extract metrics from the first row (contains totals)
    const firstRow = analyticsRows[0] || {};
    const currentConversionRate = parseFloat(firstRow.conversion_rate__totals || "0");
    const previousConversionRate = parseFloat(firstRow.comparison_conversion_rate__previous_period__totals || "0");
    const percentChange = parseFloat(firstRow.percent_change_conversion_rate__previous_period__totals || "0");

    logger.info({ 
      shopId, 
      currentConversionRate,
      previousConversionRate,
      percentChange
    }, "Conversion metrics extracted");

    let alertsSent = 0;

    // Process conversion rate alert
    if (needsConversionData && !conversionRate.alertSent) {
      const threshold = conversionRate.threshold;

      // Validate threshold
      if (threshold === undefined) {
        logger.error({ shopId }, "Threshold is not defined");
        return { success: false, error: "Threshold is not defined" };
      }

      logger.info({
        shopId,
        currentConversionRate,
        threshold
      }, "Checking conversion rate");

      if (currentConversionRate < threshold) {
        // Send alert
        await sendConversionRateAlert({
          shopDomain,
          alertEmails,
          currentConversionRate,
          threshold,
          dateRange,
          previousConversionRate,
          percentChange,
          logger,
          mantleApiToken,
        });

        // Update alert as sent
        await api.alertSettings.update(settingsId, {
          conversionRate: {
            ...conversionRate,
            alertSent: true,
          },
        });

        alertsSent++;
        logger.info({ shopId }, "Conversion rate alert sent");
      } else if (conversionRate.alertSent) {
        // Conversion rate is back above threshold, reset alert flag
        await api.alertSettings.update(settingsId, {
          conversionRate: {
            ...conversionRate,
            alertSent: false,
          },
        });
        logger.info({ shopId }, "Conversion rate back above threshold, reset alert flag");
      }
    }

    return { success: true, alertsSent };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error({ error: errorMessage, shopId }, "Error processing shop alerts");
    throw error;
  }
};

interface SendAlertParams {
  shopDomain: string;
  alertEmails: string[];
  currentConversionRate: number;
  threshold: number;
  dateRange: string;
  previousConversionRate: number;
  percentChange: number;
  logger: any;
  mantleApiToken?: string;
}

async function sendConversionRateAlert(params: SendAlertParams) {
  const {
    shopDomain,
    alertEmails,
    currentConversionRate,
    threshold,
    dateRange,
    previousConversionRate,
    percentChange,
    logger,
    mantleApiToken,
  } = params;

  // Create email transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port: parseInt(process.env.EMAIL_SMTP_PORT || "465"),
    secure: true,
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const logoUrl = process.env.GADGET_PUBLIC_OBSERVA_LOGO_URL || "";

  const dateRangeLabel = dateRange === "today" ? "Today" :
    dateRange === "last_7_days" ? "Last 7 Days" :
      "Last 30 Days";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conversion Rate Alert - Observa</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #e5e5e5;">
              ${logoUrl ? `<img src="${logoUrl}" alt="Observa" style="max-width: 150px; height: auto; margin-bottom: 20px;">` : '<h1 style="margin: 0; font-size: 32px; color: #000000;">Observa</h1>'}
              <h2 style="margin: 20px 0 0 0; font-size: 24px; color: #000000; font-weight: 600;">⚠️ Conversion Rate Alert</h2>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                Your store <strong>${shopDomain}</strong> has experienced a drop in conversion rate below your configured threshold.
              </p>
              
              <!-- Metrics Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px; background-color: #f9f9f9; border-radius: 6px; border-left: 4px solid #ff0000;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 10px 0;">
                          <p style="margin: 0; font-size: 14px; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">Current Conversion Rate</p>
                          <p style="margin: 5px 0 0 0; font-size: 32px; font-weight: 700; color: #ff0000;">${currentConversionRate.toFixed(2)}%</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #e5e5e5;">
                          <p style="margin: 0; font-size: 14px; color: #666666;">Your Threshold: <strong>${threshold.toFixed(2)}%</strong></p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <p style="margin: 0; font-size: 14px; color: #666666;">Time Period: <strong>${dateRangeLabel}</strong></p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <p style="margin: 0; font-size: 14px; color: #666666;">Previous Period: <strong>${previousConversionRate.toFixed(2)}%</strong></p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <p style="margin: 0; font-size: 14px; color: #666666;">
                            Change: <strong style="color: ${percentChange < 0 ? '#ff0000' : '#00aa00'};">${percentChange > 0 ? '+' : ''}${percentChange.toFixed(2)}%</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Recommendations -->
              <div style="margin: 30px 0; padding: 20px; background-color: #f0f0f0; border-radius: 6px;">
                <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #000000; font-weight: 600;">💡 Recommended Actions</h3>
                <ul style="margin: 0; padding-left: 20px; color: #333333; line-height: 24px;">
                  <li>Review your recent product listings and pricing changes</li>
                  <li>Check your checkout process for any technical issues</li>
                  <li>Analyze customer feedback and abandoned cart data</li>
                  <li>Review your marketing campaigns and traffic sources</li>
                  <li>Consider running promotional offers to boost conversions</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://${shopDomain}/admin" style="display: inline-block; padding: 14px 40px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      View Store Analytics →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 22px; color: #666666;">
                This alert was triggered because your conversion rate dropped below your configured threshold of ${threshold.toFixed(2)}%. You can adjust your alert settings in the Observa dashboard.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-top: 1px solid #e5e5e5; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #999999; text-align: center;">
                This alert was sent by Observa Analytics<br>
                © ${new Date().getFullYear()} Observa. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const textContent = `
OBSERVA - Conversion Rate Alert

Your store ${shopDomain} has experienced a drop in conversion rate below your configured threshold.

Current Conversion Rate: ${currentConversionRate.toFixed(2)}%
Your Threshold: ${threshold.toFixed(2)}%
Time Period: ${dateRangeLabel}
Previous Period: ${previousConversionRate.toFixed(2)}%
Change: ${percentChange > 0 ? '+' : ''}${percentChange.toFixed(2)}%

Recommended Actions:
- Review your recent product listings and pricing changes
- Check your checkout process for any technical issues
- Analyze customer feedback and abandoned cart data
- Review your marketing campaigns and traffic sources
- Consider running promotional offers to boost conversions

View your store analytics: https://${shopDomain}/admin

This alert was sent by Observa Analytics
  `;

  try {
    await transporter.sendMail({
      from: `"Observa Alerts" <${process.env.EMAIL_ID}>`,
      to: alertEmails.join(", "),
      subject: `⚠️ Conversion Rate Alert: ${shopDomain}`,
      text: textContent,
      html: htmlContent,
    });

    logger.info({ emailCount: alertEmails.length }, "Conversion rate alert email sent");

    // Send usage events to Mantle for billing - one per email recipient
    if (mantleApiToken) {
      const mantleApiBaseUrl = process.env.GADGET_PUBLIC_MANTLE_API_URL;
      const mantleAppId = process.env.GADGET_PUBLIC_MANTLE_APP_ID;

      if (mantleApiBaseUrl && mantleAppId) {
        const usageUrl = `${mantleApiBaseUrl.replace(/\/+$/, '')}/usage_events`;
        // Send a separate usage event for each email recipient
        for (const email of alertEmails) {
          try {
            const usagePayload = {
              eventName: 'alerts_sent',
              properties: {
                channel: 'email',
                alertType: 'conversion_rate',
                recipient: email,
                conversionRate: currentConversionRate.toFixed(2),
                threshold: threshold.toFixed(2),
                dateRange: dateRange,
                percentChange: percentChange.toFixed(2),
              }
            };

            await fetch(usageUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Mantle-App-Id': mantleAppId,
                'X-Mantle-Customer-Api-Token': mantleApiToken
              },
              body: JSON.stringify(usagePayload),
              signal: AbortSignal.timeout(15000)
            });

            logger.info({ email }, "Usage event sent to Mantle for email recipient");
          } catch (mantleError: any) {
            logger.warn({ error: mantleError instanceof Error ? mantleError.message : "Unknown error", email }, "Failed to send Mantle usage event for email recipient");
          }
        }
      }
    }
  } catch (error: any) {
    logger.error({ error: error.message, shopDomain }, "Failed to send conversion rate alert email");
    throw error;
  }
}

export const params = {
  settingsId: { type: "string" },
  shopId: { type: "string" },
  shopDomain: { type: "string" },
  mantleApiToken: { type: "string" },
  alertEmails: {
    type: "array",
    items: { type: "string" }
  },
  alertSlacks: {
    type: "array",
    items: { type: "string" }
  },
  alertWhatsapps: {
    type: "array",
    items: { type: "string" }
  },
  conversionRate: {
    type: "object",
    properties: {
      enabled: { type: "boolean" },
      threshold: { type: "number" },
      dateRange: { type: "string" },
      alertSent: { type: "boolean" },
    }
  }
};
