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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [ruleName, setRuleName] = useState("");
  const [metric, setMetric] = useState("orders");
  const [condition, setCondition] = useState("no_activity");
  const [threshold, setThreshold] = useState("0");
  const [timeWindow, setTimeWindow] = useState("60");
  const [cooldown, setCooldown] = useState("30");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySlack, setNotifySlack] = useState(false);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(false);

  const getDefaultCondition = (m: string) => {
    if (m === "revenue") return "drops_by_percent";
    if (m === "orders") return "no_activity";
    if (m === "conversion") return "drops_by_percent";
    if (m === "checkout") return "no_activity";
    if (m === "payment") return "above_threshold";
    if (m === "inventory") return "below_threshold";
    return "no_activity";
  };

  const handleMetricChange = (val: string) => {
    setMetric(val);
    setCondition(getDefaultCondition(val));
  };

  const getConditionOptions = (m: string) => {
    if (m === "revenue") return [
      { label: "Drops by % compared to previous period", value: "drops_by_percent" },
      { label: "Falls below amount ($)", value: "below_threshold" },
    ];
    if (m === "orders") return [
      { label: "No orders for X minutes", value: "no_activity" },
      { label: "Falls below count", value: "below_threshold" },
    ];
    if (m === "conversion") return [
      { label: "Drops by % compared to previous period", value: "drops_by_percent" },
      { label: "Falls below %", value: "below_threshold" },
    ];
    if (m === "checkout") return [
      { label: "No checkouts for X minutes", value: "no_activity" },
      { label: "Falls below count", value: "below_threshold" },
    ];
    if (m === "payment") return [
      { label: "Payment failures increase above count", value: "above_threshold" },
      { label: "No payments for X minutes", value: "no_activity" },
    ];
    if (m === "inventory") return [
      { label: "Stock falls below units", value: "below_threshold" },
    ];
    return [
      { label: "No activity", value: "no_activity" },
      { label: "Drops by percent", value: "drops_by_percent" },
      { label: "Below threshold", value: "below_threshold" },
      { label: "Above threshold", value: "above_threshold" },
    ];
  };

  const getThresholdLabel = (m: string) => {
    if (m === "revenue") return "Threshold ($)";
    if (m === "conversion") return "Threshold (%)";
    if (m === "inventory") return "Threshold (units)";
    return "Threshold";
  };

  const getThresholdHelpText = (m: string, c: string) => {
    if (m === "revenue" && c === "drops_by_percent") return "Enter a percentage e.g. 30 means alert if revenue drops by 30%";
    if (m === "revenue" && c === "below_threshold") return "Enter an amount in your store currency e.g. 500";
    if (m === "orders" && c === "below_threshold") return "Enter a count e.g. 5 means alert if fewer than 5 orders";
    if (m === "orders" && c === "no_activity") return "Not needed for no activity — set your time window below";
    if (m === "conversion" && c === "drops_by_percent") return "Enter a percentage e.g. 20 means alert if conversion drops by 20%";
    if (m === "conversion" && c === "below_threshold") return "Enter a percentage e.g. 2 means alert if conversion rate falls below 2%";
    if (m === "checkout" && c === "no_activity") return "Not needed for no activity — set your time window below";
    if (m === "payment" && c === "above_threshold") return "Enter a count e.g. 3 means alert if more than 3 payment failures";
    if (m === "inventory" && c === "below_threshold") return "Enter units e.g. 10 means alert if stock falls below 10 units";
    return "Enter a value based on the condition selected above";
  };

  const [{ data: rules, fetching: fetchingRules }] = useFindMany(api.alertRule, {
    select: {
      id: true,
      name: true,
      metric: true,
      condition: true,
      threshold: true,
      timeWindow: true,
      cooldown: true,
      isActive: true,
      notifyEmail: true,
      notifySlack: true,
      notifyWhatsapp: true,
      lastTriggeredAt: true,
    },
  });

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

  const [{ fetching: creating }, createRule] = useAction(api.alertRule.create);
  const [{ fetching: updating }, updateRule] = useAction(api.alertRule.update);
  const [{ fetching: deleting }, deleteRule] = useAction(api.alertRule.delete);
  const [, updateEvent] = useAction(api.alertEvent.update);

  const severityTone = (severity: string | null) => {
    if (severity === "critical") return "critical" as const;
    if (severity === "warning") return "warning" as const;
    return "info" as const;
  };

  const handleResolve = async (id: string) => {
    await updateEvent({ id, resolved: true });
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
    setSelectedRuleId(null);
  };

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

  const handleOpenEdit = (rule: any) => {
    setSelectedRuleId(rule.id);
    setRuleName(rule.name || "");
    setMetric(rule.metric || "orders");
    setCondition(rule.condition || "no_activity");
    setThreshold(String(rule.threshold ?? 0));
    setTimeWindow(String(rule.timeWindow ?? 60));
    setCooldown(String(rule.cooldown ?? 30));
    setNotifyEmail(rule.notifyEmail ?? true);
    setNotifySlack(rule.notifySlack ?? false);
    setNotifyWhatsapp(rule.notifyWhatsapp ?? false);
    setShowEditModal(true);
  };

  const handleEditRule = async () => {
    if (!selectedRuleId) return;
    await updateRule({
      id: selectedRuleId,
      name: ruleName,
      metric: metric as any,
      condition: condition as any,
      threshold: parseFloat(threshold),
      timeWindow: parseInt(timeWindow),
      cooldown: parseInt(cooldown),
      notifyEmail,
      notifySlack,
      notifyWhatsapp,
    });
    setShowEditModal(false);
    resetForm();
  };

  const handleOpenDelete = (id: string) => {
    setSelectedRuleId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteRule = async () => {
    if (!selectedRuleId) return;
    await deleteRule({ id: selectedRuleId });
    setShowDeleteModal(false);
    setSelectedRuleId(null);
  };

  const handleToggleRule = async (id: string, currentActive: boolean | null) => {
    await updateRule({ id, isActive: !currentActive });
  };

  const ruleFormFields = (
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
        onChange={handleMetricChange}
      />
      <Select
        label="Condition"
        options={getConditionOptions(metric)}
        value={condition}
        onChange={setCondition}
      />
      <TextField
        label={getThresholdLabel(metric)}
        value={threshold}
        onChange={setThreshold}
        type="number"
        autoComplete="off"
        helpText={getThresholdHelpText(metric, condition)}
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
      <Checkbox label="Email" checked={notifyEmail} onChange={setNotifyEmail} />
      <Checkbox label="Slack" checked={notifySlack} onChange={setNotifySlack} />
      <Checkbox label="WhatsApp (Pro only)" checked={notifyWhatsapp} onChange={setNotifyWhatsapp} />
    </FormLayout>
  );

  const rulesRows = (rules || []).map((rule) => [
    rule.name || "—",
    rule.metric || "—",
    rule.condition?.replace(/_/g, " ") || "—",
    `${rule.timeWindow} min`,
    rule.lastTriggeredAt ? new Date(rule.lastTriggeredAt).toLocaleString() : "Never",
    <InlineStack gap="200">
      <Badge tone={rule.isActive ? "success" : undefined}>
        {rule.isActive ? "Active" : "Paused"}
      </Badge>
      <Button size="slim" onClick={() => handleToggleRule(rule.id, rule.isActive)}>
        {rule.isActive ? "Pause" : "Activate"}
      </Button>
      <Button size="slim" onClick={() => handleOpenEdit(rule)}>
        Edit
      </Button>
      <Button size="slim" tone="critical" onClick={() => handleOpenDelete(rule.id)}>
        Delete
      </Button>
    </InlineStack>,
  ]);

  const eventsRows = (events || []).map((event) => [
    event.ruleName || "—",
    event.metric || "—",
    event.message || "—",
    <Badge tone={severityTone(event.severity)}>{event.severity || "info"}</Badge>,
    event.triggeredAt ? new Date(event.triggeredAt).toLocaleString() : "—",
    event.resolved ? (
      <Badge tone="success">Resolved</Badge>
    ) : (
      <Button size="slim" onClick={() => handleResolve(event.id)}>Resolve</Button>
    ),
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
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">Alert Rules</Text>
            {fetchingRules ? (
              <Spinner size="small" />
            ) : rulesRows.length === 0 ? (
              <EmptyState
                heading="No alert rules yet"
                action={{ content: "Create your first rule", onAction: () => setShowCreateModal(true) }}
                image=""
              >
                <p>Create rules to monitor your store 24/7.</p>
              </EmptyState>
            ) : (
              <DataTable
                columnContentTypes={["text","text","text","text","text","text"]}
                headings={["Name","Metric","Condition","Window","Last Triggered","Actions"]}
                rows={rulesRows}
              />
            )}
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">Recent Alerts</Text>
            {fetchingEvents ? (
              <Spinner size="small" />
            ) : eventsRows.length === 0 ? (
              <Text variant="bodyMd" as="p" tone="subdued">
                No alerts fired yet. Your store is healthy!
              </Text>
            ) : (
              <DataTable
                columnContentTypes={["text","text","text","text","text","text"]}
                headings={["Rule","Metric","Message","Severity","Triggered At","Action"]}
                rows={eventsRows}
              />
            )}
          </BlockStack>
        </Card>
      </BlockStack>

      {/* Create Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => { setShowCreateModal(false); resetForm(); }}
        title="Create Alert Rule"
        primaryAction={{ content: "Create Rule", onAction: handleCreateRule, loading: creating }}
        secondaryActions={[{ content: "Cancel", onAction: () => { setShowCreateModal(false); resetForm(); } }]}
      >
        <Modal.Section>{ruleFormFields}</Modal.Section>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={showEditModal}
        onClose={() => { setShowEditModal(false); resetForm(); }}
        title="Edit Alert Rule"
        primaryAction={{ content: "Save Changes", onAction: handleEditRule, loading: updating }}
        secondaryActions={[{ content: "Cancel", onAction: () => { setShowEditModal(false); resetForm(); } }]}
      >
        <Modal.Section>{ruleFormFields}</Modal.Section>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedRuleId(null); }}
        title="Delete Alert Rule"
        primaryAction={{ content: "Delete", onAction: handleDeleteRule, loading: deleting, destructive: true }}
        secondaryActions={[{ content: "Cancel", onAction: () => { setShowDeleteModal(false); setSelectedRuleId(null); } }]}
      >
        <Modal.Section>
          <Text variant="bodyMd" as="p">
            Are you sure you want to delete this alert rule? This action cannot be undone.
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}