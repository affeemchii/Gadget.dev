import { useGadget } from "@gadgetinc/react-shopify-app-bridge";
import { useLoaderData, Outlet, useRouteError, isRouteErrorResponse } from "react-router";
import { AppProvider, Page, Card, Text, Box } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import { NavMenu } from "../components/NavMenu";
import { FullPageSpinner } from "../components/FullPageSpinner";
import type { Route } from "./+types/_app";

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

  return (
    <>
      <NavMenu />
      <Outlet />
    </>
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
              <a href={`/edit/${gadgetConfig.environment}/files/web/routes/_app.tsx`}>
                web/routes/_app.tsx
              </a>
            </Text>
          </Box>
        </Card>
      </div>
    </Page>
  );
};

export function ErrorBoundary() {
  const error = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected error occurred while loading this page.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`.trim();
    if (error.data) {
      message =
        typeof error.data === "string"
          ? error.data
          : typeof error.data?.message === "string"
            ? error.data.message
            : message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <AppProvider i18n={enTranslations}>
      <Page>
        <div style={{ height: "80px" }}>
          <Card padding="500">
            <Text variant="headingLg" as="h1">
              {title}
            </Text>
            <Box paddingBlockStart="200">
              <Text variant="bodyLg" as="p">
                {message}
              </Text>
            </Box>
          </Card>
        </div>
      </Page>
    </AppProvider>
  );
}