import posthog from 'posthog-js';

// PostHog configuration
// Replace with your actual PostHog API key from https://posthog.com
const POSTHOG_API_KEY = 'phc_REPLACE_WITH_YOUR_API_KEY';
const POSTHOG_HOST = 'https://app.posthog.com';

export const initAnalytics = () => {
  if (POSTHOG_API_KEY.includes('REPLACE')) {
    console.warn('PostHog: Please replace the API key in src/lib/analytics.ts');
    return;
  }

  posthog.init(POSTHOG_API_KEY, {
    api_host: POSTHOG_HOST,
    loaded: (posthog) => {
      // Enable debug mode in development
      if (import.meta.env.DEV) {
        posthog.debug();
      }
    },
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
  });
};

// Track custom events
export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  if (!POSTHOG_API_KEY.includes('REPLACE')) {
    posthog.capture(eventName, properties);
  }
};

// Track OCR-specific events
export const trackOCREvent = {
  imageUploaded: (count: number, source: 'drop' | 'file' | 'url') => {
    trackEvent('ocr_image_uploaded', { count, source });
  },
  
  textExtracted: (imageCount: number, success: boolean) => {
    trackEvent('ocr_text_extracted', { imageCount, success });
  },
  
  textCopied: (charCount: number) => {
    trackEvent('ocr_text_copied', { charCount });
  },
  
  textDownloaded: (charCount: number) => {
    trackEvent('ocr_text_downloaded', { charCount });
  },
  
  docsViewed: () => {
    trackEvent('docs_page_viewed');
  },
};

// Identify users (optional - for logged-in users)
export const identifyUser = (userId: string, traits?: Record<string, unknown>) => {
  if (!POSTHOG_API_KEY.includes('REPLACE')) {
    posthog.identify(userId, traits);
  }
};

// Reset user identity (on logout)
export const resetUser = () => {
  if (!POSTHOG_API_KEY.includes('REPLACE')) {
    posthog.reset();
  }
};

export default posthog;
