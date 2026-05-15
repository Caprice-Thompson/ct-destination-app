import type { Logger } from "@application/interfaces";
import { makeLogger as makeBaseLogger } from "../../../../shared/logger";

export function makeLogger(): Logger {
  return makeBaseLogger({
  });
}
