import { applyParams, save, ActionOptions } from "gadget-server";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await save(record);
};

export const onSuccess: ActionOnSuccess = async ({ params, record, logger, api, connections }) => {
  // 1. CREATE DEFAULT SETTINGS
  try {
    // Check if a shopSetting already exists for this shop to avoid duplicates
    const existingSetting = await api.shopSetting.findFirst({
      filter: { shop: { equals: record.id } }
    } as any);

    if (!existingSetting) {
      logger.info({ shopId: record.id }, "No shop settings found, creating default settings");
      await api.shopSetting.create({
        shopSetting: {
          whatsappNumber: "",
          buttonColor: "#25D366",
          buttonPosition: "bottom-right",
          isEnabled: false,
          shop: { _link: record.id }
        }
      });
      logger.info({ shopId: record.id }, "Default settings created successfully");
    } else {
      logger.info({ shopId: record.id }, "Shop settings already exist, skipping creation");
    }
  } catch (error) {
    logger.error({ error, shopId: record.id }, "Failed to verify or create default settings");
  }

  // 2. REGISTER SCRIPT TAG
  try {
    const shopify = connections.shopify.current;
    if (shopify) {
      const scriptUrl = "https://whatsapp-chat-button--development.gadget.app/web/public/whatsapp-button.js";
      
      // Fetch current script tags to verify if it is already registered
      const scriptTags = await shopify.scriptTag.list();
      const hasScriptTag = scriptTags.some((tag: any) => tag.src === scriptUrl);

      if (!hasScriptTag) {
        logger.info({ shopId: record.id }, "Registering WhatsApp storefront script tag");
        await shopify.scriptTag.create({
          event: "onload",
          src: scriptUrl
        });
        logger.info({ shopId: record.id }, "WhatsApp storefront script tag registered successfully");
      } else {
        logger.info({ shopId: record.id }, "WhatsApp storefront script tag already registered, skipping");
      }
    } else {
      logger.warn({ shopId: record.id }, "No active Shopify connection context available for script tag registration");
    }
  } catch (error) {
    // Log error but do not throw to avoid crashing installation
    logger.error({ error, shopId: record.id }, "Failed to verify or register Shopify Script Tag");
  }
};

export const options: ActionOptions = { actionType: "create" };
