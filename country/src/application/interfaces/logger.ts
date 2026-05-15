type LogMethod = (
  message: { [key: string]: unknown } | string,
  context?: { [key: string]: unknown },
) => void;

export interface Logger {
  debug: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
}
