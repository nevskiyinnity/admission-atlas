type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: { message: string; stack?: string };
}

function formatError(err: unknown): { message: string; stack?: string } | undefined {
  if (!err) return undefined;
  if (err instanceof Error) {
    return { message: err.message, stack: err.stack };
  }
  return { message: String(err) };
}

function buildEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  error?: unknown,
): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };
  if (context && Object.keys(context).length > 0) {
    entry.context = context;
  }
  const formattedError = formatError(error);
  if (formattedError) {
    entry.error = formattedError;
  }
  return entry;
}

const isProduction = process.env.NODE_ENV === 'production';

function write(entry: LogEntry) {
  const method = entry.level === 'error' ? 'error' : entry.level === 'warn' ? 'warn' : 'log';

  if (isProduction) {
    // eslint-disable-next-line no-console
    console[method](JSON.stringify(entry));
    return;
  }

  // Human-readable format for development
  const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()}`;
  const parts: string[] = [prefix, entry.message];

  if (entry.context) {
    parts.push(JSON.stringify(entry.context, null, 2));
  }
  if (entry.error) {
    parts.push(entry.error.stack || entry.error.message);
  }

  // eslint-disable-next-line no-console
  console[method](...parts);
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    write(buildEntry('debug', message, context));
  },

  info(message: string, context?: Record<string, unknown>) {
    write(buildEntry('info', message, context));
  },

  warn(message: string, context?: Record<string, unknown>) {
    write(buildEntry('warn', message, context));
  },

  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    write(buildEntry('error', message, context, error));
  },
};
