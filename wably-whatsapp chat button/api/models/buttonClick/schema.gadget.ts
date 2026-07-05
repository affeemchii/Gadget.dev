import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "buttonClick" model, go to https://whatsapp-chat-button.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "8-DUQfMHIrj7",
  fields: {
    clickedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "FhAk3A8MLDSg",
    },
    deviceType: { type: "string", storageKey: "dW9k_k98sufJ" },
    pageType: { type: "string", storageKey: "kChzaqYRNz0x" },
    pageUrl: { type: "string", storageKey: "EZqZrGBxhiis" },
    shop: {
      type: "belongsTo",
      parent: { model: "shopifyShop" },
      storageKey: "F9wQbHvzr35v",
    },
  },
};
