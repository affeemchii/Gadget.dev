import type { GadgetSettings } from "gadget-server";

export const settings: GadgetSettings = {
  type: "gadget/settings/v1",
  frameworkVersion: "v1.4.0",
  plugins: {
    connections: {
      shopify: {
        apiVersion: "2026-04",
        enabledModels: [],
        type: "partner",
        scopes: ["read_orders", "write_orders"],
      },
    },
  },
};
