import { applyParams, save, ActionOptions } from "gadget-server";
import { preventCrossShopDataAccess } from "gadget-server/shopify";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
};

export const onSuccess: ActionOnSuccess = async ({ params, record, logger, api, connections }) => {
  // Ensure notification channel exists on reinstall
  const existing = await api.notificationChannel.findFirst({
    filter: { shopId: { equals: record.id } },
    select: { id: true },
  });

  if (!existing) {
    await api.notificationChannel.create({
      shop: { _link: record.id },
      emailEnabled: false,
      slackEnabled: false,
      whatsappEnabled: false,
      checkingFrequency: "60" as any,
    });
  }
};

export const options: ActionOptions = { actionType: "update" };