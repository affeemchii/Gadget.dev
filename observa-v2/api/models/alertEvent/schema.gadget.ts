import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "alertEvents" model, go to https://observa.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "vlnxxOi4gCLZ",
  fields: {
    message: { type: "string", storageKey: "z79DdMyDoQpE" },
    metric: { type: "string", storageKey: "4hQajujZOeLE" },
    resolved: {
      type: "boolean",
      default: false,
      storageKey: "fgnhuv2sAtoy",
    },
    ruleName: { type: "string", storageKey: "HQRbWWZNIrl2" },
    severity: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["info", "warning", "critical"],
      storageKey: "YizxULOPFarV",
    },
    shop: {
      type: "belongsTo",
      parent: { model: "shopifyShop" },
      storageKey: "vEs4RglGXSHf",
    },
    triggeredAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "SATotix_oIWx",
    },
  },
};
