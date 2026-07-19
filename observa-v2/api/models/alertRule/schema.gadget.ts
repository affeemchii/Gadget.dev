import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "alertRule" model, go to https://observa.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "2baAa4AoyWY1",
  fields: {
    condition: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: [
        "drops_by_percent",
        "no_activity",
        "below_threshold",
        "above_threshold",
      ],
      storageKey: "mqt48V6CMCpS",
      searchIndex: false,
    },
    cooldown: {
      type: "number",
      storageKey: "Xgua04EnPtx-",
      filterIndex: false,
      searchIndex: false,
    },
    isActive: {
      type: "boolean",
      storageKey: "-ArL8PLaVRoP",
      searchIndex: false,
    },
    lastTriggeredAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "KwyQl8LAvLRi",
      filterIndex: false,
      searchIndex: false,
    },
    metric: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: [
        "revenue",
        "orders",
        "conversion",
        "inventory",
        "checkout",
        "payment",
      ],
      storageKey: "BKsUb6H_5ugK",
      searchIndex: false,
    },
    name: {
      type: "string",
      storageKey: "MrvGTK8mvOG0",
      searchIndex: false,
    },
    notifyEmail: {
      type: "boolean",
      storageKey: "Dp4LqHiTSayl",
      filterIndex: false,
      searchIndex: false,
    },
    notifySlack: {
      type: "boolean",
      storageKey: "rl3rBeC8pahF",
      filterIndex: false,
      searchIndex: false,
    },
    notifyWhatsapp: {
      type: "boolean",
      storageKey: "CzF_AXM7SnL0",
      filterIndex: false,
      searchIndex: false,
    },
    shop: {
      type: "belongsTo",
      parent: { model: "shopifyShop" },
      storageKey: "zlrupMtedd13",
      searchIndex: false,
    },
    threshold: {
      type: "number",
      storageKey: "wu_6SA52joVY",
      filterIndex: false,
      searchIndex: false,
    },
    timeWindow: {
      type: "number",
      storageKey: "aqHwJKdi8g8r",
      filterIndex: false,
      searchIndex: false,
    },
  },
  searchIndex: false,
};
