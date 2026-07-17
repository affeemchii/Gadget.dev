interface AnalyticsRow {
  hour?: string;
  day?: string;
  date?: string;
  sessions?: number | string;
  sessions_with_cart_additions?: number | string;
  sessions_that_reached_checkout?: number | string;
  sessions_that_completed_checkout?: number | string;
  conversion_rate?: number | string;
  gross_sales?: number | string;
  orders?: number | string;
  average_order_value?: number | string;
  
  // Totals fields
  sessions__totals?: number | string;
  sessions_with_cart_additions__totals?: number | string;
  sessions_that_reached_checkout__totals?: number | string;
  sessions_that_completed_checkout__totals?: number | string;
  conversion_rate__totals?: number | string;
  gross_sales__totals?: number | string;
  orders__totals?: number | string;
  average_order_value__totals?: number | string;
  
  // Previous period comparison fields
  comparison_sessions__previous_period?: number | string;
  comparison_sessions_with_cart_additions__previous_period?: number | string;
  comparison_sessions_that_reached_checkout__previous_period?: number | string;
  comparison_sessions_that_completed_checkout__previous_period?: number | string;
  comparison_conversion_rate__previous_period?: number | string;
  comparison_gross_sales__previous_period?: number | string;
  comparison_orders__previous_period?: number | string;
  comparison_average_order_value__previous_period?: number | string;
  
  // Previous period totals
  comparison_sessions__previous_period__totals?: number | string;
  comparison_conversion_rate__previous_period__totals?: number | string;
  comparison_gross_sales__previous_period__totals?: number | string;
  comparison_orders__previous_period__totals?: number | string;
  
  // Percent change fields
  percent_change_sessions__previous_period?: number | string;
  percent_change_conversion_rate__previous_period?: number | string;
  percent_change_gross_sales__previous_period?: number | string;
  percent_change_orders__previous_period?: number | string;
  
  // Percent change totals
  percent_change_sessions__previous_period__totals?: number | string;
  percent_change_conversion_rate__previous_period__totals?: number | string;
  percent_change_gross_sales__previous_period__totals?: number | string;
  percent_change_orders__previous_period__totals?: number | string;
  
  [key: string]: any;
}

interface ShopifyQLTableData {
  columns?: { name: string }[];
  rows?: AnalyticsRow[];
}

interface ShopifyQLResponse {
  shopifyqlQuery?: {
    tableData?: ShopifyQLTableData;
    parseErrors?: string[];
  };
}

interface AnalyticsData {
  success: boolean;
  data: {
    sessions: {
      total: number;
      totalPreviousPeriod: number;
      percentChange: number;
      rows: AnalyticsRow[];
    };
    orders: {
      total: number;
      revenue: number;
      totalPreviousPeriod: number;
      revenuePreviousPeriod: number;
      percentChangeOrders: number;
      percentChangeRevenue: number;
      rows: AnalyticsRow[];
    };
    funnel: {
      cartAdditions: number;
      checkouts: number;
      completedCheckouts: number;
      cartAdditionsPreviousPeriod: number;
      checkoutsPreviousPeriod: number;
      completedCheckoutsPreviousPeriod: number;
      rows: AnalyticsRow[];
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

/**
 * Safely converts a value to a number, returning 0 if invalid
 */
const toNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

/**
 * Action parameters definition
 */
export const params = {
  dateRange: { type: "string" },
  currency: { type: "string" },
};

/**
 * Executes a ShopifyQL query and returns the response
 */
const executeShopifyQLQuery = async (
  shopify: any,
  query: string,
  logger: any
): Promise<AnalyticsRow[]> => {
  try {
    // Use parameterized query instead of string interpolation
    const graphqlQuery = `
      query($query: String!) {
        shopifyqlQuery(query: $query) {
          tableData {
            columns { name }
            rows
          }
          parseErrors
        }
      }
    `;

    const response: ShopifyQLResponse = await shopify.current.graphql(
      graphqlQuery,
      { query }
    );

    // Check for parse errors
    if (response?.shopifyqlQuery?.parseErrors?.length) {
      logger.warn("[ShopifyQL] Parse errors:", response.shopifyqlQuery.parseErrors);
    }

    return response?.shopifyqlQuery?.tableData?.rows || [];
  } catch (error) {
    logger.error("[ShopifyQL] Query execution failed:", { query, error });
    throw error;
  }
};

export const run = async ({
  logger,
  connections,
  params,
}: any): Promise<AnalyticsData> => {
  // Get date range and currency from params
  const dateRange = params?.dateRange || 'today';
  const currency = params?.currency || 'USD';
  logger.info("[getAnalytics] Starting analytics fetch", { dateRange, currency });

  // Validate Shopify connection
  const shopify = connections.shopify;
  if (!shopify?.current) {
    logger.error("[getAnalytics] Shopify connection not available or not authenticated");
    throw new Error("Shopify connection not available. Please ensure the app is properly installed.");
  }

  try {
    // Build query based on date range
    let timePeriod: string;
    let timeseriesType: string;
    let orderByField: string;

    switch (dateRange) {
      case 'last_7_days':
        timePeriod = 'SINCE startOfDay(-7d) UNTIL today';
        timeseriesType = 'day';
        orderByField = 'day';
        break;
      case 'last_30_days':
        timePeriod = 'SINCE startOfDay(-30d) UNTIL today';
        timeseriesType = 'day';
        orderByField = 'day';
        break;
      case 'today':
      default:
        timePeriod = 'DURING today';
        timeseriesType = 'hour';
        orderByField = 'hour';
        break;
    }

    // Use optimized ShopifyQL with TOTALS, PERCENT_CHANGE, CURRENCY, and COMPARE TO
    // This gives us everything in one query per dataset
    const FUNNEL_QUERY = `
      FROM sessions
      SHOW sessions, sessions_with_cart_additions, sessions_that_reached_checkout,
        sessions_that_completed_checkout, conversion_rate
      TIMESERIES ${timeseriesType} WITH TOTALS, PERCENT_CHANGE, CURRENCY '${currency}'
      ${timePeriod}
      COMPARE TO previous_period
      ORDER BY ${orderByField} ASC
      LIMIT 1000
    `;

    const ORDERS_QUERY = `
      FROM sales 
      SHOW gross_sales, orders, average_order_value 
      WHERE excludes_post_order_adjustments = true 
      TIMESERIES ${timeseriesType} WITH TOTALS, PERCENT_CHANGE, CURRENCY '${currency}'
      ${timePeriod}
      COMPARE TO previous_period
      ORDER BY ${orderByField} ASC
      LIMIT 1000
    `;

    // Execute queries in parallel for better performance
    logger.info("[getAnalytics] Executing ShopifyQL queries with TOTALS and PERCENT_CHANGE");
    const [funnelRows, ordersRows] = await Promise.all([
      executeShopifyQLQuery(shopify, FUNNEL_QUERY, logger),
      executeShopifyQLQuery(shopify, ORDERS_QUERY, logger),
    ]);

    logger.info("[getAnalytics] Query results received", {
      funnelCount: funnelRows.length,
      ordersCount: ordersRows.length,
    });

    // Extract totals from the first row (they're the same in all rows)
    const firstFunnelRow = funnelRows[0] || {};
    const firstOrderRow = ordersRows[0] || {};

    // Sessions data (from funnel query)
    const totalSessions = toNumber(firstFunnelRow.sessions__totals);
    const totalSessionsPreviousPeriod = toNumber(firstFunnelRow.comparison_sessions__previous_period__totals);
    const percentChangeSessions = toNumber(firstFunnelRow.percent_change_sessions__previous_period__totals);

    // Funnel data
    const totalCartAdditions = toNumber(firstFunnelRow.sessions_with_cart_additions__totals);
    const totalCheckouts = toNumber(firstFunnelRow.sessions_that_reached_checkout__totals);
    const totalCompletedCheckouts = toNumber(firstFunnelRow.sessions_that_completed_checkout__totals);
    const cartAdditionsPreviousPeriod = toNumber(firstFunnelRow.comparison_sessions_with_cart_additions__previous_period__totals);
    const checkoutsPreviousPeriod = toNumber(firstFunnelRow.comparison_sessions_that_reached_checkout__previous_period__totals);
    const completedCheckoutsPreviousPeriod = toNumber(firstFunnelRow.comparison_sessions_that_completed_checkout__previous_period__totals);

    // Conversion rate (from totals)
    const conversionRate = (toNumber(firstFunnelRow.conversion_rate__totals) || 0).toFixed(2);
    const conversionRatePreviousPeriod = (toNumber(firstFunnelRow.comparison_conversion_rate__previous_period__totals) || 0).toFixed(2);
    const percentChangeConversionRate = toNumber(firstFunnelRow.percent_change_conversion_rate__previous_period__totals);

    // Orders data
    const totalOrders = toNumber(firstOrderRow.orders__totals);
    const totalRevenue = toNumber(firstOrderRow.gross_sales__totals);
    const avgOrderValue = (toNumber(firstOrderRow.average_order_value__totals) || 0).toFixed(2);
    
    const totalOrdersPreviousPeriod = toNumber(firstOrderRow.comparison_orders__previous_period__totals);
    const totalRevenuePreviousPeriod = toNumber(firstOrderRow.comparison_gross_sales__previous_period__totals);
    
    const percentChangeOrders = toNumber(firstOrderRow.percent_change_orders__previous_period__totals);
    const percentChangeRevenue = toNumber(firstOrderRow.percent_change_gross_sales__previous_period__totals);

    // Calculate checkout rate
    const checkoutRate = totalSessions > 0
      ? ((totalCheckouts / totalSessions) * 100).toFixed(2)
      : "0.00";

    logger.info("[getAnalytics] Analytics calculated successfully", {
      totalSessions,
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      conversionRate,
      percentChangeSessions,
      percentChangeOrders,
    });

    return {
      success: true,
      data: {
        sessions: {
          total: totalSessions,
          totalPreviousPeriod: totalSessionsPreviousPeriod,
          percentChange: percentChangeSessions,
          rows: funnelRows,
        },
        orders: {
          total: totalOrders,
          revenue: totalRevenue,
          totalPreviousPeriod: totalOrdersPreviousPeriod,
          revenuePreviousPeriod: totalRevenuePreviousPeriod,
          percentChangeOrders,
          percentChangeRevenue,
          rows: ordersRows,
        },
        funnel: {
          cartAdditions: totalCartAdditions,
          checkouts: totalCheckouts,
          completedCheckouts: totalCompletedCheckouts,
          cartAdditionsPreviousPeriod,
          checkoutsPreviousPeriod,
          completedCheckoutsPreviousPeriod,
          rows: funnelRows,
        },
        metrics: {
          conversionRate,
          conversionRatePreviousPeriod,
          percentChangeConversionRate,
          checkoutRate,
          avgOrderValue,
        },
      },
    };
  } catch (error) {
    logger.error("[getAnalytics] Failed to fetch analytics", { error });
    throw new Error(
      `Failed to fetch analytics data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};