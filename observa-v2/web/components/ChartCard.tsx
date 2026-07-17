import { Card, Text } from "@shopify/polaris";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card>
      <div style={{ padding: '20px' }}>
        <Text variant="headingMd" as="h3">{title}</Text>
        <div style={{ height: '300px', marginTop: '20px' }}>
          {children}
        </div>
      </div>
    </Card>
  );
}
