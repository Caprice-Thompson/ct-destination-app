import { createLogger, format, transports } from "winston";

export const makeLogger = (config: any, options?: any) => {
  return createLogger({
    ...config,
    ...options,
    defaultMeta: options || {},
    level: "debug",
    format: format.json(),
    transports: [new transports.Console()],
  });
};

export const logger = makeLogger({});
