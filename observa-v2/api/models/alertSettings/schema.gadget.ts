import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "alertSettings" model, go to https://observa.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "0LybuQqaIha-",
  fields: {
    alertEmails: {
      type: "json",
      default: [],
      storageKey: "4VGrrto3qsIP",
    },
    alertSlacks: {
      type: "json",
      default: [],
      storageKey: "pkFlYNTNhrcy",
    },
    alertWhatsapps: {
      type: "json",
      default: [],
      storageKey: "zpnVsWVI_8oa",
    },
    checkingFrequency: {
      type: "enum",
      default: "180",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: [
        "1440",
        "720",
        "360",
        "180",
        "120",
        "60",
        "30",
        "15",
        "5",
      ],
      storageKey: "fHTmV66flYxA",
    },
    conversionRate: { type: "json", storageKey: "B5okE9SzdZeH" },
    emailAlerts: {
      type: "boolean",
      default: false,
      storageKey: "4CPDfZpFqayX",
    },
    shop: {
      type: "belongsTo",
      validations: { required: true, unique: true },
      parent: { model: "shopifyShop" },
      storageKey: "ModelField-shop-alertSettings",
    },
    slackALerts: {
      type: "boolean",
      default: false,
      storageKey: "mm4jmQPW8EQT",
    },
    whatsappAlerts: {
      type: "boolean",
      default: false,
      storageKey: "P-GrP_UhZUUh",
    },
  },
};
