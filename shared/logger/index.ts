import { type LoggerOptions, createLogger, format, transports } from "winston";

export const makeLogger = (options?: LoggerOptions) => {
	return createLogger({
		...options,
		defaultMeta: options || {},
		level: "debug",
		format: format.json(),
		transports: [new transports.Console()],
	});
};

export const logger = makeLogger({});
