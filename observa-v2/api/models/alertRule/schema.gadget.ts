import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "alertRule" model, go to https://observa.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
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
    },
    cooldown: { type: "number", storageKey: "Xgua04EnPtx-" },
    isActive: { type: "boolean", storageKey: "-ArL8PLaVRoP" },
    lastTriggeredAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "KwyQl8LAvLRi",
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
    },
    name: { type: "string", storageKey: "MrvGTK8mvOG0" },
    notifyEmail: { type: "boolean", storageKey: "Dp4LqHiTSayl" },
    notifySlack: { type: "boolean", storageKey: "rl3rBeC8pahF" },
    notifyWhatsapp: { type: "boolean", storageKey: "CzF_AXM7SnL0" },
    shop: {
      type: "belongsTo",
      parent: { model: "shopifyShop" },
      storageKey: "zlrupMtedd13",
    },
    threshold: { type: "number", storageKey: "wu_6SA52joVY" },
    timeWindow: { type: "number", storageKey: "aqHwJKdi8g8r" },
  },
};
