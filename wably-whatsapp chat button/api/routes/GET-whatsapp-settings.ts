import { RouteContext } from "gadget-server";

function isStoreOpen(businessHours: any, timezone: string): boolean {
  try {
    // Get current time in merchant's timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    const weekday = parts.find(p => p.type === 'weekday')?.value?.toLowerCase();
    const hour = parts.find(p => p.type === 'hour')?.value;
    const minute = parts.find(p => p.type === 'minute')?.value;
    
    if (!weekday || !hour || !minute) return true;
    
    const daySchedule = businessHours[weekday];
    if (!daySchedule || !daySchedule.open) return false;
    
    const currentMinutes = parseInt(hour) * 60 + parseInt(minute);
    const [startHour, startMin] = daySchedule.start.split(':').map(Number);
    const [endHour, endMin] = daySchedule.end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } catch {
    return true; // If anything fails, assume open
  }
}

/**
 * Route handler for GET /whatsapp-settings
 * Serves settings for the storefront script.
 */
export default async function route({ request, reply, api, logger }: RouteContext) {
  // Set CORS headers so storefront can access this endpoint cross-origin
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET");
  reply.header("Content-Type", "application/json");

  try {
    // 1. IDENTIFY THE SHOP
    // Extract shop domain from query parameters or request headers
    const query = (request.query || {}) as Record<string, any>;
    const shopQuery = query.shop;
    const shopHeader = request.headers["x-shopify-shop-domain"];
    const shopDomain = (shopQuery || shopHeader) as string;

    if (!shopDomain) {
      await reply.send({ isEnabled: false });
      return;
    }

    // 2. FIND THE SHOP RECORD
    const shopRecord = await api.shopifyShop.findFirst({
      filter: { domain: { equals: shopDomain } }
    });

    if (!shopRecord) {
      await reply.send({ isEnabled: false });
      return;
    }

    // 3. FIND THE SETTINGS
    const settings = await api.shopSetting.findFirst({
      filter: { shopId: { equals: shopRecord.id } } as any
    });

    if (!settings) {
      await reply.send({ isEnabled: false });
      return;
    }

    // 4. RETURN THE RESPONSE
    const timezone = (settings as any).timezone || shopRecord.ianaTimezone || "UTC";
    const businessHours = (settings as any).businessHours;
    const businessHoursEnabled = (settings as any).businessHoursEnabled === true;
    const storeIsOpen = (businessHoursEnabled && businessHours) ? isStoreOpen(businessHours, timezone) : true;
    const useMultipleAgents = (settings as any).useMultipleAgents === true;
    const agents = (settings as any).agents || [];

    await reply.send({
      isEnabled: settings.isEnabled,
      whatsappNumber: settings.whatsappNumber,
      buttonColor: settings.buttonColor,
      buttonPosition: settings.buttonPosition,
      isOpen: storeIsOpen,
      timezone: timezone,
      useMultipleAgents: useMultipleAgents,
      agents: agents
    });
  } catch (error) {
    logger.error({ error }, "Error serving WhatsApp settings");
    await reply.send({ isEnabled: false });
  }
}
