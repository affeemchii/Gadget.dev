import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyShop" model, go to https://observa.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DataModel-Shopify-Shop",
  fields: {
    alertEvents: {
      type: "hasMany",
      children: { model: "alertEvent", belongsToField: "shop" },
      storageKey: "EN93SsJKfZ1X",
    },
    alertRule: {
      type: "hasOne",
      child: { model: "alertRule", belongsToField: "shop" },
      storageKey: "GB5B0045iTTp",
    },
    alertSettings: {
      type: "hasOne",
      child: { model: "alertSettings", belongsToField: "shop" },
      storageKey: "VVSHX8IsdTNk",
    },
    disabledWebhooks: {
      type: "json",
      storageKey:
        "ModelField-DataModel-Shopify-Shop-disabled_webhooks::FieldStorageEpoch-DataModel-Shopify-Shop-ModelField-DataModel-Shopify-Shop-disabled_webhooks-initial",
      filterIndex: false,
      searchIndex: false,
    },
    mantleApiToken: {
      type: "string",
      storageKey: "MkKDvRNesWEn",
      filterIndex: false,
      searchIndex: false,
    },
    registeredWebhooks: {
      type: "json",
      storageKey:
        "ModelField-DataModel-Shopify-Shop-registered_webhooks::FieldStorageEpoch-DataModel-Shopify-Shop-ModelField-DataModel-Shopify-Shop-registered_webhooks-initial",
      filterIndex: false,
      searchIndex: false,
    },
  },
  searchIndex: false,
  shopify: {
    fields: {
      address1: { filterIndex: false, searchIndex: false },
      address2: { filterIndex: false, searchIndex: false },
      alerts: { filterIndex: false, searchIndex: false },
      billingAddress: { filterIndex: false, searchIndex: false },
      checkoutApiSupported: {
        filterIndex: false,
        searchIndex: false,
      },
      city: { filterIndex: false, searchIndex: false },
      countriesInShippingZones: {
        filterIndex: false,
        searchIndex: false,
      },
      country: { filterIndex: false, searchIndex: false },
      countryCode: { filterIndex: false, searchIndex: false },
      countryName: { filterIndex: false, searchIndex: false },
      countyTaxes: { filterIndex: false, searchIndex: false },
      currency: { filterIndex: false, searchIndex: false },
      currencyFormats: { filterIndex: false, searchIndex: false },
      customerAccounts: { filterIndex: false, searchIndex: false },
      customerAccountsV2: { filterIndex: false, searchIndex: false },
      customerEmail: { filterIndex: false, searchIndex: false },
      description: { filterIndex: false, searchIndex: false },
      domain: { filterIndex: false, searchIndex: false },
      eligibleForPayments: { filterIndex: false, searchIndex: false },
      email: { filterIndex: false, searchIndex: false },
      enabledPresentmentCurrencies: {
        filterIndex: false,
        searchIndex: false,
      },
      finances: { filterIndex: false, searchIndex: false },
      gdprRequests: true,
      googleAppsDomain: { filterIndex: false, searchIndex: false },
      googleAppsLoginEnabled: {
        filterIndex: false,
        searchIndex: false,
      },
      hasDiscounts: { filterIndex: false, searchIndex: false },
      hasGiftCards: { filterIndex: false, searchIndex: false },
      hasStorefront: { filterIndex: false, searchIndex: false },
      ianaTimezone: { filterIndex: false, searchIndex: false },
      latitude: { filterIndex: false, searchIndex: false },
      longitude: { filterIndex: false, searchIndex: false },
      marketingSmsContentEnabledAtCheckout: {
        filterIndex: false,
        searchIndex: false,
      },
      moneyFormat: { filterIndex: false, searchIndex: false },
      moneyInEmailsFormat: { filterIndex: false, searchIndex: false },
      moneyWithCurrencyFormat: {
        filterIndex: false,
        searchIndex: false,
      },
      moneyWithCurrencyInEmailsFormat: {
        filterIndex: false,
        searchIndex: false,
      },
      multiLocationEnabled: {
        filterIndex: false,
        searchIndex: false,
      },
      myshopifyDomain: { searchIndex: false },
      name: { filterIndex: false, searchIndex: false },
      orderNumberFormatPrefix: {
        filterIndex: false,
        searchIndex: false,
      },
      orderNumberFormatSuffix: {
        filterIndex: false,
        searchIndex: false,
      },
      passwordEnabled: { filterIndex: false, searchIndex: false },
      phone: { filterIndex: false, searchIndex: false },
      plan: { filterIndex: false, searchIndex: false },
      planDisplayName: { filterIndex: false, searchIndex: false },
      planName: { filterIndex: false, searchIndex: false },
      planPublicDisplayName: {
        filterIndex: false,
        searchIndex: false,
      },
      preLaunchEnabled: { filterIndex: false, searchIndex: false },
      primaryLocale: { filterIndex: false, searchIndex: false },
      province: { filterIndex: false, searchIndex: false },
      provinceCode: { filterIndex: false, searchIndex: false },
      requiresExtraPaymentsAgreement: {
        filterIndex: false,
        searchIndex: false,
      },
      resourceLimits: { filterIndex: false, searchIndex: false },
      richTextEditorUrl: { filterIndex: false, searchIndex: false },
      setupRequired: { filterIndex: false, searchIndex: false },
      shipsToCountries: { filterIndex: false, searchIndex: false },
      shopOwner: { filterIndex: false, searchIndex: false },
      shopifyCreatedAt: { filterIndex: false, searchIndex: false },
      shopifyUpdatedAt: { filterIndex: false, searchIndex: false },
      source: { filterIndex: false, searchIndex: false },
      syncs: true,
      taxShipping: { filterIndex: false, searchIndex: false },
      taxesIncluded: { filterIndex: false, searchIndex: false },
      timezone: { filterIndex: false, searchIndex: false },
      timezoneAbbreviation: {
        filterIndex: false,
        searchIndex: false,
      },
      timezoneOffset: { filterIndex: false, searchIndex: false },
      timezoneOffsetMinutes: {
        filterIndex: false,
        searchIndex: false,
      },
      transactionalSmsDisabled: {
        filterIndex: false,
        searchIndex: false,
      },
      unitSystem: { filterIndex: false, searchIndex: false },
      url: { filterIndex: false, searchIndex: false },
      weightUnit: { filterIndex: false, searchIndex: false },
      zipCode: { filterIndex: false, searchIndex: false },
    },
  },
};
