import { useState, useEffect } from "react";
import {
  BlockStack,
  Button,
  Card,
  FormLayout,
  Page,
  Spinner,
  Text,
  TextField,
  Banner,
  Select,
  Checkbox,
  Divider,
  InlineStack,
  List,
  Link,
} from "@shopify/polaris";
import { useFindFirst, useAction } from "@gadgetinc/react";
import { api } from "../api";

export default function SettingsPage() {
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState("");
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [slackWebhook, setSlackWebhook] = useState("");
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [checkingFrequency, setCheckingFrequency] = useState("60");
  const [saved, setSaved] = useState(false);

  const [{ data: channel, fetching }] = useFindFirst(api.notificationChannel);

  useEffect(() => {
    if (channel) {
      const c = channel as any;
      setEmailEnabled(c.emailEnabled ?? false);
      setEmailRecipients(c.emailRecipients || "");
      setSlackEnabled(c.slackEnabled ?? false);
      setSlackWebhook(c.slackWebhook || "");
      setWhatsappEnabled(c.whatsappEnabled ?? false);
      setWhatsappNumber(c.whatsappNumber || "");
      setCheckingFrequency(c.checkingFrequency || "60");
    }
  }, [channel]);

  const [{ fetching: creating }, createChannel] = useAction(api.notificationChannel.create);
  const [{ fetching: updating }, updateChannel] = useAction(api.notificationChannel.update);

  const saving = creating || updating;

  const handleSave = async () => {
    const data = {
      emailEnabled,
      emailRecipients,
      slackEnabled,
      slackWebhook,
      whatsappEnabled,
      whatsappNumber,
      checkingFrequency: checkingFrequency as any,
    };
    if (channel?.id) {
      await updateChannel({ id: channel.id, ...data });
    } else {
      await createChannel(data);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (fetching) {
    return (
      <Page title="Settings">
        <Spinner size="small" />
      </Page>
    );
  }

  return (
    <Page title="Settings">
      <BlockStack gap="600">
        {saved && (
          <Banner tone="success" title="Settings saved successfully." />
        )}

        {/* Monitoring Frequency */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
              Monitoring Frequency
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              How often Observa checks your store for issues. More frequent
              checks mean faster alerts but higher resource usage.
            </Text>
            <Select
              label="Check every"
              options={[
                { label: "5 minutes", value: "5" },
                { label: "15 minutes", value: "15" },
                { label: "30 minutes", value: "30" },
                { label: "1 hour", value: "60" },
                { label: "2 hours", value: "120" },
                { label: "3 hours", value: "180" },
                { label: "6 hours", value: "360" },
                { label: "12 hours", value: "720" },
                { label: "24 hours", value: "1440" },
              ]}
              value={checkingFrequency}
              onChange={setCheckingFrequency}
            />
          </BlockStack>
        </Card>

        {/* Email */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <Text variant="headingMd" as="h2">
                Email Notifications
              </Text>
              <Checkbox
                label="Enabled"
                checked={emailEnabled}
                onChange={setEmailEnabled}
              />
            </InlineStack>
            <Divider />
            <FormLayout>
              <TextField
                label="Email Recipients"
                value={emailRecipients}
                onChange={setEmailRecipients}
                placeholder="owner@store.com, alerts@store.com"
                autoComplete="off"
                helpText="Separate multiple emails with commas."
                disabled={!emailEnabled}
              />
            </FormLayout>
          </BlockStack>
        </Card>

        {/* Slack */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <Text variant="headingMd" as="h2">
                Slack Notifications
              </Text>
              <Checkbox
                label="Enabled"
                checked={slackEnabled}
                onChange={setSlackEnabled}
              />
            </InlineStack>
            <Divider />
            <FormLayout>
              <TextField
                label="Slack Webhook URL"
                value={slackWebhook}
                onChange={setSlackWebhook}
                placeholder="https://hooks.slack.com/services/..."
                autoComplete="off"
                helpText="Paste your Slack Incoming Webhook URL here."
                disabled={!slackEnabled}
              />
            </FormLayout>
            <BlockStack gap="300">
              <Text variant="headingSm" as="h3">
                How to connect Slack
              </Text>
              <List type="number">
                <List.Item>
                  Go to{" "}
                  <Link url="https://api.slack.com/apps" external>
                    api.slack.com/apps
                  </Link>
                  {" "}and click Create New App then From scratch
                </List.Item>
                <List.Item>
                  Name your app (e.g. Observa), select your workspace and click Create App
                </List.Item>
                <List.Item>
                  In the left sidebar click Incoming Webhooks and toggle it ON
                </List.Item>
                <List.Item>
                  Click Add New Webhook to Workspace, select a channel and click Allow
                </List.Item>
                <List.Item>
                  Copy the webhook URL that appears and paste it in the field above
                </List.Item>
              </List>
            </BlockStack>
          </BlockStack>
        </Card>

        {/* WhatsApp */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <Text variant="headingMd" as="h2">
                WhatsApp Notifications
              </Text>
              <Checkbox
                label="Enabled (Pro only)"
                checked={whatsappEnabled}
                onChange={setWhatsappEnabled}
              />
            </InlineStack>
            <Divider />
            <FormLayout>
              <TextField
                label="WhatsApp Number"
                value={whatsappNumber}
                onChange={setWhatsappNumber}
                placeholder="+447911123456"
                autoComplete="off"
                helpText="Include country code. Requires Pro plan."
                disabled={!whatsappEnabled}
              />
            </FormLayout>
          </BlockStack>
        </Card>

        <Button variant="primary" onClick={handleSave} loading={saving}>
          Save Settings
        </Button>
      </BlockStack>
    </Page>
  );
}