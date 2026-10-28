import { PostHog } from 'posthog-node';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';
import { postHogHosts } from '../posthogHosts';

// Server-side observability for the API routes: errors go to PostHog error
// tracking, and every request writes one structured log line to PostHog Logs
// (over OpenTelemetry). Both stay off unless PostHog is configured.

const TOKEN = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const SERVICE_NAME = 'portfolio-api';
// The longest a reply waits on telemetry; past it the reply goes out anyway.
const FLUSH_TIMEOUT_MS = 1500;

let telemetry;

/** PostHog clients, created once per warm function instance (null when PostHog isn't configured). */
function getTelemetry() {
  if (telemetry !== undefined) return telemetry;
  telemetry = null;
  if (!TOKEN || !HOST) return telemetry;
  try {
    const { api } = postHogHosts(HOST);
    const loggerProvider = new LoggerProvider({
      resource: resourceFromAttributes({
        'service.name': SERVICE_NAME,
        'service.version': process.env.APP_RELEASE,
        'deployment.environment': process.env.APP_ENV,
      }),
      processors: [
        new BatchLogRecordProcessor({
          exporter: new OTLPLogExporter({
            url: `${api}/i/v1/logs`,
            headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
          }),
        }),
      ],
    });
    telemetry = {
      posthog: new PostHog(TOKEN, { host: api, flushAt: 1, flushInterval: 0 }),
      loggerProvider,
      logger: loggerProvider.getLogger(SERVICE_NAME),
    };
  } catch (error) {
    console.error('Telemetry setup failed:', error?.message || error);
  }
  return telemetry;
}

const severityOf = (status) => {
  if (status >= 500) return { severityNumber: SeverityNumber.ERROR, severityText: 'ERROR' };
  if (status >= 400) return { severityNumber: SeverityNumber.WARN, severityText: 'WARN' };
  return { severityNumber: SeverityNumber.INFO, severityText: 'INFO' };
};

/** Logs the request and, if it failed, reports the error. Never includes the request body. */
function report({ logger, posthog }, { req, route, status, durationMs, error }) {
  const attributes = {
    'http.request.method': req.method,
    'http.route': route,
    'http.response.status_code': status,
    duration_ms: Math.round(durationMs),
  };
  const requestId = req.headers['x-vercel-id'];
  if (requestId) attributes['vercel.request_id'] = requestId;
  if (error) {
    attributes['error.type'] = error.name || 'Error';
    attributes['error.message'] = String(error.message ?? error);
    if (error.code) attributes['error.code'] = String(error.code);
  }
  logger.emit({ ...severityOf(status), body: `${req.method} ${route} ${status}`, attributes });

  if (error) {
    posthog.captureException(error, undefined, {
      route,
      method: req.method,
      status,
      environment: process.env.APP_ENV,
      release: process.env.APP_RELEASE,
    });
  }
}

/** Sends queued errors and logs, giving up after FLUSH_TIMEOUT_MS. */
async function flush({ posthog, loggerProvider }) {
  let timer;
  try {
    await Promise.race([
      Promise.all([posthog.flush(), loggerProvider.forceFlush()]),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`timed out after ${FLUSH_TIMEOUT_MS} ms`)), FLUSH_TIMEOUT_MS);
      }),
    ]);
  } catch (error) {
    console.error('Telemetry flush failed:', error?.message || error);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Wraps an API route handler with request logging and error tracking. The
 * handler returns `{ status, body, headers?, error? }` instead of writing to
 * `res` (an `error` marks a failure it handled itself; a thrown error becomes a
 * 500), so telemetry can be sent before replying: Vercel may freeze the
 * function as soon as the response is out.
 */
export function withObservability(route, handler) {
  return async function observedRoute(req, res) {
    const startedAt = performance.now();
    let reply;
    try {
      reply = await handler(req);
    } catch (error) {
      reply = { status: 500, body: 'Internal Server Error', error };
    }
    const { status, body, headers = {}, error } = reply;
    if (error) console.error(`${req.method} ${route} failed:`, error.stack || error.message || error);

    const sinks = getTelemetry();
    if (sinks) {
      try {
        report(sinks, { req, route, status, durationMs: performance.now() - startedAt, error });
      } catch (reportError) {
        console.error('Telemetry report failed:', reportError?.message || reportError);
      }
      await flush(sinks);
    }

    for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
    res.status(status);
    if (body === undefined) res.end();
    else if (typeof body === 'string') res.send(body);
    else res.json(body);
  };
}
