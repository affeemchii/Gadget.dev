export type Plan = "starter" | "pro" | "none";

export interface PlanFeatures {
  maxAlertRules: number;
  alertHistoryDays: number;
  slackNotifications: boolean;
  whatsappNotifications: boolean;
  emailNotifications: boolean;
}

export function getPlanFromSubscription(subscription: any): Plan {
  if (!subscription) return "none";
  const name = subscription?.items?.[0]?.description?.toLowerCase() || "";
  if (name === "pro") return "pro";
  if (name === "starter") return "starter";
  return "none";
}

export function getPlanFeatures(plan: Plan): PlanFeatures {
  if (plan === "pro") {
    return {
      maxAlertRules: Infinity,
      alertHistoryDays: Infinity,
      slackNotifications: true,
      whatsappNotifications: true,
      emailNotifications: true,
    };
  }
  if (plan === "starter") {
    return {
      maxAlertRules: 20,
      alertHistoryDays: 30,
      slackNotifications: false,
      whatsappNotifications: false,
      emailNotifications: true,
    };
  }
  // No plan — very limited access
  return {
    maxAlertRules: 3,
    alertHistoryDays: 7,
    slackNotifications: false,
    whatsappNotifications: false,
    emailNotifications: false,
  };
}