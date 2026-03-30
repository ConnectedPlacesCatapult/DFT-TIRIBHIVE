export const trackEvent = (
  eventName: string,
  params?: Record<string, string | number>
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, {
      ...params,
      deployment_env:
        process.env.NEXT_PUBLIC_DEPLOYMENT_ENV || "unknown",
    });
  }
};
