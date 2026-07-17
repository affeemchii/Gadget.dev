import { Card, BlockStack, Text, Spinner } from "@shopify/polaris";

interface MetricCardProps {
  title: string;
  value: string | number;
  loading?: boolean;
  chart?: React.ReactNode;
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, loading, chart, icon }: MetricCardProps) {
  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="bodyMd" as="p" tone="subdued">{title}</Text>
        <Text variant="heading2xl" as="h2">
          {loading ? <Spinner size="small" /> : value}
        </Text>
        {chart && <div style={{ marginTop: '10px' }}>{chart}</div>}
        {icon && <div style={{ marginTop: '10px' }}>{icon}</div>}
      </BlockStack>
    </Card>
  );
}
