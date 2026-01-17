/**
 * Mixpanel Product Analytics
 * 
 * This utility provides a type-safe way to track user events and user properties.
 * Events are only sent if NEXT_PUBLIC_MIXPANEL_TOKEN is configured.
 */

import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
const ENABLE_MIXPANEL = typeof window !== "undefined" && !!MIXPANEL_TOKEN;

// Initialize Mixpanel
if (ENABLE_MIXPANEL && MIXPANEL_TOKEN) {
  try {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: process.env.NODE_ENV === "development",
      track_pageview: false, // We'll track pageviews manually
      persistence: "localStorage",
      ignore_dnt: false, // Respect Do Not Track
      autocapture: true, // Automatically capture clicks, form submissions, etc.
      record_sessions_percent: 100, // Record 100% of sessions
    });
  } catch (error) {
    console.warn("Failed to initialize Mixpanel:", error);
  }
}

/**
 * Check if Mixpanel is enabled
 */
export const isMixpanelEnabled = (): boolean => {
  return ENABLE_MIXPANEL;
};

/**
 * Identify a user
 */
export const identifyUser = (userId: string, userProperties?: Record<string, any>): void => {
  if (!ENABLE_MIXPANEL) return;
  
  mixpanel.identify(userId);
  
  if (userProperties) {
    mixpanel.people.set(userProperties);
  }
};

/**
 * Track an event
 */
export const trackMixpanelEvent = (
  eventName: string,
  properties?: Record<string, any>
): void => {
  if (!ENABLE_MIXPANEL) return;
  
  mixpanel.track(eventName, {
    ...properties,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Set user properties
 */
export const setUserProperties = (properties: Record<string, any>): void => {
  if (!ENABLE_MIXPANEL) return;
  
  mixpanel.people.set(properties);
};

/**
 * Increment user properties (e.g., scan count)
 */
export const incrementUserProperty = (property: string, value: number = 1): void => {
  if (!ENABLE_MIXPANEL) return;
  
  mixpanel.people.increment(property, value);
};

/**
 * Track page view
 */
export const trackPageView = (pageName: string, properties?: Record<string, any>): void => {
  if (!ENABLE_MIXPANEL) return;
  
  mixpanel.track("Page Viewed", {
    page_name: pageName,
    page_url: typeof window !== "undefined" ? window.location.href : "",
    ...properties,
  });
};

/**
 * Reset user (on logout)
 */
export const resetMixpanel = (): void => {
  if (!ENABLE_MIXPANEL) return;
  
  mixpanel.reset();
};

// Export mixpanel instance for advanced usage
export { mixpanel };
