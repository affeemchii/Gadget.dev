import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "alertSettings" model, go to https://observa.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "0LybuQqaIha-",
  fields: {
    alertEmails: {
      type: "json",
      default: [],
      storageKey: "4VGrrto3qsIP",
      filterIndex: false,
      searchIndex: false,
    },
    alertSlacks: {
      type: "json",
      default: [],
      storageKey: "pkFlYNTNhrcy",
      filterIndex: false,
      searchIndex: false,
    },
    alertWhatsapps: {
      type: "json",
      default: [],
      storageKey: "zpnVsWVI_8oa",
      filterIndex: false,
      searchIndex: false,
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
      searchIndex: false,
    },
    conversionRate: {
      type: "json",
      storageKey: "B5okE9SzdZeH",
      filterIndex: false,
      searchIndex: false,
    },
    emailAlerts: {
      type: "boolean",
      default: false,
      storageKey: "4CPDfZpFqayX",
      searchIndex: false,
    },
    shop: {
      type: "belongsTo",
      validations: { required: true, unique: true },
      parent: { model: "shopifyShop" },
      storageKey: "ModelField-shop-alertSettings",
      searchIndex: false,
    },
    slackALerts: {
      type: "boolean",
      default: false,
      storageKey: "mm4jmQPW8EQT",
      searchIndex: false,
    },
    whatsappAlerts: {
      type: "boolean",
      default: false,
      storageKey: "P-GrP_UhZUUh",
      searchIndex: false,
    },
  },
  searchIndex: false,
};
