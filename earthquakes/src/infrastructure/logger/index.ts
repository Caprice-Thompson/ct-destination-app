import type { ApplicationConfig, Logger } from "@application/interfaces";
import { makeLogger as makeBaseLogger } from "../../../../shared/logger";

export function makeLogger(config: ApplicationConfig): Logger {
  return makeBaseLogger(config, {
    serviceName: config.service.name,
  });
}
