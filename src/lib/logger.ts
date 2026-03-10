type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  method?: string;
  path?: string;
  status?: number;
  durationMs?: number;
  locale?: string;
  slug?: string;
  [key: string]: any;
}

const formatLogMessage = (level: LogLevel, message: string, context?: LogContext) => {
  const timestamp = new Date().toISOString();
  
  if (process.env.NODE_ENV === 'development') {
    // Human-readable dev console format
    const meta = context ? ` \u001b[90m${JSON.stringify(context)}\u001b[0m` : '';
    const duration = context?.durationMs ? ` \u001b[33m+${context.durationMs}ms\u001b[0m` : '';
    return `[${timestamp}] ${level.toUpperCase()} - ${message}${meta}${duration}`;
  }

  // Structured JSON format for Vercel production log drains
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...context
  });
};

export const logger = {
  info: (message: string, context?: LogContext) => {
    console.log(formatLogMessage('info', message, context));
  },
  
  warn: (message: string, context?: LogContext) => {
    console.warn(formatLogMessage('warn', message, context));
  },
  
  error: (message: string, error?: unknown, context?: LogContext) => {
    const errorDetails = error instanceof Error ? { name: error.name, message: error.message } : { error };
    console.error(formatLogMessage('error', message, { ...context, ...errorDetails }));
  }
};
