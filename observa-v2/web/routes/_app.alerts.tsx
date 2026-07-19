import { useState } from "react";
import {
  Badge,
  BlockStack,
  Button,
  Card,
  DataTable,
  EmptyState,
  InlineStack,
  Page,
  Spinner,
  Text,
  Modal,
  FormLayout,
  TextField,
  Select,
  Checkbox,
} from "@shopify/polaris";
import { useFindMany, useAction } from "@gadgetinc/react";
import { api } from "../api";

export default function AlertsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ruleName, setRuleName] = useState("");
  const [metric, setMetric] = useState("orders");
  const [condition, setCondition] = useState("no_activity");
  const [threshold, setThreshold] = useState("0");
  const [timeWindow, setTimeWindow] = useState("60");
  const [cooldown, setCooldown] = useState("30");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySlack, setNotifySlack] = useState(false);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(false);

  // Fetch alert rules
  const [{ data: rules, fetching: fetchingRules }] = useFindMany(api.alertRule, {
    select: {
      id: true,
      name: true,
      metric: true,
      condition: true,
      threshold: true,
      timeWindow: true,
      isActive: true,
      notifyEmail: true,
      notifySlack: true,
      notifyWhatsapp: true,
      lastTriggeredAt: true,
    },
  });

  // Fetch recent alert events
  const [{ data: events, fetching: fetchingEvents }] = useFindMany(api.alertEvent, {
    sort: { createdAt: "Descending" },
    first: 20,
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

  // Create rule action
  const [{ fetching: creating }, createRule] = useAction(api.alertRule.create);

  // Update rule action (for toggling active)
  const [, updateRule] = useAction(api.alertRule.update);

  const handleCreateRule = async () => {
    await createRule({
      name: ruleName,
      metric: metric as any,
      condition: condition as any,
      threshold: parseFloat(threshold),
      timeWindow: parseInt(timeWindow),
      cooldown: parseInt(cooldown),
      isActive: true,
      notifyEmail,
      notifySlack,
      notifyWhatsapp,
    });
    setShowCreateModal(false);
    resetForm();
  };

  const resetForm = () => {
    setRuleName("");
    setMetric("orders");
    setCondition("no_activity");
    setThreshold("0");
    setTimeWindow("60");
    setCooldown("30");
    setNotifyEmail(true);
    setNotifySlack(false);
    setNotifyWhatsapp(false);
  };

  const handleToggleRule = async (id: string, currentActive: boolean | null) => {
    await updateRule({ id, isActive: !currentActive });
  };

  const severityBadgeTone = (severity: string | null) => {
    if (severity === "critical") return "critical";
    if (severity === "warning") return "warning";
    return "info";
  };

  const rulesRows = (rules || []).map((rule) => [
    rule.name || "—",
    rule.metric || "—",
    rule.condition?.replace(/_/g, " ") || "—",
    `${rule.timeWindow} min`,
    rule.lastTriggeredAt
      ? new Date(rule.lastTriggeredAt).toLocaleString()
      : "Never",
    <InlineStack gap="200">
      <Badge tone={rule.isActive ? "success" : undefined}>
        {rule.isActive ? "Active" : "Paused"}
      </Badge>
      <Button
        size="slim"
        onClick={() => handleToggleRule(rule.id, rule.isActive)}
      >
        {rule.isActive ? "Pause" : "Activate"}
      </Button>
    </InlineStack>,
  ]);

  const eventsRows = (events || []).map((event) => [
    event.ruleName || "—",
    event.metric || "—",
    event.message || "—",
    <Badge tone={severityBadgeTone(event.severity)}>
      {event.severity || "info"}
    </Badge>,
    event.triggeredAt
      ? new Date(event.triggeredAt).toLocaleString()
      : "—",
  ]);

  return (
    <Page
      title="Alerts"
      primaryAction={{
        content: "Create Alert Rule",
        onAction: () => setShowCreateModal(true),
      }}
    >
      <BlockStack gap="600">
        {/* Alert Rules */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
              Alert Rules
            </Text>
            {fetchingRules ? (
              <Spinner size="small" />
            ) : rulesRows.length === 0 ? (
              <EmptyState
                heading="No alert rules yet"
                action={{
                  content: "Create your first rule",
                  onAction: () => setShowCreateModal(true),
                }}
                image=""
              >
                <p>Create rules to monitor your store 24/7.</p>
              </EmptyState>
            ) : (
              <DataTable
                columnContentTypes={[
                  "text","text","text","text","text","text",
                ]}
                headings={[
                  "Name","Metric","Condition","Window","Last Triggered","Status",
                ]}
                rows={rulesRows}
              />
            )}
          </BlockStack>
        </Card>

        {/* Recent Alert Events */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
              Recent Alerts
            </Text>
            {fetchingEvents ? (
              <Spinner size="small" />
            ) : eventsRows.length === 0 ? (
              <Text variant="bodyMd" as="p" tone="subdued">
                No alerts fired yet. Your store is healthy!
              </Text>
            ) : (
              <DataTable
                columnContentTypes={[
                  "text","text","text","text","text",
                ]}
                headings={[
                  "Rule","Metric","Message","Severity","Triggered At",
                ]}
                rows={eventsRows}
              />
            )}
          </BlockStack>
        </Card>
      </BlockStack>

      {/* Create Rule Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => { setShowCreateModal(false); resetForm(); }}
        title="Create Alert Rule"
        primaryAction={{
          content: "Create Rule",
          onAction: handleCreateRule,
          loading: creating,
        }}
        secondaryActions={[{
          content: "Cancel",
          onAction: () => { setShowCreateModal(false); resetForm(); },
        }]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Rule Name"
              value={ruleName}
              onChange={setRuleName}
              placeholder="e.g. No Orders Alert"
              autoComplete="off"
            />
            <Select
              label="Metric"
              options={[
                { label: "Orders", value: "orders" },
                { label: "Revenue", value: "revenue" },
                { label: "Inventory", value: "inventory" },
                { label: "Checkout", value: "checkout" },
                { label: "Payment", value: "payment" },
                { label: "Conversion", value: "conversion" },
              ]}
              value={metric}
              onChange={setMetric}
            />
            <Select
              label="Condition"
              options={[
                { label: "No activity", value: "no_activity" },
                { label: "Drops by percent", value: "drops_by_percent" },
                { label: "Below threshold", value: "below_threshold" },
                { label: "Above threshold", value: "above_threshold" },
              ]}
              value={condition}
              onChange={setCondition}
            />
            <TextField
              label="Threshold"
              value={threshold}
              onChange={setThreshold}
              type="number"
              autoComplete="off"
              helpText="For percent conditions: enter a percentage (e.g. 30 for 30%). For count conditions: enter a number."
            />
            <TextField
              label="Time Window (minutes)"
              value={timeWindow}
              onChange={setTimeWindow}
              type="number"
              autoComplete="off"
              helpText="How far back to look when evaluating this rule."
            />
            <TextField
              label="Cooldown (minutes)"
              value={cooldown}
              onChange={setCooldown}
              type="number"
              autoComplete="off"
              helpText="How long to wait before re-alerting for this rule."
            />
            <Text variant="headingSm" as="h3">Notification Channels</Text>
            <Checkbox
              label="Email"
              checked={notifyEmail}
              onChange={setNotifyEmail}
            />
            <Checkbox
              label="Slack"
              checked={notifySlack}
              onChange={setNotifySlack}
            />
            <Checkbox
              label="WhatsApp (Pro only)"
              checked={notifyWhatsapp}
              onChange={setNotifyWhatsapp}
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}