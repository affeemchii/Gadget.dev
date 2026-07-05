import { RouteContext } from "gadget-server";

export default async function route({ request, reply, api, logger }: RouteContext) {
  // 1. SET CORS HEADERS
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  reply.header("Content-Type", "application/json");

  // 2. HANDLE OPTIONS PREFLIGHT
  if (request.method === "OPTIONS") {
    await reply.status(204).send("");
    return;
  }

  try {
    // 3. READ REQUEST BODY
    const body = request.body as any;
    const shopDomain = body?.shop || request.headers["x-shopify-shop-domain"];
    const pageUrl = body?.pageUrl || "";
    const pageType = body?.pageType || "";
    const deviceType = body?.deviceType || "";

    if (!shopDomain) {
      await reply.send({ success: false });
      return;
    }

    // 4. FIND THE SHOP
    const shopRecord = await api.shopifyShop.findFirst({
      filter: { domain: { equals: shopDomain as string } }
    });

    if (!shopRecord) {
      await reply.send({ success: false });
      return;
    }

    // 5. CREATE CLICK RECORD
    await api.buttonClick.create({
      buttonClick: {
        shop: { _link: shopRecord.id },
        pageUrl: pageUrl,
        pageType: pageType,
        deviceType: deviceType
      }
    });

    // 6. RETURN SUCCESS
    await reply.send({ success: true });
  } catch (error) {
    logger.error({ error }, "Error tracking button click");
    await reply.send({ success: false });
  }
}
