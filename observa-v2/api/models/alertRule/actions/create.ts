import { applyParams, save, ActionOptions } from "gadget-server";
import { preventCrossShopDataAccess } from "gadget-server/shopify";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);

  if (connections.shopify.currentShopId) {
    (record as any).shopId = connections.shopify.currentShopId;
  }

  await save(record);
};

export const options: ActionOptions = {
  actionType: "create",
};