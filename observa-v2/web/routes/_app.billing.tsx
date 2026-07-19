import {
  BlockStack,
  Button,
  Card,
  InlineGrid,
  List,
  Page,
  Text,
  Badge,
  Divider,
} from "@shopify/polaris";

export default function BillingPage() {
  return (
    <Page title="Billing">
      <BlockStack gap="600">
        <Text variant="bodyMd" as="p" tone="subdued">
          Choose the plan that fits your store. All plans include a 7-day free
          trial.
        </Text>

        <InlineGrid columns={2} gap="400">
          {/* Starter Plan */}
          <Card>
            <BlockStack gap="400">
              <BlockStack gap="200">
                <Text variant="headingLg" as="h2">
                  Starter
                </Text>
                <Text variant="heading2xl" as="p">
                  $9
                  <Text variant="bodyMd" as="span" tone="subdued">
                    /month
                  </Text>
                </Text>
              </BlockStack>

              <Divider />

              <List type="bullet">
                <List.Item>All monitoring types</List.Item>
                <List.Item>Email notifications</List.Item>
                <List.Item>Up to 20 active alert rules</List.Item>
                <List.Item>30-day alert history</List.Item>
              </List>

              <Button variant="primary" fullWidth>
                Start Free Trial
              </Button>
            </BlockStack>
          </Card>

          {/* Pro Plan */}
          <Card>
            <BlockStack gap="400">
              <BlockStack gap="200">
                <InlineGrid columns={2}>
                  <Text variant="headingLg" as="h2">
                    Pro
                  </Text>
                  <Badge tone="success">Most Popular</Badge>
                </InlineGrid>
                <Text variant="heading2xl" as="p">
                  $19
                  <Text variant="bodyMd" as="span" tone="subdued">
                    /month
                  </Text>
                </Text>
              </BlockStack>

              <Divider />

              <List type="bullet">
                <List.Item>Everything in Starter</List.Item>
                <List.Item>Unlimited alert rules</List.Item>
                <List.Item>WhatsApp notifications</List.Item>
                <List.Item>Slack integration</List.Item>
                <List.Item>Unlimited alert history</List.Item>
                <List.Item>Priority support</List.Item>
              </List>

              <Button variant="primary" fullWidth>
                Start Free Trial
              </Button>
            </BlockStack>
          </Card>
        </InlineGrid>

        {/* Current Plan */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
              Current Plan
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Shopify App Billing will be set up in the next phase. Your
              subscription will appear here once active.
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}