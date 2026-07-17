import { useState, useCallback, useEffect, memo } from "react";
import { useBreakpoints } from '@shopify/polaris';
import { useFindFirst } from "@gadgetinc/react";
import { api } from "../api";
import {
  Card,
  Page,
  TextField,
  Banner,
  Text,
  BlockStack,
  InlineGrid,
  Box,
  Divider,
  Button,
  Frame,
  Spinner,
  InlineStack,
  Badge,
  Select,
} from "@shopify/polaris";
import { DeleteIcon, PlusIcon } from "@shopify/polaris-icons";
import validator from 'validator';
import { SaveBar, useAppBridge } from '@shopify/app-bridge-react';
import { Knob } from "../components/Knob";

interface FormState {
  emailAlerts: boolean;
  alertEmails: string[];
  slackALerts: boolean;
  alertSlacks: string[];
  whatsappAlerts: boolean;
  alertWhatsapps: string[];
  checkingFrequency: string;
  conversionRateLow: boolean;
  conversionRateThreshold: string;
  conversionRateDateRange: string;
}

interface ValidationErrors {
  alertEmails?: string[];
  alertSlacks?: string[];
  alertWhatsapps?: string[];
  conversionRateThreshold?: string;
}

// Note: Phone input library removed; we'll use a simple Polaris TextField with validator checks.

export default function Settings() {
  const [{ data: shopData, fetching: shopFetching }] = useFindFirst(
    api.shopifyShop, 
    { select: { id: true } }
  );
  const shopId = shopData?.id;
  
  const { smUp } = useBreakpoints();
  const app = useAppBridge();
  
  const [alertSettings, setAlertSettings] = useState<any>(null);
  const [fetching, setFetching] = useState(false);

  const fetchAlertSettings = useCallback(async () => {
    if (!shopId) return;
    
    setFetching(true);
    try {
      const record = await api.alertSettings.findByShop(shopId);
      setAlertSettings(record);
    } catch (error) {
      console.error('Error fetching alert settings:', error);
      setAlertSettings(null);
    } finally {
      setFetching(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchAlertSettings();
  }, [fetchAlertSettings]);

  const [formState, setFormState] = useState<FormState>({
    emailAlerts: false,
    alertEmails: [],
    slackALerts: false,
    alertSlacks: [],
    whatsappAlerts: false,
    alertWhatsapps: [],
    checkingFrequency: "180",
    conversionRateLow: false,
    conversionRateThreshold: "",
    conversionRateDateRange: "today",
  });
  
  const [originalSettings, setOriginalSettings] = useState<FormState | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  // Initialize form state when settings are loaded
  useEffect(() => {
    if (alertSettings) {
      const conversionRate = alertSettings.conversionRate as any;
      const newSettings: FormState = {
        emailAlerts: alertSettings.emailAlerts || false,
        alertEmails: (alertSettings.alertEmails as string[]) || [],
        slackALerts: alertSettings.slackALerts || false,
        alertSlacks: (alertSettings.alertSlacks as string[]) || [],
        whatsappAlerts: alertSettings.whatsappAlerts || false,
        alertWhatsapps: (alertSettings.alertWhatsapps as string[]) || [],
        checkingFrequency: alertSettings.checkingFrequency || "180",
        conversionRateLow: conversionRate?.enabled || false,
        conversionRateThreshold: conversionRate?.threshold?.toString() || "",
        conversionRateDateRange: conversionRate?.dateRange || "today",
      };
      setFormState(newSettings);
      setOriginalSettings(JSON.parse(JSON.stringify(newSettings)));
    }
  }, [alertSettings]);

  // Check for unsaved changes
  useEffect(() => {
    if (!originalSettings) return;
    const hasChanges = JSON.stringify(formState) !== JSON.stringify(originalSettings);
    setIsDirty(hasChanges);
  }, [formState, originalSettings]);

  // Show/hide SaveBar based on isDirty state
  useEffect(() => {
    if (isDirty) {
      app.saveBar.show('settings-save-bar');
    } else {
      app.saveBar.hide('settings-save-bar');
    }
  }, [isDirty, app.saveBar]);

  // Email handlers
  const handleAddEmail = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      alertEmails: [...prev.alertEmails, ""]
    }));
  }, []);

  const handleUpdateEmail = useCallback((index: number, value: string) => {
    const updatedEmails = [...formState.alertEmails];
    updatedEmails[index] = value;
    setFormState((prev) => ({
      ...prev,
      alertEmails: updatedEmails
    }));
    
    // Real-time validation
    const updatedErrors = [...(errors.alertEmails || [])];
    if (value.trim() && !validator.isEmail(value.trim())) {
      updatedErrors[index] = "Invalid email address";
    } else {
      updatedErrors[index] = "";
    }
    setErrors((prev) => ({ ...prev, alertEmails: updatedErrors }));
  }, [formState.alertEmails, errors]);

  const handleRemoveEmail = useCallback((index: number) => {
    setFormState((prev) => ({
      ...prev,
      alertEmails: prev.alertEmails.filter((_, i) => i !== index)
    }));
  }, []);

  // Slack handlers
  const handleAddSlack = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      alertSlacks: [...prev.alertSlacks, ""]
    }));
  }, []);

  const handleUpdateSlack = useCallback((index: number, value: string) => {
    const updatedSlacks = [...formState.alertSlacks];
    updatedSlacks[index] = value;
    setFormState((prev) => ({
      ...prev,
      alertSlacks: updatedSlacks
    }));
    
    // Real-time validation
    const updatedErrors = [...(errors.alertSlacks || [])];
    if (value.trim() && !value.trim().startsWith('https://hooks.slack.com/')) {
      updatedErrors[index] = "Must be a valid Slack webhook URL";
    } else {
      updatedErrors[index] = "";
    }
    setErrors((prev) => ({ ...prev, alertSlacks: updatedErrors }));
  }, [formState.alertSlacks, errors]);

  const handleRemoveSlack = useCallback((index: number) => {
    setFormState((prev) => ({
      ...prev,
      alertSlacks: prev.alertSlacks.filter((_, i) => i !== index)
    }));
  }, []);

  // WhatsApp handlers
  const handleAddWhatsapp = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      alertWhatsapps: [...prev.alertWhatsapps, ""]
    }));
  }, []);

  const handleUpdateWhatsapp = useCallback((index: number, value: string) => {
    // Remove all non-digit characters except the leading +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Ensure it starts with + if there are any digits
    if (cleaned.length > 0 && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    const updatedWhatsapps = [...formState.alertWhatsapps];
    updatedWhatsapps[index] = cleaned;
    setFormState((prev) => ({
      ...prev,
      alertWhatsapps: updatedWhatsapps
    }));
    
    // Real-time validation
    const updatedErrors = [...(errors.alertWhatsapps || [])];
    if (cleaned.trim() && !validator.isMobilePhone(cleaned.trim(), 'any', { strictMode: true })) {
      updatedErrors[index] = "Invalid phone number (include country code, e.g., +1234567890)";
    } else {
      updatedErrors[index] = "";
    }
    setErrors((prev) => ({ ...prev, alertWhatsapps: updatedErrors }));
  }, [formState.alertWhatsapps, errors]);

  const handleRemoveWhatsapp = useCallback((index: number) => {
    setFormState((prev) => ({
      ...prev,
      alertWhatsapps: prev.alertWhatsapps.filter((_, i) => i !== index)
    }));
  }, []);

  // Conversion rate threshold handler with validation
  const handleConversionRateThresholdChange = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, conversionRateThreshold: value }));
    
    // Real-time validation
    if (!formState.conversionRateLow) {
      // Skip validation if monitoring is disabled
      setErrors((prev) => ({ ...prev, conversionRateThreshold: undefined }));
      return;
    }
    
    if (!value || value.trim() === '') {
      setErrors((prev) => ({ ...prev, conversionRateThreshold: "Conversion rate threshold is required" }));
      return;
    }
    
    const threshold = parseFloat(value);
    if (isNaN(threshold)) {
      setErrors((prev) => ({ ...prev, conversionRateThreshold: "Must be a valid number" }));
    } else if (threshold < 0 || threshold > 100) {
      setErrors((prev) => ({ ...prev, conversionRateThreshold: "Must be between 0 and 100" }));
    } else {
      // Clear error if valid
      setErrors((prev) => ({ ...prev, conversionRateThreshold: undefined }));
    }
  }, [formState.conversionRateLow]);

  // Toggle handlers for each alert type
  const handleToggleEmail = useCallback(async () => {
    if (!alertSettings?.id) return;
    
    try {
      const newStatus = !formState.emailAlerts;
      await api.alertSettings.update(alertSettings.id, {
        emailAlerts: newStatus
      });
      setFormState((prev) => ({ ...prev, emailAlerts: newStatus }));
      setOriginalSettings((prev) => prev ? { ...prev, emailAlerts: newStatus } : null);
      // Show success toast
      app.toast.show('Settings saved!', {
        duration: 5000,
      });
    } catch (error: any) {
      setErrorMessage(error?.message || "Failed to toggle email alerts");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  }, [formState.emailAlerts, alertSettings]);

  const handleToggleSlack = useCallback(async () => {
    if (!alertSettings?.id) return;
    
    try {
      const newStatus = !formState.slackALerts;
      await api.alertSettings.update(alertSettings.id, {
        slackALerts: newStatus
      });
      setFormState((prev) => ({ ...prev, slackALerts: newStatus }));
      setOriginalSettings((prev) => prev ? { ...prev, slackALerts: newStatus } : null);
      // Show success toast
      app.toast.show('Settings saved!', {
        duration: 5000,
      });
    } catch (error: any) {
      setErrorMessage(error?.message || "Failed to toggle Slack alerts");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  }, [formState.slackALerts, alertSettings]);

  const handleToggleWhatsapp = useCallback(async () => {
    if (!alertSettings?.id) return;
    
    try {
      const newStatus = !formState.whatsappAlerts;
      await api.alertSettings.update(alertSettings.id, {
        whatsappAlerts: newStatus
      });
      setFormState((prev) => ({ ...prev, whatsappAlerts: newStatus }));
      setOriginalSettings((prev) => prev ? { ...prev, whatsappAlerts: newStatus } : null);
      // Show success toast
      app.toast.show('Settings saved!', {
        duration: 5000,
      });
    } catch (error: any) {
      setErrorMessage(error?.message || "Failed to toggle WhatsApp alerts");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  }, [formState.whatsappAlerts, alertSettings]);

  const handleSave = useCallback(async () => {
    if (!shopId) {
      setErrorMessage('Shop not available');
      return;
    }

    const newErrors: ValidationErrors = {
      alertEmails: [],
      alertSlacks: [],
      alertWhatsapps: [],
      conversionRateThreshold: undefined
    };
    let hasErrors = false;

    // Validate email alerts
    if (formState.emailAlerts && formState.alertEmails.length === 0) {
      setErrorMessage("At least one email is required when email alerts are enabled");
      return;
    } else if (formState.emailAlerts) {
      formState.alertEmails.forEach((email, index) => {
        if (!email || !email.trim()) {
          newErrors.alertEmails![index] = "Email is required";
          hasErrors = true;
        } else if (!validator.isEmail(email.trim())) {
          newErrors.alertEmails![index] = "Invalid email address";
          hasErrors = true;
        }
      });
    }

    // Validate Slack webhooks
    if (formState.slackALerts && formState.alertSlacks.length === 0) {
      setErrorMessage("At least one Slack webhook URL is required when Slack alerts are enabled");
      return;
    } else if (formState.slackALerts) {
      formState.alertSlacks.forEach((url, index) => {
        if (!url || !url.trim()) {
          newErrors.alertSlacks![index] = "Slack webhook URL is required";
          hasErrors = true;
        } else if (!url.trim().startsWith('https://hooks.slack.com/')) {
          newErrors.alertSlacks![index] = "Must be a valid Slack webhook URL";
          hasErrors = true;
        }
      });
    }

    // Validate WhatsApp numbers
    if (formState.whatsappAlerts && formState.alertWhatsapps.length === 0) {
      setErrorMessage("At least one WhatsApp number is required when WhatsApp alerts are enabled");
      return;
    } else if (formState.whatsappAlerts) {
      formState.alertWhatsapps.forEach((number, index) => {
        if (!number || !number.trim()) {
          newErrors.alertWhatsapps![index] = "WhatsApp number is required";
          hasErrors = true;
        } else if (!validator.isMobilePhone(number.trim(), 'any', { strictMode: true })) {
          newErrors.alertWhatsapps![index] = "Invalid phone number (include country code, e.g., +1234567890)";
          hasErrors = true;
        }
      });
    }

    // Validate conversion rate threshold
    if (formState.conversionRateLow) {
      if (!formState.conversionRateThreshold || formState.conversionRateThreshold.trim() === '') {
        newErrors.conversionRateThreshold = "Conversion rate threshold is required when monitoring is enabled";
        hasErrors = true;
      } else {
        const threshold = parseFloat(formState.conversionRateThreshold);
        if (isNaN(threshold)) {
          newErrors.conversionRateThreshold = "Must be a valid number";
          hasErrors = true;
        } else if (threshold < 0 || threshold > 100) {
          newErrors.conversionRateThreshold = "Must be between 0 and 100";
          hasErrors = true;
        }
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      setErrorMessage("Please fix the validation errors before saving");
      return;
    }
    
    setIsSaving(true);
    setErrorMessage("");
    
    const data = {
      emailAlerts: formState.emailAlerts,
      alertEmails: formState.alertEmails
        .map(e => e.trim())
        .filter(e => e)
        .map(e => e.toLowerCase()),
      slackALerts: formState.slackALerts,
      alertSlacks: formState.alertSlacks.filter(s => s.trim()),
      whatsappAlerts: formState.whatsappAlerts,
      alertWhatsapps: formState.alertWhatsapps
        .map(w => w.trim())
        .filter(w => w),
      checkingFrequency: formState.checkingFrequency as any,
      conversionRate: {
        enabled: formState.conversionRateLow,
        threshold: formState.conversionRateThreshold ? parseFloat(formState.conversionRateThreshold) : undefined,
        dateRange: formState.conversionRateDateRange,
        alertSent: false, // Reset alert sent flag when settings are changed
      } as any,
    };
    
    try {
      if (alertSettings) {
        await api.alertSettings.update(alertSettings.id, data);
      } else {
        await api.alertSettings.create({
          ...data,
          shop: { _link: shopId }
        });
      }
      
      setOriginalSettings(JSON.parse(JSON.stringify(formState)));
      setIsDirty(false);
      
      // Hide the SaveBar after successful save
      app.saveBar.hide('settings-save-bar');
      
      // Show success toast
      app.toast.show('Settings saved!', {
        duration: 5000,
      });

    } catch (error: any) {
      console.error('Failed to save settings:', error);
      setErrorMessage(error?.message || 'Failed to save settings.');
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setIsSaving(false);
    }
  }, [formState, shopId, alertSettings, app.saveBar]);

  const handleDiscard = useCallback(() => {
    if (originalSettings) {
      setFormState(JSON.parse(JSON.stringify(originalSettings)));
      setErrors({});
      setErrorMessage("");
      setIsDirty(false);
      
      // Hide the SaveBar after discard
      app.saveBar.hide('settings-save-bar');
    }
  }, [originalSettings, app.saveBar]);

  if (fetching || shopFetching) {
    return (
      <Page title="Alert Settings">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Spinner size="large" />
        </div>
      </Page>
    );
  }
  
  return (
    <Frame>
      {/* App Bridge SaveBar will be rendered below */}
      
      <Page
        title="Alert Settings"
      >
        <BlockStack gap={{ xs: "800", sm: "400" }}>
          {/* Email Alerts Section */}
          <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
            <Box
              as="section"
              paddingInlineStart={{ xs: "400", sm: "0" }}
              paddingInlineEnd={{ xs: "400", sm: "0" }}
            >
              <BlockStack gap="400">
                <InlineStack gap="200" align="start" blockAlign="center">
                  <Text as="h3" variant="headingMd">
                    Email Alerts
                  </Text>
                  <Badge tone={formState.emailAlerts ? 'success' : undefined}>
                    {formState.emailAlerts ? 'On' : 'Off'}
                  </Badge>
                </InlineStack>
                <Text as="p" variant="bodyMd">
                  Receive alert notifications via email when performance metrics fall below thresholds.
                </Text>
              </BlockStack>
            </Box>
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h4" variant="headingSm">Email Alerts</Text>
                  <Knob
                    ariaLabel="Email alerts toggle"
                    selected={formState.emailAlerts}
                    onClick={() => setFormState(prev => ({ ...prev, emailAlerts: !prev.emailAlerts }))}
                  />
                </InlineStack>
                
                <Text as="p" variant="bodyMd" tone="subdued">
                  Add email addresses to receive alert notifications
                </Text>
                
                {formState.alertEmails.map((email, index) => (
                  <InlineStack key={index} gap="200" blockAlign="center">
                      <TextField
                        label=""
                        value={email}
                        onChange={(value) => handleUpdateEmail(index, value)}
                        type="email"
                        placeholder="email@example.com"
                        autoComplete="off"
                        error={errors.alertEmails?.[index]}
                      />
                    <Button
                      icon={DeleteIcon as any}
                      variant="tertiary"
                      tone="critical"
                      onClick={() => handleRemoveEmail(index)}
                      accessibilityLabel="Remove email"
                    />
                  </InlineStack>
                ))}
                
                <div>
                  <Button
                    onClick={handleAddEmail}
                    icon={PlusIcon as any}
                  >
                    Add email address
                  </Button>
                </div>
                
                {formState.emailAlerts && formState.alertEmails.length === 0 && (
                  <Banner tone="warning">
                    <p>You haven't added any email addresses yet. At least one email is required for email alerts to work.</p>
                  </Banner>
                )}
              </BlockStack>
            </Card>
          </InlineGrid>

          {smUp ? <Divider /> : null}

          {/* Slack Alerts Section */}
          <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
            <Box
              as="section"
              paddingInlineStart={{ xs: "400", sm: "0" }}
              paddingInlineEnd={{ xs: "400", sm: "0" }}
            >
              <BlockStack gap="400">
                <InlineStack gap="200" align="start" blockAlign="center">
                  <Text as="h3" variant="headingMd">
                    Slack Alerts
                  </Text>
                  <Badge tone="info">Coming Soon</Badge>
                </InlineStack>
                <Text as="p" variant="bodyMd">
                  Send alert notifications to Slack channels using webhook URLs.
                </Text>
              </BlockStack>
            </Box>
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h4" variant="headingSm">Slack Alerts</Text>
                  <Knob
                    ariaLabel="Slack alerts toggle"
                    selected={formState.slackALerts}
                    onClick={() => {}}
                  />
                </InlineStack>
                
                <Text as="p" variant="bodyMd" tone="subdued">
                  Add Slack webhook URLs to receive alerts
                </Text>
                
                {formState.alertSlacks.map((url, index) => (
                  <InlineStack key={index} gap="200" blockAlign="center">
                      <TextField
                        label=""
                        value={url}
                        onChange={(value) => handleUpdateSlack(index, value)}
                        type="url"
                        placeholder="https://hooks.slack.com/services/..."
                        autoComplete="off"
                        error={errors.alertSlacks?.[index]}
                        disabled
                      />
                    <Button
                      icon={DeleteIcon as any}
                      variant="tertiary"
                      tone="critical"
                      onClick={() => handleRemoveSlack(index)}
                      accessibilityLabel="Remove Slack webhook"
                    />
                  </InlineStack>
                ))}
                
                <div>
                  <Button
                    onClick={handleAddSlack}
                    icon={PlusIcon as any}
                    disabled
                  >
                    Add Slack webhook URL
                  </Button>
                </div>
                
                {formState.slackALerts && formState.alertSlacks.length === 0 && (
                  <Banner tone="warning">
                    <p>You haven't added any Slack webhooks yet. At least one webhook URL is required for Slack alerts to work.</p>
                  </Banner>
                )}
              </BlockStack>
            </Card>
          </InlineGrid>

          {smUp ? <Divider /> : null}

          {/* WhatsApp Alerts Section */}
          <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
            <Box
              as="section"
              paddingInlineStart={{ xs: "400", sm: "0" }}
              paddingInlineEnd={{ xs: "400", sm: "0" }}
            >
              <BlockStack gap="400">
                <InlineStack gap="200" align="start" blockAlign="center">
                  <Text as="h3" variant="headingMd">
                    WhatsApp Alerts
                  </Text>
                  <Badge tone="info">Coming Soon</Badge>
                </InlineStack>
                <Text as="p" variant="bodyMd">
                  Receive alerts on WhatsApp for immediate notification of store performance issues.
                </Text>
              </BlockStack>
            </Box>
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h4" variant="headingSm">WhatsApp Alerts</Text>
                  <Knob
                    ariaLabel="WhatsApp alerts toggle"
                    selected={formState.whatsappAlerts}
                    onClick={() => {}}
                  />
                </InlineStack>
                
                <Text as="p" variant="bodyMd" tone="subdued">
                  Add WhatsApp numbers with country code (e.g., +1234567890)
                </Text>
                
                {formState.alertWhatsapps.map((number, index) => (
                  <InlineStack key={index} gap="200" blockAlign="center">
                      <TextField
                        label=""
                        value={number}
                        onChange={(value) => handleUpdateWhatsapp(index, value)}
                        type="tel"
                        placeholder="+1234567890"
                        autoComplete="tel"
                        error={errors.alertWhatsapps?.[index]}
                        disabled
                      />
                    <Button
                      icon={DeleteIcon as any}
                      variant="tertiary"
                      tone="critical"
                      onClick={() => handleRemoveWhatsapp(index)}
                      accessibilityLabel="Remove WhatsApp number"
                    />
                  </InlineStack>
                ))}
                
                <div>
                  <Button
                    onClick={handleAddWhatsapp}
                    icon={PlusIcon as any}
                    disabled
                  >
                    Add WhatsApp number
                  </Button>
                </div>
                
                {formState.whatsappAlerts && formState.alertWhatsapps.length === 0 && (
                  <Banner tone="warning">
                    <p>You haven't added any WhatsApp numbers yet. At least one number is required for WhatsApp alerts to work.</p>
                  </Banner>
                )}
              </BlockStack>
            </Card>
          </InlineGrid>

          {smUp ? <Divider /> : null}

          {/* Checking Frequency Section */}
          <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
            <Box
              as="section"
              paddingInlineStart={{ xs: "400", sm: "0" }}
              paddingInlineEnd={{ xs: "400", sm: "0" }}
            >
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  Checking Frequency
                </Text>
                <Text as="p" variant="bodyMd">
                  Set how often the system should check your store's performance metrics and send alerts if thresholds are crossed.
                </Text>
              </BlockStack>
            </Box>
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <Select
                  label="Check frequency"
                  options={[
                    { label: '5 minutes', value: '5' },
                    { label: '15 minutes', value: '15' },
                    { label: '30 minutes', value: '30' },
                    { label: '1 hour', value: '60' },
                    { label: '2 hours', value: '120' },
                    { label: '3 hours', value: '180' },
                    { label: '6 hours', value: '360' },
                    { label: '12 hours', value: '720' },
                    { label: '24 hours', value: '1440' },
                  ]}
                  value={formState.checkingFrequency}
                  onChange={(value) => setFormState(prev => ({ ...prev, checkingFrequency: value }))}
                  helpText="More frequent checks provide faster alerts but may consume more resources."
                />
              </BlockStack>
            </Card>
          </InlineGrid>

          {smUp ? <Divider /> : null}

          {/* Conversion Rate Monitoring Section */}
          <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
            <Box
              as="section"
              paddingInlineStart={{ xs: "400", sm: "0" }}
              paddingInlineEnd={{ xs: "400", sm: "0" }}
            >
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  Conversion Rate
                </Text>
                <Text as="p" variant="bodyMd">
                  Monitor your store's conversion rate and receive alerts when it drops below your specified threshold.
                </Text>
              </BlockStack>
            </Box>
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="200" align="start" blockAlign="center">
                    <Text as="h4" variant="headingSm">Conversion Rate Monitoring</Text>
                    <Badge tone={formState.conversionRateLow ? 'success' : 'attention'}>
                      {formState.conversionRateLow ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </InlineStack>
                  <Knob
                    ariaLabel="Conversion rate monitoring toggle"
                    selected={formState.conversionRateLow}
                    onClick={() => {
                      setFormState(prev => ({ ...prev, conversionRateLow: !prev.conversionRateLow }));
                      // Clear error when disabling
                      if (formState.conversionRateLow) {
                        setErrors((prev) => ({ ...prev, conversionRateThreshold: undefined }));
                      }
                    }}
                  />
                </InlineStack>
                
                <TextField
                  label="Conversion Rate Threshold (%)"
                  type="number"
                  value={formState.conversionRateThreshold}
                  onChange={handleConversionRateThresholdChange}
                  helpText="Alert will be sent when conversion rate falls below this percentage."
                  autoComplete="off"
                  disabled={!formState.conversionRateLow}
                  min={0}
                  max={100}
                  step={0.1}
                  error={errors.conversionRateThreshold}
                />
                
                <Select
                  label="Date Range for Analysis"
                  options={[
                    { label: 'Today', value: 'today' },
                    { label: 'Last 7 days', value: 'last_7_days' },
                    { label: 'Last 30 days', value: 'last_30_days' },
                  ]}
                  value={formState.conversionRateDateRange}
                  onChange={(value) => setFormState(prev => ({ ...prev, conversionRateDateRange: value }))}
                  helpText="Select the time period to analyze for conversion rate alerts."
                  disabled={!formState.conversionRateLow}
                />
                
                {formState.conversionRateLow && !formState.conversionRateThreshold && (
                  <Banner tone="warning">
                    <p>Please set a conversion rate threshold to enable monitoring.</p>
                  </Banner>
                )}
              </BlockStack>
            </Card>
          </InlineGrid>

        </BlockStack>
      </Page>
      {/* App Bridge SaveBar (Shopify Admin) */}
      <SaveBar id="settings-save-bar">
        <button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving}
          loading={isSaving ? "" : undefined}
        />
        <button
          onClick={handleDiscard}
          disabled={isSaving}
        />
      </SaveBar>
    </Frame>
  );
}