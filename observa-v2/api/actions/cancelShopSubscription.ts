export const params = {
  shopId: { type: "string" },
};

export const run: ActionRun = async ({ params, api, logger, connections }) => {
  const shopId = params.shopId || connections.shopify?.currentShopId?.toString();

  if (!shopId) {
    throw new Error("shopId is required or a current shopify session must exist");
  }

  // Get configuration from env vars with fallbacks
  const organizationId = process.env.SHOPIFY_ORGANIZATION_ID;
  const partnerApiToken = process.env.SHOPIFY_PARTNER_API_TOKEN;
  const appIdRaw = process.env.SHOPIFY_PARTNER_APP_ID || process.env.GADGET_PUBLIC_SHOPIFY_APP_CLIENT_ID;

  if (!organizationId || !partnerApiToken || !appIdRaw) {
    throw new Error("Missing Partner API configuration in environment variables. Requires SHOPIFY_ORGANIZATION_ID, SHOPIFY_PARTNER_API_TOKEN.");
  }

  const appId = appIdRaw.startsWith("gid://") ? appIdRaw : `gid://shopify/App/${appIdRaw}`;

  // Get the Shopify Shop ID string from the Gadget DB
  const shop = await api.internal.shopifyShop.findOne(shopId);
  if (!shop) {
    throw new Error("Shop not found");
  }

  // shop.id is typed as string | bigint in Gadget's internal API — coerce to string.
  const shopGlobalId = `gid://shopify/Shop/${shop.id.toString()}`;

  const query = `
    mutation appSubscriptionCancel($appId: ID!, $shopId: ID!, $prorate: Boolean!, $deferCancellation: Boolean!, $skipFinalUsageCharge: Boolean!) {
      appSubscriptionCancel(
        appId: $appId, 
        shopId: $shopId, 
        prorate: $prorate, 
        deferCancellation: $deferCancellation,
        skipFinalUsageCharge: $skipFinalUsageCharge
      ) {
        appSubscription {
          __typename
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const url = `https://partners.shopify.com/${organizationId}/api/2026-07/graphql.json`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": partnerApiToken,
      },
      body: JSON.stringify({
        query,
        variables: {
          appId,
          shopId: shopGlobalId,
          prorate: false,
          deferCancellation: true,
          skipFinalUsageCharge: true,
        }
      })
    });

    const json = await response.json();

    if (json.errors) {
      logger.error({ errors: json.errors }, "Error canceling subscription from Partner API");
      throw new Error(json.errors[0]?.message || "GraphQL Error from Partner API");
    }

    const result = json.data.appSubscriptionCancel;
    if (result.userErrors && result.userErrors.length > 0) {
      const errorMsg = result.userErrors.map((e: any) => e.message).join(", ");
      throw new Error(`Cancellation failed: ${errorMsg}`);
    }

    return result.appSubscription;
  } catch (error) {
    logger.error({ error }, "Failed to cancel subscription");
    throw error;
  }
};
