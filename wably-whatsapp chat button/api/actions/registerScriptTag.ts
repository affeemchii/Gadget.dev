import { ActionOptions } from "gadget-server";

// Define GlobalActionRun locally to satisfy typescript checks before backend sync generates it
export type GlobalActionRun = (context: {
  params: any;
  logger: any;
  api: any;
  connections: any;
}) => Promise<{ success: boolean; message: string }>;

export const run: GlobalActionRun = async ({ params, logger, api, connections }) => {
  try {
    // 1. Find the first shopifyShop record
    const shop = await api.shopifyShop.findFirst();
    if (!shop) {
      logger.error("No Shopify shop found in the database");
      return { success: false, message: "No Shopify shop found in database." };
    }

    // 2. Use connections.shopify.forShopId(shop.id) to get the Shopify client
    const shopify = connections.shopify.forShopId(shop.id);
    if (!shopify) {
      logger.error({ shopId: shop.id }, "Failed to get Shopify API client for shop ID");
      return { success: false, message: "Failed to get Shopify API client." };
    }

    const scriptUrl = "https://whatsapp-chat-button--development.gadget.app/web/public/whatsapp-button.js";

    // 3. Check if our script tag already exists by listing all script tags
    const scriptTags = await shopify.scriptTag.list();
    const hasScriptTag = scriptTags.some((tag: any) => tag.src === scriptUrl);

    // 4. If not found, create it
    if (!hasScriptTag) {
      logger.info({ shopId: shop.id }, "Registering WhatsApp storefront script tag");
      await shopify.scriptTag.create({
        event: "onload",
        src: scriptUrl
      });
      logger.info({ shopId: shop.id }, "Script tag registered successfully");
      return { success: true, message: "Script tag registered successfully." };
    } else {
      logger.info({ shopId: shop.id }, "WhatsApp storefront script tag already registered");
      return { success: true, message: "Script tag already registered." };
    }
  } catch (error: any) {
    logger.error({ error }, "Error running registerScriptTag action");
    return { success: false, message: error.message || "Failed to register script tag." };
  }
};

export const options: ActionOptions = {
  triggers: {
    api: true
  }
};
