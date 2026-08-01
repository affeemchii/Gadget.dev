export const params = {
  shopId: { type: "string" },
};

export const run: ActionRun = async ({ params, api, logger, connections }) => {
  const shopId = params.shopId || connections.shopify?.currentShopId;

  if (!shopId) {
    throw new Error("shopId is required or a current shopify session must exist");
  }

  // Get configuration from env vars with fallbacks
  const organizationId = process.env.SHOPIFY_ORGANIZATION_ID;
  const partnerApiToken = process.env.SHOPIFY_PARTNER_API_TOKEN;
  const appIdRaw = process.env.SHOPIFY_PARTNER_APP_ID || process.env.GADGET_PUBLIC_SHOPIFY_APP_CLIENT_ID;

  if (!organizationId || !partnerApiToken || !appIdRaw) {
    logger.warn("Missing Partner API configuration in environment variables");
    return null;
  }

  const appId = appIdRaw.startsWith("gid://") ? appIdRaw : `gid://shopify/App/${appIdRaw}`;

  // Get the Shopify Shop ID string from the Gadget DB
  const shop = await api.internal.shopifyShop.findOne(shopId.toString()); if (!shop) {
    throw new Error("Shop not found");
  }

  // shop.id is typically the Shopify ID string.
  const shopGlobalId = `gid://shopify/Shop/${shop.id}`;

  const query = `
    query ActiveSubscription($appId: ID!, $shopId: ID!) {
      activeSubscription(appId: $appId, shopId: $shopId) {
        legacySubscriptionId
        billingPeriod
        cancelAtEndOfCycle
        trialEndsAt
        currentBillingCycle {
          startTime
          endTime
        }
        items {
          description
          handle
          price {
            __typename
            ... on FlatRatePrice {
              amount
              currency
            }
            ... on TieredPrice {
              active
              tiersMode
              currency
              tiers {
                amount
                amountPerUnit
                upTo
              }
            }
          }
        }
      }
    }
  `;

  // Note: Some documentation shows the endpoint without the organization ID in the path (e.g. https://partners.shopify.com/api/2026-07/graphql.json).
  // We use the organization ID path as it is commonly required for Partner API access.
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
          shopId: shopGlobalId
        }
      })
    });

    const json = await response.json();

    logger.info({ json }, "Active subscription response from Partner API");

    if (json.errors) {
      logger.error({ errors: json.errors }, "Error fetching active subscription from Partner API");
      throw new Error(json.errors[0]?.message || "GraphQL Error from Partner API");
    }

    return json.data.activeSubscription;
  } catch (error) {
    logger.error({ error }, "Failed to fetch active subscription");
    throw error;
  }
};
