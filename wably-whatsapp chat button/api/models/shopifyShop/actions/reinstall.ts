import { applyParams, save, ActionOptions } from "gadget-server";
import { preventCrossShopDataAccess } from "gadget-server/shopify";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
};

export const onSuccess: ActionOnSuccess = async ({ params, record, logger, api, connections }) => {
  // 1. CREATE DEFAULT SETTINGS if none exist
  try {
    const existingSetting = await api.shopSetting.findFirst({
      filter: { shopId: { equals: record.id } }
    } as any);
    if (!existingSetting) {
      await api.shopSetting.create({
        shopSetting: {
          whatsappNumber: "",
          buttonColor: "#25D366",
          buttonPosition: "bottom-right",
          isEnabled: false,
          shop: { _link: record.id }
        }
      });
      logger.info({ shopId: record.id }, "Default settings created");
    }
  } catch (error) {
    logger.error({ error, shopId: record.id }, "Failed to create default settings");
  }

  // 2. REGISTER SCRIPT TAG
  try {
    const shopify = connections.shopify.current;
    if (shopify) {
      const scriptUrl = "https://whatsapp-chat-button--development.gadget.app/web/public/whatsapp-button.js";
      const scriptTags = await shopify.scriptTag.list();
      const hasScriptTag = scriptTags.some((tag: any) => tag.src === scriptUrl);
      if (!hasScriptTag) {
        await shopify.scriptTag.create({ event: "onload", src: scriptUrl });
        logger.info({ shopId: record.id }, "Script tag registered");
      }
    }
  } catch (error) {
    logger.error({ error, shopId: record.id }, "Failed to register script tag");
  }
};

export const options: ActionOptions = { actionType: "update", triggers: { api: true } };
