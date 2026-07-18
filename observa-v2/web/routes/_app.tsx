import { useGadget } from "@gadgetinc/react-shopify-app-bridge";
import { useLoaderData, Outlet } from "react-router";
import { MantleProvider } from "@heymantle/react";
import { useFindFirst } from "@gadgetinc/react";
import { Page, Card, Text, Box } from "@shopify/polaris";
import { NavMenu } from "../components/NavMenu";
import { FullPageSpinner } from "../components/FullPageSpinner";
import type { Route } from "./+types/_app"; 
import { api } from "../api";

export const loader = async ({ context }: Route.LoaderArgs) => {
  return { gadgetConfig: context.gadgetConfig };
};

export default function() {
  const { isAuthenticated, loading } = useGadget();

  if (loading) {
    return <FullPageSpinner />;
  }

  if (!isAuthenticated) {
    return <Unauthenticated />;
  }

  return <AuthenticatedAppLayout />;
}

const AuthenticatedAppLayout = () => {
  const [{ data: shopData, fetching }] = useFindFirst(api.shopifyShop, {
    select: { mantleApiToken: true, id: true },
  });

  if (fetching) {
    return <FullPageSpinner />;
  }

  return (
    <MantleProvider
      appId={process.env.GADGET_PUBLIC_MANTLE_APP_ID as string}
      customerApiToken={shopData?.mantleApiToken ?? ""}
    >
      <>
        <NavMenu />
        <Outlet />
      </>
    </MantleProvider>
  );
}

const Unauthenticated = () => {
  const { gadgetConfig } = useLoaderData<typeof loader>();

  return (
    <Page>
      <div style={{ height: "80px" }}>
        <Card padding="500">
          <Text variant="headingLg" as="h1">
            App must be viewed in the Shopify Admin
          </Text>
          <Box paddingBlockStart="200">
            <Text variant="bodyLg" as="p">
              Edit this page:{" "}
              <a
                href={`/edit/${gadgetConfig.environment}/files/web/routes/_app.tsx`}
              >
                web/routes/_app.tsx
              </a>
            </Text>
          </Box>
        </Card>
      </div>
    </Page>
  );
};