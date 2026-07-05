import { useState, useEffect } from "react";
import { useFindFirst, useAction, useFindMany } from "@gadgetinc/react";
import { api } from "../api";

const TIMEZONES = [
  { value: "Pacific/Honolulu", label: "Hawaii (UTC-10:00)" },
  { value: "America/Anchorage", label: "Alaska (UTC-09:00)" },
  { value: "America/Los_Angeles", label: "Pacific Time - US & Canada (UTC-08:00)" },
  { value: "America/Denver", label: "Mountain Time - US & Canada (UTC-07:00)" },
  { value: "America/Phoenix", label: "Arizona (UTC-07:00)" },
  { value: "America/Chicago", label: "Central Time - US & Canada (UTC-06:00)" },
  { value: "America/New_York", label: "Eastern Time - US & Canada (UTC-05:00)" },
  { value: "America/Halifax", label: "Atlantic Time - Canada (UTC-04:00)" },
  { value: "America/St_Johns", label: "Newfoundland (UTC-03:30)" },
  { value: "America/Sao_Paulo", label: "Brasilia (UTC-03:00)" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (UTC-03:00)" },
  { value: "America/Santiago", label: "Santiago (UTC-03:00)" },
  { value: "America/Bogota", label: "Bogota (UTC-05:00)" },
  { value: "America/Lima", label: "Lima (UTC-05:00)" },
  { value: "America/Mexico_City", label: "Mexico City (UTC-06:00)" },
  { value: "America/Toronto", label: "Toronto (UTC-05:00)" },
  { value: "America/Vancouver", label: "Vancouver (UTC-08:00)" },
  { value: "Atlantic/Reykjavik", label: "Reykjavik (UTC+00:00)" },
  { value: "Europe/London", label: "London (UTC+00:00)" },
  { value: "Europe/Dublin", label: "Dublin (UTC+00:00)" },
  { value: "Europe/Lisbon", label: "Lisbon (UTC+00:00)" },
  { value: "Europe/Paris", label: "Paris (UTC+01:00)" },
  { value: "Europe/Berlin", label: "Berlin (UTC+01:00)" },
  { value: "Europe/Rome", label: "Rome (UTC+01:00)" },
  { value: "Europe/Madrid", label: "Madrid (UTC+01:00)" },
  { value: "Europe/Amsterdam", label: "Amsterdam (UTC+01:00)" },
  { value: "Europe/Brussels", label: "Brussels (UTC+01:00)" },
  { value: "Europe/Stockholm", label: "Stockholm (UTC+01:00)" },
  { value: "Europe/Oslo", label: "Oslo (UTC+01:00)" },
  { value: "Europe/Copenhagen", label: "Copenhagen (UTC+01:00)" },
  { value: "Europe/Zurich", label: "Zurich (UTC+01:00)" },
  { value: "Europe/Vienna", label: "Vienna (UTC+01:00)" },
  { value: "Europe/Warsaw", label: "Warsaw (UTC+01:00)" },
  { value: "Europe/Prague", label: "Prague (UTC+01:00)" },
  { value: "Europe/Budapest", label: "Budapest (UTC+01:00)" },
  { value: "Europe/Bucharest", label: "Bucharest (UTC+02:00)" },
  { value: "Europe/Helsinki", label: "Helsinki (UTC+02:00)" },
  { value: "Europe/Athens", label: "Athens (UTC+02:00)" },
  { value: "Europe/Kiev", label: "Kyiv (UTC+02:00)" },
  { value: "Europe/Istanbul", label: "Istanbul (UTC+03:00)" },
  { value: "Europe/Moscow", label: "Moscow (UTC+03:00)" },
  { value: "Africa/Cairo", label: "Cairo (UTC+02:00)" },
  { value: "Africa/Johannesburg", label: "Johannesburg (UTC+02:00)" },
  { value: "Africa/Lagos", label: "Lagos (UTC+01:00)" },
  { value: "Africa/Nairobi", label: "Nairobi (UTC+03:00)" },
  { value: "Africa/Casablanca", label: "Casablanca (UTC+01:00)" },
  { value: "Asia/Dubai", label: "Dubai (UTC+04:00)" },
  { value: "Asia/Karachi", label: "Islamabad, Karachi (UTC+05:00)" },
  { value: "Asia/Kolkata", label: "Mumbai, Kolkata (UTC+05:30)" },
  { value: "Asia/Dhaka", label: "Dhaka (UTC+06:00)" },
  { value: "Asia/Colombo", label: "Colombo (UTC+05:30)" },
  { value: "Asia/Kathmandu", label: "Kathmandu (UTC+05:45)" },
  { value: "Asia/Almaty", label: "Almaty (UTC+06:00)" },
  { value: "Asia/Yangon", label: "Yangon (UTC+06:30)" },
  { value: "Asia/Bangkok", label: "Bangkok (UTC+07:00)" },
  { value: "Asia/Jakarta", label: "Jakarta (UTC+07:00)" },
  { value: "Asia/Singapore", label: "Singapore (UTC+08:00)" },
  { value: "Asia/Kuala_Lumpur", label: "Kuala Lumpur (UTC+08:00)" },
  { value: "Asia/Manila", label: "Manila (UTC+08:00)" },
  { value: "Asia/Shanghai", label: "Beijing, Shanghai (UTC+08:00)" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (UTC+08:00)" },
  { value: "Asia/Taipei", label: "Taipei (UTC+08:00)" },
  { value: "Asia/Seoul", label: "Seoul (UTC+09:00)" },
  { value: "Asia/Tokyo", label: "Tokyo (UTC+09:00)" },
  { value: "Asia/Riyadh", label: "Riyadh (UTC+03:00)" },
  { value: "Asia/Kuwait", label: "Kuwait (UTC+03:00)" },
  { value: "Asia/Qatar", label: "Qatar (UTC+03:00)" },
  { value: "Asia/Bahrain", label: "Bahrain (UTC+03:00)" },
  { value: "Asia/Muscat", label: "Muscat (UTC+04:00)" },
  { value: "Asia/Beirut", label: "Beirut (UTC+02:00)" },
  { value: "Asia/Jerusalem", label: "Jerusalem (UTC+02:00)" },
  { value: "Asia/Tehran", label: "Tehran (UTC+03:30)" },
  { value: "Asia/Kabul", label: "Kabul (UTC+04:30)" },
  { value: "Asia/Tashkent", label: "Tashkent (UTC+05:00)" },
  { value: "Australia/Perth", label: "Perth (UTC+08:00)" },
  { value: "Australia/Darwin", label: "Darwin (UTC+09:30)" },
  { value: "Australia/Adelaide", label: "Adelaide (UTC+09:30)" },
  { value: "Australia/Sydney", label: "Sydney (UTC+10:00)" },
  { value: "Australia/Melbourne", label: "Melbourne (UTC+10:00)" },
  { value: "Australia/Brisbane", label: "Brisbane (UTC+10:00)" },
  { value: "Pacific/Auckland", label: "Auckland (UTC+12:00)" },
  { value: "Pacific/Fiji", label: "Fiji (UTC+12:00)" },
  { value: "UTC", label: "UTC (UTC+00:00)" }
];

const AGENT_COUNTRY_CODES = [
  { value: "1", label: "🇺🇸 +1" },
  { value: "44", label: "🇬🇧 +44" },
  { value: "92", label: "🇵🇰 +92" },
  { value: "91", label: "🇮🇳 +91" },
  { value: "971", label: "🇦🇪 +971" },
  { value: "966", label: "🇸🇦 +966" },
  { value: "974", label: "🇶🇦 +974" },
  { value: "965", label: "🇰🇼 +965" },
  { value: "973", label: "🇧🇭 +973" },
  { value: "968", label: "🇴🇲 +968" },
  { value: "61", label: "🇦🇺 +61" },
  { value: "49", label: "🇩🇪 +49" },
  { value: "33", label: "🇫🇷 +33" },
  { value: "55", label: "🇧🇷 +55" },
  { value: "52", label: "🇲🇽 +52" },
  { value: "60", label: "🇲🇾 +60" },
  { value: "65", label: "🇸🇬 +65" },
  { value: "62", label: "🇮🇩 +62" },
  { value: "63", label: "🇵🇭 +63" },
  { value: "66", label: "🇹🇭 +66" },
  { value: "880", label: "🇧🇩 +880" },
  { value: "94", label: "🇱🇰 +94" },
  { value: "20", label: "🇪🇬 +20" },
  { value: "27", label: "🇿🇦 +27" },
  { value: "234", label: "🇳🇬 +234" },
  { value: "90", label: "🇹🇷 +90" }
];

type Agent = {
  id: string;
  name: string;
  role: string;
  phone: string;
  countryCode: string;
};

export default function Index() {
  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  const DEFAULT_HOURS = {
    monday: { open: true, start: "09:00", end: "17:00" },
    tuesday: { open: true, start: "09:00", end: "17:00" },
    wednesday: { open: true, start: "09:00", end: "17:00" },
    thursday: { open: true, start: "09:00", end: "17:00" },
    friday: { open: true, start: "09:00", end: "17:00" },
    saturday: { open: false, start: "10:00", end: "14:00" },
    sunday: { open: false, start: "10:00", end: "14:00" },
  };

  const [businessHours, setBusinessHours] = useState(DEFAULT_HOURS);
  const [selectedTimezone, setSelectedTimezone] = useState<string>("");
  const [timezoneSearch, setTimezoneSearch] = useState<string>("");
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [businessHoursEnabled, setBusinessHoursEnabled] = useState(false);
  const [hoursSaved, setHoursSaved] = useState(false);
  const [hoursSaveError, setHoursSaveError] = useState<string | null>(null);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsSaved, setAgentsSaved] = useState(false);
  const [agentsSaveError, setAgentsSaveError] = useState<string | null>(null);
  const [useMultipleAgents, setUseMultipleAgents] = useState(false);

  const [{ data: shop, fetching: loadingShop, error: shopError }] = useFindFirst(api.shopifyShop);
  const [{ data: settings, fetching: loadingSettings, error: settingsError }] = useFindFirst(api.shopSetting);

  const [{ data: clicks, fetching: loadingClicks }] = useFindMany(
    api.buttonClick,
    { sort: { createdAt: "Descending" }, first: 100 }
  );

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);
  const totalClicks = clicks?.length || 0;
  const todayClicks = clicks?.filter((c: any) => new Date(c.createdAt) >= todayStart).length || 0;
  const weekClicks = clicks?.filter((c: any) => new Date(c.createdAt) >= weekStart).length || 0;
  const mobileClicks = clicks?.filter((c: any) => c.deviceType === 'mobile').length || 0;
  const desktopClicks = clicks?.filter((c: any) => c.deviceType === 'desktop').length || 0;
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(todayStart);
    date.setDate(date.getDate() - (6 - i));
    const dayClicks = clicks?.filter((c: any) => {
      const clickDate = new Date(c.createdAt);
      return clickDate >= date && clickDate < new Date(date.getTime() + 86400000);
    }).length || 0;
    return {
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      count: dayClicks
    };
  });
  const maxDayClicks = Math.max(...last7Days.map(d => d.count), 1);

  const [{ fetching: updatingHours }, updateSetting] = useAction(api.shopSetting.update);
  const [{ fetching: creatingHours }, createSetting] = useAction(api.shopSetting.create);

  const isSaving = updatingHours || creatingHours;

  useEffect(() => {
    if (settings?.businessHours) {
      setBusinessHours(settings.businessHours as typeof DEFAULT_HOURS);
    }
    setSelectedTimezone(
      (settings as any)?.timezone || shop?.ianaTimezone || "UTC"
    );
    setBusinessHoursEnabled((settings as any)?.businessHoursEnabled === true);
    if (settings?.agents) {
      setAgents(settings.agents as Agent[]);
    }
    setUseMultipleAgents((settings as any)?.useMultipleAgents === true);
  }, [settings, shop]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const dropdown = document.getElementById('timezone-dropdown-container');
      if (dropdown && !dropdown.contains(e.target as Node)) {
        setShowTimezoneDropdown(false);
        setTimezoneSearch("");
      }
    };
    if (showTimezoneDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTimezoneDropdown]);

  const handleSaveHours = async () => {
    setHoursSaved(false);
    setHoursSaveError(null);
    try {
      if (settings?.id) {
        await updateSetting({
          id: settings.id,
          shopSetting: {
            businessHours,
            timezone: selectedTimezone,
            businessHoursEnabled: businessHoursEnabled,
          } as any,
        });
      } else if (shop?.id) {
        await createSetting({
          shopSetting: {
            businessHours,
            timezone: selectedTimezone,
            businessHoursEnabled: businessHoursEnabled,
            shop: { _link: shop.id },
          } as any,
        });
      }
      setHoursSaved(true);
    } catch (err: any) {
      setHoursSaveError(err.message || "Failed to save business hours");
    }
  };

  const addAgent = () => {
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: "",
      role: "",
      phone: "",
      countryCode: "92"
    };
    setAgents(prev => [...prev, newAgent]);
  };

  const updateAgent = (id: string, field: keyof Agent, value: string) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeAgent = (id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id));
  };

  const handleToggleChange = async (checked: boolean) => {
    setUseMultipleAgents(checked);
    if (!checked) {
      setAgentsSaved(false);
      setAgentsSaveError(null);
      try {
        if (settings?.id) {
          await updateSetting({
            id: settings.id,
            shopSetting: { useMultipleAgents: false } as any,
          });
        } else if (shop?.id) {
          await createSetting({
            shopSetting: {
              useMultipleAgents: false,
              shop: { _link: shop.id },
            } as any,
          });
        }
        setAgentsSaved(true);
      } catch (err: any) {
        setAgentsSaveError(err.message || "Failed to save agents settings");
      }
    }
  };

  const handleSaveAgents = async () => {
    setAgentsSaved(false);
    setAgentsSaveError(null);
    try {
      if (settings?.id) {
        await updateSetting({
          id: settings.id,
          shopSetting: { agents, useMultipleAgents } as any,
        });
      } else if (shop?.id) {
        await createSetting({
          shopSetting: {
            agents,
            useMultipleAgents,
            shop: { _link: shop.id },
          } as any,
        });
      }
      setAgentsSaved(true);
    } catch (err: any) {
      setAgentsSaveError(err.message || "Failed to save agents");
    }
  };

  const updateDay = (day: string, field: string, value: any) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day as keyof typeof DEFAULT_HOURS], [field]: value },
    }));
  };

  if (loadingShop || loadingSettings) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
        <s-spinner accessibility-label="Loading app details..." size="large" />
      </div>
    );
  }

  const loadError = shopError || settingsError;
  if (loadError) {
    return (
      <s-page heading="WhatsApp Chat Button">
        <s-section>
          <s-banner tone="critical" heading="Error">
            {loadError.message}
          </s-banner>
        </s-section>
      </s-page>
    );
  }

  const myshopifyDomain = shop?.myshopifyDomain || "";
  const themeEditorUrl = myshopifyDomain
    ? `https://${myshopifyDomain}/admin/themes/current/editor?context=apps&activateAppId=0aebc762ec32a1a6c5830ce84dc4dc10/whatsapp_button`
    : "";

  const handleOpenThemeEditor = () => {
    if (themeEditorUrl) {
      window.open(themeEditorUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Card styling
  const cardStyle: React.CSSProperties = {
    flex: 1,
    minWidth: "250px",
    padding: "24px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e1e3e5",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxSizing: "border-box",
  };

  const iconStyle: React.CSSProperties = {
    fontSize: "32px",
  };

  const stepBadgeStyle: React.CSSProperties = {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#8c9196",
    fontWeight: 600,
  };

  return (
    <s-page heading="WhatsApp Chat Button">
      {/* Subtitle */}
      <div style={{ marginTop: "-16px", marginBottom: "24px" }}>
        <s-text color="subdued">
          Connect with your customers instantly via WhatsApp
        </s-text>
      </div>

      {/* CSS Pulse Animation Injection */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes whatsapp-pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7);
            }
            70% {
              box-shadow: 0 0 0 15px rgba(37, 211, 102, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
            }
          }
          .whatsapp-pulse-animation {
            animation: whatsapp-pulse 2s infinite;
          }
          .step-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .step-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          }
        `
      }} />

      {/* Success Banner */}
      <s-section>
        <s-banner tone="success">
          Your app is installed and ready to configure!
        </s-banner>
      </s-section>

      {/* How It Works Section */}
      <s-section>
        <div style={{ marginTop: "16px", marginBottom: "24px" }}>
          <div style={{ marginBottom: "16px" }}>
            <s-heading>How it works</s-heading>
          </div>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {/* Step 1 */}
            <div style={cardStyle} className="step-card">
              <div style={iconStyle}>✅</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={stepBadgeStyle}>Step 1 — Install</span>
                <s-heading>App Installed</s-heading>
              </div>
              <s-text color="subdued">
                Your WhatsApp Chat Button app is installed and ready.
              </s-text>
            </div>

            {/* Step 2 */}
            <div style={cardStyle} className="step-card">
              <div style={iconStyle}>🎨</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={stepBadgeStyle}>Step 2 — Customize</span>
                <s-heading>Customize Your Button</s-heading>
              </div>
              <s-text color="subdued">
                Set your WhatsApp number, button color, position, and more in the theme editor.
              </s-text>
            </div>

            {/* Step 3 */}
            <div style={cardStyle} className="step-card">
              <div style={iconStyle}>🚀</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={stepBadgeStyle}>Step 3 — Go Live</span>
                <s-heading>Start Chatting</s-heading>
              </div>
              <s-text color="subdued">
                Customers can now click the button to chat with you directly on WhatsApp.
              </s-text>
            </div>
          </div>
        </div>
      </s-section>



      {/* Main CTA Section */}
      <s-section>
        <div style={{
          padding: "40px 24px",
          backgroundColor: "#f4f6f8",
          borderRadius: "12px",
          border: "1px solid #e1e3e5",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "16px",
          marginTop: "16px",
          marginBottom: "24px"
        }}>
          <s-heading>Customize your button</s-heading>
          <div style={{ maxWidth: "600px" }}>
            <s-text color="subdued">
              Open the theme editor to set your WhatsApp number and customize how the button looks on your store.
            </s-text>
          </div>
          <div style={{ marginTop: "8px" }}>
            <s-button
              variant="primary"
              disabled={!myshopifyDomain}
              onClick={handleOpenThemeEditor}
            >
              Open Theme Editor
            </s-button>
          </div>
        </div>
      </s-section>

      {/* Button Preview Section */}
      <s-section>
        <div style={{ marginTop: "16px", marginBottom: "24px" }}>
          <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <s-heading>Button Preview</s-heading>
            <s-text color="subdued">This is what your WhatsApp button looks like on your storefront</s-text>
          </div>
          
          <div style={{
            position: "relative",
            height: "200px",
            backgroundColor: "#f9fafb",
            borderRadius: "12px",
            border: "1px solid #e1e3e5",
            overflow: "hidden",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
          }}>
            {/* Grid decoration to look like a shop page */}
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ height: "20px", width: "35%", backgroundColor: "#e1e3e5", borderRadius: "4px" }} />
              <div style={{ height: "12px", width: "75%", backgroundColor: "#f1f2f4", borderRadius: "4px" }} />
              <div style={{ height: "12px", width: "65%", backgroundColor: "#f1f2f4", borderRadius: "4px" }} />
              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <div style={{ height: "36px", width: "80px", backgroundColor: "#e1e3e5", borderRadius: "6px" }} />
                <div style={{ height: "36px", width: "120px", backgroundColor: "#f1f2f4", borderRadius: "6px" }} />
              </div>
            </div>

            {/* The floating green circle button */}
            <div
              className="whatsapp-pulse-animation"
              style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                width: "56px",
                height: "56px",
                backgroundColor: "#25D366",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 4px 12px rgba(37, 211, 102, 0.4)",
                cursor: "pointer",
                zIndex: 10,
              }}
            >
              <svg
                viewBox="0 0 448 512"
                width="28"
                height="28"
                fill="white"
              >
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
              </svg>
            </div>
          </div>
        </div>
      </s-section>

      {/* Need Help Section */}
      <s-section>
        <div style={{ marginTop: "16px", marginBottom: "32px" }}>
          <div style={{ marginBottom: "16px" }}>
            <s-heading>Need help?</s-heading>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ borderLeft: "4px solid #25D366", paddingLeft: "16px" }}>
              <s-heading>How to add the button to your theme</s-heading>
              <s-text color="subdued">
                Go to Online Store → Themes → Customize → App Embeds → Enable WhatsApp Chat Button
              </s-text>
            </div>
            <div style={{ borderLeft: "4px solid #25D366", paddingLeft: "16px" }}>
              <s-heading>How to set your WhatsApp number</s-heading>
              <s-text color="subdued">
                In the theme editor, click on the WhatsApp Chat Button embed and enter your number with country code
              </s-text>
            </div>
          </div>
        </div>
      </s-section>

      <s-section>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontWeight: "700", fontSize: "16px" }}>Page Visibility</div>
          <div style={{ fontSize: "13px", color: "#6d7175" }}>
            Control which pages show the WhatsApp button from the theme editor.
          </div>
          <div style={{
            backgroundColor: "#f0f8ff",
            border: "1px solid #b3d9ff",
            borderRadius: "8px",
            padding: "12px 16px",
            fontSize: "13px",
            color: "#0066cc",
            lineHeight: "1.6"
          }}>
            <strong>How to set page visibility:</strong><br/>
            Open Theme Editor → App Embeds → WhatsApp Chat Button → 
            Page Visibility section → Choose "Only selected pages" or 
            "All pages except selected" → Check the pages you want.
          </div>
          <s-button
            onClick={() => {
              if (shop?.myshopifyDomain) {
                window.open(
                  `https://${shop.myshopifyDomain}/admin/themes/current/editor?context=apps&activateAppId=0aebc762ec32a1a6c5830ce84dc4dc10/whatsapp_button`,
                  '_blank'
                );
              }
            }}
          >
            Open Theme Editor
          </s-button>
        </div>
      </s-section>

      {/* Analytics Section */}
      <s-section>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <div style={{ fontWeight: "700", fontSize: "16px" }}>Analytics</div>
            <div style={{ color: "#6d7175", fontSize: "13px", marginTop: "2px" }}>
              Track how customers interact with your WhatsApp button
            </div>
          </div>

          {loadingClicks ? (
            <div style={{ textAlign: "center", padding: "32px", color: "#6d7175" }}>
              Loading analytics...
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                {[
                  { label: "Total Clicks", value: totalClicks, color: "#008060" },
                  { label: "This Week", value: weekClicks, color: "#0070c4" },
                  { label: "Today", value: todayClicks, color: "#9c6ade" },
                  { label: "Mobile %", value: totalClicks > 0 ? Math.round((mobileClicks / totalClicks) * 100) + "%" : "0%", color: "#e67e22" }
                ].map(stat => (
                  <div key={stat.label} style={{
                    backgroundColor: "white",
                    border: "1px solid #e1e3e5",
                    borderRadius: "8px",
                    padding: "16px",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: stat.color }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6d7175", marginTop: "4px" }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                backgroundColor: "white",
                border: "1px solid #e1e3e5",
                borderRadius: "8px",
                padding: "16px"
              }}>
                <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "16px" }}>
                  Last 7 Days
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "120px" }}>
                  {last7Days.map(day => (
                    <div key={day.label} style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      height: "100%",
                      justifyContent: "flex-end"
                    }}>
                      <div style={{ fontSize: "11px", color: "#6d7175" }}>
                        {day.count > 0 ? day.count : ""}
                      </div>
                      <div style={{
                        width: "100%",
                        backgroundColor: "#008060",
                        borderRadius: "4px 4px 0 0",
                        height: `${Math.max((day.count / maxDayClicks) * 90, day.count > 0 ? 4 : 0)}px`,
                        minHeight: day.count > 0 ? "4px" : "0",
                        transition: "height 0.3s ease"
                      }} />
                      <div style={{ fontSize: "11px", color: "#6d7175" }}>{day.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                backgroundColor: "white",
                border: "1px solid #e1e3e5",
                borderRadius: "8px",
                padding: "16px",
                display: "flex",
                gap: "24px",
                alignItems: "center"
              }}>
                <div style={{ fontWeight: "600", fontSize: "14px" }}>Device Breakdown</div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#0070c4" }} />
                    <span style={{ fontSize: "13px" }}>Desktop: {desktopClicks}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#e67e22" }} />
                    <span style={{ fontSize: "13px" }}>Mobile: {mobileClicks}</span>
                  </div>
                </div>
              </div>

              {clicks && clicks.length > 0 && (
                <div style={{
                  backgroundColor: "white",
                  border: "1px solid #e1e3e5",
                  borderRadius: "8px",
                  padding: "16px"
                }}>
                  <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "12px" }}>
                    Recent Clicks
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {clicks.slice(0, 5).map((click, index) => (
                      <div key={click.id} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 0",
                        borderBottom: index < 4 ? "1px solid #f1f1f1" : "none",
                        fontSize: "13px"
                      }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <span style={{
                            backgroundColor: click.deviceType === 'mobile' ? "#fff4ed" : "#f0f8ff",
                            color: click.deviceType === 'mobile' ? "#e67e22" : "#0070c4",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "500"
                          }}>
                            {click.deviceType === 'mobile' ? '📱 Mobile' : '💻 Desktop'}
                          </span>
                          <span style={{ color: "#6d7175" }}>
                            {click.pageType || 'unknown'} page
                          </span>
                        </div>
                        <div style={{ color: "#6d7175", fontSize: "12px" }}>
                          {new Date(click.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {totalClicks === 0 && (
                <div style={{
                  textAlign: "center",
                  padding: "32px",
                  backgroundColor: "#f6f6f7",
                  borderRadius: "8px",
                  color: "#6d7175",
                  fontSize: "14px"
                }}>
                  No clicks recorded yet. Clicks will appear here after 
                  customers interact with your WhatsApp button.
                </div>
              )}
            </>
          )}
        </div>
      </s-section>

      {/* Business Hours Section */}
      <s-section>
        <div style={{ marginTop: "16px", marginBottom: "32px" }}>
          <div style={{ marginBottom: "16px" }}>
            <s-heading>Business Hours</s-heading>
            <div style={{ marginTop: "4px" }}>
              <s-text color="subdued">
                Set when you are available to chat. The button will show an offline message outside these hours.
              </s-text>
            </div>
          </div>

          {hoursSaved && (
            <div style={{ marginBottom: "16px" }}>
              <s-banner tone="success">
                Business hours saved successfully!
              </s-banner>
            </div>
          )}

          {hoursSaveError && (
            <div style={{ marginBottom: "16px" }}>
              <s-banner tone="critical" heading="Error">
                {hoursSaveError}
              </s-banner>
            </div>
          )}

          <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e1e3e5", padding: "24px", marginBottom: "20px" }}>
            {/* Enable Business Hours Toggle */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              padding: "12px 16px",
              backgroundColor: "#f6f6f7",
              borderRadius: "8px",
              marginBottom: "20px"
            }}>
              <div>
                <div style={{ fontWeight: "600", fontSize: "14px" }}>Use Business Hours</div>
                <div style={{ fontSize: "12px", color: "#6d7175", marginTop: "2px" }}>
                  Turn this off if you offer 24/7 support. The button will always 
                  appear active and never show as offline.
                </div>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px" }}>
                <input
                  type="checkbox"
                  checked={businessHoursEnabled}
                  onChange={(e: any) => setBusinessHoursEnabled(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: businessHoursEnabled ? "#008060" : "#c9cccf",
                  borderRadius: "24px",
                  transition: "0.2s"
                }}>
                  <span style={{
                    position: "absolute",
                    height: "18px", width: "18px",
                    left: businessHoursEnabled ? "23px" : "3px",
                    bottom: "3px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    transition: "0.2s"
                  }} />
                </span>
              </label>
            </div>

            {businessHoursEnabled && (
              <>
                {/* Timezone UI Selector */}
                <div id="timezone-dropdown-container" style={{ marginBottom: "20px", position: "relative" }}>
                  <div style={{ fontWeight: "600", marginBottom: "4px", fontSize: "14px" }}>
                    Timezone
                  </div>
                  <div style={{ color: "#6d7175", fontSize: "12px", marginBottom: "8px" }}>
                    Shopify detected: {shop?.ianaTimezone || "Not detected"}
                  </div>
                  
                  {/* Selected timezone display - clicking opens dropdown */}
                  <div
                    onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #c9cccf",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "white",
                      userSelect: "none"
                    }}
                  >
                    <span>
                      {TIMEZONES.find(tz => tz.value === selectedTimezone)?.label || selectedTimezone || "Select timezone..."}
                    </span>
                    <span style={{ fontSize: "10px", color: "#6d7175" }}>
                      {showTimezoneDropdown ? "▲" : "▼"}
                    </span>
                  </div>

                  {/* Dropdown panel */}
                  {showTimezoneDropdown && (
                    <div style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "white",
                      border: "1px solid #c9cccf",
                      borderRadius: "6px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                      zIndex: 1000,
                      marginTop: "4px"
                    }}>
                      {/* Search input inside dropdown */}
                      <div style={{ padding: "8px" }}>
                        <input
                          type="text"
                          placeholder="Search timezone..."
                          value={timezoneSearch}
                          onChange={(e: any) => setTimezoneSearch(e.target.value)}
                          autoFocus
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            borderRadius: "4px",
                            border: "1px solid #c9cccf",
                            fontSize: "13px",
                            boxSizing: "border-box",
                            outline: "none"
                          }}
                        />
                      </div>

                      {/* Timezone options list */}
                      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {TIMEZONES
                          .filter(tz =>
                            tz.label.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
                            tz.value.toLowerCase().includes(timezoneSearch.toLowerCase())
                          )
                          .map(tz => (
                            <div
                              key={tz.value}
                              onClick={() => {
                                setSelectedTimezone(tz.value);
                                setShowTimezoneDropdown(false);
                                setTimezoneSearch("");
                              }}
                              style={{
                                padding: "8px 12px",
                                fontSize: "13px",
                                cursor: "pointer",
                                backgroundColor: selectedTimezone === tz.value ? "#f0faf0" : "transparent",
                                color: selectedTimezone === tz.value ? "#008060" : "#333",
                                fontWeight: selectedTimezone === tz.value ? "600" : "normal",
                              }}
                              onMouseEnter={(e: any) => {
                                if (selectedTimezone !== tz.value) {
                                  e.currentTarget.style.backgroundColor = "#f6f6f7";
                                }
                              }}
                              onMouseLeave={(e: any) => {
                                if (selectedTimezone !== tz.value) {
                                  e.currentTarget.style.backgroundColor = "transparent";
                                }
                              }}
                            >
                              {tz.label}
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>

                {/* Business Hours Days */}
                {DAYS.map((day) => {
                  const dayHours = businessHours[day as keyof typeof DEFAULT_HOURS] || { open: false, start: "09:00", end: "17:00" };
                  const isDayOpen = dayHours.open;
                  const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
                  
                  return (
                    <div
                      key={day}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "12px 0",
                        borderBottom: day === "sunday" ? "none" : "1px solid #e1e3e5",
                        opacity: isDayOpen ? 1 : 0.6,
                        transition: "opacity 0.2s ease",
                      }}
                    >
                      <div style={{ width: "100px", fontWeight: "500" }}>{capitalizedDay}</div>
                      <s-checkbox
                        {...({
                          checked: isDayOpen,
                          onChange: (e: any) => updateDay(day, "open", e.target.checked),
                          label: "Open",
                        } as any)}
                      />
                      {isDayOpen ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="time"
                            value={dayHours.start}
                            onChange={(e) => updateDay(day, "start", e.target.value)}
                            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #c9cccf", fontSize: "14px", fontFamily: "inherit" }}
                          />
                          <s-text color="subdued">to</s-text>
                          <input
                            type="time"
                            value={dayHours.end}
                            onChange={(e) => updateDay(day, "end", e.target.value)}
                            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #c9cccf", fontSize: "14px", fontFamily: "inherit" }}
                          />
                        </div>
                      ) : (
                        <s-text color="subdued">Closed</s-text>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <div>
            <s-button
              variant="primary"
              onClick={handleSaveHours}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Business Hours"}
            </s-button>
          </div>
        </div>
      </s-section>

      <s-section>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            backgroundColor: "#f6f6f7",
            borderRadius: "8px",
            marginBottom: "16px"
          }}>
            <div>
              <div style={{ fontWeight: "600", fontSize: "14px" }}>Use Multiple Agents</div>
              <div style={{ fontSize: "12px", color: "#6d7175", marginTop: "2px" }}>
                Turn on to let customers choose which team member to chat with. 
                Turn off to use a single WhatsApp number from your theme settings.
              </div>
            </div>
            <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px", flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={useMultipleAgents}
                onChange={(e: any) => handleToggleChange(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: useMultipleAgents ? "#008060" : "#c9cccf",
                borderRadius: "24px",
                transition: "0.2s"
              }}>
                <span style={{
                  position: "absolute",
                  height: "18px", width: "18px",
                  left: useMultipleAgents ? "23px" : "3px",
                  bottom: "3px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  transition: "0.2s"
                }} />
              </span>
            </label>
          </div>

          {useMultipleAgents && (
            <>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "16px" }}>Team Agents</div>
                  <div style={{ color: "#6d7175", fontSize: "13px", marginTop: "2px" }}>
                    Add multiple WhatsApp contacts. Customers will pick who to chat with.
                  </div>
                </div>
                <s-button onClick={addAgent} disabled={agents.length >= 5}>
                  + Add Agent
                </s-button>
              </div>

              {/* Agent limit note */}
              <div style={{ fontSize: "12px", color: "#6d7175" }}>
                Maximum 5 agents. {agents.length}/5 added.
              </div>

              {/* Agent list */}
              {agents.length === 0 && (
                <div style={{
                  padding: "32px",
                  textAlign: "center",
                  backgroundColor: "#f6f6f7",
                  borderRadius: "8px",
                  color: "#6d7175",
                  fontSize: "14px"
                }}>
                  No agents added yet. Click "+ Add Agent" to get started.
                </div>
              )}

              {agents.map((agent, index) => (
                <div key={agent.id} style={{
                  border: "1px solid #e1e3e5",
                  borderRadius: "8px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  backgroundColor: "white"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: "600", fontSize: "14px", color: "#333" }}>
                      Agent {index + 1}
                    </div>
                    <button
                      onClick={() => removeAgent(agent.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#d72c0d",
                        cursor: "pointer",
                        fontSize: "13px",
                        padding: "4px 8px",
                        borderRadius: "4px"
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "13px", fontWeight: "500", display: "block", marginBottom: "4px" }}>
                        Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. John Smith"
                        value={agent.name}
                        onChange={(e: any) => updateAgent(agent.id, "name", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: "1px solid #c9cccf",
                          fontSize: "13px",
                          boxSizing: "border-box" as const
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "13px", fontWeight: "500", display: "block", marginBottom: "4px" }}>
                        Role / Department
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sales, Support"
                        value={agent.role}
                        onChange={(e: any) => updateAgent(agent.id, "role", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: "1px solid #c9cccf",
                          fontSize: "13px",
                          boxSizing: "border-box" as const
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "13px", fontWeight: "500", display: "block", marginBottom: "4px" }}>
                      WhatsApp Number *
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <select
                        value={agent.countryCode}
                        onChange={(e: any) => updateAgent(agent.id, "countryCode", e.target.value)}
                        style={{
                          padding: "8px",
                          borderRadius: "6px",
                          border: "1px solid #c9cccf",
                          fontSize: "13px",
                          backgroundColor: "white"
                        }}
                      >
                        {AGENT_COUNTRY_CODES.map(cc => (
                          <option key={cc.value} value={cc.value}>{cc.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="3001234567"
                        value={agent.phone}
                        onChange={(e: any) => updateAgent(agent.id, "phone", e.target.value)}
                        style={{
                          flex: 1,
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: "1px solid #c9cccf",
                          fontSize: "13px"
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Success/Error banners */}
              {agentsSaved && (
                <s-banner tone="success" heading="Saved">
                  Agents saved successfully!
                </s-banner>
              )}
              {agentsSaveError && (
                <s-banner tone="critical" heading="Error">
                  {agentsSaveError}
                </s-banner>
              )}

              {/* Save button */}
              <div>
                <s-button
                  variant="primary"
                  onClick={handleSaveAgents}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Agents"}
                </s-button>
              </div>
            </>
          )}

        </div>
      </s-section>
    </s-page>
  );
}
