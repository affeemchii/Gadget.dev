import { applyParams, save, ActionOptions } from "gadget-server";
import { preventCrossShopDataAccess } from "gadget-server/shopify";
import { identifyShop } from "../../../services/mantle";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
};

export const onSuccess: ActionOnSuccess = async ({ params, record, logger, api, connections }) => {
  try {
    await identifyShop({ shop: record, api });
  } catch (err: any) {
    logger?.error?.("Mantle identify failed: " + (err?.message || String(err)));
  }
};

export const options: ActionOptions = { actionType: "update" };
