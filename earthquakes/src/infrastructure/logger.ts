import { createLogger, format, transports } from 'winston';
import type { ApplicationConfig } from './config';
import type { Logger } from '@application/interfaces/logger';

const isDev = process.env.NODE_ENV === 'dev';

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json(),
);

export const makeLogger = (config: ApplicationConfig): Logger => {
  const winstonLogger = createLogger({
    level: isDev ? 'debug' : 'info',
    format: logFormat,
    defaultMeta: { service: config.service.name },
    transports: [
      new transports.Console({
        format: isDev ? format.combine(format.colorize(), format.simple()) : logFormat,
      }),
    ],
    exitOnError: false,
  });

  return {
    debug: (message, context) => winstonLogger.debug(message as string, context),
    info: (message, context) => winstonLogger.info(message as string, context),
    warn: (message, context) => winstonLogger.warn(message as string, context),
    error: (message, context) => winstonLogger.error(message as string, context),
  };
};
