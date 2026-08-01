import { useCallback, useState } from 'react';
import { useGlobalAction } from "@gadgetinc/react";
import { api } from "../api";
import type { Route } from "./+types/_app.billing";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  Badge,
  Banner,
  BlockStack,
  InlineStack,
  Grid,
  Box,
  Modal,
} from "@shopify/polaris";

declare const shopify: any;

export const loader = async ({ context }: Route.LoaderArgs) => {
  const shopId = context.connections.shopify.currentShopId;
  if (!shopId) {
    throw new Error("Could not load current Shop");
  }

  const shop = await context.api.shopifyShop.findOne(shopId.toString(), {
    select: { myshopifyDomain: true }
  });

  let activeSubscription = null;
  let subscriptionError = null;
  try {
    activeSubscription = await context.api.getActiveShopSubscription({ shopId: shopId.toString() });
  } catch (err: any) {
    subscriptionError = err.message || "Failed to load active subscription";
  }

  return {
    myshopifyDomain: shop.myshopifyDomain,
    appHandle: process.env.GADGET_PUBLIC_SHOPIFY_APP_HANDLE || "whatflow-official-api",
    activeSubscription,
    subscriptionError,
    shopId: shopId.toString(),
  };
};

export default function Plans({ loaderData }: Route.ComponentProps) {
  const { myshopifyDomain, appHandle, activeSubscription, subscriptionError, shopId } = loaderData;
  const [{ fetching: canceling }, cancelSubscription] = useGlobalAction(api.cancelShopSubscription);
  const [canceled, setCanceled] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const handleManagePlans = useCallback(() => {
    if (myshopifyDomain) {
      const storeHandle = myshopifyDomain.replace('.myshopify.com', '');
      const url = `https://admin.shopify.com/store/${storeHandle}/charges/${appHandle}/pricing_plans`;
      open(url, "_top");
    }
  }, [myshopifyDomain, appHandle]);

  const handleCancelPlan = useCallback(async () => {
    try {
      await cancelSubscription({ shopId });
      setCanceled(true);
      setCancelModalOpen(false);
      if (typeof shopify !== 'undefined') {
        shopify.toast.show("Subscription canceled successfully");
      }
    } catch (err: any) {
      setCancelModalOpen(false);
      if (typeof shopify !== 'undefined') {
        shopify.toast.show(err.message || "Failed to cancel subscription", { isError: true });
      }
    }
  }, [cancelSubscription, shopId]);

  const flatItem = (activeSubscription as any)?.items?.find((i: any) => i.price?.__typename === "FlatRatePrice") || (activeSubscription as any)?.items?.[0];
  const tieredItem = (activeSubscription as any)?.items?.find((i: any) => i.price?.__typename === "TieredPrice");

  let planName = "Starter";
  if (flatItem) {
    if (flatItem.description) {
      planName = flatItem.description;
    } else if (flatItem.handle) {
      planName = flatItem.handle.charAt(0).toUpperCase() + flatItem.handle.slice(1).toLowerCase();
    }
  }

  let priceText = "Free";
  if (flatItem?.price) {
    const { price } = flatItem;
    const periodSuffix = activeSubscription.billingPeriod === "ANNUAL" ? "year" : "month";
    if (price.__typename === "FlatRatePrice" && price.amount !== undefined) {
      const symbol = price.currency === "USD" ? "$" : `${price.currency} `;
      priceText = `${symbol}${parseFloat(price.amount).toFixed(2)} per ${periodSuffix}`;
    } else if (price.__typename === "TieredPrice" && price.tiers?.[0]) {
      const baseTier = price.tiers[0];
      const baseAmount = baseTier.amount !== undefined ? baseTier.amount : "0";
      const symbol = price.currency === "USD" ? "$" : `${price.currency} `;
      priceText = `${symbol}${parseFloat(baseAmount).toFixed(2)} per ${periodSuffix}`;
    }
  }

  const renderUsageCharges = () => {
    if (planName.toLowerCase() === "starter") {
      return <Text as="p" tone="subdued">Up to 1,500 messages, then auto-upgrades to Growth plan.</Text>;
    }
    if (!tieredItem) {
      return <Text as="p" tone="subdued">No usage charges.</Text>;
    }

    const currency = tieredItem.price?.currency || "USD";
    const symbol = currency === "USD" ? "$" : `${currency} `;
    const tiers = tieredItem.price?.tiers || [];
    const tiersMode = tieredItem.price?.tiersMode || "GRADUATED";
    const eventName = tieredItem.description || "Messages Sent";

    if (tiers.length === 0) {
      return <Text as="p" tone="subdued">{tieredItem.description || "Usage based pricing."}</Text>;
    }

    const sortedTiers = [...tiers].sort((a: any, b: any) => {
      if (a.upTo === null || a.upTo === undefined) return 1;
      if (b.upTo === null || b.upTo === undefined) return -1;
      return parseInt(a.upTo) - parseInt(b.upTo);
    });

    const isVolume = tiersMode === "VOLUME";

    return (
      <BlockStack gap="100">
        {sortedTiers.map((tier: any, index: number) => {
          const startUnit = index === 0 ? 1 : parseInt(sortedTiers[index - 1].upTo) + 1;
          const endUnit = tier.upTo;

          let rangeText = "";
          if (endUnit !== null && endUnit !== undefined) {
            if (index === 0) {
              rangeText = `First ${parseInt(endUnit).toLocaleString()} ${eventName}`;
            } else {
              rangeText = `${startUnit} to ${parseInt(endUnit).toLocaleString()} ${eventName}`;
            }
          } else {
            rangeText = `${startUnit}+ ${eventName}`;
          }

          const amountPerUnit = parseFloat(tier.amountPerUnit || "0");
          let costText = "Free";
          if (amountPerUnit > 0) {
            const formattedPrice = amountPerUnit % 1 === 0 ? amountPerUnit.toFixed(0) : amountPerUnit.toFixed(3).replace(/\.?0+$/, '');
            costText = `${symbol}${formattedPrice}`;
          }

          return (
            <Text as="p" tone="subdued" key={index}>
              {rangeText}: {costText}
            </Text>
          );
        })}

        <Box paddingBlockStart="100">
          <Text as="p" tone="subdued">
            <span style={{ fontSize: "12px", display: "block", fontStyle: "italic" }}>
              {isVolume
                ? "Your monthly usage total determines the cost per unit for all usage."
                : "Each tier's cost per unit only applies to usage within that tier."
              }
            </span>
          </Text>
        </Box>
      </BlockStack>
    );
  };

  const isCanceled = activeSubscription?.cancelAtEndOfCycle || canceled;
  const hasTrial = !isCanceled && activeSubscription?.trialEndsAt && new Date(activeSubscription.trialEndsAt) > new Date();

  return (
    <>
      {activeSubscription && (
        <Modal
          open={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title="Cancel plan?"
          primaryAction={{
            content: "Cancel plan",
            destructive: true,
            loading: canceling,
            onAction: () => void handleCancelPlan(),
          }}
          secondaryActions={[
            {
              content: "Keep plan",
              onAction: () => setCancelModalOpen(false),
            },
          ]}
        >
          <Modal.Section>
            <Text as="p">
              Are you sure you want to cancel your subscription? Your access will continue until the end of the billing cycle.
            </Text>
          </Modal.Section>
        </Modal>
      )}

      <Page
        title="Plans & Billing"
        backAction={{ content: "Home", url: "/" }}
      >
        <Layout>
          <Layout.Section>
            {subscriptionError && (
              <Banner
                title="Could not load subscription details"
                tone="critical"
              >
                <p>{subscriptionError}</p>
                <p>Make sure SHOPIFY_PARTNER_API_TOKEN and SHOPIFY_ORGANIZATION_ID are set in your environment variables.</p>
              </Banner>
            )}

            {!activeSubscription && !subscriptionError && (
              <Card>
                <InlineStack align="space-between" blockAlign="center">
                  <BlockStack gap="100">
                    <Text as="h2" variant="headingMd">Subscription</Text>
                    <Text as="p" tone="subdued">You're not subscribed to a plan yet.</Text>
                  </BlockStack>
                  <Button variant="primary" onClick={handleManagePlans}>
                    Select plan
                  </Button>
                </InlineStack>
              </Card>
            )}

            {activeSubscription && (
              <Card>
                <BlockStack gap="400">
                  <BlockStack gap="100">
                    <Text as="h2" variant="headingMd">Subscription</Text>
                    {activeSubscription.currentBillingCycle ? (
                      <Text as="p" tone="subdued">
                        Billing cycle: {new Date(activeSubscription.currentBillingCycle.startTime).toLocaleDateString()} to {new Date(activeSubscription.currentBillingCycle.endTime).toLocaleDateString()}
                      </Text>
                    ) : activeSubscription.trialEndsAt ? (
                      <Text as="p" tone="subdued">
                        First billing cycle starts: {new Date(activeSubscription.trialEndsAt).toLocaleDateString()}
                      </Text>
                    ) : null}
                  </BlockStack>

                  <Grid>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 3, xl: 3 }}>
                      <BlockStack gap="100">
                        <Text as="p" fontWeight="semibold">Current plan</Text>
                        <InlineStack gap="200" blockAlign="center">
                          <Text as="p" tone="subdued">{planName}</Text>
                          {hasTrial && (
                            <Badge tone="info">{`Trial ends ${new Date(activeSubscription.trialEndsAt).toLocaleDateString()}`}</Badge>
                          )}
                          {(activeSubscription.cancelAtEndOfCycle || canceled) && (
                            <Badge tone="warning">Cancels at end of cycle</Badge>
                          )}
                        </InlineStack>
                      </BlockStack>
                    </Grid.Cell>

                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 3, xl: 3 }}>
                      <BlockStack gap="100">
                        <Text as="p" fontWeight="semibold">Price</Text>
                        <Text as="p" tone="subdued">{priceText}</Text>
                      </BlockStack>
                    </Grid.Cell>

                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 6, xl: 6 }}>
                      <BlockStack gap="100">
                        <Text as="p" fontWeight="semibold">Usage charges</Text>
                        {renderUsageCharges()}
                      </BlockStack>
                    </Grid.Cell>
                  </Grid>

                  <InlineStack gap="200" align="end" blockAlign="center">
                    {activeSubscription && !activeSubscription.cancelAtEndOfCycle && !canceled && (
                      <Button
                        tone="critical"
                        onClick={() => setCancelModalOpen(true)}
                      >
                        Cancel plan
                      </Button>
                    )}
                    <Button variant="primary" onClick={handleManagePlans}>
                      Change plan
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            )}
          </Layout.Section>
        </Layout>
      </Page>
    </>
  );
}