import axios from "axios";

const MANTLE_API_BASE_URL = process.env.GADGET_PUBLIC_MANTLE_API_URL;
const GADGET_PUBLIC_MANTLE_APP_ID = process.env.GADGET_PUBLIC_MANTLE_APP_ID;

// Simplified Mantle customer info retrieval
export const getMantleCustomerInfo = async (mantleApiToken: string, retries = 2): Promise<any> => {
  try {
    const { data } = await axios.get(`${MANTLE_API_BASE_URL}/customer`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Mantle-App-Id': GADGET_PUBLIC_MANTLE_APP_ID,
        'X-Mantle-Customer-Api-Token': mantleApiToken
      },
      timeout: 10000 // 10 second timeout
    });
    return data.customer;
  } catch (error: any) {
    const statusCode = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;
    
    // Log detailed information about the error
    console.error(`Mantle API request failed:`, {
      statusCode,
      errorMessage,
    });
    
    // Retry logic for 5xx errors
    if (statusCode >= 500 && retries > 0) {
      console.log(`Retrying Mantle API request (${retries} attempts left)...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      return getMantleCustomerInfo(mantleApiToken, retries - 1);
    }
    
    throw new Error(`Mantle API request failed: ${errorMessage} (Status: ${statusCode || 'unknown'})`);
  }
};

// Subscription validation with improved error handling
export const validateSubscription = async (mantleApiToken: string) => {
  const customerInfo = await getMantleCustomerInfo(mantleApiToken);
  
  if (customerInfo.subscription?.active) return true;
  if (!customerInfo.trialExpiresAt) return false;
  
  const trialExpiry = new Date(customerInfo.trialExpiresAt);
  return trialExpiry > new Date();
};

export const params = {
  mantleApiToken: { type: "string" }
};

export const run: ActionRun = async ({ params, logger }) => {
  const { mantleApiToken } = params;

  try {
    const customerInfo = await getMantleCustomerInfo(mantleApiToken || "");    
    let isValid = false;
    if (customerInfo.subscription?.active) {
      isValid = true;
    } else if (customerInfo.trialExpiresAt) {
      const trialExpiry = new Date(customerInfo.trialExpiresAt);
      isValid = trialExpiry > new Date();
    }
    
    // Extract checking frequency from features
    const checkingFrequencyFeature = customerInfo.features?.checking_frequency;
    const checkingFrequency = checkingFrequencyFeature?.value || null;
    
    return { isValid, checkingFrequency };
  } catch (error: any) {
    logger.error({ error: error.message, mantleApiToken }, "Error during subscription validation.");
    return { isValid: false, checkingFrequency: null, error: error.message };
  }
};