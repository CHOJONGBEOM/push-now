import * as amplitude from '@amplitude/analytics-browser';

const API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY as string;

export function initAmplitude() {
    if (!API_KEY) {
        console.warn('[Analytics] VITE_AMPLITUDE_API_KEY is not set.');
        return;
    }
    amplitude.init(API_KEY, {
        autocapture: {
            pageViews: false, // 수동으로 제어
            sessions: true,
            formInteractions: true,
            fileDownloads: true,
        },
        defaultTracking: false,
    });
}

export function trackPageView(pageName: string, properties?: Record<string, unknown>) {
    amplitude.track('page_viewed', {
        page_name: pageName,
        ...properties,
    });
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
    amplitude.track(eventName, properties);
}

export function setUserIdentity(userId: string, userProperties?: Record<string, unknown>) {
    amplitude.setUserId(userId);
    if (userProperties) {
        const identifyEvent = new amplitude.Identify();
        Object.entries(userProperties).forEach(([key, value]) => {
            identifyEvent.set(key, value as amplitude.Types.ValidPropertyType);
        });
        amplitude.identify(identifyEvent);
    }
}
