

export function makeLogger(config: ApplicationConfig): Logger {
  return makeBaseLogger({
    silent: config.isTestEnv,
  });
}
