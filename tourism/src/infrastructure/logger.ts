import { createLogger, format, type LoggerOptions, transports } from 'winston';

export const makeLogger = (options: LoggerOptions) => {
  return createLogger({
    ...options,
    defaultMeta: {},
    level: 'debug',
    format: format.json(),
    transports: [new transports.Console()],
  });
};

export const logger = makeLogger({});
