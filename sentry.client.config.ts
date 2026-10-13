// sentry.client.config.ts
// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  integrations: [
    Sentry.replayIntegration(),
  ],

  // 10% sampling ở production để tiết kiệm quota.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,

  // Replay: 10% cho session bình thường, 100% khi có lỗi.
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
