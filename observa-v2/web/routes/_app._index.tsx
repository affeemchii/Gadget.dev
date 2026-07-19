import { useFindMany, useGlobalAction } from "@gadgetinc/react";
import { useEffect } from "react";
import {
  Badge,
  BlockStack,
  Button,
  Card,
  InlineGrid,
  InlineStack,
  Page,
  Spinner,
  Text,
  Divider,
} from "@shopify/polaris";
import { api } from "../api";

export default function Dashboard() {
  // Fetch recent alert events
  const [{ data: events, fetching: fetchingEvents }] = useFindMany(
    api.alertEvent,
    {
      sort: { createdAt: "Descending" },
      first: 5,
      select: {
        id: true,
        ruleName: true,
        metric: true,
        message: true,
        severity: true,
        triggeredAt: true,
        resolved: true,
      },
    }
  );

  // Fetch analytics for overview cards
  const [{ data: analyticsData, fetching: fetchingAnalytics }, runAnalytics] =
    useGlobalAction(api.getAnalytics);

  useEffect(() => {
    runAnalytics({ dateRange: "today", currency: "USD" } as any);
  }, []);

  const analytics = analyticsData as any;
  const orders = analytics?.data?.orders?.total ?? 0;
  const revenue = analytics?.data?.orders?.revenue ?? 0;
  const conversionRate = analytics?.data?.metrics?.conversionRate ?? "0.00";
  const avgOrderValue = analytics?.data?.metrics?.avgOrderValue ?? "0.00";

  // Store health: based on recent unresolved alerts
  const unresolvedCount =
    events?.filter((e) => !e.resolved).length ?? 0;
  const storeHealth =
    unresolvedCount === 0
      ? { label: "Healthy", tone: "success" as const }
      : unresolvedCount <= 2
      ? { label: "Warning", tone: "warning" as const }
      : { label: "Critical", tone: "critical" as const };

  const severityTone = (severity: string | null) => {
    if (severity === "critical") return "critical" as const;
    if (severity === "warning") return "warning" as const;
    return "info" as const;
  };

  const timeAgo = (date: Date | string | null) => {
    if (!date) return "—";
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Page title="Dashboard">
      <BlockStack gap="600">
        {/* Overview Cards */}
        <InlineGrid columns={5} gap="400">
          <Card>
            <BlockStack gap="200">
              <Text variant="bodySm" as="p" tone="subdued">
                Revenue Today
              </Text>
              {fetchingAnalytics ? (
                <Spinner size="small" />
              ) : (
                <Text variant="heading2xl" as="p">
                  ${Number(revenue).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              )}
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="200">
              <Text variant="bodySm" as="p" tone="subdued">
                Orders Today
              </Text>
              {fetchingAnalytics ? (
                <Spinner size="small" />
              ) : (
                <Text variant="heading2xl" as="p">
                  {orders}
                </Text>
              )}
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="200">
              <Text variant="bodySm" as="p" tone="subdued">
                Conversion Rate
              </Text>
              {fetchingAnalytics ? (
                <Spinner size="small" />
              ) : (
                <Text variant="heading2xl" as="p">
                  {conversionRate}%
                </Text>
              )}
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="200">
              <Text variant="bodySm" as="p" tone="subdued">
                Avg Order Value
              </Text>
              {fetchingAnalytics ? (
                <Spinner size="small" />
              ) : (
                <Text variant="heading2xl" as="p">
                  ${avgOrderValue}
                </Text>
              )}
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="200">
              <Text variant="bodySm" as="p" tone="subdued">
                Store Health
              </Text>
              {fetchingEvents ? (
                <Spinner size="small" />
              ) : (
                <Badge tone={storeHealth.tone}>{storeHealth.label}</Badge>
              )}
            </BlockStack>
          </Card>
        </InlineGrid>

        {/* Recent Alerts */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text variant="headingMd" as="h2">
                Recent Alerts
              </Text>
              <Button
                variant="plain"
                url="/alerts"
              >
                View all
              </Button>
            </InlineStack>

            <Divider />

            {fetchingEvents ? (
              <Spinner size="small" />
            ) : !events || events.length === 0 ? (
              <BlockStack gap="200" inlineAlign="center">
                <Text variant="bodyMd" as="p" tone="subdued">
                  ✅ No alerts fired recently. Your store looks healthy!
                </Text>
              </BlockStack>
            ) : (
              <BlockStack gap="300">
                {events.map((event) => (
                  <BlockStack key={event.id} gap="0">
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="300" blockAlign="center">
                        <Badge tone={severityTone(event.severity)}>
                          {event.severity || "info"}
                        </Badge>
                        <BlockStack gap="100">
                          <Text variant="bodyMd" as="p" fontWeight="semibold">
                            {event.ruleName}
                          </Text>
                          <Text variant="bodySm" as="p" tone="subdued">
                            {event.message}
                          </Text>
                        </BlockStack>
                      </InlineStack>
                      <BlockStack gap="100" inlineAlign="end">
                        <Text variant="bodySm" as="p" tone="subdued">
                          {timeAgo(event.triggeredAt)}
                        </Text>
                        <Badge tone={event.resolved ? "success" : undefined}>
                          {event.resolved ? "Resolved" : "Open"}
                        </Badge>
                      </BlockStack>
                    </InlineStack>
                    <Divider />
                  </BlockStack>
                ))}
              </BlockStack>
            )}
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}