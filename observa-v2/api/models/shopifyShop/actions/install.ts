import { applyParams, save, ActionOptions } from "gadget-server";
import { identifyShop } from "../../../services/mantle";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await save(record);
};

export const onSuccess: ActionOnSuccess = async ({ params, record, logger, api, connections }) => {
  try {
    await identifyShop({ shop: record, api });
  } catch (err: any) {
    logger?.error?.("Mantle identify failed: " + (err?.message || String(err)));
  }

  await api.alertSettings.upsert({
    shop: {
      _link: record.id,
    },
  });
};

export const options: ActionOptions = { actionType: "create" };
