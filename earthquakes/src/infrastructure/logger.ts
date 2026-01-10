import * as winston from 'winston';
import type { ApplicationConfig } from './config';

const isDev = process.env.NODE_ENV === 'dev';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

export const makeLogger = (config: ApplicationConfig) => winston.createLogger({
  level: isDev ? 'debug' : 'info',
  format: logFormat,
  defaultMeta: { service: config.service.name },
  transports: [
    new winston.transports.Console({
      format: isDev ? winston.format.combine(winston.format.colorize(), winston.format.simple()) : logFormat,
    }),
  ],
  exitOnError: false,
});
