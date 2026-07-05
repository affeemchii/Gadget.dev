import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyScriptTag" model, go to https://whatsapp-chat-button.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DataModel-Shopify-ScriptTag",
  fields: {},
  searchIndex: false,
  shopify: {
    fields: {
      cache: { filterIndex: false, searchIndex: false },
      displayScope: { filterIndex: false, searchIndex: false },
      legacyResourceId: { filterIndex: false, searchIndex: false },
      shop: { searchIndex: false },
      shopifyCreatedAt: { filterIndex: false, searchIndex: false },
      shopifyUpdatedAt: { filterIndex: false, searchIndex: false },
      source: { filterIndex: false, searchIndex: false },
    },
  },
};
