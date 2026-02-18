import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || "https://20cca6ada3debb9b586457f6308d8a8e@o4510908954836992.ingest.de.sentry.io/4510908961914960",
  tracesSampleRate: 0.1,
  enableLogs: true,
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],
});
