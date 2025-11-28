import winston from 'winston';

const isDev = process.env.NODE_ENV === 'dev';
const isTest = process.env.NODE_ENV === 'test';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

export const logger = winston.createLogger({
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

export default logger;
