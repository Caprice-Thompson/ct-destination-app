import { createLogger, format, transports } from "winston";
import type { ApplicationConfig } from "./config";
import type { Logger } from "@application/interfaces/logger";

const isDev = process.env.NODE_ENV === "dev";

const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.splat(),
  format.json(),
);

let Sentry: any = null;
const getSentry = () => {
  if (!Sentry && process.env.SENTRY_DSN) {
    try {
      Sentry = require("@sentry/node");
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV ?? "development",
        enableLogs: true,
      });
    } catch (e) {
    }
  }
  return Sentry;
};

export const makeLogger = (config: ApplicationConfig): Logger => {
  const winstonLogger = createLogger({
    level: isDev ? "debug" : "info",
    format: logFormat,
    defaultMeta: { service: config.service.name },
    transports: [
      new transports.Console({
        format: isDev
          ? format.combine(format.colorize(), format.simple())
          : logFormat,
      }),
    ],
    exitOnError: false,
  });

  const sentry = getSentry();

  const logToSentry = (level: string, message: string, context?: any) => {
    if (sentry && sentry.logger) {
      const attributes = {
        service: config.service.name,
        ...context,
      };
      
      switch (level) {
        case "info":
          sentry.logger.info(message, attributes);
          break;
        case "warn":
          sentry.logger.warn(message, attributes);
          break;
        case "error":
          sentry.logger.error(message, attributes);
          break;
      }
    }
  };

  return {
    debug: (message, context) =>
      winstonLogger.debug(message as string, context),
    info: (message, context) => {
      winstonLogger.info(message as string, context);
      logToSentry("info", message as string, context);
    },
    warn: (message, context) => {
      winstonLogger.warn(message as string, context);
      logToSentry("warn", message as string, context);
    },
    error: (message, context) => {
      winstonLogger.error(message as string, context);
      logToSentry("error", message as string, context);
    },
  };
};
