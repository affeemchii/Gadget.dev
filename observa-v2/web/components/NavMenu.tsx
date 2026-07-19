import { Link } from "react-router";
import { NavMenu as AppBridgeNavMenu } from "@shopify/app-bridge-react";

export function NavMenu() {
  return (
    <AppBridgeNavMenu>
      <Link to="/" rel="home">
        Dashboard
      </Link>
      <Link to="/alerts">
        Alerts
      </Link>
      <Link to="/analytics">
        Analytics
      </Link>
      <Link to="/reports">
        Reports
      </Link>
      <Link to="/settings">
        Settings
      </Link>
      <Link to="/billing">
        Billing
      </Link>
    </AppBridgeNavMenu>
  );
}