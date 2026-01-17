/**
 * Mixpanel Product Analytics
 * 
 * This utility provides a type-safe way to track user events and user properties.
 * Events are only sent if NEXT_PUBLIC_MIXPANEL_TOKEN is configured.
 */

import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
const ENABLE_MIXPANEL = typeof window !== "undefined" && !!MIXPANEL_TOKEN;

// Initialize Mixpanel - only in browser
let mixpanelInitialized = false;

function initializeMixpanel() {
  // Only initialize once
  if (mixpanelInitialized) return;
  
  if (typeof window === "undefined") return;
  
  if (!MIXPANEL_TOKEN) {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ Mixpanel token not found. Set NEXT_PUBLIC_MIXPANEL_TOKEN in .env.local");
    }
    return;
  }

  try {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: process.env.NODE_ENV === "development",
      track_pageview: false, // We'll track pageviews manually
      persistence: "localStorage",
      ignore_dnt: false, // Respect Do Not Track
      autocapture: true, // Automatically capture clicks, form submissions, etc.
      record_sessions_percent: 100, // Record 100% of sessions
      loaded: (mixpanel) => {
        // Callback when Mixpanel is loaded
        if (process.env.NODE_ENV === "development") {
          console.log("✅ Mixpanel loaded and ready");
        }
        // Send a test event to verify connection
        mixpanel.track("Mixpanel Initialized", {
          timestamp: new Date().toISOString(),
          test: true,
          source: "browser_init"
        });
      }
    });
    
    mixpanelInitialized = true;
    
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Mixpanel initialization started with token:", MIXPANEL_TOKEN.substring(0, 12) + "...");
    }
  } catch (error) {
    console.error("❌ Failed to initialize Mixpanel:", error);
    mixpanelInitialized = false;
  }
}

// Initialize when module loads (if in browser)
if (typeof window !== "undefined") {
  // Use requestIdleCallback or setTimeout to ensure DOM is ready
  if (window.requestIdleCallback) {
    window.requestIdleCallback(initializeMixpanel, { timeout: 1000 });
  } else {
    setTimeout(initializeMixpanel, 0);
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
  if (typeof window === "undefined") return;
  
  // Ensure Mixpanel is initialized
  if (!mixpanelInitialized && MIXPANEL_TOKEN) {
    initializeMixpanel();
  }
  
  if (!ENABLE_MIXPANEL || !MIXPANEL_TOKEN) {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ Mixpanel not enabled. Event not tracked:", eventName);
    }
    return;
  }
  
  try {
    mixpanel.track(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
    
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Mixpanel event tracked:", eventName, properties);
    }
  } catch (error) {
    console.error("❌ Failed to track Mixpanel event:", error);
  }
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
  if (typeof window === "undefined") return;
  
  // Ensure Mixpanel is initialized
  if (!mixpanelInitialized && MIXPANEL_TOKEN) {
    initializeMixpanel();
  }
  
  if (!ENABLE_MIXPANEL || !MIXPANEL_TOKEN) return;
  
  try {
    mixpanel.track("Page Viewed", {
      page_name: pageName,
      page_url: window.location.href,
      ...properties,
    });
  } catch (error) {
    console.error("❌ Failed to track page view:", error);
  }
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
