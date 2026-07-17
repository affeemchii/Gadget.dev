import { MantleClient } from "@heymantle/client";

// MantleClient expects strings; make sure env vars are strings so TypeScript is happy
const mantleClient = new MantleClient({
  appId: (process.env.GADGET_PUBLIC_MANTLE_APP_ID as string) || "",
  apiKey: (process.env.MANTLE_API_KEY as string) || "",
});

export const identifyShop = async ({ shop, api }: { shop: any; api: any }) => {
  const { id, name, email, myshopifyDomain, accessToken } = shop as any;
  const result = await mantleClient.identify({
    platform: "shopify",
    platformId: id,
    myshopifyDomain,
    accessToken,
    name,
    email,
  });

  // result may be an error object depending on the client; guard access to apiToken
  const apiToken = (result as any)?.apiToken;
  if (apiToken) {
    await api.internal.shopifyShop.update(id, {
      shopifyShop: {
        mantleApiToken: apiToken,
      },
    });
  }
};

export { mantleClient };
