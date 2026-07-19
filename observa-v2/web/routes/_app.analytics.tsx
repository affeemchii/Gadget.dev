import { useState, useEffect, useMemo, useCallback } from "react";
import { useGlobalAction, useFindFirst } from "@gadgetinc/react";
import { useGadget } from "@gadgetinc/react-shopify-app-bridge";
import { api } from "../api";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  DataTable,
  Grid,
  InlineStack,
  Page,
  Spinner,
  Text,
  Badge,
  InlineGrid,
} from "@shopify/polaris";
import { LineChart, BarChart } from "@shopify/polaris-viz";
import { MetricCard } from "../components/MetricCard";
import { ChartCard } from "../components/ChartCard";
import { DateRangePicker } from "../components/DateRangePicker";
import { ComparisonSelector } from "../components/ComparisonSelector";
import { CurrencySelector, getCurrencySymbol } from "../components/CurrencySelector";

interface AnalyticsResponse {
  success: boolean;
  data: {
    sessions: {
      total: number;
      totalPreviousPeriod: number;
      percentChange: number;
      rows: any[];
    };
    orders: {
      total: number;
      revenue: number;
      totalPreviousPeriod: number;
      revenuePreviousPeriod: number;
      percentChangeOrders: number;
      percentChangeRevenue: number;
      rows: any[];
    };
    funnel: {
      cartAdditions: number;
      checkouts: number;
      completedCheckouts: number;
      cartAdditionsPreviousPeriod: number;
      checkoutsPreviousPeriod: number;
      completedCheckoutsPreviousPeriod: number;
      rows: any[];
    };
    metrics: {
      conversionRate: string;
      conversionRatePreviousPeriod: string;
      percentChangeConversionRate: number;
      checkoutRate: string;
      avgOrderValue: string;
    };
  };
}

interface ChartDataPoint {
  date: string;
  sessionCount: number;
  orderCount: number;
  visitors: number;
  conversionRate: string;
}

interface OrderDataPoint {
  date: string;
  orders: number;
  avgOrderValue: number;
  revenue: number;
}

export default function AnalyticsPage() {
  const { isAuthenticated, loading: authLoading } = useGadget();
  const [dateRange, setDateRange] = useState<'today' | 'last_7_days' | 'last_30_days'>('today');
  const [dateRangeValue, setDateRangeValue] = useState<{ start?: Date; end?: Date }>({});
  const [comparison, setComparison] = useState<'none' | 'previous_period' | 'benchmarks'>('previous_period');
  const [{ data, fetching, error }, refresh] = useGlobalAction(api.getAnalytics);
  const shouldLoadShop = isAuthenticated && !authLoading;
  const [{ data: shopData, fetching: fetchingShop }] = useFindFirst(api.shopifyShop, {
    pause: !shouldLoadShop,
    select: { currency: true, id: true },
  });
  const [dailyPage, setDailyPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const itemsPerPage = 10;
  const [currency, setCurrency] = useState<string>("");

  useEffect(() => {
    if (shopData?.currency && !currency) {
      setCurrency(shopData.currency);
    }
  }, [shopData?.currency, currency]);

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    refresh({ dateRange, currency: value } as any);
  };

  const currencySymbol = getCurrencySymbol(currency || "USD");

  useEffect(() => {
    if (currency) {
      refresh({ dateRange, currency } as any);
    }
  }, [dateRange, currency]);

  const handleRefreshData = useCallback(() => {
    refresh({ dateRange, currency } as any);
  }, [refresh, dateRange, currency]);

  const analyticsData = useMemo((): AnalyticsResponse | null => {
    if (!data) return null;
    return data as AnalyticsResponse;
  }, [data]);

  const metrics = useMemo(() => {
    if (!analyticsData?.data) {
      return {
        totalSessions: 0, totalSessionsPreviousPeriod: 0, percentChangeSessions: 0,
        totalOrders: 0, totalOrdersPreviousPeriod: 0, percentChangeOrders: 0,
        totalRevenue: 0, totalRevenuePreviousPeriod: 0, percentChangeRevenue: 0,
        conversionRate: "0.00", conversionRatePreviousPeriod: "0.00",
        percentChangeConversionRate: 0, checkoutRate: "0.00", avgOrderValue: "0.00",
        cartAdditions: 0, checkouts: 0, completedCheckouts: 0,
      };
    }
    const { sessions, orders, funnel, metrics: metricsData } = analyticsData.data;
    return {
      totalSessions: sessions.total,
      totalSessionsPreviousPeriod: sessions.totalPreviousPeriod,
      percentChangeSessions: sessions.percentChange,
      totalOrders: orders.total,
      totalOrdersPreviousPeriod: orders.totalPreviousPeriod,
      percentChangeOrders: orders.percentChangeOrders,
      totalRevenue: orders.revenue,
      totalRevenuePreviousPeriod: orders.revenuePreviousPeriod,
      percentChangeRevenue: orders.percentChangeRevenue,
      conversionRate: metricsData.conversionRate,
      conversionRatePreviousPeriod: metricsData.conversionRatePreviousPeriod,
      percentChangeConversionRate: metricsData.percentChangeConversionRate,
      checkoutRate: metricsData.checkoutRate,
      avgOrderValue: metricsData.avgOrderValue,
      cartAdditions: funnel.cartAdditions,
      checkouts: funnel.checkouts,
      completedCheckouts: funnel.completedCheckouts,
    };
  }, [analyticsData]);

  const chartData = useMemo((): ChartDataPoint[] => {
    if (!analyticsData?.data?.funnel?.rows) return [];
    const { funnel, orders } = analyticsData.data;
    const funnelRows = funnel.rows;
    const ordersRows = orders?.rows || [];
    return funnelRows.map((funnelRow: any, index: number) => {
      const orderRow = ordersRows[index] || {};
      let date: string;
      if (funnelRow.hour) {
        const hourStr = funnelRow.hour;
        date = hourStr.split('T')[0] + ' ' + hourStr.split('T')[1]?.substring(0, 5);
      } else if (funnelRow.day) {
        date = funnelRow.day;
      } else {
        date = `Point ${index + 1}`;
      }
      const sessionCount = Number(funnelRow.sessions || 0);
      const orderCount = Number(orderRow.orders || 0);
      const convRate = Number(funnelRow.conversion_rate || 0);
      return { date, sessionCount, orderCount, visitors: sessionCount, conversionRate: convRate.toFixed(2) };
    });
  }, [analyticsData]);

  const ordersByDate = useMemo((): OrderDataPoint[] => {
    if (!analyticsData?.data?.orders?.rows) return [];
    return analyticsData.data.orders.rows.map((row: any, index: number) => {
      let date: string;
      if (row.hour) {
        const hourStr = row.hour;
        date = hourStr.split('T')[0] + ' ' + hourStr.split('T')[1]?.substring(0, 5);
      } else if (row.day) {
        date = row.day;
      } else {
        date = `Point ${index + 1}`;
      }
      return { date, orders: Number(row.orders || 0), avgOrderValue: Number(row.average_order_value || 0), revenue: Number(row.gross_sales || 0) };
    });
  }, [analyticsData]);

  const dailyTableData = useMemo(() => {
    const startIndex = (dailyPage - 1) * itemsPerPage;
    return chartData.slice(startIndex, startIndex + itemsPerPage);
  }, [chartData, dailyPage]);

  const dailyTotalPages = Math.ceil(chartData.length / itemsPerPage);

  const dailyTableRows = useMemo(
    () => dailyTableData.map((item) => [item.date, item.sessionCount.toString(), item.orderCount.toString(), `${item.conversionRate}%`]),
    [dailyTableData]
  );

  const ordersTableData = useMemo(() => {
    const startIndex = (ordersPage - 1) * itemsPerPage;
    return ordersByDate.slice(startIndex, startIndex + itemsPerPage);
  }, [ordersByDate, ordersPage]);

  const ordersTotalPages = Math.ceil(ordersByDate.length / itemsPerPage);

  const ordersTableRows = useMemo(
    () => ordersTableData.map((item) => [item.date, item.orders.toString(), `${currencySymbol}${item.avgOrderValue.toFixed(2)}`, `${currencySymbol}${item.revenue.toFixed(2)}`]),
    [ordersTableData, currencySymbol]
  );

  const funnelBreakdown = useMemo(() => {
    if (!analyticsData?.data?.funnel) return { cartAdditionRate: 0, checkoutRate: 0, completionRate: 0 };
    const { cartAdditions, checkouts, completedCheckouts } = analyticsData.data.funnel;
    const totalSessions = analyticsData.data.sessions.total;
    return {
      cartAdditionRate: Number(totalSessions > 0 ? ((cartAdditions / totalSessions) * 100).toFixed(2) : 0),
      checkoutRate: Number(totalSessions > 0 ? ((checkouts / totalSessions) * 100).toFixed(2) : 0),
      completionRate: Number(totalSessions > 0 ? ((completedCheckouts / totalSessions) * 100).toFixed(2) : 0),
    };
  }, [analyticsData]);

  if (authLoading || (shouldLoadShop && fetchingShop && !shopData) || (fetching && !data)) {
    return (
      <Page title="Performance Analytics" fullWidth>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
          <BlockStack gap="300" inlineAlign="center">
            <Spinner accessibilityLabel="Loading dashboard" size="large" />
            <Text variant="bodyMd" as="p" tone="subdued">Loading live analytics from Shopify...</Text>
          </BlockStack>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Performance Analytics" fullWidth>
      <BlockStack gap="400">
        <InlineStack gap="200" align="space-between">
          <InlineStack gap="200">
            <DateRangePicker
              value={dateRangeValue}
              onDateRangeSelect={({ start, end }) => {
                setDateRangeValue({ start, end });
              }}
            />
            <ComparisonSelector selected={comparison} onChange={setComparison} />
            <CurrencySelector selected={currency || shopData?.currency || "USD"} onChange={handleCurrencyChange} />
          </InlineStack>
        </InlineStack>

        {error && (
          <Banner tone="critical" title="Error loading analytics">
            <p>{error instanceof Error ? error.message : "Failed to fetch analytics data."}</p>
          </Banner>
        )}

        <InlineGrid columns={5} gap="300">
          <MetricCard title="Total Sessions" value={metrics.totalSessions.toLocaleString()} loading={fetching} />
          <MetricCard title="Total Orders" value={metrics.totalOrders.toLocaleString()} loading={fetching} />
          <MetricCard title="Conversion Rate" value={`${metrics.conversionRate}%`} loading={fetching} />
          <MetricCard title="Avg Order Value" value={`${currencySymbol}${parseFloat(metrics.avgOrderValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} loading={fetching} />
          <MetricCard title="Total Revenue" value={`${currencySymbol}${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} loading={fetching} />
        </InlineGrid>

        {chartData.length > 0 && (
          <Grid columns={{ xs: 1, md: 1, lg: 3 }}>
            <Grid.Cell>
              <Card>
                <BlockStack gap="400">
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h3" tone="subdued">Sessions over time</Text>
                    <InlineStack gap="200" align="start" blockAlign="center">
                      <Text variant="heading2xl" as="p">{metrics.totalSessions.toLocaleString()}</Text>
                      {metrics.percentChangeSessions !== 0 && (
                        <Badge tone={metrics.percentChangeSessions > 0 ? "success" : "critical"}>
                          {`${metrics.percentChangeSessions > 0 ? "↑" : "↓"} ${Math.abs(metrics.percentChangeSessions).toFixed(0)}%`}
                        </Badge>
                      )}
                    </InlineStack>
                  </BlockStack>
                  <div style={{ height: "260px" }}>
                    <LineChart data={[{ name: "Sessions", data: chartData.map((item) => ({ key: item.date, value: item.sessionCount })) }]} theme="Light" showLegend={false} />
                  </div>
                </BlockStack>
              </Card>
            </Grid.Cell>
            <Grid.Cell>
              <Card>
                <BlockStack gap="400">
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h3" tone="subdued">Conversion rate over time</Text>
                    <InlineStack gap="200" align="start" blockAlign="center">
                      <Text variant="heading2xl" as="p">{metrics.conversionRate}%</Text>
                      {metrics.percentChangeConversionRate !== 0 ? (
                        <Badge tone={metrics.percentChangeConversionRate > 0 ? "success" : "critical"}>
                          {`${metrics.percentChangeConversionRate > 0 ? "↑" : "↓"} ${Math.abs(metrics.percentChangeConversionRate).toFixed(1)}%`}
                        </Badge>
                      ) : <Badge>—</Badge>}
                    </InlineStack>
                  </BlockStack>
                  <div style={{ height: "260px" }}>
                    <LineChart data={[{ name: "Conversion Rate", data: chartData.map((item) => ({ key: item.date, value: parseFloat(item.conversionRate) })) }]} theme="Light" showLegend={false} />
                  </div>
                </BlockStack>
              </Card>
            </Grid.Cell>
            <Grid.Cell>
              <Card>
                <BlockStack gap="400">
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h3" tone="subdued">Conversion rate breakdown</Text>
                  </BlockStack>
                  <InlineGrid columns={4} gap="300">
                    <BlockStack gap="100">
                      <Text variant="bodySm" as="p" tone="subdued">Sessions</Text>
                      <Text variant="headingMd" as="p">100%</Text>
                    </BlockStack>
                    <BlockStack gap="100">
                      <Text variant="bodySm" as="p" tone="subdued">Added to cart</Text>
                      <Text variant="headingMd" as="p">{funnelBreakdown.cartAdditionRate}%</Text>
                    </BlockStack>
                    <BlockStack gap="100">
                      <Text variant="bodySm" as="p" tone="subdued">Reached checkout</Text>
                      <Text variant="headingMd" as="p">{funnelBreakdown.checkoutRate}%</Text>
                    </BlockStack>
                    <BlockStack gap="100">
                      <Text variant="bodySm" as="p" tone="subdued">Completed checkout</Text>
                      <Text variant="headingMd" as="p">{funnelBreakdown.completionRate}%</Text>
                    </BlockStack>
                  </InlineGrid>
                  <div style={{ height: "180px" }}>
                    <BarChart data={[{ name: "Funnel", data: [{ key: "Sessions", value: 100 }, { key: "Added to cart", value: funnelBreakdown.cartAdditionRate }, { key: "Reached checkout", value: funnelBreakdown.checkoutRate }, { key: "Completed", value: funnelBreakdown.completionRate }] }]} theme="Light" showLegend={false} />
                  </div>
                </BlockStack>
              </Card>
            </Grid.Cell>
          </Grid>
        )}

        {chartData.length > 0 && (
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text variant="headingMd" as="h3">Orders by {dateRange === 'today' ? 'Hour' : 'Date'}</Text>
                  <Badge tone="success">{`${metrics.totalOrders} Orders`}</Badge>
                </InlineStack>
                <DataTable
                  columnContentTypes={["text", "numeric", "numeric", "numeric"]}
                  headings={[dateRange === 'today' ? "Date/Time" : "Date", "Orders", "Avg Order Value", "Revenue"]}
                  rows={ordersTableRows}
                />
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text variant="headingMd" as="h3">{dateRange === 'today' ? 'Hourly' : 'Daily'} Performance Breakdown</Text>
                  <Badge tone="info">Live Data</Badge>
                </InlineStack>
                <DataTable
                  columnContentTypes={["text", "numeric", "numeric", "numeric"]}
                  headings={[dateRange === 'today' ? "Date/Time" : "Date", "Sessions", "Orders", "Conversion %"]}
                  rows={dailyTableRows}
                />
              </BlockStack>
            </Card>
          </BlockStack>
        )}

        {chartData.length === 0 && !fetching && analyticsData?.success && (
          <Card>
            <BlockStack gap="300" inlineAlign="center">
              <Text variant="headingMd" as="h3">No data available</Text>
              <Button onClick={handleRefreshData}>Refresh Data</Button>
            </BlockStack>
          </Card>
        )}
      </BlockStack>
    </Page>
  );
}