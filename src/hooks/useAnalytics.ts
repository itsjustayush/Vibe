import { useEffect } from 'react';

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

/**
 * Hook to track analytics events
 * Sends data to Cloudflare and custom analytics
 */
export function useAnalytics(eventName: string, properties?: Record<string, any>) {
  useEffect(() => {
    trackEvent({
      event: eventName,
      properties,
      timestamp: Date.now(),
    });
  }, [eventName, properties]);
}

/**
 * Track a custom analytics event
 */
export function trackEvent(event: AnalyticsEvent): void {
  try {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event);
    }

    // Send via beacon to avoid blocking
    if (navigator.sendBeacon && event.properties?.tracked !== false) {
      navigator.sendBeacon('/api/analytics', JSON.stringify(event));
    }

    // Also trigger Cloudflare Analytics engine event if available
    if (typeof (window as any).cfl_insights !== 'undefined') {
      (window as any).cfl_insights?.trackEvent?.(event.event, event.properties);
    }
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error);
  }
}

/**
 * Track page view
 */
export function trackPageView(page: string): void {
  trackEvent({
    event: 'pageview',
    properties: {
      page,
      url: window.location.href,
      referrer: document.referrer,
    },
  });
}

/**
 * Track user interaction
 */
export function trackInteraction(action: string, element: string): void {
  trackEvent({
    event: 'interaction',
    properties: {
      action,
      element,
    },
  });
}

/**
 * Track conversion event
 */
export function trackConversion(conversionType: string, value?: number): void {
  trackEvent({
    event: 'conversion',
    properties: {
      type: conversionType,
      value,
    },
  });
}
