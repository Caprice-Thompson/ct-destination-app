<<<<<<< Updated upstream
import winston from 'winston';

const isDev = process.env.NODE_ENV === 'dev';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'tourism-service' },
  transports: [
    new winston.transports.Console({
      format: isDev ? winston.format.combine(winston.format.colorize(), winston.format.simple()) : logFormat,
    }),
  ],
  exitOnError: false,
});

export default logger;
=======
import { createLogger, format, type LoggerOptions, transports } from "winston";

export const makeLogger = (options: LoggerOptions) => {
  return createLogger({
    ...options,
    defaultMeta: {},
    level: "debug",
    format: format.json(),
    transports: [new transports.Console()],
  });
};

export const logger = makeLogger({});
>>>>>>> Stashed changes
