import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "notificationChannel" model, go to https://observa.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "YIU2lnN3Vk_v",
  fields: {
    checkingFrequency: {
      type: "enum",
      default: "60",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: [
        "5",
        "15",
        "30",
        "60",
        "120",
        "180",
        "360",
        "720",
        "1440",
      ],
      storageKey: "xI3rYnzwr8Pb",
    },
    emailEnabled: { type: "boolean", storageKey: "2yvvFVBphyN-" },
    emailRecipients: { type: "string", storageKey: "jBlja4Z5wNJI" },
    shop: {
      type: "belongsTo",
      parent: { model: "shopifyShop" },
      storageKey: "YBU8wy8hDDOG",
    },
    slackEnabled: { type: "boolean", storageKey: "A_wv7Io0lBSf" },
    slackWebhook: { type: "string", storageKey: "n3O44O4XNDKN" },
    whatsappEnabled: { type: "boolean", storageKey: "g16nKajB4Ru3" },
    whatsappNumber: { type: "string", storageKey: "1rYkva8xRelZ" },
  },
};
