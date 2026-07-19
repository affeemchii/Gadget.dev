import {
  BlockStack,
  Card,
  DataTable,
  Page,
  Spinner,
  Text,
  InlineGrid,
  Badge,
} from "@shopify/polaris";
import { useFindMany } from "@gadgetinc/react";
import { api } from "../api";

export default function ReportsPage() {
  const [{ data: events, fetching }] = useFindMany(api.alertEvent, {
    sort: { createdAt: "Descending" },
    first: 50,
    select: {
      id: true,
      ruleName: true,
      metric: true,
      message: true,
      severity: true,
      triggeredAt: true,
      resolved: true,
    },
  });

  // Calculate summary stats
  const total = events?.length || 0;
  const critical = events?.filter((e) => e.severity === "critical").length || 0;
  const warning = events?.filter((e) => e.severity === "warning").length || 0;
  const resolved = events?.filter((e) => e.resolved === true).length || 0;

  const rows = (events || []).map((event) => [
    event.ruleName || "—",
    event.metric || "—",
    event.message || "—",
    <Badge
      tone={
        event.severity === "critical"
          ? "critical"
          : event.severity === "warning"
          ? "warning"
          : "info"
      }
    >
      {event.severity || "info"}
    </Badge>,
    event.triggeredAt
      ? new Date(event.triggeredAt).toLocaleString()
      : "—",
    <Badge tone={event.resolved ? "success" : undefined}>
      {event.resolved ? "Resolved" : "Open"}
    </Badge>,
  ]);

  return (
    <Page title="Reports">
      <BlockStack gap="600">
        {/* Summary Cards */}
        <InlineGrid columns={4} gap="400">
          <Card>
            <BlockStack gap="200">
              <Text variant="bodySm" as="p" tone="subdued">
                Total Alerts
              </Text>
              <Text variant="heading2xl" as="p">
                {total}
              </Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="200">
              <Text variant="bodySm" as="p" tone="subdued">
                Critical
              </Text>
              <Text variant="heading2xl" as="p" tone="critical">
                {critical}
              </Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="200">
              <Text variant="bodySm" as="p" tone="subdued">
                Warnings
              </Text>
              <Text variant="heading2xl" as="p">
                {warning}
              </Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="200">
              <Text variant="bodySm" as="p" tone="subdued">
                Resolved
              </Text>
              <Text variant="heading2xl" as="p" tone="success">
                {resolved}
              </Text>
            </BlockStack>
          </Card>
        </InlineGrid>

        {/* Full History Table */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
              Alert History
            </Text>
            {fetching ? (
              <Spinner size="small" />
            ) : rows.length === 0 ? (
              <Text variant="bodyMd" as="p" tone="subdued">
                No alerts in history yet.
              </Text>
            ) : (
              <DataTable
                columnContentTypes={[
                  "text","text","text","text","text","text",
                ]}
                headings={[
                  "Rule","Metric","Message","Severity","Triggered At","Status",
                ]}
                rows={rows}
              />
            )}
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}