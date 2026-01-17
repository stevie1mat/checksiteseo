/**
 * Unified Analytics & Error Tracking
 * 
 * This utility provides a type-safe way to track events across multiple analytics platforms:
 * - Google Analytics 4 (GA4)
 * - Mixpanel (Product Analytics)
 * - Sentry (Error Tracking)
 * 
 * Events are only sent if the respective service tokens are configured.
 */

import { trackMixpanelEvent, trackPageView as trackMixpanelPageView, identifyUser as mixpanelIdentify, setUserProperties as mixpanelSetUserProperties } from './mixpanel';
import { captureException, captureMessage, setUserContext as sentrySetUserContext, clearUserContext as sentryClearUserContext, addBreadcrumb } from './sentry';

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

// GA4 Measurement ID from environment
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Check if analytics is enabled
 */
export const isAnalyticsEnabled = (): boolean => {
  return typeof window !== 'undefined' && !!GA_MEASUREMENT_ID && !!window.gtag;
};

/**
 * Initialize Google Analytics
 */
export const initGA = (): void => {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) {
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
  });
};

/**
 * Track a page view across all analytics platforms
 */
export const trackPageView = (url: string): void => {
  // Google Analytics
  if (isAnalyticsEnabled()) {
    window.gtag?.('config', GA_MEASUREMENT_ID!, {
      page_path: url,
    });
  }
  
  // Mixpanel
  trackMixpanelPageView(url.split('?')[0], {
    url,
  });
  
  // Sentry breadcrumb
  addBreadcrumb(`Page view: ${url}`, 'navigation', 'info', { url });
};

/**
 * Track a custom event across all analytics platforms
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
): void => {
  // Google Analytics
  if (isAnalyticsEnabled()) {
    window.gtag?.('event', eventName, eventParams);
  }
  
  // Mixpanel
  trackMixpanelEvent(eventName, eventParams);
  
  // Sentry breadcrumb
  addBreadcrumb(`Event: ${eventName}`, 'user', 'info', eventParams);
};

// Predefined event types for type safety
export const AnalyticsEvents = {
  // Scan Events
  SCAN_STARTED: 'scan_started',
  SCAN_COMPLETED: 'scan_completed',
  SCAN_FAILED: 'scan_failed',
  SCAN_RESCHEDULED: 'scan_rescheduled',
  SCAN_CANCELLED: 'scan_cancelled',

  // Authentication Events
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  SIGNUP_FAILED: 'signup_failed',
  SIGNIN_STARTED: 'signin_started',
  SIGNIN_COMPLETED: 'signin_completed',
  SIGNIN_FAILED: 'signin_failed',
  SIGNOUT: 'signout',

  // Conversion Events
  UPGRADE_PLAN_STARTED: 'upgrade_plan_started',
  UPGRADE_PLAN_COMPLETED: 'upgrade_plan_completed',
  SITE_ADDED: 'site_added',
  SITE_VERIFIED: 'site_verified',
  SITE_DELETED: 'site_deleted',

  // Engagement Events
  DASHBOARD_VIEWED: 'dashboard_viewed',
  REPORT_VIEWED: 'report_viewed',
  REPORT_DOWNLOADED: 'report_downloaded',
  CONTACT_FORM_SUBMITTED: 'contact_form_submitted',
  FAQ_EXPANDED: 'faq_expanded',

  // Error Events
  ERROR_OCCURRED: 'error_occurred',
} as const;

/**
 * Helper functions for common events
 */
export const analytics = {
  // Scan tracking
  trackScanStarted: (url: string, siteId?: string) => {
    trackEvent(AnalyticsEvents.SCAN_STARTED, {
      url,
      site_id: siteId,
    });
  },

  trackScanCompleted: (url: string, score?: number, siteId?: string) => {
    trackEvent(AnalyticsEvents.SCAN_COMPLETED, {
      url,
      score,
      site_id: siteId,
    });
  },

  trackScanFailed: (url: string, error: string, siteId?: string) => {
    trackEvent(AnalyticsEvents.SCAN_FAILED, {
      url,
      error,
      site_id: siteId,
    });
  },

  // Auth tracking
  trackSignupStarted: () => {
    trackEvent(AnalyticsEvents.SIGNUP_STARTED);
  },

  trackSignupCompleted: (method: 'email' | 'oauth') => {
    trackEvent(AnalyticsEvents.SIGNUP_COMPLETED, {
      method,
    });
  },

  trackSignupFailed: (error: string) => {
    trackEvent(AnalyticsEvents.SIGNUP_FAILED, {
      error,
    });
  },

  trackSigninStarted: () => {
    trackEvent(AnalyticsEvents.SIGNIN_STARTED);
  },

  trackSigninCompleted: (method: 'email' | 'oauth') => {
    trackEvent(AnalyticsEvents.SIGNIN_COMPLETED, {
      method,
    });
  },

  trackSigninFailed: (error: string) => {
    trackEvent(AnalyticsEvents.SIGNIN_FAILED, {
      error,
    });
  },

  trackSignout: () => {
    trackEvent(AnalyticsEvents.SIGNOUT);
  },

  // Conversion tracking
  trackUpgradePlanStarted: (plan: string) => {
    trackEvent(AnalyticsEvents.UPGRADE_PLAN_STARTED, {
      plan,
    });
  },

  trackUpgradePlanCompleted: (plan: string, price?: number) => {
    trackEvent(AnalyticsEvents.UPGRADE_PLAN_COMPLETED, {
      plan,
      value: price,
      currency: 'USD',
    });
  },

  trackSiteAdded: (url: string) => {
    trackEvent(AnalyticsEvents.SITE_ADDED, {
      url,
    });
  },

  trackSiteVerified: (url: string) => {
    trackEvent(AnalyticsEvents.SITE_VERIFIED, {
      url,
    });
  },

  trackSiteDeleted: (url: string) => {
    trackEvent(AnalyticsEvents.SITE_DELETED, {
      url,
    });
  },

  // Engagement tracking
  trackDashboardViewed: () => {
    trackEvent(AnalyticsEvents.DASHBOARD_VIEWED);
  },

  trackReportViewed: (siteId: string, reportType?: string) => {
    trackEvent(AnalyticsEvents.REPORT_VIEWED, {
      site_id: siteId,
      report_type: reportType,
    });
  },

  trackReportDownloaded: (siteId: string, format?: string) => {
    trackEvent(AnalyticsEvents.REPORT_DOWNLOADED, {
      site_id: siteId,
      format,
    });
  },

  trackContactFormSubmitted: () => {
    trackEvent(AnalyticsEvents.CONTACT_FORM_SUBMITTED);
  },

  trackFAQExpanded: (question: string) => {
    trackEvent(AnalyticsEvents.FAQ_EXPANDED, {
      question,
    });
  },

  // Error tracking
  trackError: (error: string, errorInfo?: Record<string, any>) => {
    trackEvent(AnalyticsEvents.ERROR_OCCURRED, {
      error,
      ...errorInfo,
    });
    
    // Also send to Sentry
    captureMessage(error, 'error', errorInfo);
  },
  
  // User identification (for Mixpanel and Sentry)
  identifyUser: (userId: string, userProperties?: Record<string, any>) => {
    // Mixpanel
    mixpanelIdentify(userId, userProperties);
    
    // Sentry
    sentrySetUserContext({
      id: userId,
      ...userProperties,
    });
  },
  
  // Clear user (on logout)
  clearUser: () => {
    sentryClearUserContext();
  },
};
