/**
 * Google Analytics utilities for the modular monolith.
 * Provides GDPR-compliant analytics tracking.
 */

/**
 * Configuration for Google Analytics.
 */
export interface AnalyticsConfig {
  trackingId: string;
}

/**
 * Event properties for analytics tracking.
 */
export interface AnalyticsEventProps {
  action: string;
  category?: string;
  label?: string;
  value?: string;
}

/**
 * Abstract base class for analytics services.
 * Subclasses implement specific analytics providers.
 */
export abstract class BaseAnalyticsService {
  protected readonly trackingId: string;

  constructor(config: AnalyticsConfig) {
    this.trackingId = config.trackingId;
  }

  /**
   * Check if the user has accepted GDPR consent.
   */
  protected isGdprAccepted(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    return localStorage.getItem('GDPR:accepted') === 'true';
  }

  /**
   * Track a page view.
   * @param url - The page URL
   */
  abstract pageview(url: string): void;

  /**
   * Track a custom event.
   * @param props - The event properties
   */
  abstract event(props: AnalyticsEventProps): void;
}

/**
 * Google Analytics service implementation.
 */
export class GoogleAnalyticsService extends BaseAnalyticsService {
  private static instance: GoogleAnalyticsService | null = null;

  private constructor(config: AnalyticsConfig) {
    super(config);
  }

  /**
   * Get or create the singleton instance.
   * @param config - Analytics configuration
   */
  static getInstance(config: AnalyticsConfig): GoogleAnalyticsService {
    if (!GoogleAnalyticsService.instance) {
      GoogleAnalyticsService.instance = new GoogleAnalyticsService(config);
    }
    return GoogleAnalyticsService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    GoogleAnalyticsService.instance = null;
  }

  /**
   * Track a page view.
   * @param url - The page URL
   */
  pageview(url: string): void {
    if (!this.isGdprAccepted()) {
      return;
    }
    // @ts-ignore - gtag is injected by Google Analytics script
    if (typeof window !== 'undefined' && window.gtag) {
      // @ts-ignore
      window.gtag('config', this.trackingId, {
        page_path: url,
      });
    }
  }

  /**
   * Track a custom event.
   * @param props - The event properties
   */
  event({ action, category, label, value }: AnalyticsEventProps): void {
    if (!this.isGdprAccepted()) {
      return;
    }
    // @ts-ignore - gtag is injected by Google Analytics script
    if (typeof window !== 'undefined' && window.gtag) {
      // @ts-ignore
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  }
}

// Legacy functional exports for backward compatibility
export const GA_TRACKING_ID = 'G-357BGWEVLV';

export const pageview = (url: string): void => {
  const service = GoogleAnalyticsService.getInstance({ trackingId: GA_TRACKING_ID });
  service.pageview(url);
};

export const event = (props: AnalyticsEventProps): void => {
  const service = GoogleAnalyticsService.getInstance({ trackingId: GA_TRACKING_ID });
  service.event(props);
};
