import winston from 'winston';

const isDev = process.env.NODE_ENV === 'dev';
const isTest = process.env.NODE_ENV === 'test';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  format: logFormat,
  defaultMeta: { service: 'country-service' },
  transports: [
    new winston.transports.Console({
      silent: isTest,
      format: isDev ? winston.format.combine(winston.format.colorize(), winston.format.simple()) : logFormat,
    }),
  ],
  exitOnError: false,
});

let Sentry: any = null;
const getSentry = () => {
  if (!Sentry && process.env.SENTRY_DSN) {
    try {
      Sentry = require('@sentry/node');
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV ?? 'development',
        enableLogs: true,
      });
    } catch (e) {
    }
  }
  return Sentry;
};

const logToSentry = (level: string, message: string, context?: any) => {
  const sentry = getSentry();
  if (sentry && sentry.logger) {
    const attributes = {
      service: 'country-service',
      ...context,
    };
    switch (level) {
      case 'info':
        sentry.logger.info(message, attributes);
        break;
      case 'warn':
        sentry.logger.warn(message, attributes);
        break;
      case 'error':
        sentry.logger.error(message, attributes);
        break;
    }
  }
};

// Export a logger that sends to both Winston and Sentry
export const logger = {
  debug: (message: string, context?: any) => winstonLogger.debug(message, context),
  info: (message: string, context?: any) => {
    winstonLogger.info(message, context);
    logToSentry('info', message, context);
  },
  warn: (message: string, context?: any) => {
    winstonLogger.warn(message, context);
    logToSentry('warn', message, context);
  },
  error: (message: string, context?: any) => {
    winstonLogger.error(message, context);
    logToSentry('error', message, context);
  },
};

export default logger;
